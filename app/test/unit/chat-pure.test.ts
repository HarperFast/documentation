// Unit tests for the pure chat helpers (lib/chat-pure.ts) — version scoping,
// cache-key derivation, question validation, and cosine. These are split out of
// chat.ts precisely so they can run under plain `node --test` without booting the
// Harper runtime. parseVersion in particular shipped a real bug (multi-version
// bias) that a test like this would have caught.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVersion, normalizeQuestion, cacheKey, computeCacheId, validateQuestion, cosine, clientIp, hashIp } from '../../lib/chat-pure.ts';

// A minimal fake request: X-Forwarded-For header + socket-peer ip.
function req(xff: string | null, ip?: string) {
	return { headers: { get: (n: string) => (n.toLowerCase() === 'x-forwarded-for' ? xff : null) }, ip };
}

test('parseVersion: exactly one version → that version', () => {
	assert.equal(parseVersion('how does replication work in v4?'), 'v4');
	assert.equal(parseVersion('what is new in v5'), 'v5');
	assert.equal(parseVersion('in V4 clustered mode'), 'v4'); // case-insensitive
	assert.equal(parseVersion('the answer is v5, definitely v5'), 'v5'); // repeated same version
});

test('parseVersion: zero or multiple versions → null (default scope)', () => {
	assert.equal(parseVersion('how does replication work?'), null); // none
	assert.equal(parseVersion('what changed between v4 and v5?'), null); // comparison → not biased to v4
	assert.equal(parseVersion('upgrading from v4 to v5'), null); // both
	assert.equal(parseVersion('the v45 storage format'), null); // no word boundary — not a version
	assert.equal(parseVersion('version 6 or v3'), null); // v3/v6 are out of range
});

test('normalizeQuestion: lowercases, collapses whitespace, strips trailing punctuation', () => {
	assert.equal(normalizeQuestion('  How   Does X Work?!! '), 'how does x work');
	assert.equal(normalizeQuestion('Replication.'), 'replication');
	assert.equal(normalizeQuestion('a\tb\nc'), 'a b c');
});

test('cacheKey: "<release>:<version>:<20-hex>" and scope-sensitive', () => {
	const k = cacheKey('rel-1', 'v5', 'how does x work');
	assert.match(k, /^rel-1:v5:[0-9a-f]{20}$/);
	// Different scope → different slot (a v4 answer must never share a v5 key).
	assert.notEqual(cacheKey('rel-1', 'v4', 'q'), cacheKey('rel-1', 'v5', 'q'));
	assert.notEqual(cacheKey('rel-1', 'v5', 'q'), cacheKey('rel-2', 'v5', 'q'));
	// Same inputs → stable id.
	assert.equal(cacheKey('rel-1', 'v5', 'q'), cacheKey('rel-1', 'v5', 'q'));
});

test('computeCacheId: equals cacheKey(normalizeQuestion(q)) — the eviction invariant', () => {
	// This is the contract eviction relies on: the id logged for a stored answer
	// MUST be the id storeCache/lookupCache derive, or a thumbs-down silently
	// no-ops. Pin it here so a future divergence fails loudly.
	assert.equal(computeCacheId('r', 'v5', 'How does X work?'), cacheKey('r', 'v5', normalizeQuestion('How does X work?')));
	// Normalization means punctuation/case/whitespace variants collide (a hit).
	assert.equal(computeCacheId('r', 'v5', 'How does X work?'), computeCacheId('r', 'v5', '  how  does x WORK '));
	// But different questions do not.
	assert.notEqual(computeCacheId('r', 'v5', 'how does x work'), computeCacheId('r', 'v5', 'how does y work'));
});

test('validateQuestion: trims valid, rejects non-strings and out-of-range lengths', () => {
	assert.equal(validateQuestion('  hello  '), 'hello');
	assert.equal(validateQuestion('a'), null); // < 2 chars
	assert.equal(validateQuestion(''), null);
	assert.equal(validateQuestion('   '), null); // whitespace-only trims to empty
	assert.equal(validateQuestion(123), null);
	assert.equal(validateQuestion(null), null);
	assert.equal(validateQuestion('x'.repeat(1001)), null); // > MAX_QUESTION
	assert.equal(validateQuestion('x'.repeat(1000)), 'x'.repeat(1000)); // exactly MAX is ok
});

test('clientIp: ignores X-Forwarded-For unless CHAT_TRUST_PROXY=true (anti-spoofing)', () => {
	const prev = process.env.CHAT_TRUST_PROXY;
	try {
		delete process.env.CHAT_TRUST_PROXY; // default: do NOT trust the header
		assert.equal(clientIp(req('1.1.1.1, 2.2.2.2', '9.9.9.9')), '9.9.9.9', 'untrusted → socket peer, not spoofable header');
		assert.equal(clientIp(req(null, '9.9.9.9')), '9.9.9.9');
		assert.equal(clientIp(req('1.1.1.1')), 'local', 'no socket ip → "local"');
	} finally {
		if (prev === undefined) delete process.env.CHAT_TRUST_PROXY;
		else process.env.CHAT_TRUST_PROXY = prev;
	}
});

test('clientIp: behind a trusted proxy, takes the RIGHTMOST hop', () => {
	const prev = process.env.CHAT_TRUST_PROXY;
	try {
		process.env.CHAT_TRUST_PROXY = 'true';
		// Leftmost hops are client-supplied/spoofable; the proxy appends the real one last.
		assert.equal(clientIp(req('1.1.1.1, 2.2.2.2, 3.3.3.3', '9.9.9.9')), '3.3.3.3');
		assert.equal(clientIp(req('  1.1.1.1 ,  2.2.2.2  ', '9.9.9.9')), '2.2.2.2', 'trims hops');
		assert.equal(clientIp(req('1.1.1.1, , ', '9.9.9.9')), '1.1.1.1', 'skips empty trailing hops');
		assert.equal(clientIp(req(null, '9.9.9.9')), '9.9.9.9', 'no header → socket peer');
		assert.equal(clientIp(req('', '9.9.9.9')), '9.9.9.9', 'empty header → socket peer');
	} finally {
		if (prev === undefined) delete process.env.CHAT_TRUST_PROXY;
		else process.env.CHAT_TRUST_PROXY = prev;
	}
});

test('hashIp: 16-hex, deterministic, and collision-resistant across IPs', () => {
	const a = hashIp('203.0.113.7');
	assert.match(a, /^[0-9a-f]{16}$/, 'never a raw IP — 16 hex chars');
	assert.equal(a, hashIp('203.0.113.7'), 'same IP → same hash (stable quota bucket in-process)');
	assert.notEqual(a, hashIp('203.0.113.8'), 'different IP → different hash');
});

test('cosine: identical→1, orthogonal→0, opposite→-1, zero-vector→0', () => {
	assert.equal(Number(cosine([1, 2, 3], [2, 4, 6]).toFixed(6)), 1); // same direction
	assert.equal(cosine([1, 0], [0, 1]), 0); // orthogonal
	assert.equal(Number(cosine([1, 0], [-1, 0]).toFixed(6)), -1); // opposite
	assert.equal(cosine([0, 0], [1, 1]), 0); // guards divide-by-zero
});
