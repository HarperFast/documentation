// Unit tests for the pure admin aggregation (lib/metrics-pure.ts): the 14-day
// windowing, the rate math (grounded/cache-hit/zero), faithfulness averaging,
// top-N sorting, and the zero-filled volume series. Split out of metrics.ts (which
// boots the DB on import) so it runs under plain `node --test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateSearch, aggregateChat } from '../../lib/metrics-pure.ts';

// A fixed "now" and dates relative to it (ISO) so windowing is deterministic.
const NOW = Date.parse('2026-07-05T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW - n * 86400000).toISOString();

test('aggregateChat: rate math over the window', () => {
	const rows = [
		{ createdAt: daysAgo(1), grounded: true, cached: false, model: 'sonnet', latencyMs: 100, feedback: 1, question: 'a', faithfulness: 1 },
		{ createdAt: daysAgo(2), grounded: true, cached: true, model: 'sonnet', latencyMs: 300, feedback: 0, question: 'a', faithfulness: 0.8 },
		{ createdAt: daysAgo(3), grounded: false, cached: true, model: 'stub', latencyMs: 200, feedback: -1, question: 'b' }, // no faithfulness score
	];
	const a = aggregateChat(rows, NOW, 14);
	assert.equal(a.totals.chats, 3);
	assert.equal(a.totals.grounded, 2);
	assert.equal(a.totals.groundedRate, 2 / 3);
	assert.equal(a.totals.cacheHits, 2);
	assert.equal(a.totals.cacheHitRate, 2 / 3);
	assert.equal(a.totals.avgLatencyMs, 200); // (100+300+200)/3
	assert.equal(a.totals.scored, 2); // only rows with a numeric faithfulness
	assert.equal(a.totals.avgFaithfulness, 0.9); // (1+0.8)/2 — the unscored row is excluded
	assert.deepEqual(a.feedback, { up: 1, down: 1, none: 1 });
	assert.deepEqual(
		a.topQuestions.map((q) => `${q.question}:${q.count}`),
		['a:2', 'b:1'],
	);
});

test('aggregateChat: rows outside the window are excluded', () => {
	const rows = [
		{ createdAt: daysAgo(2), grounded: true, question: 'in' },
		{ createdAt: daysAgo(20), grounded: true, question: 'old' }, // > 14 days → dropped
	];
	const a = aggregateChat(rows, NOW, 14);
	assert.equal(a.totals.chats, 1, 'only the in-window row counts');
	assert.equal(a.recent.length, 1);
});

test('aggregateChat: empty input → zero rates, no divide-by-zero', () => {
	const a = aggregateChat([], NOW, 14);
	assert.equal(a.totals.chats, 0);
	assert.equal(a.totals.groundedRate, 0);
	assert.equal(a.totals.cacheHitRate, 0);
	assert.equal(a.totals.avgFaithfulness, 0);
	assert.equal(a.totals.avgLatencyMs, 0);
});

test('aggregateChat: flagged list only holds scored+flagged rows, newest-first', () => {
	const rows = [
		{ createdAt: daysAgo(5), question: 'older', faithfulness: 0.3, flagged: true, flaggedNote: 'x' },
		{ createdAt: daysAgo(1), question: 'newer', faithfulness: 0.2, flagged: true, flaggedNote: 'y' },
		{ createdAt: daysAgo(2), question: 'fine', faithfulness: 0.95, flagged: false },
	];
	const a = aggregateChat(rows, NOW, 14);
	assert.equal(a.totals.flaggedCount, 2);
	assert.deepEqual(a.flagged.map((f) => f.question), ['newer', 'older']); // newest-first
});

test('aggregateChat: volume is a zero-filled series of exactly windowDays entries', () => {
	const a = aggregateChat([{ createdAt: daysAgo(0), question: 'q' }], NOW, 14);
	assert.equal(a.volume.length, 14);
	assert.equal(a.volume.at(-1)!.count, 1, "today's bucket (last in the series) carries the row");
	assert.equal(a.volume.at(0)!.count, 0, '13-days-ago bucket is zero-filled');
	assert.equal(a.volume.reduce((s, d) => s + d.count, 0), 1);
});

test('aggregateSearch: zeroRate, content-gap filtering, and section breakdown', () => {
	const rows = [
		{ createdAt: daysAgo(1), query: 'vector index', resultCount: 5, section: 'reference' },
		{ createdAt: daysAgo(1), query: 'vektor', resultCount: 0, section: 'reference' }, // zero-result gap
		{ createdAt: daysAgo(1), query: 'sc', resultCount: 0, section: 'learn' }, // < 3 chars → NOT a gap
		{ createdAt: daysAgo(1), query: 'vector index', resultCount: 5, section: 'learn' },
	];
	const a = aggregateSearch(rows, NOW, 14);
	assert.equal(a.totals.queries, 4);
	assert.equal(a.totals.zeroResult, 2);
	assert.equal(a.totals.zeroRate, 0.5);
	assert.deepEqual(a.topTerms[0], { query: 'vector index', count: 2, zero: false });
	assert.deepEqual(a.zeroResult.map((z) => z.query), ['vektor'], 'sub-3-char fragments excluded from gaps');
	assert.deepEqual(
		a.bySection.map((s) => s.section).sort(),
		['learn', 'reference'],
	);
});
