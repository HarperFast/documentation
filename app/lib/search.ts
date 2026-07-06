// Hybrid search: a table-backed BM25 keyword lane (with trigram + edit-distance
// typo tolerance) fused with an HNSW vector lane, both scoped and released
// through /api/search. No standing in-memory index — every structure is a
// table read; per-query memory is bounded to the candidate set.

import { tables, models } from './harper.ts';
import { tokenize, trigrams, trigramSimilarity, editDistance } from './tokenize.ts';

interface TermMatch {
	term: string;
	docFreq: number;
	weight: number;
}

interface SearchResponse {
	query: string;
	results: any[];
	total: number;
	lanes?: { keyword: number; semantic: number };
}

interface SearchOptions {
	q?: string;
	section?: string | null;
	version?: string | null;
	// Accepts a raw query-string value (string | null) as well as a number; the
	// implementation coerces/clamps it.
	limit?: number | string | null;
	// blend: fuse the keyword + semantic lanes with equal-weight RRF instead of
	// the box's keyword-primary ordering — better recall for natural-language
	// questions (used by M3 chat retrieval, NOT the search box).
	blend?: boolean;
	// withText: include each matched chunk's full section `text` in the results
	// (chat grounds on this; the box doesn't need it).
	withText?: boolean;
}

const { SitePointer, ContentRelease, SearchChunk, Term } = tables;

const K1 = 1.2; // BM25 term-frequency saturation
const B = 0.75; // BM25 length-normalization strength
const TITLE_BOOST = 2.5;
const HEADING_BOOST = 1.6;
const CANDIDATE_CAP = 400; // max chunks scored per query
const FUZZY_MIN = 0.4; // min trigram similarity to accept a correction outright
const SEMANTIC_K = 30; // chunks pulled from the vector lane before fusion
const SEMANTIC_EF = 400; // HNSW search budget per query (recall vs latency)
const RRF_K = 60; // reciprocal-rank-fusion constant (standard default)
const EMBED_MODEL = 'gemini-embedding-001'; // logical name == wire model id (see @embed note)
const MAX_QUERY_CHARS = 200; // hard cap on query length (DoS guard)
const MAX_QUERY_TERMS = 12; // hard cap on distinct scored terms (DoS guard)
// Max edit distance for a typo correction, scaled to query-term length so a
// single substitution in a short word (vektor→vector) is accepted while long
// words tolerate two (replciation→replication).
const maxEdits = (len: number): number => (len <= 4 ? 1 : 2);

async function activeRelease(): Promise<string | null> {
	const pointer = await SitePointer.get('active');
	return pointer?.release ?? null;
}

// Resolve a query term to indexed terms: exact if present, else the closest
// dictionary terms. Trigrams GENERATE candidates (broad recall); a term is
// ACCEPTED if it is within the edit-distance budget OR has high trigram
// overlap — edit distance catches single-char typos that trigrams miss on
// short words. Returns [{term, docFreq, weight}].
async function resolveTerm(release: string, term: string): Promise<TermMatch[]> {
	const exact = await Term.get(`${release}:${term}`);
	if (exact) return [{ term, docFreq: exact.docFreq, weight: 1 }];

	const seen = new Map<string, number>();
	for (const g of trigrams(term)) {
		for await (const t of Term.search({
			conditions: [
				{ attribute: 'release', value: release },
				{ attribute: 'trigrams', value: g },
			],
			select: ['term', 'docFreq'],
			limit: 400, // common trigrams (e.g. "tor") back ~90 terms; cap must clear that
		})) {
			if (!seen.has(t.term)) seen.set(t.term, t.docFreq);
		}
	}
	const budget = maxEdits(term.length);
	const ranked = [...seen.entries()]
		.map(([t, docFreq]) => ({ term: t, docFreq, sim: trigramSimilarity(term, t), dist: editDistance(term, t, budget) }))
		.filter((c) => c.dist <= budget || c.sim >= FUZZY_MIN)
		// closest edit distance first, then strongest trigram overlap
		.sort((a, b) => a.dist - b.dist || b.sim - a.sim)
		.slice(0, 3);
	// Weight blends both signals so a near-exact correction outweighs a loose one.
	return ranked.map((c) => ({
		term: c.term,
		docFreq: c.docFreq,
		weight: Math.max(c.sim, 1 - c.dist / (term.length + 1)),
	}));
}

