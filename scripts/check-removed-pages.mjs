#!/usr/bin/env node

/**
 * Fails when the build no longer serves a page from the live sitemap, as the page or a redirect.
 *
 * Usage: node scripts/check-removed-pages.mjs [--site=https://docs.harperdb.io/] [--build=build]
 *
 * Exit codes:
 *   0 — every live page is still served, or the sitemap couldn't be fetched (printed as a warning)
 *   1 — one or more live pages are missing from the build
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A PR build has no Algolia credentials, so it never builds the search page.
const IGNORED = new Set(['/search']);

// Sitemap URLs carry the site's base path; the build output does not.
export function sitemapPaths(xml, basePath = '/') {
	const base = basePath.replace(/\/{2,}/g, '/').replace(/\/$/, '');
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
		const pathname = new URL(match[1].trim()).pathname;
		if (!base) return pathname;
		if (pathname === base) return '/';
		return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
	});
}

// With `trailingSlash: false` a page builds to "<path>.html", and a redirect or an index page
// builds to "<path>/index.html".
export function isBuilt(buildDir, pathname) {
	const relativePath = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
	if (relativePath === '') return existsSync(path.join(buildDir, 'index.html'));
	return (
		existsSync(path.join(buildDir, `${relativePath}.html`)) ||
		existsSync(path.join(buildDir, relativePath, 'index.html'))
	);
}

export function findMissingPages(pathnames, buildDir) {
	return [...new Set(pathnames)].filter((pathname) => !IGNORED.has(pathname) && !isBuilt(buildDir, pathname)).sort();
}

export function redirectHome(pathname) {
	return pathname.startsWith('/reference/v5/')
		? '`docs/reference/_redirects.json` in the harper or harper-pro repo that owns the page'
		: '`redirects.ts`';
}

function parseArgs(argv) {
	return Object.fromEntries(
		argv.map((arg) => {
			const [name, ...value] = arg.replace(/^--/, '').split('=');
			return [name, value.join('=') || true];
		})
	);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	// Without repository variables (a fork PR), SITE_URL is just the base path.
	const site = new URL(String(args.site || process.env.SITE_URL || '/'), 'https://docs.harperdb.io/');
	site.pathname = `${site.pathname}/`.replace(/\/{2,}/g, '/');
	const sitemapUrl = new URL('sitemap.xml', site).href;
	const buildDir = path.resolve(String(args.build || 'build'));

	if (!existsSync(path.join(buildDir, 'index.html'))) {
		console.error(`No build found in ${buildDir}. Run \`npm run build\` first.`);
		process.exit(1);
	}

	let xml;
	try {
		const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(30_000) });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		xml = await response.text();
	} catch (error) {
		// The live site being unreachable says nothing about this build, so don't block on it.
		console.log(`::warning::Skipped the removed pages check: couldn't fetch ${sitemapUrl} (${error.message}).`);
		return;
	}

	const pathnames = sitemapPaths(xml, site.pathname);
	if (pathnames.length === 0) {
		console.log(`::warning::Skipped the removed pages check: ${sitemapUrl} lists no pages.`);
		return;
	}

	const missing = findMissingPages(pathnames, buildDir);
	if (missing.length === 0) {
		console.log(`All ${pathnames.length} pages in ${sitemapUrl} are still served.`);
		return;
	}

	const verb = missing.length === 1 ? 'is' : 'are';
	console.log(`${missing.length} of the ${pathnames.length} pages in ${sitemapUrl} ${verb} missing from this build:\n`);
	for (const pathname of missing) {
		console.log(
			`::error::${pathname} is live but no longer built. Add a redirect for it to ${redirectHome(pathname)}.`
		);
	}
	console.log('\nA redirect keeps inbound links and search results working after a page moves or is removed.');
	process.exit(1);
}

// `import.meta.main` needs Node 22.18, and package.json allows 22.12.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
