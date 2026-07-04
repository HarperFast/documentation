// Answer-quality eval (LLM-as-judge). Retrieval recall only says "the right page
// was in context" — this measures whether the ANSWER is actually correct and
// complete. For each question it gets the real answer from /api/chat (grounding +
// Claude), then asks a judge model to score it against a rubric of key points.
//
// Needs ANTHROPIC_API_KEY (read from env or app/.env) for the judge; the answer
// itself comes from the running server (which holds the key). Two API calls per
// question — run occasionally, not in the fast test loop.
//
// Usage:
//   node scripts/chat-answer-eval.ts [--target http://localhost:9936]
//                                    [--set eval/chat-answers.json]
//                                    [--min-score 3.5] [--limit N] [--verbose]

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface Case {
	q: string;
	key_points: string[];
}
interface Judgement {
	correctness: number;
	completeness: number;
	grounded: boolean;
	notes: string;
}

const APP_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TARGET = argValue('--target') ?? process.env.HARPER_TARGET ?? 'http://localhost:9936';
const SET_PATH = path.resolve(APP_DIR, argValue('--set') ?? 'eval/chat-answers.json');
const JUDGE_MODEL = process.env.JUDGE_MODEL || 'claude-sonnet-5';
const MIN_SCORE = Number(argValue('--min-score') ?? NaN);
const LIMIT = Number(argValue('--limit') ?? NaN);
const VERBOSE = process.argv.includes('--verbose');

const { cases }: { cases: Case[] } = JSON.parse(readFileSync(SET_PATH, 'utf8'));
const KEY = loadAnthropicKey();

// Get the app's real answer via /api/chat (server holds the generation key).
async function getAnswer(q: string): Promise<{ answer: string; sources: number; error?: string }> {
	const res = await fetch(`${TARGET}/api/chat`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ question: q }),
	});
	if (!res.ok || !res.body) return { answer: '', sources: 0, error: `chat HTTP ${res.status}` };
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buf = '';
	let answer = '';
	let sources = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buf += decoder.decode(value, { stream: true });
		const frames = buf.split('\n\n');
		buf = frames.pop() ?? '';
		for (const frame of frames) {
			let event = '';
			let data = '';
			for (const line of frame.split('\n')) {
				if (line.startsWith('event:')) event = line.slice(6).trim();
				else if (line.startsWith('data:')) data = line.slice(5).trim();
			}
			if (!data) continue;
			try {
				const parsed = JSON.parse(data);
				if (event === 'token' && typeof parsed === 'string') answer += parsed;
				else if (event === 'sources' && Array.isArray(parsed)) sources = parsed.length;
				else if (event === 'error') return { answer, sources, error: parsed.message ?? 'generation error' };
			} catch {
				// ignore non-JSON frames
			}
		}
	}
	return { answer, sources };
}