// Hybrid search. { q, section, version, limit } → { query, results, total }.
// Runs the keyword lane (always) and the vector lane (when an embedding model
// is configured and reachable), then fuses them with reciprocal-rank fusion.
export async function runSearch({
	q = '',
	section = null,
	version = null,
	limit = 10,
	blend = false,
	withText = false,
}: SearchOptions = {}): Promise<SearchResponse> {
	// Bound every input: q may arrive null (missing param), limit negative or huge.
	q = String(q ?? '')
		.trim()
		.slice(0, MAX_QUERY_CHARS);
	limit = Math.max(1, Math.min(Number(limit) || 10, 30));
	if (!q) return { query: q, results: [], total: 0 };

	const release = await activeRelease();
	if (!release) return { query: q, results: [], total: 0 };

	const scope: Array<{ attribute: string; value: any }> = [{ attribute: 'release', value: release }];
	if (section) scope.push({ attribute: 'section', value: section });
	if (version) scope.push({ attribute: 'version', value: version });
	// Cap distinct terms so a synthetic many-word query can't fan out into
	// hundreds of trigram lookups + edit-distance passes (DoS).
	const queryTerms = [...new Set(tokenize(q))].slice(0, MAX_QUERY_TERMS);

	// A query that tokenizes to nothing (only stopwords/punctuation) has no
	// search intent — return empty rather than embed it and surface arbitrary
	// nearest-neighbors (and skip the wasted embedding call).
	if (queryTerms.length === 0) {
		return { query: q, results: [], total: 0, lanes: { keyword: 0, semantic: 0 } };
	}

	// Both lanes return ranked chunk arrays. The vector lane degrades to [] if
	// no model is configured — keyword search never depends on it.
	const [keyword, semantic] = await Promise.all([
		keywordLane(release, q, queryTerms, scope),
		semanticLane(release, q, scope),
	]);

	// Keyword-primary fusion with semantic recall-append. The keyword lane is
	// precise and deterministic, so it OWNS the ranking; the semantic lane only
	// contributes pages keyword didn't find, appended strictly below.
	//
	// A golden-set sweep drove this: equal-weight RRF monotonically lowered MRR
	// (0.91 keyword-only → 0.75 at semantic weight 0.5) because the semantic
	// lane's generic nearest-neighbors for short keyword queries displaced
	// keyword-strong results — and it made the score vary run-to-run with HNSW
	// rebuilds. Keyword-primary is precise, deterministic (0.907, stable across
	// rebuilds), still adds recall for queries keyword can't answer, and keeps
	// embeddings available for M3 chat grounding. (Natural-language search is
	// better served by chat, which does its own semantic retrieval.)
	const byPage = new Map<any, { chunk: any; score: number; best?: number; semanticOnly?: boolean }>();
	let ranked: Array<{ chunk: any; score: number; semanticOnly?: boolean }>;
	if (blend) {
		// Equal-weight RRF, but a page accumulates a contribution from EVERY matching
		// chunk across both lanes — a deliberate "multi-match boost": a page that
		// matches in several sections is more relevant, and this measurably raised
		// grounding recall on the chat eval (92% vs 83% for one-contribution-per-lane
		// RRF). We keep the single BEST-scoring chunk per page so `withText` grounds
		// on the strongest section (not just the first lane's).
		// NOTE: keyword-anchoring this blend (weighting the keyword lane above the
		// semantic lane so a precise match isn't demoted by a long tutorial's many
		// weak section-hits) was swept on the grounding eval (weights 1–3, averaged
		// over 5 runs to beat the ~±0.02 query-embedding noise). It did NOT help:
		// 1.0 → MRR 0.839, 1.5 → 0.836 (indistinguishable), ≥2 clearly hurt. So the
		// equal-weight blend below stands; don't re-litigate without a harder eval.
		const add = (chunk: any, i: number) => {
			const s = 1 / (RRF_K + i + 1);
			const e = byPage.get(chunk.pageId);
			if (e) {
				e.score += s;
				if (s > (e.best ?? 0)) {
					e.best = s;
					e.chunk = chunk;
				}
			} else {
				byPage.set(chunk.pageId, { chunk, score: s, best: s });
			}
		};
		keyword.forEach(add);
		semantic.forEach(add);
		ranked = [...byPage.values()].sort((a, b) => b.score - a.score);
	} else {
		// Keyword-primary fusion with semantic recall-append (the search box).
		keyword.forEach((chunk, i) => {
			if (!byPage.has(chunk.pageId)) byPage.set(chunk.pageId, { chunk, score: 1 / (RRF_K + i + 1) });
		});
		semantic.forEach((chunk, i) => {
			if (!byPage.has(chunk.pageId))
				byPage.set(chunk.pageId, { chunk, score: 1 / (RRF_K + i + 1), semanticOnly: true });
		});
		ranked = [...byPage.values()].sort((a, b) => {
			if (!!a.semanticOnly !== !!b.semanticOnly) return a.semanticOnly ? 1 : -1; // keyword pages first
			return b.score - a.score;
		});
	}

	const results = ranked.slice(0, limit).map(({ chunk, score }) => ({
		path: chunk.path,
		anchor: chunk.anchor,
		url: chunk.anchor ? `/${chunk.path}#${chunk.anchor}` : `/${chunk.path}`,
		title: chunk.title,
		heading: chunk.heading,
		breadcrumb: chunk.breadcrumb,
		section: chunk.section,
		version: chunk.version,
		snippet: snippet(chunk.text, queryTerms),
		// Chat grounds on the full matched section text; the box omits it.
		...(withText ? { text: chunk.text } : {}),
		score: Number(score.toFixed(5)),
	}));

	return { query: q, results, total: byPage.size, lanes: { keyword: keyword.length, semantic: semantic.length } };
}

