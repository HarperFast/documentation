// End-to-end tests for the search modal — drives it as a real user would and
// asserts behavior against the live dev server. Ported from
// scripts/verify-search-ui.ts; selectors and query strings are kept verbatim so
// this stays a faithful contract of that manual verification.
//
// Uses the node:test runner with raw Playwright (not @playwright/test) to match
// the rest of the suite. Node 24 strips the types at load time.
//   Run: node --test test/e2e/search-ui.test.ts

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, type Browser, type Page } from 'playwright';

const BASE = process.env.HARPER_TARGET ?? 'http://localhost:9936';

let browser: Browser;

before(async () => {
	browser = await chromium.launch();
});

after(async () => {
	await browser?.close();
});

// Type a query and wait until the rendered results actually reflect IT, not a
// stale prior render. Clear first so the wait can't satisfy on old results,
// then wait for the list to be non-empty and (optionally) contain an expected
// path — and settle past the debounce so `active` is stable before we act.
// Kept identical to scripts/verify-search-ui.ts.
async function query(page: Page, text: string, expectPathIncludes?: string): Promise<void> {
	await page.fill('.search-input', '');
	await page.waitForFunction(() => document.querySelectorAll('.search-result').length === 0, { timeout: 4000 });
	await page.fill('.search-input', text);
	await page.waitForFunction(
		(needle) => {
			const links = [...document.querySelectorAll('.search-result a')].map((a) => a.getAttribute('href')!);
			return links.length > 0 && (!needle || links.some((h) => h.includes(needle)));
		},
		expectPathIncludes,
		{ timeout: 4000 }
	);
	await page.waitForTimeout(200);
}

// Land on a reference/v5 page (contextual scope = reference/v5) and open the
// modal via ⌘K, matching the verify script's entry flow.
async function openOnReference(): Promise<Page> {
	const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
	await page.goto(`${BASE}/reference/v5/database/schema`, { waitUntil: 'networkidle' });
	await page.keyboard.press('Meta+k');
	await page.waitForSelector('.search-overlay:not([hidden])', { timeout: 3000 });
	return page;
}

test('Cmd-K opens the search modal', async () => {
	const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
	try {
		await page.goto(`${BASE}/reference/v5/database/schema`, { waitUntil: 'networkidle' });
		await page.keyboard.press('Meta+k');
		await page.waitForSelector('.search-overlay:not([hidden])', { timeout: 3000 });
		assert.ok(await page.isVisible('.search-input'), 'search input should be visible after ⌘K');
	} finally {
		await page.close();
	}
});

test('typing a query renders contextual (reference/v5) results', async () => {
	const page = await openOnReference();
	try {
		await query(page, 'vector index', '/reference/v5');
		const scoped = await page.$$eval('.search-result', (els) =>
			els.map((e) => e.querySelector('a')!.getAttribute('href')!)
		);
		assert.ok(scoped.length > 0, `expected results, got ${scoped.length}`);
		assert.ok(
			scoped.every((h) => h.startsWith('/reference/v5')),
			`contextual scope should be reference/v5, first was ${scoped[0]}`
		);
	} finally {
		await page.close();
	}
});

test('all-docs toggle broadens scope', async () => {
	const page = await openOnReference();
	try {
		await query(page, 'vector index', '/reference/v5');
		await page.check('.search-allscope');
		// Wait for the re-search to actually broaden (a non-reference result to
		// appear) rather than a fixed timeout — under CI load a short fixed wait can
		// read the still-scoped results and flake.
		await page.waitForFunction(
			() => {
				const links = [...document.querySelectorAll('.search-result a')].map((a) => a.getAttribute('href') ?? '');
				return links.length > 0 && links.some((h) => !h.startsWith('/reference/v5'));
			},
			{ timeout: 4000 }
		);
		const all = await page.$$eval('.search-result', (els) =>
			els.map((e) => e.querySelector('a')!.getAttribute('href')!)
		);
		assert.ok(
			all.some((h) => !h.startsWith('/reference/v5')),
			`all-docs toggle should surface non-reference results (${all.length} results)`
		);
	} finally {
		await page.close();
	}
});

test('ArrowDown moves the active result', async () => {
	const page = await openOnReference();
	try {
		await query(page, 'authentication');
		const firstActive = await page.$eval('.search-result.active', (e) => e.querySelector('a')!.getAttribute('href')!);
		await page.keyboard.press('ArrowDown');
		const afterDown = await page.$eval('.search-result.active', (e) => e.querySelector('a')!.getAttribute('href')!);
		assert.notEqual(firstActive, afterDown, `ArrowDown should move selection (${firstActive} → ${afterDown})`);
	} finally {
		await page.close();
	}
});

test('typo query still returns results (fuzzy end-to-end)', async () => {
	const page = await openOnReference();
	try {
		await query(page, 'authentcation');
		const typo = await page.$$eval('.search-result', (els) => els.length);
		assert.ok(typo > 0, `expected fuzzy results for "authentcation", got ${typo}`);
	} finally {
		await page.close();
	}
});

test('Enter navigates to the active result', async () => {
	const page = await openOnReference();
	try {
		await query(page, 'jwt token', '/reference/v5/security/jwt-authentication');
		const target = await page.$eval('.search-result.active', (e) => e.querySelector('a')!.getAttribute('href')!);
		const base = target.split('#')[0];
		await Promise.all([
			page.waitForURL((u) => u.pathname === base, { timeout: 5000 }).catch(() => {}),
			page.keyboard.press('Enter'),
		]);
		assert.equal(new URL(page.url()).pathname, base, `Enter should navigate to ${base}, got ${page.url()}`);
	} finally {
		await page.close();
	}
});

test('Esc closes the modal', async () => {
	const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
	try {
		await page.goto(`${BASE}/learn`, { waitUntil: 'networkidle' });
		await page.click('#search-trigger');
		await page.waitForSelector('.search-overlay:not([hidden])');
		await page.keyboard.press('Escape');
		await page.waitForTimeout(200);
		assert.ok(await page.isHidden('.search-input'), 'Esc should hide the search input');
	} finally {
		await page.close();
	}
});

test('scope tracks the current section (learn)', async () => {
	const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
	try {
		await page.goto(`${BASE}/learn`, { waitUntil: 'networkidle' });
		await page.click('#search-trigger');
		await page.waitForSelector('.search-overlay:not([hidden])');
		await query(page, 'application', '/learn');
		const learnScoped = await page.$$eval('.search-result', (els) =>
			els.map((e) => e.querySelector('a')!.getAttribute('href')!)
		);
		assert.ok(
			learnScoped.every((h) => h.startsWith('/learn')),
			`scope on /learn should be learn, first was ${learnScoped[0]}`
		);
	} finally {
		await page.close();
	}
});