// Ask the judge model to score the answer against the rubric.
async function judge(q: string, keyPoints: string[], answer: string): Promise<Judgement> {
	const system =
		'You are a strict but fair grader of a Harper (harperdb) documentation assistant. ' +
		'Grade the answer only against the rubric key points and Harper reality. Do NOT reward ' +
		'fluent-but-wrong or invented content. Respond ONLY with a single JSON object, no prose.';
	const user = `Question: ${q}

Rubric — a correct answer should cover these key points:
${keyPoints.map((k, i) => `  ${i + 1}. ${k}`).join('\n')}

Answer to grade:
"""
${answer}
"""

Respond as JSON exactly:
{"correctness": <1-5 integer>, "completeness": <1-5 integer>, "grounded": <true|false>, "notes": "<one short line>"}
correctness = are the stated facts right, with no hallucination.
completeness = how fully the key points are correctly covered.
grounded = is the answer based on real Harper features (not invented).`;

	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
		body: JSON.stringify({ model: JUDGE_MODEL, max_tokens: 300, system, messages: [{ role: 'user', content: user }] }),
	});
	if (!res.ok) throw new Error(`judge HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
	const body: any = await res.json();
	const text = (body.content ?? []).map((c: any) => c.text ?? '').join('');
	const match = text.match(/\{[\s\S]*\}/);
	if (!match) throw new Error(`judge returned no JSON: ${text.slice(0, 120)}`);
	return JSON.parse(match[0]);
}

interface Row {
	q: string;
	correctness: number;
	completeness: number;
	grounded: boolean;
	sources: number;
	notes: string;
	error?: string;
}

const rows: Row[] = [];
const list = Number.isNaN(LIMIT) ? cases : cases.slice(0, LIMIT);
for (const c of list) {
	const a = await getAnswer(c.q);
	if (a.error) {
		rows.push({ q: c.q, correctness: 0, completeness: 0, grounded: false, sources: a.sources, notes: '', error: a.error });
		continue;
	}
	try {
		const j = await judge(c.q, c.key_points, a.answer);
		rows.push({
			q: c.q,
			correctness: j.correctness,
			completeness: j.completeness,
			grounded: Boolean(j.grounded),
			sources: a.sources,
			notes: j.notes,
		});
	} catch (err: any) {
		rows.push({ q: c.q, correctness: 0, completeness: 0, grounded: false, sources: a.sources, notes: '', error: err.message });
	}
}

const n = rows.length;
const errored = rows.filter((r) => r.error);
const scored = rows.filter((r) => !r.error);
const avg = (f: (r: Row) => number): number => (scored.length ? scored.reduce((a, r) => a + f(r), 0) / scored.length : 0);
const avgCorr = avg((r) => r.correctness);
const avgComp = avg((r) => r.completeness);
const groundedRate = scored.length ? scored.filter((r) => r.grounded).length / scored.length : 0;

console.log(`\nChat answer quality — ${n} questions vs ${TARGET} (judge: ${JUDGE_MODEL})\n`);
console.log(`  Correctness:  ${avgCorr.toFixed(2)}/5`);
console.log(`  Completeness: ${avgComp.toFixed(2)}/5`);
console.log(`  Grounded:     ${(groundedRate * 100).toFixed(0)}%`);

if (VERBOSE || errored.length) {
	console.log('\n  Per question:');
	for (const r of rows) {
		console.log(
			r.error
				? `    ⚠ "${r.q}" → error: ${r.error}`
				: `    correct ${r.correctness}/5 · complete ${r.completeness}/5 ${r.grounded ? '· grounded' : '· NOT grounded'}  "${r.q}" — ${r.notes}`
		);
	}
}

if (errored.length) {
	console.error(`\nFAIL: ${errored.length}/${n} questions errored (endpoint/judge failure).`);
	process.exit(1);
}
if (!Number.isNaN(MIN_SCORE)) {
	if (avgCorr < MIN_SCORE) {
		console.error(`\nGATE FAIL: correctness ${avgCorr.toFixed(2)} < ${MIN_SCORE}`);
		process.exit(1);
	}
	console.log(`\nGATE PASS: correctness ${avgCorr.toFixed(2)} ≥ ${MIN_SCORE}`);
}

// The judge needs a model key. Prefer env; fall back to app/.env (gitignored).
function loadAnthropicKey(): string {
	if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
	try {
		for (const line of readFileSync(path.join(APP_DIR, '.env'), 'utf8').split('\n')) {
			const eq = line.indexOf('=');
			if (eq < 0) continue;
			if (line.slice(0, eq).trim() === 'ANTHROPIC_API_KEY') {
				return line
					.slice(eq + 1)
					.trim()
					.replace(/^["']|["']$/g, '');
			}
		}
	} catch {
		// no .env — fall through
	}
	throw new Error('ANTHROPIC_API_KEY not set (env or app/.env) — required for the judge');
}
function argValue(flag: string): string | undefined {
	const i = process.argv.indexOf(flag);
	return i >= 0 ? process.argv[i + 1] : undefined;
}