// Keyword lane: BM25 over the table-backed inverted index. Returns chunks
// ranked best-first.
async function keywordLane(release: string, q: string, queryTerms: string[], scope: Array<{ attribute: string; value: any }>): Promise<any[]> {
	const rel = await ContentRelease.get(release);
	const N = rel?.chunkCount || 1;
	const avgLen = rel?.avgChunkLength || 1;

	const resolved: Array<{ query: string; matches: TermMatch[] }> = [];
	for (const qt of queryTerms) {
		const matches = await resolveTerm(release, qt);
		if (matches.length) resolved.push({ query: qt, matches });
	}
	if (resolved.length === 0) return [];

	// Candidate chunks: union of chunks containing any resolved term, rarest
	// terms first (smaller sets), capped by total. Retrieving up to the full cap
	// per term (rarest first) measured better on the golden set than splitting
	// the cap evenly across terms.
	const flat = resolved.flatMap((r) => r.matches).sort((a, b) => a.docFreq - b.docFreq);
	const candidates = new Map<any, any>();
	for (const { term } of flat) {
		if (candidates.size >= CANDIDATE_CAP) break;
		for await (const chunk of SearchChunk.search({
			conditions: [...scope, { attribute: 'tokens', value: term }],
			limit: CANDIDATE_CAP,
		})) {
			if (!candidates.has(chunk.id)) candidates.set(chunk.id, chunk);
		}
	}

	const idf = (docFreq: number): number => Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
	const scored: Array<{ chunk: any; score: number }> = [];
	for (const chunk of candidates.values()) {
		const counts = chunk.termCounts ?? {};
		const len = chunk.length || 1;
		let score = 0;
		let matchedQueryTerms = 0;
		for (const r of resolved) {
			let best = 0;
			for (const m of r.matches) {
				const tf = counts[m.term] ?? 0;
				if (tf === 0) continue;
				const norm = (tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * len) / avgLen));
				best = Math.max(best, idf(m.docFreq) * norm * m.weight);
			}
			if (best > 0) matchedQueryTerms++;
			score += best;
		}
		if (score === 0) continue;
		score *= 1 + 0.35 * (matchedQueryTerms - 1); // coverage bonus
		// Field boosts test the RESOLVED terms (what actually matched), not the
		// raw query token — so a typo-corrected query still earns title/heading
		// boosts (the index holds the correct spelling, not the typo).
		const titleTokens = new Set(tokenize(chunk.title));
		const headingTokens = new Set(tokenize(chunk.heading));
		for (const r of resolved) {
			if (r.matches.some((m) => titleTokens.has(m.term))) score *= TITLE_BOOST ** (1 / resolved.length);
			if (r.matches.some((m) => headingTokens.has(m.term))) score *= HEADING_BOOST ** (1 / resolved.length);
		}
		scored.push({ chunk, score });
	}
	scored.sort((a, b) => b.score - a.score);
	return scored.map((s) => s.chunk);
}

