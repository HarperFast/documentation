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
} from './admin.ts';
import { aggregateSearch, aggregateChat } from './metrics-pure.ts';

const { SearchQueryLog, EvalRun, ParityRun, ChatEvalRun, ChatLog } = tables;

const WINDOW_DAYS = 14;

// Aggregate the last WINDOW_DAYS of SearchQueryLog into top queries, the
// zero-result content-gap list, per-day volume, and a section breakdown.
export async function searchAnalytics(): Promise<SearchAnalytics> {
	const rows: any[] = [];
	for await (const row of SearchQueryLog.search({})) rows.push(row);
	return aggregateSearch(rows, Date.now(), WINDOW_DAYS);
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
	const rows: any[] = [];
	for await (const row of ChatLog.search({})) rows.push(row);
	return aggregateChat(rows, Date.now(), WINDOW_DAYS);
}
