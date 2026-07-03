// Shared tokenizer + trigram helpers. Used at BOTH index time (ingest) and
// query time (search) — they MUST stay identical, so they live in one module
// imported by both. Pure, deterministic, no dependencies.

const STOPWORDS = new Set(
	'a an and are as at be but by for from has have if in into is it its of on or that the their then there these this to was were will with'.split(
		' '
	)
);

// text -> ordered array of normalized terms.
// - camelCase / PascalCase identifiers are split into parts AND kept whole, so
//   both "getRecordCount" and "record"/"count" retrieve the same chunk.
// - lowercased, split on non-alphanumeric, stopwords dropped, 1-char dropped.
export function tokenize(text) {
	if (!text) return [];
	const out = [];
	for (const raw of String(text).split(/[^A-Za-z0-9]+/)) {
		if (!raw) continue;
		const lower = raw.toLowerCase();
		// keep the whole identifier (e.g. version-ish "v5", "http2", "getall")
		if (lower.length > 1 && !STOPWORDS.has(lower)) out.push(lower);
		// split camelCase/Pascal and digit boundaries into parts
		const parts = raw
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/([A-Za-z])([0-9])/g, '$1 $2')
			.toLowerCase()
			.split(/[^a-z0-9]+/);
		if (parts.length > 1) {
			for (const p of parts) {
				if (p.length > 1 && !STOPWORDS.has(p)) out.push(p);
			}
		}
	}
	return out;
}

// term -> { term: count } for a chunk (BM25 term-frequency input).
export function termCounts(tokens) {
	const counts = {};
	for (const t of tokens) counts[t] = (counts[t] ?? 0) + 1;
	return counts;
}

// Sliding trigrams of a term, for typo/fuzzy matching (pg_trgm-style).
// Short terms (<3) index the whole term so they remain matchable.
export function trigrams(term) {
	if (term.length < 3) return [term];
	const grams = [];
	for (let i = 0; i <= term.length - 3; i++) grams.push(term.slice(i, i + 3));
	return grams;
}

// Trigram similarity in [0,1] between two terms (Dice over trigram sets).
export function trigramSimilarity(a, b) {
	const ga = new Set(trigrams(a));
	const gb = new Set(trigrams(b));
	if (ga.size === 0 && gb.size === 0) return a === b ? 1 : 0;
	let inter = 0;
	for (const g of ga) if (gb.has(g)) inter++;
	return (2 * inter) / (ga.size + gb.size);
}
