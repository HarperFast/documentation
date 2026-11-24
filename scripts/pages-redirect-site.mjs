#!/usr/bin/env node

/**
 * Writes a static site that sends every URL to the same path on another host. GitHub Pages serves
 * it at docs.harperdb.io, an older host name for the site, to send readers to docs.harper.fast.
 *
 * Usage: node scripts/pages-redirect-site.mjs [--to=https://docs.harper.fast/] [--out=pages-redirect]
 *
 * Each page in the target's sitemap gets its own HTML file with an immediate meta refresh, which
 * search engines treat as a permanent redirect. Every other path gets 404.html, which redirects
 * with a script. Both keep the query string and hash.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sitemapPaths } from './check-removed-pages.mjs';

const escapeHtml = (value) =>
	value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// JSON.stringify leaves "</script>" intact; escaping "<" keeps the string inside its script element.
const scriptString = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

export function redirectPage(target) {
	const href = escapeHtml(target);
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to ${href}</title>
<link rel="canonical" href="${href}">
<script>location.replace(${scriptString(target)} + location.search + location.hash);</script>
<meta http-equiv="refresh" content="0; url=${href}">
</head>
<body>
<p>This page has moved to <a href="${href}">${href}</a>.</p>
</body>
</html>
`;
}

// Appends the requested path to `to` for the same reason as redirectFiles below.
export function notFoundPage(to) {
	const href = escapeHtml(to);
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to ${href}</title>
<script>location.replace(${scriptString(to)} + location.pathname.slice(1) + location.search + location.hash);</script>
</head>
<body>
<p>The Harper documentation has moved to <a href="${href}">${href}</a>.</p>
</body>
</html>
`;
}

// GitHub Pages serves "/a/b" from "a/b.html" and "/" from "index.html". Returns null for a path that
// would land outside the site.
export function pageFile(pathname) {
	const relativePath = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
	if (relativePath === '') return 'index.html';
	if (relativePath.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')) return null;
	return `${relativePath}.html`;
}

// Targets are built by appending the path to `to`, which ends in "/", never by resolving it as a URL:
// a path such as "/javascript:..." would otherwise resolve to another scheme or host.
export function redirectFiles(pathnames, to) {
	const files = new Map([['404.html', notFoundPage(to)]]);
	for (const pathname of pathnames) {
		const file = pageFile(pathname);
		if (file && !files.has(file)) files.set(file, redirectPage(to + pathname.slice(1)));
	}
	return files;
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
	const to = new URL(String(args.to || 'https://docs.harper.fast/'));
	to.pathname = `${to.pathname}/`.replace(/\/{2,}/g, '/');
	const out = path.resolve(String(args.out || 'pages-redirect'));
	const sitemapUrl = new URL('sitemap.xml', to).href;

	const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(30_000) });
	if (!response.ok) throw new Error(`Couldn't fetch ${sitemapUrl}: HTTP ${response.status}`);
	const pathnames = sitemapPaths(await response.text(), to.pathname);
	if (pathnames.length === 0) throw new Error(`${sitemapUrl} lists no pages`);

	const files = redirectFiles(pathnames, to.href);
	rmSync(out, { recursive: true, force: true });
	for (const [file, html] of files) {
		mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
		writeFileSync(path.join(out, file), html);
	}
	console.log(`Wrote ${files.size - 1} page redirects and 404.html to ${out}, all to ${to.href}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
