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
import { recordMetric, gitSha } from './lib/record.ts';

interface Turn {
	role: string;
	content: string;
}

interface Case {
	q: string;
	expect: string[];
	// Optional prior conversation. When present, the endpoint condenses
	// history + q into a standalone question before retrieving — this is how the
	// multi-turn condenser gets the same golden-set coverage as single-turn.
	history?: Turn[];
}

interface Source {
	path: string;
}

const APP_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TARGET = argValue('--target') ?? process.env.HARPER_TARGET ?? 'http://localhost:9936';
const SET_PATH = path.resolve(APP_DIR, argValue('--set') ?? 'eval/chat-grounding.json');
const MIN_RECALL = Number(argValue('--min-recall') ?? NaN);
const VERBOSE = process.argv.includes('--verbose');
const NO_RECORD = process.argv.includes('--no-record');

const { cases }: { cases: Case[] } = JSON.parse(readFileSync(SET_PATH, 'utf8'));

interface Row {
	q: string; // display label (follow-ups show the prior turn for context)
	hit: boolean;
	rank: number; // 1-based rank of the first matching source, 0 = miss
	top: string[];
	error?: string;
}

// A follow-up on its own ("what about for v4?") is meaningless in the report —
// prefix it with the last user turn so misses are debuggable.
function label(c: Case): string {
	if (!c.history?.length) return c.q;
	const lastUser = [...c.history].reverse().find((t) => t.role === 'user');
	return lastUser ? `${lastUser.content} ⟶ ${c.q}` : c.q;
}

const rows: Row[] = [];
for (const c of cases) {
	let sources: Source[] = [];
	try {
		const res = await fetch(`${TARGET}/api/chat`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ question: c.q, retrieveOnly: true, ...(c.history ? { history: c.history } : {}) }),
		});
		// A non-2xx (e.g. 429/500) is an endpoint failure, not a content miss —
		// surface it rather than silently counting it as recall=0.
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		sources = ((await res.json()) as { sources?: Source[] }).sources ?? [];
	} catch (err: any) {
		rows.push({ q: label(c), hit: false, rank: 0, top: [], error: err.message });
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
	rows.push({ q: label(c), hit: rank > 0, rank, top: paths });
}

const n = rows.length;
const errored = rows.filter((r) => r.error);
const recall = n ? rows.filter((r) => r.hit).length / n : 0;
const mrr = n ? rows.reduce((a, r) => a + (r.rank ? 1 / r.rank : 0), 0) / n : 0;
const misses = rows.filter((r) => !r.hit);
// K = grounding sources returned (chat grounds on ALL of them), so "expected page
// is anywhere in the K sources" is the meaningful recall — report it honestly.
const k = Math.max(0, ...rows.map((r) => r.top.length));

console.log(`\nChat grounding — ${n} questions vs ${TARGET}\n`);
console.log(`  Recall@${k}:   ${(recall * 100).toFixed(1)}%  (expected page appears in the K grounding sources)`);
console.log(`  MRR:        ${mrr.toFixed(3)}`);

if (misses.length) {
	console.log(`\n  Misses:`);
	for (const r of misses) console.log(`    ✗ "${r.q}" → ${r.error ? `error: ${r.error}` : JSON.stringify(r.top)}`);
}

// A broken endpoint (any errored row) is a hard failure regardless of recall —
// don't let partial failures slip past a lenient --min-recall gate.
if (errored.length) {
	console.error(`\nFAIL: ${errored.length}/${n} questions errored (endpoint failure, not a content miss).`);
	process.exit(1);
}
if (VERBOSE) {
	console.log('\n  All cases:');
	for (const r of rows) console.log(`    ${r.rank ? `#${r.rank}`.padEnd(4) : 'MISS'} "${r.q}" → ${r.top.join(', ')}`);
}

// Persist this run so the admin Validation panel can chart the trend
// (best-effort; a recording failure never fails the eval). Skip with --no-record.
await recordChatEval();

if (!Number.isNaN(MIN_RECALL)) {
	if (recall < MIN_RECALL) {
		console.error(`\nGATE FAIL: recall ${recall.toFixed(3)} < ${MIN_RECALL}`);
		process.exit(1);
	}
	console.log(`\nGATE PASS: recall ${recall.toFixed(3)} ≥ ${MIN_RECALL}`);
}

async function recordChatEval(): Promise<void> {
	if (NO_RECORD) return;
	const multiTurn = cases.filter((c) => c.history && c.history.length).length;
	const passed = Number.isNaN(MIN_RECALL) ? null : recall >= MIN_RECALL;
	await recordMetric(TARGET, {
		action: 'record-chat-eval',
		gitSha: gitSha(APP_DIR),
		recall,
		mrr,
		cases: n,
		multiTurn,
		passed,
	});
}

function argValue(flag: string): string | undefined {
	const i = process.argv.indexOf(flag);
	return i >= 0 ? process.argv[i + 1] : undefined;
}
