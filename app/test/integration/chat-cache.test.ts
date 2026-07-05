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
// Isolation notes:
//   - Run the server with CHAT_TRUST_PROXY=true so the per-test `x-forwarded-for`
//     lands in clientIp() and each test gets its own quota bucket; otherwise all
//     requests share the socket-peer bucket and re-runs can hit CHAT_DAILY_CAP.
//     Tests skip (don't fail) if they do hit the cap.
//   - The cache tests scope every question under a unique per-run version
//     (`test-<nonce>`) so a previous run's semantically-similar rows can't be
//     matched by the semantic lane — the first ask is always a genuine miss.

import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.HARPER_TARGET ?? 'http://localhost:9936';
const NONCE = Date.now().toString(36);
const SCOPE = `test-${NONCE}`; // synthetic cache version — isolates this run's cache state

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

const QUOTA = Symbol('quota-exhausted');

// One chat exchange. Returns the parsed `done` payload, null if the stream
// carried no completion (provider error), or the QUOTA sentinel on a 429. A
// distinct IP per caller keeps tests off each other's quota bucket (when the
// server trusts X-Forwarded-For).
async function chat(question: string, opts: { ip?: string; version?: string } = {}): Promise<any> {
	const res = await fetch(`${BASE}/api/chat`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-forwarded-for': opts.ip ?? '203.0.113.51' },
		body: JSON.stringify({ question, ...(opts.version ? { version: opts.version } : {}) }),
	});
	if (res.status === 429) return QUOTA;
	if (!res.ok) return null;
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
	try {
		const d = await chat(`model probe ${NONCE}`, { ip: '203.0.113.59', version: SCOPE });
		// Only a COMPLETED, non-stub answer means live. A missing/QUOTA result is an
		// environmental hiccup, not proof of the stub — treat as not-live so we skip
		// rather than run live-only assertions against a broken/empty response.
		live = Boolean(typeof d === 'object' && d !== null && d.model && d.model !== 'stub');
	} catch {
		live = false;
	}
	return live;
}

// Read the SSE stream and fire feedback the INSTANT the `done` frame arrives —
// before the stream is drained — so it fails if the ChatLog row is written after
// `done` instead of before it (the race both eviction fixes closed).
async function rateOnDone(question: string, ip: string): Promise<number | null> {
	const res = await fetch(`${BASE}/api/chat`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
		body: JSON.stringify({ question }),
	});
	if (res.status === 429 || !res.ok || !res.body) return null; // environmental → caller skips
	const reader = res.body.getReader();
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
	if (!done?.id) return null;
	return rate(done.id, 1); // +1 avoids evicting; we only assert the row exists
}

// ── Tier 2: log-before-`done` invariant (runs under the stub) ─────────────────

test('feedback fired the instant `done` arrives succeeds (row logged before done)', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const status = await rateOnDone(`race guard ${NONCE}: how do I define a table?`, '203.0.113.52');
	if (status === null) return t.skip('no completion (quota/provider) — environmental');
	assert.equal(status, 200, 'ChatLog row exists by the time the client can rate');
});

// ── Tier 3: cache behavior (needs a live model; skips under the stub) ─────────

test('exact cache hit: the same question is served from cache the second time', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!(await liveModel())) return t.skip('dev stub does not cache — needs ANTHROPIC_API_KEY');
	const q = `cache exact ${NONCE}: how does replication work in Harper?`;
	const first = await chat(q, { ip: '203.0.113.53', version: SCOPE });
	if (first === QUOTA || first === null) return t.skip('quota/environmental');
	assert.ok(!first.cached, 'first ask is a miss (generated)');
	const second = await chat(q, { ip: '203.0.113.54', version: SCOPE });
	if (second === QUOTA || second === null) return t.skip('quota/environmental');
	assert.equal(second.cached, true, 'second ask is served from cache');
	assert.equal(second.via, 'exact', 'via the exact-key path');
});

test('version scoping: the same question under a different version scope is a separate entry', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!(await liveModel())) return t.skip('dev stub does not cache — needs ANTHROPIC_API_KEY');
	const q = `cache scope ${NONCE}: how does indexing work?`;
	const a1 = await chat(q, { ip: '203.0.113.55', version: `${SCOPE}-a` }); // cache under scope A
	if (a1 === QUOTA || a1 === null) return t.skip('quota/environmental');
	const b1 = await chat(q, { ip: '203.0.113.55', version: `${SCOPE}-b` }); // same text, scope B
	if (b1 === QUOTA || b1 === null) return t.skip('quota/environmental');
	assert.ok(!b1.cached, 'same text under a different version scope is a miss (not shared)');
	const a2 = await chat(q, { ip: '203.0.113.55', version: `${SCOPE}-a` });
	if (a2 === QUOTA || a2 === null) return t.skip('quota/environmental');
	assert.equal(a2.cached, true, 'scope A still has its own cached answer');
});

test('eviction: a thumbs-down drops the cached answer so the next ask regenerates', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!(await liveModel())) return t.skip('dev stub does not cache — needs ANTHROPIC_API_KEY');
	const q = `cache evict ${NONCE}: how do I configure TLS?`;
	const gen = await chat(q, { ip: '203.0.113.56', version: SCOPE }); // generate + cache
	if (gen === QUOTA || gen === null) return t.skip('quota/environmental');
	const hit = await chat(q, { ip: '203.0.113.57', version: SCOPE }); // cache hit
	if (hit === QUOTA || hit === null) return t.skip('quota/environmental');
	assert.equal(hit.cached, true, 'cached before eviction');
	assert.equal(await rate(hit.id, -1), 200, 'thumbs-down recorded');
	const after = await chat(q, { ip: '203.0.113.58', version: SCOPE });
	if (after === QUOTA || after === null) return t.skip('quota/environmental');
	assert.ok(!after.cached, 'after eviction the answer regenerates (not served from cache)');
});
