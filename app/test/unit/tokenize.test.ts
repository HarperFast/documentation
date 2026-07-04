// Unit tests for the shared tokenizer/trigram/edit-distance helpers. These run
// at BOTH index and query time, so their behavior is a hard contract — a change
// here silently corrupts retrieval. Pure functions, no I/O: fast node:test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, termCounts, trigrams, trigramSimilarity, editDistance } from '../../lib/tokenize.ts';

test('tokenize: empty / nullish → []', () => {
	assert.deepEqual(tokenize(''), []);
	assert.deepEqual(tokenize(null), []);
	assert.deepEqual(tokenize(undefined), []);
});

test('tokenize: lowercases, drops stopwords and 1-char tokens', () => {
	assert.deepEqual(tokenize('The Cat'), ['cat']); // "the" is a stopword
	assert.deepEqual(tokenize('a b cd'), ['cd']); // "a" stopword, "b" too short
});

test('tokenize: keeps whole identifier AND camelCase parts', () => {
	// whole identifier first, then the split parts (order matters for the index)
	assert.deepEqual(tokenize('getRecordCount'), ['getrecordcount', 'get', 'record', 'count']);
});

test('tokenize: splits digit boundaries but drops the 1-char digit', () => {
	// "http2" kept whole; parts "http"/"2" — "2" dropped as 1-char
	assert.deepEqual(tokenize('HTTP2'), ['http2', 'http']);
});

test('tokenize: splits on non-alphanumeric runs', () => {
	assert.deepEqual(tokenize('vector-index_search'), ['vector', 'index', 'search']);
});

test('termCounts: tallies occurrences', () => {
	assert.deepEqual(termCounts(['a', 'a', 'b']), { a: 2, b: 1 });
	assert.deepEqual(termCounts([]), {});
});

test('trigrams: sliding windows, whole term when <3', () => {
	assert.deepEqual(trigrams('vector'), ['vec', 'ect', 'cto', 'tor']);
	assert.deepEqual(trigrams('ab'), ['ab']);
	assert.deepEqual(trigrams('abc'), ['abc']);
});

test('trigramSimilarity: identical → 1, disjoint → 0, symmetric', () => {
	assert.equal(trigramSimilarity('vector', 'vector'), 1);
	assert.equal(trigramSimilarity('abcdef', 'uvwxyz'), 0);
	assert.equal(trigramSimilarity('replication', 'replicate'), trigramSimilarity('replicate', 'replication'));
});

test('editDistance: substitutions, transpositions, and the bound', () => {
	assert.equal(editDistance('vector', 'vector'), 0);
	assert.equal(editDistance('vektor', 'vector'), 1); // single substitution
	assert.equal(editDistance('replciation', 'replication'), 1); // adjacent transposition (Damerau)
	// bail out early once the best possible distance exceeds max
	assert.equal(editDistance('abcdefgh', '12345678', 2), 3); // max + 1
});