// Vector lane: embed the query, HNSW nearest-neighbor over the chunk vectors,
// scoped to the same section/version. Returns chunks ranked by similarity, or
// [] if no embedding model is configured/reachable (keyword lane stands alone).
async function semanticLane(release: string, q: string, scope: Array<{ attribute: string; value: any }>): Promise<any[]> {
	let vector: any;
	try {
		// Logical name must equal the wire model id (see schema note on @embed);
		// query embeddings must use the same model that produced the index.
		[vector] = await (models as any).embed(q, { model: EMBED_MODEL, inputType: 'query' });
	} catch {
		return []; // no/failed embedding model — degrade to keyword-only
	}
	if (!vector) return [];
	const out: any[] = [];
	try {
		for await (const chunk of SearchChunk.search({
			conditions: scope,
			// High ef: raises the HNSW exploration budget so recall is strong and
			// stable across index rebuilds — 3072-dim vectors need a generous
			// budget or the approximate search misses the right chunk.
			sort: { attribute: 'embedding', target: Array.from(vector), ef: SEMANTIC_EF },
			limit: SEMANTIC_K,
		})) {
			out.push(chunk);
		}
	} catch {
		return [];
	}
	return out;
}

// Build a short snippet around the first query-term hit.
function snippet(text: string | null | undefined, queryTerms: string[]): string {
	if (!text) return '';
	const lower = text.toLowerCase();
	let at = -1;
	for (const qt of queryTerms) {
		const i = lower.indexOf(qt);
		if (i >= 0 && (at < 0 || i < at)) at = i;
	}
	const start = at < 0 ? 0 : Math.max(0, at - 60);
	let s = text.slice(start, start + 200).trim();
	if (start > 0) s = `…${s}`;
	if (start + 200 < text.length) s = `${s}…`;
	return s;
}

// Log a *committed* query (the search UI fires this only when a query settles or
// is acted on — see web/assets/search.js), NOT every debounced keystroke, so the
// content-gap report reflects intent rather than typing fragments. Best-effort.
export async function logQuery(
	query: string,
	section: string | null,
	version: string | null,
	resultCount: number,
	source: 'ui' | 'agent' | 'mcp' = 'ui'
): Promise<void> {
	if (!query || query.trim().length < 2) return; // ignore trivially short queries
	// The commit beacon is public and its inputs are caller-supplied — bound them
	// so a hostile client can't store megabyte query strings or absurd counts.
	const safeQuery = query.slice(0, MAX_QUERY_CHARS);
	const safeCount = Number.isFinite(resultCount) ? Math.max(0, Math.min(Math.trunc(resultCount), 100000)) : 0;
	try {
		const { SearchQueryLog } = tables;
		if (SearchQueryLog) {
			await SearchQueryLog.put({
				// Random suffix: same-length queries in the same ms must not
				// collide and overwrite each other (distorts zero-result stats).
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
				query: safeQuery,
				querySource: source,
				section,
				version,
				resultCount: safeCount,
			});
		}
	} catch {
		// logging is best-effort; never fail a search on it
	}
}
