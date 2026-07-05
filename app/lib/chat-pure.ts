// Pure, dependency-free chat helpers — no Harper runtime, no network, no I/O.
// Split out of chat.ts (which boots the Harper database on import via the
// `harper` package) so this logic is unit-testable under plain `node --test`.
// chat.ts imports these for its own use and re-exports the public ones, so
// existing callers keep importing from './chat.ts'.

import { createHash, randomBytes } from 'node:crypto';

export const MAX_QUESTION = 1000; // reject longer questions

// Secret salt so stored IP hashes aren't reversible via a precomputed IPv4
// rainbow table (the address space is small). Set CHAT_IP_SALT in production for
// a STABLE secret salt (so per-IP quota survives restarts); otherwise a random
// per-process salt keeps hashes private, at the cost of resetting the quota
// window on restart.
const IP_SALT = process.env.CHAT_IP_SALT || randomBytes(16).toString('hex');

// Minimal shape of the request fields clientIp reads — kept local so this module
// needs no Harper types (importing them would boot the runtime).
interface ClientRequest {
	headers: { get(name: string): string | null };
	ip?: string;
}

// ── Client identity ──────────────────────────────────────────────────────────

export function clientIp(request: ClientRequest): string {
	// Only trust X-Forwarded-For when explicitly behind a proxy that appends the
	// real client IP (CHAT_TRUST_PROXY=true). Off by default so the socket peer —
	// which a client cannot spoof — is used for quota bucketing. Read at call time
	// (not a module const) so it reflects the current env and is unit-testable.
	if (process.env.CHAT_TRUST_PROXY === 'true') {
		// Behind a trusted proxy, take the RIGHTMOST X-Forwarded-For hop — the one the
		// proxy appended — since the leftmost entries are client-supplied and spoofable.
		const fwd = request.headers.get('x-forwarded-for');
		if (fwd) {
			const hops = fwd
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			if (hops.length) return hops[hops.length - 1];
		}
	}
	return request.ip || 'local';
}

// Never store raw IPs — hash with a salt and keep a short prefix.
export function hashIp(ip: string): string {
	return createHash('sha256')
		.update(`${IP_SALT}:${ip}`)
		.digest('hex')
		.slice(0, 16);
}

// ── Version scoping ──────────────────────────────────────────────────────────

// Major doc version mentioned in a question ("...in v4" → "v4"), or null. The
// condenser bakes the version into the standalone question, so this recovers the
// version intent when the UI didn't pin one — used to scope the cache correctly.
// Return a version only when EXACTLY one is mentioned. A comparison question
// ("differences between v4 and v5") names both — scope it to `default`, not
// whichever appears first, so retrieval/cache aren't biased to one version.
export function parseVersion(text: string): string | null {
	const versions = new Set<string>();
	for (const m of text.matchAll(/\bv([45])\b/gi)) versions.add(`v${m[1]}`);
	return versions.size === 1 ? [...versions][0] : null;
}

// ── Cache key ────────────────────────────────────────────────────────────────

export function normalizeQuestion(q: string): string {
	return q
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim() // trim BEFORE stripping punctuation, else a trailing space hides the "?"
		.replace(/[?!.,;:]+$/g, '')
		.trim();
}

// Cache id: release + version + question hash. Release is in the KEY (not just a
// field) so a straggler request on an old release can't overwrite a fresh
// row for the current release — old rows simply age out via TTL.
export function cacheKey(release: string, version: string, normQ: string): string {
	return `${release}:${version}:${createHash('sha256').update(normQ).digest('hex').slice(0, 20)}`;
}

// The cache id a generated answer will be stored under — recorded on its ChatLog
// row so a later thumbs-down or faithfulness flag can evict exactly that entry.
// MUST match the key storeCache/lookupCache compute, or eviction silently no-ops.
export function computeCacheId(release: string, version: string, question: string): string {
	return cacheKey(release, version, normalizeQuestion(question));
}

// ── Math ─────────────────────────────────────────────────────────────────────

export function cosine(a: number[], b: number[]): number {
	let dot = 0;
	let na = 0;
	let nb = 0;
	const n = Math.min(a.length, b.length);
	for (let i = 0; i < n; i++) {
		dot += a[i] * b[i];
		na += a[i] * a[i];
		nb += b[i] * b[i];
	}
	return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

// ── Validation ───────────────────────────────────────────────────────────────

export function validateQuestion(q: unknown): string | null {
	if (typeof q !== 'string') return null;
	const trimmed = q.trim();
	if (trimmed.length < 2 || trimmed.length > MAX_QUESTION) return null;
	return trimmed;
}
