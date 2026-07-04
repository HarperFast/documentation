// M3 chat: retrieval-augmented answers grounded in the docs. A question is run
// through the existing hybrid search (lib/search.ts), the top pages become
// grounding context, and an LLM streams a cited answer. Generation uses Claude
// (Anthropic Messages API, streaming); with no ANTHROPIC_API_KEY set it falls
// back to a deterministic dev stub so the whole pipeline (retrieval, streaming,
// citations, quota, logging) is exercised without a key.

import { createHash } from 'node:crypto';
import { tables, type HarperRequest } from './harper.ts';
import { runSearch } from './search.ts';

const { SitePointer, Page, ChatLog, ChatQuota } = tables;

const CHAT_MODEL = process.env.CHAT_MODEL || 'claude-sonnet-5';
const DAILY_CAP = Number(process.env.CHAT_DAILY_CAP) || 50; // messages / IP / UTC day
const RETRIEVE_K = 5; // distinct pages used as grounding
const CTX_CHARS = 1500; // per-page context budget
const MAX_QUESTION = 1000; // reject longer questions
const ANSWER_STORE_CAP = 8000; // truncate stored answers
const IP_SALT = process.env.CHAT_IP_SALT || 'harper-docs-chat';

export interface Source {
	rank: number;
	path: string;
	title: string;
	heading: string;
	url: string;
}

// ── Client identity + quota ──────────────────────────────────────────────────

export function clientIp(request: HarperRequest): string {
	const fwd = request.headers.get('x-forwarded-for');
	if (fwd) return fwd.split(',')[0].trim();
	return (request as any).ip || 'local';
}

// Never store raw IPs — hash with a salt and keep a short prefix.
export function hashIp(ip: string): string {
	return createHash('sha256')
		.update(`${IP_SALT}:${ip}`)
		.digest('hex')
		.slice(0, 16);
}

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

export interface QuotaResult {
	ok: boolean;
	count: number;
	cap: number;
}

// Per-IP daily cap. Reads-then-writes (a soft cap — a small concurrent overshoot
// is acceptable). The id embeds the UTC date so the counter resets each day and
// self-expires via the table TTL.
export async function checkAndBumpQuota(ipHash: string): Promise<QuotaResult> {
	const id = `${ipHash}:${today()}`;
	let count = 0;
	try {
		const row = await ChatQuota.get(id);
		count = row?.count ?? 0;
	} catch {
		count = 0;
	}
	if (count >= DAILY_CAP) return { ok: false, count, cap: DAILY_CAP };
	try {
		await ChatQuota.put({ id, count: count + 1 });
	} catch {
		// best-effort: never block a chat on the counter write
	}
	return { ok: true, count: count + 1, cap: DAILY_CAP };
}

// ── Retrieval / grounding ────────────────────────────────────────────────────

export interface Grounding {
	sources: Source[];
	context: string;
}

// Run the question through hybrid search, dedupe to distinct pages, and build a
// numbered context block from each page's rendered markdown (truncated).
export async function retrieve(question: string, section?: string | null, version?: string | null): Promise<Grounding> {
	const { results } = await runSearch({ q: question, section, version, limit: 8 });
	const release = (await SitePointer.get('active'))?.release ?? null;

	const seen = new Set<string>();
	const sources: Source[] = [];
	for (const r of results) {
		if (seen.has(r.path)) continue;
		seen.add(r.path);
		sources.push({
			rank: sources.length + 1,
			path: r.path,
			title: r.title,
			heading: r.heading ?? '',
			url: r.url,
		});
		if (sources.length >= RETRIEVE_K) break;
	}

	const blocks: string[] = [];
	for (const s of sources) {
		let text = '';
		if (release) {
			try {
				const page = await Page.get(`${release}:${s.path}`);
				text = (page?.renderedMarkdown ?? '').slice(0, CTX_CHARS);
			} catch {
				text = '';
			}
		}
		blocks.push(`[${s.rank}] ${s.title}${s.heading ? ` — ${s.heading}` : ''} (${s.url})\n${text}`);
	}

	return { sources, context: blocks.join('\n\n') };
}

// ── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = [
	'You are the Harper documentation assistant. Answer using ONLY the provided',
	'documentation context. Cite the sources you use with inline bracketed numbers',
	'like [1] or [2] that match the context blocks. Be concise, accurate, and',
	'technical. Prefer code and concrete steps. If the context does not contain the',
	'answer, say so plainly and point the reader to the most relevant section rather',
	'than guessing.',
].join(' ');

export function buildMessages(question: string, context: string): { system: string; messages: any[] } {
	const user = context
		? `Documentation context:\n\n${context}\n\n---\nQuestion: ${question}\n\nAnswer with inline [n] citations.`
		: `Question: ${question}\n\n(No documentation context matched this question.)`;
	return { system: SYSTEM_PROMPT, messages: [{ role: 'user', content: user }] };
}

// ── Generation (streaming) ───────────────────────────────────────────────────

export function hasLiveModel(): boolean {
	return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function modelId(): string {
	return hasLiveModel() ? CHAT_MODEL : 'stub';
}

// Stream text deltas for the answer. Uses Claude when ANTHROPIC_API_KEY is set,
// otherwise a deterministic grounded stub (so the pipeline is verifiable).
export async function* streamAnswer(question: string, grounding: Grounding): AsyncGenerator<string> {
	if (!hasLiveModel()) {
		yield* stubStream(question, grounding.sources);
		return;
	}
	const { system, messages } = buildMessages(question, grounding.context);
	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'x-api-key': process.env.ANTHROPIC_API_KEY as string,
			'anthropic-version': '2023-06-01',
			'content-type': 'application/json',
		},
		body: JSON.stringify({ model: CHAT_MODEL, max_tokens: 1024, system, messages, stream: true }),
	});
	if (!res.ok || !res.body) {
		const detail = await res.text().catch(() => '');
		throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 200)}`);
	}
	// Parse the Anthropic SSE stream, yielding text_delta chunks.
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buf = '';
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buf += decoder.decode(value, { stream: true });
		const events = buf.split('\n\n');
		buf = events.pop() ?? '';
		for (const ev of events) {
			for (const line of ev.split('\n')) {
				if (!line.startsWith('data:')) continue;
				const json = line.slice(5).trim();
				if (!json || json === '[DONE]') continue;
				try {
					const d = JSON.parse(json);
					if (d.type === 'content_block_delta' && d.delta?.type === 'text_delta') {
						yield d.delta.text as string;
					}
				} catch {
					// ignore keep-alive / non-JSON lines
				}
			}
		}
	}
}

async function* stubStream(question: string, sources: Source[]): AsyncGenerator<string> {
	const text = sources.length
		? `(dev stub — set ANTHROPIC_API_KEY for real answers) Based on the documentation, the most relevant page is “${sources[0].title}” [1]${
				sources[1] ? `, see also “${sources[1].title}” [2]` : ''
			}. Ask about "${question}" once a model key is configured for a full grounded answer.`
		: `(dev stub) I couldn't find documentation matching “${question}”. Try rephrasing, or browse the reference.`;
	for (const word of text.split(' ')) yield `${word} `;
}

// ── Validation + logging ─────────────────────────────────────────────────────

export function validateQuestion(q: unknown): string | null {
	if (typeof q !== 'string') return null;
	const trimmed = q.trim();
	if (trimmed.length < 2 || trimmed.length > MAX_QUESTION) return null;
	return trimmed;
}

export interface ChatLogInput {
	question: string;
	answer: string;
	sources: Source[];
	grounded: boolean;
	promptChars: number;
	latencyMs: number;
	sessionId: string;
	ipHash: string;
}

export async function logChat(input: ChatLogInput): Promise<void> {
	try {
		await ChatLog.put({
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			question: input.question.slice(0, MAX_QUESTION),
			answer: input.answer.slice(0, ANSWER_STORE_CAP),
			sources: input.sources,
			grounded: input.grounded,
			model: modelId(),
			promptChars: input.promptChars,
			answerChars: input.answer.length,
			latencyMs: input.latencyMs,
			sessionId: input.sessionId.slice(0, 64),
			ipHash: input.ipHash,
			feedback: 0,
		});
	} catch {
		// observability is best-effort; never fail a chat on it
	}
}
