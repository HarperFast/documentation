// Unit tests for the pure chat helpers (lib/chat-pure.ts) — version scoping,
// cache-key derivation, question validation, and cosine. These are split out of
// chat.ts precisely so they can run under plain `node --test` without booting the
// Harper runtime. parseVersion in particular shipped a real bug (multi-version
// bias) that a test like this would have caught.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVersion, normalizeQuestion, cacheKey, computeCacheId, validateQuestion, cosine } from '../../lib/chat-pure.ts';

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

test('cosine: identical→1, orthogonal→0, opposite→-1, zero-vector→0', () => {
	assert.equal(Number(cosine([1, 2, 3], [2, 4, 6]).toFixed(6)), 1); // same direction
	assert.equal(cosine([1, 0], [0, 1]), 0); // orthogonal
	assert.equal(Number(cosine([1, 0], [-1, 0]).toFixed(6)), -1); // opposite
	assert.equal(cosine([0, 0], [1, 1]), 0); // guards divide-by-zero
});
