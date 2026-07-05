// Admin data-aggregation layer. Reads the observability tables and shapes them
// into the view models the admin panels render. Server-side only (uses the
// `tables` binding, not the REST API). Kept separate from rendering (lib/admin.ts)
// so the two can be tested independently.

import { tables } from './harper.ts';
import {
	type SearchAnalytics,
	type EvalTrend,
	type ParityTrend,
	type EvalRunRow,
	type ParityRunRow,
	type ChatEvalTrend,
	type ChatEvalRunRow,
	type ChatAnalytics,
	type ChatRecent,
	type ChatFlagged,
} from './admin.ts';

const { SearchQueryLog, EvalRun, ParityRun, ChatEvalRun, ChatLog } = tables;

const DAY_MS = 86400000;
const WINDOW_DAYS = 14;

// Aggregate the last WINDOW_DAYS of SearchQueryLog into top queries, the
// zero-result content-gap list, per-day volume, and a section breakdown.
export async function searchAnalytics(): Promise<SearchAnalytics> {
	const now = Date.now();
	const windowMs = WINDOW_DAYS * DAY_MS;
	const byQuery = new Map<string, { count: number; zeroCount: number }>();
	const bySection = new Map<string, number>();
	const byDay = new Map<string, number>();
	let queries = 0;
	let zeroResult = 0;

	for await (const row of SearchQueryLog.search({})) {
		const created = new Date(row.createdAt ?? 0).getTime();
		if (now - created > windowMs) continue; // outside the reporting window
		queries++;
		const q = String(row.query ?? '')
			.trim()
			.toLowerCase();
		const isZero = (row.resultCount ?? 0) === 0;
		if (isZero) zeroResult++;
		if (q) {
			const e = byQuery.get(q) ?? { count: 0, zeroCount: 0 };
			e.count++;
			if (isZero) e.zeroCount++;
			byQuery.set(q, e);
		}
		const sec = row.section || 'all';
		bySection.set(sec, (bySection.get(sec) ?? 0) + 1);
		const day = new Date(created).toISOString().slice(0, 10);
		byDay.set(day, (byDay.get(day) ?? 0) + 1);
	}

	const topTerms = [...byQuery.entries()]
		.map(([query, e]) => ({ query, count: e.count, zero: e.count > 0 && e.zeroCount === e.count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 15);

	// Content gaps: zero-result queries, excluding sub-3-char keystroke fragments
	// (the search UI logs each debounced partial, so "s"/"sc" are noise, not gaps).
	const zeroResultList = [...byQuery.entries()]
		.filter(([query, e]) => e.zeroCount > 0 && query.length >= 3)
		.map(([query, e]) => ({ query, count: e.zeroCount }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 15);

	// Fill every day in the window (including zero days) for a continuous chart.
	const volume: Array<{ day: string; count: number }> = [];
	for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
		const day = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
		volume.push({ day, count: byDay.get(day) ?? 0 });
	}

	const bySectionArr = [...bySection.entries()]
		.map(([section, count]) => ({ section, count }))
		.sort((a, b) => b.count - a.count);

	return {
		totals: {
			// zeroRate is a 0..1 fraction; the renderer formats it as a percentage.
			queries,
			zeroResult,
			zeroRate: queries ? zeroResult / queries : 0,
			windowDays: WINDOW_DAYS,
		},
		topTerms,
		zeroResult: zeroResultList,
		volume,
		bySection: bySectionArr,
	};
}

function plainEval(r: any): EvalRunRow {
	return {
		id: r.id,
		gitSha: r.gitSha ?? '',
		mrr: r.mrr ?? 0,
		recall5: r.recall5 ?? 0,
		recall10: r.recall10 ?? 0,
		zeroRate: r.zeroRate ?? 0,
		cases: r.cases ?? 0,
		weak: r.weak ?? 0,
		passed: r.passed ?? null,
		createdAt: r.createdAt ?? 0,
	};
}

function plainParity(r: any): ParityRunRow {
	return {
		id: r.id,
		gitSha: r.gitSha ?? '',
		pages: r.pages ?? 0,
		titlesOk: r.titlesOk ?? 0,
		redirectsOk: r.redirectsOk ?? 0,
		simMedian: r.simMedian ?? 0,
		simMin: r.simMin ?? 0,
		hardFailures: r.hardFailures ?? 0,
		strict: r.strict ?? false,
		passed: r.passed ?? false,
		createdAt: r.createdAt ?? 0,
	};
}

function byCreatedDesc(a: { createdAt: string | number }, b: { createdAt: string | number }): number {
	return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
}

export async function evalTrend(limit = 30): Promise<EvalTrend> {
	const runs: EvalRunRow[] = [];
	for await (const r of EvalRun.search({})) runs.push(plainEval(r));
	runs.sort(byCreatedDesc);
	const top = runs.slice(0, limit);
	return { latest: top[0] ?? null, runs: top };
}

export async function parityTrend(limit = 30): Promise<ParityTrend> {
	const runs: ParityRunRow[] = [];
	for await (const r of ParityRun.search({})) runs.push(plainParity(r));
	runs.sort(byCreatedDesc);
	const top = runs.slice(0, limit);
	return { latest: top[0] ?? null, runs: top };
}

function plainChatEval(r: any): ChatEvalRunRow {
	return {
		id: r.id,
		gitSha: r.gitSha ?? '',
		recall: r.recall ?? 0,
		mrr: r.mrr ?? 0,
		cases: r.cases ?? 0,
		multiTurn: r.multiTurn ?? 0,
		passed: r.passed ?? null,
		createdAt: r.createdAt ?? 0,
	};
}

export async function chatEvalTrend(limit = 30): Promise<ChatEvalTrend> {
	const runs: ChatEvalRunRow[] = [];
	for await (const r of ChatEvalRun.search({})) runs.push(plainChatEval(r));
	runs.sort(byCreatedDesc);
	const top = runs.slice(0, limit);
	return { latest: top[0] ?? null, runs: top };
}

// Aggregate the last WINDOW_DAYS of ChatLog: volume, grounded rate, latency,
// top questions, model + feedback breakdowns, and the most recent conversations.
export async function chatAnalytics(): Promise<ChatAnalytics> {
	const now = Date.now();
	const windowMs = WINDOW_DAYS * DAY_MS;
	const byQuestion = new Map<string, number>();
	const byDay = new Map<string, number>();
	const byModel = new Map<string, number>();
	const recent: ChatRecent[] = [];
	const flagged: ChatFlagged[] = [];
	const feedback = { up: 0, down: 0, none: 0 };
	let chats = 0;
	let grounded = 0;
	let cacheHits = 0;
	let latencySum = 0;
	let latencyN = 0;
	let faithSum = 0;
	let faithN = 0;
	let flaggedCount = 0;

	for await (const row of ChatLog.search({})) {
		const created = new Date(row.createdAt ?? 0).getTime();
		if (now - created > windowMs) continue;
		chats++;
		if (row.grounded) grounded++;
		if (row.cached) cacheHits++;
		if (typeof row.faithfulness === 'number') {
			faithSum += row.faithfulness;
			faithN++;
			if (row.flagged) {
				flaggedCount++;
				flagged.push({
					question: row.question ?? '',
					faithfulness: row.faithfulness,
					note: String(row.flaggedNote ?? ''),
					createdAt: row.createdAt ?? 0,
				});
			}
		}
		if (typeof row.latencyMs === 'number') {
			latencySum += row.latencyMs;
			latencyN++;
		}
		const q = String(row.question ?? '').trim();
		if (q) byQuestion.set(q.toLowerCase(), (byQuestion.get(q.toLowerCase()) ?? 0) + 1);
		const day = new Date(created).toISOString().slice(0, 10);
		byDay.set(day, (byDay.get(day) ?? 0) + 1);
		const model = row.model || 'unknown';
		byModel.set(model, (byModel.get(model) ?? 0) + 1);
		const fb = row.feedback ?? 0;
		if (fb > 0) feedback.up++;
		else if (fb < 0) feedback.down++;
		else feedback.none++;
		recent.push({
			question: row.question ?? '',
			answerPreview: String(row.answer ?? '').slice(0, 160),
			sources: Array.isArray(row.sources) ? row.sources.length : 0,
			model,
			latencyMs: row.latencyMs ?? 0,
			grounded: Boolean(row.grounded),
			createdAt: row.createdAt ?? 0,
		});
	}

	recent.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
	flagged.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
	const topQuestions = [...byQuestion.entries()]
		.map(([question, count]) => ({ question, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 15);
	const volume: Array<{ day: string; count: number }> = [];
	for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
		const day = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
		volume.push({ day, count: byDay.get(day) ?? 0 });
	}
	const byModelArr = [...byModel.entries()]
		.map(([model, count]) => ({ model, count }))
		.sort((a, b) => b.count - a.count);

	return {
		totals: {
			chats,
			grounded,
			groundedRate: chats ? grounded / chats : 0,
			cacheHits,
			cacheHitRate: chats ? cacheHits / chats : 0,
			avgLatencyMs: latencyN ? latencySum / latencyN : 0,
			windowDays: WINDOW_DAYS,
			avgFaithfulness: faithN ? faithSum / faithN : 0,
			scored: faithN,
			flaggedCount,
		},
		topQuestions,
		volume,
		byModel: byModelArr,
		feedback,
		flagged: flagged.slice(0, 12),
		recent: recent.slice(0, 12),
	};
}
