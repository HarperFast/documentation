// Site middleware: serves documentation pages, redirects, .md routes,
// llms.txt, and sitemap.xml from the active ContentRelease.

import { server, tables } from 'harper';
import { layout } from '../lib/layout.mjs';
import { runSearch } from '../lib/search.mjs';
import { renderAdminDashboard } from '../lib/admin.mjs';

const { Page, Navigation, Redirect, SitePointer, IngestRun } = tables;

// Admin area is gated by Google OAuth (via the @harperfast/oauth plugin, which
// populates request.session after /oauth/google/login) and restricted to an
// allowlist of email domains. Returns the signed-in email if permitted, else a
// reason: 'login' (not signed in) or 'forbidden' (signed in, wrong domain).
const ADMIN_DOMAINS = (process.env.ADMIN_ALLOWED_DOMAINS ?? 'harperdb.io,harper.fast')
	.split(',')
	.map((s) => s.trim().toLowerCase())
	.filter(Boolean);

// Dev/verification bypass: ONLY active when ADMIN_DEV_KEY is set in the env
// (never in production). A request carrying the matching `x-admin-dev-key`
// header is treated as a signed-in admin, so the dashboard can be exercised
// without the full Google OAuth round-trip. The OAuth path below is the real
// mechanism; this sits above it purely as a local test affordance.
const ADMIN_DEV_KEY = process.env.ADMIN_DEV_KEY || null;
const ADMIN_DEV_EMAIL = process.env.ADMIN_DEV_EMAIL || 'dev@harperdb.io';

function adminAuth(request) {
	if (ADMIN_DEV_KEY && request.headers.get('x-admin-dev-key') === ADMIN_DEV_KEY) {
		return { email: ADMIN_DEV_EMAIL, dev: true };
	}
	const email = request.session?.oauthUser?.email ?? null;
	if (!email) return { reason: 'login' };
	if (ADMIN_DOMAINS.length && !ADMIN_DOMAINS.some((d) => email.toLowerCase().endsWith(`@${d}`))) {
		return { reason: 'forbidden', email };
	}
	return { email };
}

// Canonical origin for absolute URLs (sitemap). Matches the current production
// host; override via env for staging/preview.
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://docs.harper.fast';

// Content-Security-Policy for pages. script-src 'self' (no unsafe-inline)
// blocks injected inline scripts AND inline event handlers (onerror/onclick) —
// the main XSS vector through ingested content — while our own /assets scripts
// still run. style-src allows inline for the shiki dual-theme CSS variables.
const CSP = [
	"default-src 'self'",
	"script-src 'self'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data:",
	"font-src 'self'",
	"connect-src 'self'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"object-src 'none'",
].join('; ');

// Paths handled elsewhere (REST resources, static assets) — pass through.
// Anchored to a path-segment boundary so a real doc page named e.g.
// /favicon-guide is not shadowed.
const PASSTHROUGH = /^\/(Ingest(?:$|\/)|assets\/|favicon(?:$|[./])|oauth\/)/;

