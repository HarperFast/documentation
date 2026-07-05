// E2E: the M3 chat surfaces — the dedicated /chat page and the site-wide widget.
// Needs the dev server running (answers come from the dev stub unless
// ANTHROPIC_API_KEY is set; the UI behaves the same either way). A distinct
// X-Forwarded-For keeps these off the shared localhost chat quota.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, type Browser, type BrowserContext } from 'playwright';

const BASE = process.env.HARPER_TARGET ?? 'http://localhost:9936';

let browser: Browser;
let ctx: BrowserContext;

before(async () => {
	browser = await chromium.launch();
	ctx = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': '203.0.113.60' } });
});
after(async () => {
	await browser?.close();
});

test('/chat page streams a grounded answer with citations', async () => {
	const page = await ctx.newPage();
	try {
		await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' });
		await page.waitForSelector('#chat-root .chat-input', { timeout: 5000 });
		await page.locator('.chat-input').fill('How do I define a table schema in Harper?');
		await page.locator('.chat-input').press('Enter');
		// Wait until the answer has actually streamed in (not just the empty bubble).
		await page.waitForFunction(
			() => (document.querySelector('.chat-msg-assistant .chat-bubble')?.textContent ?? '').trim().length > 0,
			{ timeout: 8000 }
		);
		await page.waitForSelector('.chat-source', { timeout: 8000 });
		const answer = await page.locator('.chat-msg-assistant .chat-bubble').first().innerText();
		assert.ok(answer.trim().length > 0, 'assistant answer rendered');
		assert.ok((await page.locator('.chat-source').count()) > 0, 'citations rendered');
		assert.equal(await page.locator('.chat-msg-user').count(), 1, 'user message echoed once');
	} finally {
		await page.close();
	}
});

test('multi-turn: the browser accumulates conversation history and sends it', async () => {
	const page = await ctx.newPage();
	// Capture every /api/chat POST body so we can assert what the browser sent.
	const sent: any[] = [];
	page.on('request', (req) => {
		if (req.method() === 'POST' && req.url().endsWith('/api/chat')) {
			try {
				sent.push(JSON.parse(req.postData() ?? '{}'));
			} catch {
				/* ignore non-JSON */
			}
		}
	});
	// Waits until streaming finishes (composer re-enabled) so the turn is fully recorded.
	const settle = () => page.waitForFunction(() => !(document.querySelector('.chat-input') as HTMLTextAreaElement)?.disabled, { timeout: 15000 });
	const askAndWait = async (q: string, expectCount: number) => {
		await page.locator('.chat-input').fill(q);
		await page.locator('.chat-input').press('Enter');
		await page.waitForFunction(
			(n) => document.querySelectorAll('.chat-msg-assistant .chat-bubble').length >= n &&
				(document.querySelectorAll('.chat-msg-assistant .chat-bubble')[n - 1]?.textContent ?? '').trim().length > 0,
			expectCount,
			{ timeout: 15000 }
		);
		await settle();
	};
	try {
		await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' });
		await page.waitForSelector('#chat-root .chat-input', { timeout: 5000 });

		await askAndWait('How does replication work in Harper?', 1);
		await askAndWait('what about for v4?', 2);

		// Turn 1 carried no prior history; turn 2 carried the first Q + its answer.
		assert.equal(sent.length, 2, 'two chat requests were sent');
		assert.deepEqual(sent[0].history ?? [], [], 'first request sends empty history');
		const h = sent[1].history;
		assert.ok(Array.isArray(h) && h.length === 2, 'second request carries the prior turn (2 messages)');
		assert.equal(h[0].role, 'user');
		assert.equal(h[0].content, 'How does replication work in Harper?', 'user turn recorded verbatim');
		assert.equal(h[1].role, 'assistant');
		assert.ok(h[1].content.trim().length > 0, 'assistant turn recorded with its answer');
	} finally {
		await page.close();
	}
});

test('site-wide widget opens from the launcher and answers', async () => {
	const page = await ctx.newPage();
	try {
		await page.goto(`${BASE}/reference/v5`, { waitUntil: 'domcontentloaded' });
		assert.ok(await page.locator('#chat-launcher').isVisible(), 'launcher present on doc pages');
		await page.locator('#chat-launcher').click();
		await page.waitForSelector('#chat-panel:not([hidden]) .chat-input', { timeout: 5000 });
		await page.locator('#chat-panel .chat-input').fill('what is replication?');
		await page.locator('#chat-panel .chat-input').press('Enter');
		await page.waitForFunction(
			() =>
				(document.querySelector('#chat-panel .chat-msg-assistant .chat-bubble')?.textContent ?? '').trim().length >
				0,
			{ timeout: 8000 }
		);
		const answer = await page.locator('#chat-panel .chat-msg-assistant .chat-bubble').first().innerText();
		assert.ok(answer.trim().length > 0, 'widget streamed an answer');
	} finally {
		await page.close();
	}
});
