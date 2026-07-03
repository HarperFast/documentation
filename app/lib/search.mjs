// Keyword search lane: a table-backed inverted index scored with the BM25
// formula, with trigram fuzzy resolution for typos. No standing in-memory
// index — every structure is a table read, memory is bounded to the candidate
// set of one query. Exposed at /api/search. (Vector/semantic lane is M2b.)

import { tables } from 'harper';
import { tokenize, trigrams, trigramSimilarity } from './tokenize.mjs';

const { SitePointer, ContentRelease, SearchChunk, Term } = tables;

const K1 = 1.2; // BM25 term-frequency saturation
const B = 0.75; // BM25 length-normalization strength
const TITLE_BOOST = 2.5;
const HEADING_BOOST = 1.6;
const CANDIDATE_CAP = 400; // max chunks scored per query
const FUZZY_MIN = 0.45; // min trigram similarity to accept a typo correction

async function activeRelease() {
	const pointer = await SitePointer.get('active');
	return pointer?.release ?? null;
}

// Resolve a query term to indexed terms: exact if it exists, else the closest
// dictionary terms by trigram overlap (typo tolerance). Returns [{term, weight}].
async function resolveTerm(release, term) {
	const exact = await Term.get(`${release}:${term}`);
	if (exact) return [{ term, docFreq: exact.docFreq, weight: 1 }];

	// Fuzzy: gather candidates sharing trigrams, rank by trigram similarity.
	const seen = new Map();
	for (const g of trigrams(term)) {
		for await (const t of Term.search({
			conditions: [
				{ attribute: 'release', value: release },
				{ attribute: 'trigrams', value: g },
			],
			select: ['term', 'docFreq'],
			limit: 60,
		})) {
			if (!seen.has(t.term)) seen.set(t.term, t.docFreq);
		}
	}
	const ranked = [...seen.entries()]
		.map(([t, docFreq]) => ({ term: t, docFreq, sim: trigramSimilarity(term, t) }))
		.filter((c) => c.sim >= FUZZY_MIN)
		.sort((a, b) => b.sim - a.sim)
		.slice(0, 3);
	return ranked.map((c) => ({ term: c.term, docFreq: c.docFreq, weight: c.sim }));
}

// Run a keyword search. { q, section, version, limit } → { query, results, total }.
export async function runSearch({ q = '', section = null, version = null, limit = 10 } = {}) {
	q = q.trim();
	limit = Math.min(Number(limit) || 10, 30);

	if (!q) return { query: q, results: [], total: 0 };

	const release = await activeRelease();
	if (!release) return { query: q, results: [], total: 0 };

	const rel = await ContentRelease.get(release);
	const N = rel?.chunkCount || 1;
	const avgLen = rel?.avgChunkLength || 1;

	const queryTerms = [...new Set(tokenize(q))];
	const resolved = [];
	for (const qt of queryTerms) {
		const matches = await resolveTerm(release, qt);
		if (matches.length) resolved.push({ query: qt, matches });
	}
	if (resolved.length === 0) {
		await logQuery(q, section, version, 0);
		return { query: q, results: [], total: 0 };
	}

	// Retrieve candidate chunks: union of chunks containing any resolved
	// term, scoped to section/version, rarest terms first (smaller sets).
	const flat = resolved
		.flatMap((r) => r.matches.map((m) => ({ ...m, queryWeight: m.weight })))
		.sort((a, b) => a.docFreq - b.docFreq);
	const scope = [{ attribute: 'release', value: release }];
	if (section) scope.push({ attribute: 'section', value: section });
	if (version) scope.push({ attribute: 'version', value: version });

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

	// Score each candidate with BM25 over the resolved query terms.
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
		// Coverage bonus: reward chunks matching more distinct query terms.
		score *= 1 + 0.35 * (matchedQueryTerms - 1);
		// Field boosts: query term appearing in title / heading.
		const titleTokens = new Set(tokenize(chunk.title));
		const headingTokens = new Set(tokenize(chunk.heading));
		for (const r of resolved) {
			if (titleTokens.has(r.query)) score *= TITLE_BOOST ** (1 / resolved.length);
			if (headingTokens.has(r.query)) score *= HEADING_BOOST ** (1 / resolved.length);
		}
		scored.push({ chunk, score });
	}

	scored.sort((a, b) => b.score - a.score);
	// One result per page: keep the best-scoring section. Standard
	// docs-search UX; avoids a single well-titled page flooding the list.
	const byPage = new Map();
	for (const s of scored) if (!byPage.has(s.chunk.pageId)) byPage.set(s.chunk.pageId, s);
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
		score: Number(score.toFixed(4)),
	}));

	await logQuery(q, section, version, byPage.size);
	return { query: q, results, total: byPage.size };
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
				id: `${Date.now()}-${Math.round(query.length)}`,
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
