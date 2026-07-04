// Site middleware: serves documentation pages, redirects, .md routes,
// llms.txt, and sitemap.xml from the active ContentRelease.

import { server, tables, type HarperRequest, type HarperTable } from '../lib/harper.ts';
import { layout } from '../lib/layout.ts';
import { runSearch, logQuery } from '../lib/search.ts';
import { renderIngestDashboard, renderSearchDashboard, renderValidationDashboard, renderChatDashboard } from '../lib/admin.ts';
import { searchAnalytics, evalTrend, parityTrend, chatAnalytics } from '../lib/metrics.ts';
import {
	validateQuestion,
	clientIp,
	hashIp,
	checkAndBumpQuota,
	retrieve,
	buildMessages,
	streamAnswer,
	modelId,
	logChat,
	newChatId,
	recordFeedback,
} from '../lib/chat.ts';
import { renderChatPage } from '../lib/chat-ui.ts';

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
const ADMIN_VIEWS = new Set(['/admin/ingest', '/admin/search', '/admin/validation', '/admin/chat']);

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
	// Chat API (M3): POST /api/chat — grounded, streamed (SSE) answers. Handled
	// before the GET/HEAD guard below because it is the one POST this owns.
	if (request.method === 'POST' && request.pathname === '/api/chat') {
		return handleChat(request);
	}
	// Thumbs feedback on a prior answer: POST /api/chat-feedback { id, value }.
	if (request.method === 'POST' && request.pathname === '/api/chat-feedback') {
		const body = await readJsonBody(request);
		if (body === null) return jsonResponse({ error: 'bad request' }, 400);
		const ok = await recordFeedback(body.id, body.value);
		return jsonResponse({ ok }, ok ? 200 : 404);
	}
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

	// Dedicated chat page (the widget is injected site-wide via the layout).
	if (request.pathname === '/chat') {
		return new Response(renderChatPage(), {
			status: 200,
			headers: { 'content-type': 'text/html; charset=utf-8', 'content-security-policy': CSP },
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
		} else if (request.pathname === '/admin/chat') {
			html = renderChatDashboard(await chatAnalytics());
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

function jsonResponse(obj: unknown, status: number): Response {
	return new Response(JSON.stringify(obj), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
	});
}

const MAX_CHAT_BODY = 16 * 1024; // cap the chat request body (questions are tiny)

// Read + JSON-parse a POST body from the async-iterable request stream (Harper's
// RequestBody has no .json()). Returns null on oversize or malformed input.
async function readJsonBody(request: HarperRequest): Promise<any> {
	try {
		let raw = '';
		const decoder = new TextDecoder();
		for await (const chunk of (request as any).body as AsyncIterable<Uint8Array | string>) {
			raw += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
			if (raw.length > MAX_CHAT_BODY) return null;
		}
		return raw ? JSON.parse(raw) : {};
	} catch {
		return null;
	}
}

// POST /api/chat: validate + quota-gate, retrieve grounding, then stream the
// answer as Server-Sent Events (`sources`, then `token`… then `done`/`error`),
// logging the exchange to ChatLog when the stream finishes.
async function handleChat(request: HarperRequest): Promise<Response> {
	const body = await readJsonBody(request);
	if (body === null) return jsonResponse({ error: 'bad request' }, 400);
	const question = validateQuestion(body.question);
	if (!question) return jsonResponse({ error: 'invalid question' }, 400);
	const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';

	// Retrieval-only mode: return the grounding sources without generating an
	// answer — no LLM cost, no quota. Powers the grounding preview + chat eval.
	if (body.retrieveOnly) {
		const grounding = await retrieve(question, body.section ?? null, body.version ?? null);
		return jsonResponse({ sources: grounding.sources }, 200);
	}

	const ipHash = hashIp(clientIp(request));
	const quota = await checkAndBumpQuota(ipHash);
	if (!quota.ok) return jsonResponse({ error: 'daily quota exceeded', cap: quota.cap }, 429);

	const started = Date.now();
	const grounding = await retrieve(question, body.section ?? null, body.version ?? null);
	const { system } = buildMessages(question, grounding.context);
	const promptChars = system.length + grounding.context.length + question.length;

	const chatId = newChatId(); // sent to the client (done event) so it can rate this answer
	const encoder = new TextEncoder();
	// Aborts upstream generation (the Anthropic fetch) when the client disconnects.
	const ac = new AbortController();
	let answer = '';
	const stream = new ReadableStream({
		async start(controller) {
			// enqueue can throw once the stream is cancelled — never let that escape.
			const send = (event: string, data: unknown) => {
				try {
					controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
				} catch {
					/* stream already closed/cancelled */
				}
			};
			const writeLog = () =>
				logChat({
					id: chatId,
					question,
					answer,
					sources: grounding.sources,
					grounded: grounding.sources.length > 0,
					promptChars,
					latencyMs: Date.now() - started,
					sessionId,
					ipHash,
				});
			try {
				send('sources', grounding.sources);
				for await (const delta of streamAnswer(question, grounding, ac.signal)) {
					answer += delta;
					send('token', delta);
				}
				// Persist the row BEFORE announcing its id, so a fast rating click on
				// /api/chat-feedback can't arrive before the ChatLog row exists.
				await writeLog();
				send('done', { id: chatId, model: modelId(), latencyMs: Date.now() - started });
			} catch (err: any) {
				// Log detail server-side; the client only gets a generic message.
				console.error('[chat] generation error', err?.message ?? err);
				send('error', { message: 'The answer could not be generated. Please try again.' });
				await writeLog(); // still record the (partial/failed) exchange
			} finally {
				try {
					controller.close();
				} catch {
					/* already closed */
				}
			}
		},
		cancel() {
			ac.abort(); // client went away — stop generating (and paying for) tokens
		},
	});

	return new Response(stream, {
		status: 200,
		headers: {
			'content-type': 'text/event-stream; charset=utf-8',
			'cache-control': 'no-store',
			'x-accel-buffering': 'no', // don't let a proxy buffer the stream
		},
	});
}
