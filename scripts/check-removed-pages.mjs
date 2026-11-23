#!/usr/bin/env node

/**
 * Fail when a build drops a page that the live site serves, unless a redirect covers it.
 *
 * Reads every URL from the live site's sitemap and checks that the build output still has a file
 * for it: either the page itself or the redirect page that @docusaurus/plugin-client-redirects
 * writes for each `from` path. That covers redirects in redirects.ts and historic-redirects.ts and
 * the `_redirects.json` files assembled from harper and harper-pro.
 *
 * Usage: node scripts/check-removed-pages.mjs [--site=https://docs.harperdb.io] [--build=build]
 *
 * Exit codes:
 *   0 — every live page is still served, or the sitemap couldn't be fetched (printed as a warning)
 *   1 — one or more live pages are missing from the build
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

// Live pages a PR build can't reproduce.
const IGNORED = new Map([['/search', 'only built when the Algolia credentials are set']]);

export function sitemapPaths(xml) {
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].trim()).pathname);
}

// With `trailingSlash: false` a page builds to "<path>.html", and a redirect or an index page
// builds to "<path>/index.html".
export function isBuilt(buildDir, pathname) {
	const rel = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
	if (rel === '') return existsSync(path.join(buildDir, 'index.html'));
	return existsSync(path.join(buildDir, `${rel}.html`)) || existsSync(path.join(buildDir, rel, 'index.html'));
}

export function findMissingPages(paths, buildDir) {
	return [...new Set(paths)].filter((p) => !IGNORED.has(p) && !isBuilt(buildDir, p)).sort();
}

// Where the redirect for a removed page belongs.
export function redirectHome(pathname) {
	return pathname.startsWith('/reference/v5/')
		? '`docs/reference/_redirects.json` in the harper or harper-pro repo that owns the page'
		: '`redirects.ts`';
}

async function main() {
	const args = Object.fromEntries(
		process.argv.slice(2).map((a) => {
			const [k, ...v] = a.replace(/^--/, '').split('=');
			return [k, v.join('=') || true];
		})
	);
	const site = String(args.site || process.env.SITE_URL || 'https://docs.harperdb.io').replace(/\/$/, '');
	const buildDir = path.resolve(String(args.build || 'build'));
	const sitemapUrl = `${site}/sitemap.xml`;

	if (!existsSync(path.join(buildDir, 'index.html'))) {
		console.error(`No build found in ${buildDir}. Run \`npm run build\` first.`);
		process.exit(1);
	}

	let xml;
	try {
		const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(30_000) });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		xml = await res.text();
	} catch (error) {
		// The live site being unreachable says nothing about this build, so don't block on it.
		console.log(`::warning::Skipped the removed pages check: couldn't fetch ${sitemapUrl} (${error.message}).`);
		return;
	}

	const paths = sitemapPaths(xml);
	if (paths.length === 0) {
		console.log(`::warning::Skipped the removed pages check: ${sitemapUrl} lists no pages.`);
		return;
	}

	const missing = findMissingPages(paths, buildDir);
	if (missing.length === 0) {
		console.log(`All ${paths.length} pages in ${sitemapUrl} are still served.`);
		return;
	}

	const verb = missing.length === 1 ? 'is' : 'are';
	console.log(`${missing.length} of the ${paths.length} pages in ${sitemapUrl} ${verb} missing from this build:\n`);
	for (const p of missing) {
		console.log(`::error::${p} is live but no longer built. Add a redirect for it to ${redirectHome(p)}.`);
	}
	console.log('\nA redirect keeps inbound links and search results working after a page moves or is removed.');
	process.exit(1);
}

if (import.meta.main) await main();
