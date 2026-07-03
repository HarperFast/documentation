// Hybrid search: a table-backed BM25 keyword lane (with trigram + edit-distance
// typo tolerance) fused with an HNSW vector lane, both scoped and released
// through /api/search. No standing in-memory index — every structure is a
// table read; per-query memory is bounded to the candidate set.

import { tables, models } from 'harper';
import { tokenize, trigrams, trigramSimilarity, editDistance } from './tokenize.mjs';

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
const maxEdits = (len) => (len <= 4 ? 1 : 2);

async function activeRelease() {
	const pointer = await SitePointer.get('active');
	return pointer?.release ?? null;
}

// Resolve a query term to indexed terms: exact if present, else the closest
// dictionary terms. Trigrams GENERATE candidates (broad recall); a term is
// ACCEPTED if it is within the edit-distance budget OR has high trigram
// overlap — edit distance catches single-char typos that trigrams miss on
// short words. Returns [{term, docFreq, weight}].
async function resolveTerm(release, term) {
	const exact = await Term.get(`${release}:${term}`);
	if (exact) return [{ term, docFreq: exact.docFreq, weight: 1 }];

	const seen = new Map();
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
export async function runSearch({ q = '', section = null, version = null, limit = 10 } = {}) {
	// Bound every input: q may arrive null (missing param), limit negative or huge.
	q = String(q ?? '')
		.trim()
		.slice(0, MAX_QUERY_CHARS);
	limit = Math.max(1, Math.min(Number(limit) || 10, 30));
	if (!q) return { query: q, results: [], total: 0 };

	const release = await activeRelease();
	if (!release) return { query: q, results: [], total: 0 };

	const scope = [{ attribute: 'release', value: release }];
	if (section) scope.push({ attribute: 'section', value: section });
	if (version) scope.push({ attribute: 'version', value: version });
	// Cap distinct terms so a synthetic many-word query can't fan out into
	// hundreds of trigram lookups + edit-distance passes (DoS).
	const queryTerms = [...new Set(tokenize(q))].slice(0, MAX_QUERY_TERMS);

	// A query that tokenizes to nothing (only stopwords/punctuation) has no
	// search intent — return empty rather than embed it and surface arbitrary
	// nearest-neighbors (and skip the wasted embedding call).
	if (queryTerms.length === 0) {
		await logQuery(q, section, version, 0);
		return { query: q, results: [], total: 0, lanes: { keyword: 0, semantic: 0 } };
	}

	// Both lanes return ranked chunk arrays. The vector lane degrades to [] if
	// no model is configured — keyword search never depends on it.
	const [keyword, semantic] = await Promise.all([
		keywordLane(release, q, queryTerms, scope),
		semanticLane(release, q, scope),
	]);

	// Reciprocal-rank fusion at the CHUNK level: a chunk's fused score is
	// Σ 1/(RRF_K + rank) across the lanes it appears in; then keep the best
	// chunk per page. (Page-level accumulation was tried and measurably lowered
	// MRR on the golden set — it over-rewards pages with many weak chunks over a
	// page with one strong chunk — so we keep chunk-level.)
	const fused = new Map();
	for (const lane of [keyword, semantic]) {
		lane.forEach((chunk, i) => {
			const rr = 1 / (RRF_K + i + 1);
			const prev = fused.get(chunk.id);
			if (prev) prev.score += rr;
			else fused.set(chunk.id, { chunk, score: rr });
		});
	}
	const ranked = [...fused.values()].sort((a, b) => b.score - a.score);
	const byPage = new Map();
	for (const s of ranked) if (!byPage.has(s.chunk.pageId)) byPage.set(s.chunk.pageId, s);

	const results = [...byPage.values()].slice(0, limit).map(({ chunk, score }) => ({
		path: chunk.path,
		anchor: chunk.anchor,
		url: chunk.anchor ? `/${chunk.path}#${chunk.anchor}` : `/${chunk.path}`,
		title: chunk.title,
		heading: chunk.heading,
		breadcrumb: chunk.breadcrumb,
		section: chunk.section,
		version: chunk.version,
		snippet: snippet(chunk.text, queryTerms),
		score: Number(score.toFixed(5)),
	}));

	await logQuery(q, section, version, byPage.size);
	return { query: q, results, total: byPage.size, lanes: { keyword: keyword.length, semantic: semantic.length } };
}

// Keyword lane: BM25 over the table-backed inverted index. Returns chunks
// ranked best-first.
async function keywordLane(release, q, queryTerms, scope) {
	const rel = await ContentRelease.get(release);
	const N = rel?.chunkCount || 1;
	const avgLen = rel?.avgChunkLength || 1;

	const resolved = [];
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
	const candidates = new Map();
	for (const { term } of flat) {
		if (candidates.size >= CANDIDATE_CAP) break;
		for await (const chunk of SearchChunk.search({
			conditions: [...scope, { attribute: 'tokens', value: term }],
			limit: CANDIDATE_CAP,
		})) {
			if (!candidates.has(chunk.id)) candidates.set(chunk.id, chunk);
		}
	}

	const idf = (docFreq) => Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
	const scored = [];
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
async function semanticLane(release, q, scope) {
	let vector;
	try {
		// Logical name must equal the wire model id (see schema note on @embed);
		// query embeddings must use the same model that produced the index.
		[vector] = await models.embed(q, { model: EMBED_MODEL, inputType: 'query' });
	} catch {
		return []; // no/failed embedding model — degrade to keyword-only
	}
	if (!vector) return [];
	const out = [];
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
function snippet(text, queryTerms) {
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

async function logQuery(query, section, version, resultCount) {
	try {
		const { SearchQueryLog } = tables;
		if (SearchQueryLog) {
			await SearchQueryLog.put({
				// Random suffix: same-length queries in the same ms must not
				// collide and overwrite each other (distorts zero-result stats).
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
				query,
				querySource: 'ui',
				section,
				version,
				resultCount,
			});
		}
	} catch {
		// logging is best-effort; never fail a search on it
	}
}
