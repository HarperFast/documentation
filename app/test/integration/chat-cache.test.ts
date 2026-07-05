// Integration tests for the answer cache, condenser quota, and eviction against a
// RUNNING Harper instance (`npm run dev`). These exercise the parts that /verify
// had to check by hand.
//
// Two tiers:
//   - The log-before-`done` race guard runs under the dev stub (no API key).
//   - Cache hit / version scoping / eviction need a LIVE model (the stub never
//     caches), so they self-skip when the server is running the stub. They start
//     passing for real once ANTHROPIC_API_KEY is set in CI.
//
// A per-run nonce keeps questions unique so the first ask is always a cache miss.

import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.HARPER_TARGET ?? 'http://localhost:9936';
const NONCE = Date.now().toString(36);

let reachable: boolean | undefined;
async function serverUp(): Promise<boolean> {
	if (reachable !== undefined) return reachable;
	try {
		reachable = (await fetch(`${BASE}/`, { redirect: 'manual' })).status > 0;
	} catch {
		reachable = false;
	}
	return reachable;
}

function doneOf(body: string): any {
	const m = body.match(/event: done\ndata: (\{.*\})/);
	return m ? JSON.parse(m[1]) : null;
}

// One chat exchange; returns the parsed `done` payload. Distinct IP per caller
// keeps tests off each other's per-IP quota bucket.
async function chat(question: string, opts: { ip?: string; body?: Record<string, unknown> } = {}): Promise<any> {
	const res = await fetch(`${BASE}/api/chat`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-forwarded-for': opts.ip ?? '203.0.113.51' },
		body: JSON.stringify({ question, ...opts.body }),
	});
	return doneOf(await res.text());
}

async function rate(id: string, value: number): Promise<number> {
	const r = await fetch(`${BASE}/api/chat-feedback`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ id, value }),
	});
	return r.status;
}

let live: boolean | undefined;
async function liveModel(): Promise<boolean> {
	if (live !== undefined) return live;
	const d = await chat(`model probe ${NONCE}`, { ip: '203.0.113.59' });
	live = !!d && typeof d.model === 'string' && d.model !== 'stub';
	return live;
}

// Read the SSE stream and fire feedback the INSTANT the `done` frame arrives —
// before the stream is drained — so it fails if the ChatLog row is written after
// `done` instead of before it (the race both eviction fixes closed).
async function rateOnDone(question: string, ip: string, body?: Record<string, unknown>): Promise<number> {
	const res = await fetch(`${BASE}/api/chat`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
		body: JSON.stringify({ question, ...body }),
	});
	const reader = res.body!.getReader();
	const dec = new TextDecoder();
	let buf = '';
	let done: any = null;
	for (;;) {
		const { value, done: end } = await reader.read();
		if (end) break;
		buf += dec.decode(value, { stream: true });
		const m = buf.match(/event: done\ndata: (\{.*\})/);
		if (m) {
			done = JSON.parse(m[1]);
			break;
		}
	}
	void reader.cancel();
	assert.ok(done?.id, 'done event carried an id');
	return rate(done.id, 1); // +1 avoids evicting; we only assert the row exists
}

// ── Tier 2: log-before-`done` invariant (runs under the stub) ─────────────────

test('feedback fired the instant `done` arrives succeeds (row logged before done)', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const status = await rateOnDone(`race guard ${NONCE}: how do I define a table?`, '203.0.113.52');
	assert.equal(status, 200, 'ChatLog row exists by the time the client can rate');
});

// ── Tier 3: cache behavior (needs a live model; skips under the stub) ─────────

test('exact cache hit: the same question is served from cache the second time', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!(await liveModel())) return t.skip('dev stub does not cache — needs ANTHROPIC_API_KEY');
	const q = `cache exact ${NONCE}: how does replication work in Harper?`;
	const first = await chat(q, { ip: '203.0.113.53' });
	assert.ok(!first.cached, 'first ask is a miss (generated)');
	const second = await chat(q, { ip: '203.0.113.54' });
	assert.equal(second.cached, true, 'second ask is served from cache');
	assert.equal(second.via, 'exact', 'via the exact-key path');
});

test('version scoping: a v4-scoped answer is not served to a v5-scoped ask', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!(await liveModel())) return t.skip('dev stub does not cache — needs ANTHROPIC_API_KEY');
	const q = `cache scope ${NONCE}: how does indexing work?`;
	await chat(q, { ip: '203.0.113.55', body: { version: 'v4' } }); // cache under v4
	const v5 = await chat(q, { ip: '203.0.113.55', body: { version: 'v5' } });
	assert.ok(!v5.cached, 'same text under a different version scope is a miss');
	const v4again = await chat(q, { ip: '203.0.113.55', body: { version: 'v4' } });
	assert.equal(v4again.cached, true, 'the v4 scope still has its own cached answer');
});

test('eviction: a thumbs-down drops the cached answer so the next ask regenerates', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!(await liveModel())) return t.skip('dev stub does not cache — needs ANTHROPIC_API_KEY');
	const q = `cache evict ${NONCE}: how do I configure TLS?`;
	await chat(q, { ip: '203.0.113.56' }); // generate + cache
	const hit = await chat(q, { ip: '203.0.113.57' }); // cache hit
	assert.equal(hit.cached, true, 'cached before eviction');
	assert.equal(await rate(hit.id, -1), 200, 'thumbs-down recorded');
	const afterEvict = await chat(q, { ip: '203.0.113.58' });
	assert.ok(!afterEvict.cached, 'after eviction the answer regenerates (not served from cache)');
});
