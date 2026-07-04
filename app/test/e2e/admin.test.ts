// End-to-end tests for the admin area: OAuth gating for anonymous users, and
// the dev-login → session-cookie → tabbed dashboards flow.
//
// Uses the node:test runner with raw Playwright (not @playwright/test) to match
// the rest of the suite. Node 24 strips the types at load time.
//   Run: node --test test/e2e/admin.test.ts

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type BrowserContext, type Cookie } from 'playwright';

const BASE = process.env.HARPER_TARGET ?? 'http://localhost:9936';

// Admin credentials: the ~/hdb-docs-replatform/.admin-credentials file
// (HARPER_CLI_USERNAME= / HARPER_CLI_PASSWORD= lines) takes precedence, then
// the same-named env vars. If neither yields a pair, the dev-login tests skip.
function readCredentials(): { username: string; password: string } | null {
	let username = process.env.HARPER_CLI_USERNAME ?? '';
	let password = process.env.HARPER_CLI_PASSWORD ?? '';
	try {
		const raw = readFileSync(join(homedir(), 'hdb-docs-replatform', '.admin-credentials'), 'utf8');
		const u = raw.match(/^HARPER_CLI_USERNAME=(.*)$/m);
		const p = raw.match(/^HARPER_CLI_PASSWORD=(.*)$/m);
		if (u) username = u[1].trim();
		if (p) password = p[1].trim();
	} catch {
		// No credentials file — fall back to whatever the env provided.
	}
	if (!username || !password) return null;
	return { username, password };
}

const creds = readCredentials();
const skipDevLogin = creds
	? false
	: 'no admin credentials found (~/hdb-docs-replatform/.admin-credentials or HARPER_CLI_USERNAME/HARPER_CLI_PASSWORD)';

let browser: Browser;
// A context whose ONLY authorization is the session cookie minted by
// /admin/dev-login — no Authorization header — proving the cookie alone gates
// the admin views. Populated in before() when credentials are available.
let sessionOnly: BrowserContext | null = null;

before(async () => {
	browser = await chromium.launch();

	if (!creds) return;

	// 1. Preemptive Basic auth: Playwright's httpCredentials only sends after a
	//    401, but /admin/dev-login returns 403 for non-super_user, so the header
	//    must be sent on the first request.
	const basic = 'Basic ' + Buffer.from(`${creds.username}:${creds.password}`).toString('base64');
	const authed = await browser.newContext({ extraHTTPHeaders: { Authorization: basic } });
	const page = await authed.newPage();
	// Minting the session redirects to /admin/ingest, which renders (200) only
	// because the session now carries the admin oauthUser.
	const resp = await page.goto(`${BASE}/admin/dev-login`, { waitUntil: 'load' });
	assert.equal(resp?.status(), 200, 'dev-login should land on the dashboard (200)');

	// 2. Copy the session cookie into a FRESH context with NO auth header.
	const cookies: Cookie[] = await authed.cookies();
	assert.ok(
		cookies.some((c) => /session/i.test(c.name)),
		'dev-login should have set a session cookie'
	);
	sessionOnly = await browser.newContext();
	await sessionOnly.addCookies(cookies);

	await authed.close();
});

after(async () => {
	await sessionOnly?.close();
	await browser?.close();
});

test('anonymous /admin/ingest redirects toward Google OAuth', async () => {
	// Fresh context, no session, no auth. Do not follow the redirect (it would
	// leave localhost for accounts.google.com and hang) — assert on the first
	// response's 302 Location instead.
	const anon = await browser.newContext();
	try {
		const resp = await anon.request.get(`${BASE}/admin/ingest`, { maxRedirects: 0 });
		assert.equal(resp.status(), 302, 'anonymous admin access should redirect (302)');
		const location = resp.headers()['location'] ?? '';
		assert.ok(
			location.startsWith('/oauth/google/login'),
			`redirect should kick off Google OAuth, got Location: ${location}`
		);
	} finally {
		await anon.close();
	}
});

// The session cookie alone (no Authorization header) must authorize each admin
// view and land on the correct active tab.
const tabs: ReadonlyArray<readonly [string, string]> = [
	['/admin/ingest', 'Ingest'],
	['/admin/search', 'Search'],
	['/admin/validation', 'Validation'],
];

for (const [path, label] of tabs) {
	test(`session cookie authorizes ${path} (active tab: ${label})`, { skip: skipDevLogin }, async () => {
		assert.ok(sessionOnly, 'session-only context should be established in before()');
		const page = await sessionOnly.newPage();
		try {
			const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'load' });
			assert.equal(resp?.status(), 200, `${path} should return 200 with only the session cookie`);
			const active = (await page.textContent('.admin-tab.is-active'))?.trim();
			assert.equal(active, label, `active tab on ${path} should be "${label}"`);
		} finally {
			await page.close();
		}
	});
}
