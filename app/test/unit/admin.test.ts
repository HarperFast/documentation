// Unit tests for the admin dashboard renderers. Pure string builders (no I/O):
// feed a fixed view-model, assert the produced HTML carries the right shell,
// active tab, and formatted numbers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	renderIngestDashboard,
	renderSearchDashboard,
	renderValidationDashboard,
	type SearchAnalytics,
	type EvalTrend,
	type ParityTrend,
} from '../../lib/admin.ts';

test('renderIngestDashboard: shell, active Ingest tab, run data', () => {
	const html = renderIngestDashboard([
		{
			id: 'abc123-1700000000000',
			status: 'activated',
			pages: 392,
			chunks: 2578,
			terms: 7778,
			pruned: 2,
			durationMs: 530000,
			startedAt: '2026-07-03T21:33:00Z',
			guard: { actual: { pages: 392, nav: 6, redirects: 1376 } },
		},
	]);
	assert.match(html, /<!DOCTYPE html>/);
	assert.match(html, /Ingest Observability/);
	assert.match(html, /class="admin-tab is-active"[^>]*>Ingest/);
	assert.match(html, /activated/);
	assert.match(html, /2,578/); // thousands-formatted chunk count
});

const SAMPLE_SEARCH: SearchAnalytics = {
	totals: { queries: 1649, zeroResult: 29, zeroRate: 0.0176, windowDays: 14 },
	topTerms: [
		{ query: 'vector index', count: 57, zero: false },
		{ query: 'vektor', count: 1, zero: true },
	],
	zeroResult: [{ query: 'vektor', count: 1 }],
	volume: [
		{ day: '2026-07-03', count: 1553 },
		{ day: '2026-07-04', count: 96 },
	],
	bySection: [
		{ section: 'all', count: 1553 },
		{ section: 'learn', count: 69 },
	],
};

test('renderSearchDashboard: active Search tab, totals, panels', () => {
	const html = renderSearchDashboard(SAMPLE_SEARCH);
	assert.match(html, /class="admin-tab is-active"[^>]*>Search/);
	assert.match(html, /1,649/); // total queries
	assert.match(html, /1\.8%/); // zeroRate 0.0176 → 1.8%
	assert.match(html, /Top queries/);
	assert.match(html, /vector index/);
	assert.match(html, /Content gaps/);
	assert.match(html, /By section/);
});

const SAMPLE_EVAL: EvalTrend = {
	latest: {
		id: 'e1',
		gitSha: 'abc123',
		mrr: 0.907,
		recall5: 1,
		recall10: 1,
		zeroRate: 0,
		cases: 44,
		weak: 1,
		passed: null,
		createdAt: '2026-07-04T00:00:00Z',
	},
	runs: [
		{ id: 'e1', gitSha: 'abc123', mrr: 0.907, recall5: 1, recall10: 1, zeroRate: 0, cases: 44, weak: 1, passed: null, createdAt: '2026-07-04T00:00:00Z' },
	],
};

const SAMPLE_PARITY: ParityTrend = {
	latest: {
		id: 'p1',
		gitSha: 'abc123',
		pages: 392,
		titlesOk: 392,
		redirectsOk: 1376,
		simMedian: 0.999,
		simMin: 0.842,
		hardFailures: 0,
		strict: false,
		passed: true,
		createdAt: '2026-07-04T00:00:00Z',
	},
	runs: [
		{ id: 'p1', gitSha: 'abc123', pages: 392, titlesOk: 392, redirectsOk: 1376, simMedian: 0.999, simMin: 0.842, hardFailures: 0, strict: false, passed: true, createdAt: '2026-07-04T00:00:00Z' },
	],
};

test('renderValidationDashboard: active Validation tab, eval + parity numbers', () => {
	const html = renderValidationDashboard(SAMPLE_EVAL, SAMPLE_PARITY);
	assert.match(html, /class="admin-tab is-active"[^>]*>Validation/);
	assert.match(html, /0\.907/); // MRR (3 decimals)
	assert.match(html, /100\.0%/); // recall5 1 → 100.0%
	assert.match(html, /Content parity/);
	assert.match(html, /99\.9%/); // simMedian
	assert.match(html, /84\.2%/); // simMin
});

test('renderValidationDashboard: empty states when no runs', () => {
	const html = renderValidationDashboard({ latest: null, runs: [] }, { latest: null, runs: [] });
	assert.match(html, /class="admin-tab is-active"[^>]*>Validation/);
	assert.match(html, /No .{0,40}runs/i); // both sections show an empty-state message
});
