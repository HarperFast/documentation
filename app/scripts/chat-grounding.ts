// Chat-grounding eval. Runs a set of natural-language questions through the chat
// retrieval (POST /api/chat with retrieveOnly — no answer generated, no LLM cost)
// and scores whether the expected doc page appears in the top-K grounding
// sources. This is the chat analogue of search-eval: it measures RETRIEVAL, which
// is what gates answer quality (a good model can't answer from bad grounding).
//
// Usage:
//   node scripts/chat-grounding.ts [--target http://localhost:9936]
//                                  [--set eval/chat-grounding.json]
//                                  [--min-recall 0.8] [--verbose]

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface Case {
	q: string;
	expect: string[];
}

interface Source {
	path: string;
}

const APP_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TARGET = argValue('--target') ?? process.env.HARPER_TARGET ?? 'http://localhost:9936';
const SET_PATH = path.resolve(APP_DIR, argValue('--set') ?? 'eval/chat-grounding.json');
const MIN_RECALL = Number(argValue('--min-recall') ?? NaN);
const VERBOSE = process.argv.includes('--verbose');

const { cases }: { cases: Case[] } = JSON.parse(readFileSync(SET_PATH, 'utf8'));

interface Row {
	q: string;
	hit: boolean;
	rank: number; // 1-based rank of the first matching source, 0 = miss
	top: string[];
	error?: string;
}

const rows: Row[] = [];
for (const c of cases) {
	let sources: Source[] = [];
	try {
		const res = await fetch(`${TARGET}/api/chat`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ question: c.q, retrieveOnly: true }),
		});
		sources = ((await res.json()) as { sources?: Source[] }).sources ?? [];
	} catch (err: any) {
		rows.push({ q: c.q, hit: false, rank: 0, top: [], error: err.message });
		continue;
	}
	const paths = sources.map((s) => s.path);
	let rank = 0;
	for (let i = 0; i < paths.length; i++) {
		if (c.expect.some((e) => paths[i].includes(e))) {
			rank = i + 1;
			break;
		}
	}
	rows.push({ q: c.q, hit: rank > 0, rank, top: paths });
}

const n = rows.length;
const recall = n ? rows.filter((r) => r.hit).length / n : 0;
const mrr = n ? rows.reduce((a, r) => a + (r.rank ? 1 / r.rank : 0), 0) / n : 0;
const misses = rows.filter((r) => !r.hit);

console.log(`\nChat grounding — ${n} questions vs ${TARGET}\n`);
console.log(`  Recall@5:   ${(recall * 100).toFixed(1)}%  (expected page appears in the grounding sources)`);
console.log(`  MRR:        ${mrr.toFixed(3)}`);

if (misses.length) {
	console.log(`\n  Misses:`);
	for (const r of misses) console.log(`    ✗ "${r.q}" → ${r.error ? `error: ${r.error}` : JSON.stringify(r.top)}`);
}
if (VERBOSE) {
	console.log('\n  All cases:');
	for (const r of rows) console.log(`    ${r.rank ? `#${r.rank}`.padEnd(4) : 'MISS'} "${r.q}" → ${r.top.join(', ')}`);
}

if (!Number.isNaN(MIN_RECALL)) {
	if (recall < MIN_RECALL) {
		console.error(`\nGATE FAIL: recall ${recall.toFixed(3)} < ${MIN_RECALL}`);
		process.exit(1);
	}
	console.log(`\nGATE PASS: recall ${recall.toFixed(3)} ≥ ${MIN_RECALL}`);
}

function argValue(flag: string): string | undefined {
	const i = process.argv.indexOf(flag);
	return i >= 0 ? process.argv[i + 1] : undefined;
}
