// Site middleware: serves documentation pages, redirects, .md routes,
// llms.txt, and sitemap.xml from the active ContentRelease.

import { server, tables, type HarperRequest, type HarperTable } from '../lib/harper.ts';
import { layout } from '../lib/layout.ts';
import { runSearch, logQuery } from '../lib/search.ts';
import { renderIngestDashboard, renderSearchDashboard, renderValidationDashboard } from '../lib/admin.ts';
import { searchAnalytics, evalTrend, parityTrend } from '../lib/metrics.ts';

const { Page, Navigation, Redirect, SitePointer, IngestRun } = tables;

// Admin area is gated by Google OAuth (via the @harperfast/oauth plugin, which
// writes the signed-in profile onto the session as `oauthUser`) and restricted
// to an allowlist of email domains. adminAuth reads the session's oauthUser
// email and returns it if permitted, else a reason: 'login' (not signed in) or
// 'forbidden' (signed in, wrong domain).
//
// NB: the session is only present because this middleware registers with
// `{ after: 'authentication' }` (see the server.http call at the bottom) — a
// bare server.http handler runs *before* Harper's auth stage and gets no
// `request.session`, which silently breaks every session-based gate.
const ADMIN_DOMAINS = (process.env.ADMIN_ALLOWED_DOMAINS ?? 'harperdb.io,harper.fast')
	.split(',')
	.map((s) => s.trim().toLowerCase())
	.filter(Boolean);

// Dev/verification login (GET /admin/dev-login): establishes a real Harper
// session as an admin WITHOUT the Google round-trip, so the dashboard can be
// driven locally (e.g. Playwright). Two independent gates, both required:
//   1. ADMIN_DEV_LOGIN=true in the env (unset in production), and
//   2. the request is already locally authorized as a super_user — which Harper
//      only grants via `authorizeLocal` to loopback requests, so this can never
//      be reached remotely.
// It writes the same session shape the OAuth plugin does (`oauthUser.email`) so
// adminAuth stays a single code path.
const ADMIN_DEV_LOGIN = process.env.ADMIN_DEV_LOGIN === 'true';
const ADMIN_DEV_EMAIL = process.env.ADMIN_DEV_EMAIL || 'dev@harperdb.io';

// The gated admin dashboard views (all share the tabbed shell).
const ADMIN_VIEWS = new Set(['/admin/ingest', '/admin/search', '/admin/validation']);

interface AdminAuth {
	reason?: 'login' | 'forbidden';
	email?: string;
}

function isLocalSuperUser(request: HarperRequest): boolean {
	return request.user?.role?.permission?.super_user === true;
}

function adminAuth(request: HarperRequest): AdminAuth {
	const email = request.session?.oauthUser?.email ?? null;
	if (!email) return { reason: 'login' };
	// Fail CLOSED: an empty allowlist (misconfigured `ADMIN_ALLOWED_DOMAINS=''`)
	// denies everyone rather than admitting any authenticated Google account.
	if (!ADMIN_DOMAINS.some((d) => email.toLowerCase().endsWith(`@${d}`))) {
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

async function activeReleaseId(): Promise<any> {
	const pointer = await SitePointer.get('active');
	return pointer?.release ?? null;
}

async function findOne(table: HarperTable, conditions: any[], select?: any[]): Promise<any> {
	for await (const record of table.search({ conditions, ...(select ? { select } : {}) })) return record;
	return null;
}

function normalizePath(pathname: string): string | null {
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
function etagMatches(ifNoneMatch: string | null, etag: string): boolean {
	if (!ifNoneMatch) return false;
	const bare = etag.replace(/^W\//, '');
	return ifNoneMatch.split(',').some((t) => t.trim().replace(/^W\//, '') === bare);
}

function navSectionFor(path: string): { section: string; version?: string } {
	if (path.startsWith('reference/v4')) return { section: 'reference', version: 'v4' };
	if (path.startsWith('reference')) return { section: 'reference', version: 'v5' };
	if (path.startsWith('learn')) return { section: 'learn' };
	if (path.startsWith('release-notes')) return { section: 'release-notes' };
	if (path.startsWith('fabric')) return { section: 'fabric' };
	return { section: 'root' };
}

server.http(async (request: HarperRequest, next: (request: HarperRequest) => Response | Promise<Response>) => {
	if ((request.method !== 'GET' && request.method !== 'HEAD') || PASSTHROUGH.test(request.pathname))
		return next(request);

	// Search API: /api/search?q=…&section=…&version=…&limit=…
	if (request.pathname === '/api/search') {
		const p = new URL(request.url, 'http://x').searchParams;
		// Commit-logging beacon: the UI fires `?log=1&n=<count>` only when a query
		// is committed (settled or acted on), so debounced keystroke partials never
		// reach SearchQueryLog. Logging is decoupled from search execution — this
		// path records and returns 204 without running a search.
		if (p.get('log')) {
			await logQuery(p.get('q') ?? '', p.get('section'), p.get('version'), Number(p.get('n')) || 0);
			return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
		}
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

	// Dev/verification login — see ADMIN_DEV_LOGIN note above. Establishes an
	// admin session for a locally-authorized super_user, then lands on the
	// dashboard. Both gates must hold; otherwise it is indistinguishable from
	// any other unknown path (404-style fallthrough) or forbidden.
	if (request.pathname === '/admin/dev-login') {
		if (!ADMIN_DEV_LOGIN) return next(request);
		if (!isLocalSuperUser(request)) {
			return new Response('Dev login requires a locally-authorized super_user (authorizeLocal).', {
				status: 403,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		}
		if (typeof request.session?.update !== 'function') {
			return new Response('No updatable session on this request.', { status: 500 });
		}
		await request.session.update({ oauthUser: { email: ADMIN_DEV_EMAIL }, dev: true });
		return new Response(null, { status: 302, headers: { location: '/admin/ingest' } });
	}

	// Admin area (Google-OAuth gated): three tabbed observability dashboards —
	// ingest, search analytics, and validation trends. Bare /admin lands on ingest.
	if (request.pathname === '/admin') {
		return new Response(null, { status: 302, headers: { location: '/admin/ingest' } });
	}
	if (ADMIN_VIEWS.has(request.pathname)) {
		const auth = adminAuth(request);
		if (auth.reason === 'login') {
			// Not signed in → kick off the Google OAuth flow, returning here after.
			return new Response(null, {
				status: 302,
				headers: { location: `/oauth/google/login?redirect=${encodeURIComponent(request.pathname)}` },
			});
		}
		if (auth.reason === 'forbidden') {
			return new Response(`Forbidden: ${auth.email} is not an authorized admin account.`, {
				status: 403,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		}
		let html: string;
		if (request.pathname === '/admin/search') {
			html = renderSearchDashboard(await searchAnalytics());
		} else if (request.pathname === '/admin/validation') {
			html = renderValidationDashboard(await evalTrend(), await parityTrend());
		} else {
			const runs: any[] = [];
			for await (const run of IngestRun.search({})) runs.push(run);
			runs.sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime());
			html = renderIngestDashboard(runs.slice(0, 100));
		}
		return new Response(html, {
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
		const urls: string[] = [];
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
}, { after: 'authentication' });

function textResponse(body: any, contentType: string): Response {
	return new Response(body, { status: 200, headers: { 'content-type': contentType } });
}
