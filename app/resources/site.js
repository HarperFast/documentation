// Site middleware: serves documentation pages, redirects, .md routes,
// llms.txt, and sitemap.xml from the active ContentRelease.

import { server, tables } from 'harper';
import { layout } from '../lib/layout.mjs';

const { ContentRelease, Page, Navigation, Redirect } = tables;

// Paths handled elsewhere (REST resources, static assets) — pass through.
const PASSTHROUGH = /^\/(Ingest|assets\/|favicon)/;

async function activeReleaseId() {
	for await (const rel of ContentRelease.search({ conditions: [{ attribute: 'status', value: 'active' }] })) {
		return rel.id;
	}
	return null;
}

async function findOne(table, conditions, select) {
	for await (const record of table.search({ conditions, ...(select ? { select } : {}) })) return record;
	return null;
}

function normalizePath(pathname) {
	let p;
	try {
		p = decodeURIComponent(pathname);
	} catch {
		return null; // malformed percent-encoding — treat as no match, not a 500
	}
	if (p.endsWith('/')) p = p.slice(0, -1);
	if (p.startsWith('/')) p = p.slice(1);
	return p; // '' = homepage
}

function navSectionFor(path) {
	if (path.startsWith('reference/v4')) return { section: 'reference', version: 'v4' };
	if (path.startsWith('reference')) return { section: 'reference', version: 'v5' };
	if (path.startsWith('learn')) return { section: 'learn' };
	if (path.startsWith('release-notes')) return { section: 'release-notes' };
	if (path.startsWith('fabric')) return { section: 'fabric' };
	return { section: 'root' };
}

server.http(async (request, next) => {
	if ((request.method !== 'GET' && request.method !== 'HEAD') || PASSTHROUGH.test(request.pathname)) return next(request);

	const release = await activeReleaseId();
	if (!release) return next(request);

	// llms.txt / llms-full.txt / sitemap.xml
	if (request.pathname === '/llms.txt' || request.pathname === '/llms-full.txt') {
		const full = request.pathname === '/llms-full.txt';
		const lines = ['# Harper Documentation', ''];
		for await (const page of Page.search({
			conditions: [{ attribute: 'release', value: release }],
			select: full ? ['path', 'title', 'renderedMarkdown'] : ['path', 'title', 'description'],
		})) {
			if (full) lines.push(`# ${page.title}`, '', page.renderedMarkdown, '');
			else lines.push(`- [${page.title}](/${page.path}.md)${page.description ? `: ${page.description}` : ''}`);
		}
		return textResponse(lines.join('\n'), 'text/plain; charset=utf-8');
	}
	if (request.pathname === '/sitemap.xml') {
		const urls = [];
		for await (const page of Page.search({ conditions: [{ attribute: 'release', value: release }], select: ['path'] })) {
			urls.push(`<url><loc>https://docs.harperdb.io/${page.path}</loc></url>`);
		}
		return textResponse(
			`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
			'application/xml'
		);
	}

	// Per-page markdown projection: GET /<path>.md
	if (request.pathname.endsWith('.md')) {
		const path = normalizePath(request.pathname.slice(0, -3));
		const page = await findOne(Page, [
			{ attribute: 'release', value: release },
			{ attribute: 'path', value: path },
		]);
		if (page) return textResponse(page.renderedMarkdown, 'text/markdown; charset=utf-8');
		return next(request);
	}

	// HTML page
	const path = normalizePath(request.pathname);
	if (path === null) return next(request);
	const page = await findOne(Page, [
		{ attribute: 'release', value: release },
		{ attribute: 'path', value: path },
	]);
	if (page) {
		const etag = `"${page.contentHash}"`;
		if (request.headers.get('if-none-match') === etag) {
			return new Response(null, { status: 304, headers: { etag } });
		}
		const { section, version } = navSectionFor(path);
		const navId = version ? `${release}:${section}:${version}` : `${release}:${section}`;
		const nav = await Navigation.get(navId);
		const html = layout({ page, navTree: nav?.tree ?? [] });
		return new Response(html, {
			status: 200,
			headers: { 'content-type': 'text/html; charset=utf-8', etag, 'cache-control': 'public, max-age=60' },
		});
	}

	// Redirects
	const redirect = await findOne(Redirect, [
		{ attribute: 'release', value: release },
		{ attribute: 'from', value: `/${path}` },
	]);
	if (redirect) {
		return new Response(null, { status: redirect.status ?? 301, headers: { location: redirect.to } });
	}

	return next(request);
});

function textResponse(body, contentType) {
	return new Response(body, { status: 200, headers: { 'content-type': contentType } });
}
