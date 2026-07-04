// Search relevance eval. Runs the golden query set against /api/search and
// scores ranking quality — the tuning loop and the pre-cutover relevance gate
// (sibling to parity.mjs, but for relevance instead of content fidelity).
//
// Usage:
//   node scripts/search-eval.mjs [--target http://localhost:9936]
//                                [--set eval/golden-set.json]
//                                [--min-mrr 0.6] [--verbose] [--json]
//
// Metrics (averaged over cases):
//   MRR       — mean reciprocal rank of the first correct result (1=top, .5=#2)
//   Recall@5  — fraction of queries with a correct page in the top 5
//   Recall@10 — same, top 10
//   0-result  — fraction returning nothing (health, not ranking)
//
// A `case` is correct when a result's path CONTAINS one of its `expect`
// substrings (so one entry credits both v4 and v5 variants).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordMetric, gitSha } from './lib/record.ts';

interface Case {
	q: string;
	expect: string[];
	section?: string;
	version?: string;
}

interface SearchResult {
	path: string;
}

interface Row {
	q: string;
	expect?: string[];
	error?: string;
	rank: number;
	rr: number;
	hit5?: boolean;
	hit10?: boolean;
	zero?: boolean;
	top: string;
}

const APP_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TARGET = argValue('--target') ?? process.env.HARPER_TARGET ?? 'http://localhost:9936';
const SET_PATH = path.resolve(APP_DIR, argValue('--set') ?? 'eval/golden-set.json');
const MIN_MRR = Number(argValue('--min-mrr') ?? NaN);
const VERBOSE = process.argv.includes('--verbose');
const JSON_OUT = process.argv.includes('--json');
const NO_RECORD = process.argv.includes('--no-record');
const K = 10;

const { cases }: { cases: Case[] } = JSON.parse(readFileSync(SET_PATH, 'utf8'));

const rows: Row[] = [];
for (const c of cases) {
	const params = new URLSearchParams({ q: c.q, limit: String(K) });
	if (c.section) params.set('section', c.section);
	if (c.version) params.set('version', c.version);
	let results: SearchResult[] = [];
	try {
		results = (await (await fetch(`${TARGET}/api/search?${params}`)).json()).results ?? [];
	} catch (err: any) {
		rows.push({ q: c.q, error: err.message, rank: 0, rr: 0, top: '' });
		continue;
	}
	// rank (1-based) of the first result matching any expected substring.
	let rank = 0;
	for (let i = 0; i < results.length; i++) {
		if (c.expect.some((e) => results[i].path.includes(e))) {
			rank = i + 1;
			break;
		}
	}
	rows.push({
		q: c.q,
		expect: c.expect,
		rank,
		rr: rank ? 1 / rank : 0,
		hit5: rank > 0 && rank <= 5,
		hit10: rank > 0 && rank <= 10,
		zero: results.length === 0,
		top: results[0]?.path ?? '',
	});
}

const n = rows.length;
const mrr = avg(rows.map((r) => r.rr));
const recall5 = avg(rows.map((r) => (r.hit5 ? 1 : 0)));
const recall10 = avg(rows.map((r) => (r.hit10 ? 1 : 0)));
const zeroRate = avg(rows.map((r) => (r.zero ? 1 : 0)));
const misses = rows.filter((r) => !r.hit10).sort((a, b) => a.q.localeCompare(b.q));
const weak = rows.filter((r) => r.rank > 3 && r.hit10).sort((a, b) => b.rank - a.rank);

if (JSON_OUT) {
	console.log(JSON.stringify({ target: TARGET, n, mrr, recall5, recall10, zeroRate, rows }, null, '\t'));
} else {
	console.log(`\nSearch relevance — ${n} queries vs ${TARGET}\n`);
	console.log(`  MRR:        ${mrr.toFixed(3)}`);
	console.log(`  Recall@5:   ${(recall5 * 100).toFixed(1)}%`);
	console.log(`  Recall@10:  ${(recall10 * 100).toFixed(1)}%`);
	console.log(`  0-result:   ${(zeroRate * 100).toFixed(1)}%`);

	if (misses.length) {
		console.log(`\n  Misses (no correct page in top ${K}):`);
		for (const r of misses)
			console.log(`    ✗ "${r.q}" → expected ${JSON.stringify(r.expect)}; top was ${r.top || '(none)'}`);
	}
	if (weak.length) {
		console.log(`\n  Weak (correct but ranked 4+):`);
		for (const r of weak) console.log(`    · "${r.q}" → rank ${r.rank} (${r.top})`);
	}
	if (VERBOSE) {
		console.log('\n  All cases:');
		for (const r of rows) console.log(`    ${r.rank ? `#${r.rank}`.padEnd(4) : 'MISS'} ${r.rr.toFixed(2)}  "${r.q}"`);
	}
}

// Persist this run so the admin Validation panel can chart the trend
// (best-effort; a recording failure never fails the eval). Skip with --no-record.
await recordEval();

if (!Number.isNaN(MIN_MRR)) {
	if (mrr < MIN_MRR) {
		console.error(`\nGATE FAIL: MRR ${mrr.toFixed(3)} < ${MIN_MRR}`);
		process.exit(1);
	}
	console.log(`\nGATE PASS: MRR ${mrr.toFixed(3)} ≥ ${MIN_MRR}`);
}

async function recordEval(): Promise<void> {
	if (NO_RECORD) return;
	const passed = Number.isNaN(MIN_MRR) ? null : mrr >= MIN_MRR;
	await recordMetric(TARGET, {
		action: 'record-eval',
		gitSha: gitSha(APP_DIR),
		mrr,
		recall5,
		recall10,
		zeroRate,
		cases: n,
		weak: weak.length,
		passed,
	});
}

function avg(xs: number[]): number {
	return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function argValue(flag: string): string | undefined {
	const i = process.argv.indexOf(flag);
	return i >= 0 ? process.argv[i + 1] : undefined;
}
