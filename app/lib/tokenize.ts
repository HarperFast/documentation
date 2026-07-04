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
export function tokenize(text: string | null | undefined): string[] {
	if (!text) return [];
	const out: string[] = [];
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
export function termCounts(tokens: string[]): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const t of tokens) counts[t] = (counts[t] ?? 0) + 1;
	return counts;
}

// Sliding trigrams of a term, for typo/fuzzy matching (pg_trgm-style).
// Short terms (<3) index the whole term so they remain matchable.
export function trigrams(term: string): string[] {
	if (term.length < 3) return [term];
	const grams: string[] = [];
	for (let i = 0; i <= term.length - 3; i++) grams.push(term.slice(i, i + 3));
	return grams;
}

// Trigram similarity in [0,1] between two terms (Dice over trigram sets).
export function trigramSimilarity(a: string, b: string): number {
	const ga = new Set(trigrams(a));
	const gb = new Set(trigrams(b));
	if (ga.size === 0 && gb.size === 0) return a === b ? 1 : 0;
	let inter = 0;
	for (const g of ga) if (gb.has(g)) inter++;
	return (2 * inter) / (ga.size + gb.size);
}

// Damerau-Levenshtein edit distance (counts adjacent transpositions as 1),
// bounded: returns max+1 as soon as the best possible distance exceeds `max`.
// Catches single-char typos that trigrams miss on short words
// (vektor→vector, replciation→replication) without scanning the dictionary.
export function editDistance(a: string, b: string, max = 2): number {
	if (a === b) return 0;
	if (Math.abs(a.length - b.length) > max) return max + 1;
	const prev2: number[] = new Array(b.length + 1);
	let prev: number[] = new Array(b.length + 1);
	let curr: number[] = new Array(b.length + 1);
	for (let j = 0; j <= b.length; j++) prev[j] = j;
	for (let i = 1; i <= a.length; i++) {
		curr[0] = i;
		let rowMin = curr[0];
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			let v = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				v = Math.min(v, prev2[j - 2] + 1);
			}
			curr[j] = v;
			if (v < rowMin) rowMin = v;
		}
		if (rowMin > max) return max + 1;
		for (let j = 0; j <= b.length; j++) prev2[j] = prev[j];
		[prev, curr] = [curr, prev];
	}
	return prev[b.length];
}