async function activeReleaseId() {
	const pointer = await SitePointer.get('active');
	return pointer?.release ?? null;
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

// If-None-Match may arrive weak-prefixed (W/"…") or as a comma list; a doc
// page's representation is byte-identical regardless of transport weakening,
// so compare ignoring the W/ prefix.
function etagMatches(ifNoneMatch, etag) {
	if (!ifNoneMatch) return false;
	const bare = etag.replace(/^W\//, '');
	return ifNoneMatch.split(',').some((t) => t.trim().replace(/^W\//, '') === bare);
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
	if ((request.method !== 'GET' && request.method !== 'HEAD') || PASSTHROUGH.test(request.pathname))
		return next(request);

	// Search API: /api/search?q=…&section=…&version=…&limit=…
	if (request.pathname === '/api/search') {
		const p = new URL(request.url, 'http://x').searchParams;
		const data = await runSearch({
			q: p.get('q') ?? '',
			section: p.get('section'),
			version: p.get('version'),
			limit: p.get('limit'),
		});
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
		});
	}

	// Admin area (Google-OAuth gated): ingest observability dashboard.
	if (request.pathname === '/admin' || request.pathname === '/admin/ingest') {
		const auth = adminAuth(request);
		if (auth.reason === 'login') {
			// Not signed in → kick off the Google OAuth flow, returning here after.
			return new Response(null, { status: 302, headers: { location: '/oauth/google/login?redirect=/admin/ingest' } });
		}
		if (auth.reason === 'forbidden') {
			return new Response(`Forbidden: ${auth.email} is not an authorized admin account.`, {
				status: 403,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		}
		const runs = [];
		for await (const run of IngestRun.search({})) runs.push(run);
		runs.sort((a, b) => new Date(b.startedAt ?? 0) - new Date(a.startedAt ?? 0));
		return new Response(renderAdminDashboard(runs.slice(0, 100)), {
			status: 200,
			headers: {
				'content-type': 'text/html; charset=utf-8',
				'cache-control': 'no-store',
				'content-security-policy': CSP,
			},
		});
	}

	const release = await activeReleaseId();
	if (!release) return next(request);

	// llms.txt / llms-full.txt — streamed from the page cursor so the whole
	// corpus (llms-full is ~1.4MB) is never materialized in memory at once.
	if (request.pathname === '/llms.txt' || request.pathname === '/llms-full.txt') {
		const full = request.pathname === '/llms-full.txt';
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					controller.enqueue(encoder.encode('# Harper Documentation\n\n'));
					for await (const page of Page.search({
						conditions: [{ attribute: 'release', value: release }],
						select: full ? ['path', 'title', 'renderedMarkdown'] : ['path', 'title', 'description'],
					})) {
						const line = full
							? `# ${page.title}\n\n${page.renderedMarkdown}\n\n`
							: `- [${page.title}](/${page.path}.md)${page.description ? `: ${page.description}` : ''}\n`;
						controller.enqueue(encoder.encode(line));
					}
					controller.close();
				} catch (err) {
					controller.error(err);
				}
			},
		});
		return new Response(stream, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
	}
	if (request.pathname === '/sitemap.xml') {
		const urls = [];
		for await (const page of Page.search({
			conditions: [{ attribute: 'release', value: release }],
			select: ['path'],
		})) {
			urls.push(`<url><loc>${SITE_ORIGIN}/${page.path}</loc></url>`);
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
		// ETag keys on release + source hash: the composed response also depends
		// on layout/nav, and every layout/nav/content change ships as a new
		// release, so folding the release id in prevents stale 304s.
		const etag = `"${release}-${page.contentHash}"`;
		if (etagMatches(request.headers.get('if-none-match'), etag)) {
			return new Response(null, { status: 304, headers: { etag } });
		}
		const { section, version } = navSectionFor(path);
		const navId = version ? `${release}:${section}:${version}` : `${release}:${section}`;
		const nav = await Navigation.get(navId);
		const html = layout({ page, navTree: nav?.tree ?? [] });
		return new Response(html, {
			status: 200,
			// no-cache = store but revalidate every request; ETag makes that a cheap 304.
			// Real caching strategy (composed-page cache, longer TTLs) comes with M4.
			headers: {
				'content-type': 'text/html; charset=utf-8',
				etag,
				'cache-control': 'public, no-cache',
				'content-security-policy': CSP,
				'x-content-type-options': 'nosniff',
				'referrer-policy': 'strict-origin-when-cross-origin',
			},
		});
	}

	// Redirects — O(1) primary-key lookup ("<release>:<from>").
	const redirect = await Redirect.get(`${release}:/${path}`);
	if (redirect) {
		return new Response(null, { status: redirect.status ?? 301, headers: { location: redirect.to } });
	}

	return next(request);
});

function textResponse(body, contentType) {
	return new Response(body, { status: 200, headers: { 'content-type': contentType } });
}
