// Parity harness: diffs the Docusaurus build (ground truth) against the
// Harper-served site, URL by URL. The migration-period regression gate.
//
// Compares per page: HTTP status, <title>, meta description, canonical path,
// heading anchor ids, and normalized article-text similarity. Also verifies
// every redirect rule, diffs the sitemaps, and checks per-page .md routes.
//
// Usage:
//   node scripts/parity.mjs [--build ../build] [--target http://localhost:9936]
//                           [--filter substr] [--strict] [--report parity-report.json]
//
// --strict exits non-zero on hard failures (missing pages, redirect mismatches,
// similarity < FAIL_SIMILARITY). Default is report-only.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const APP_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = path.dirname(APP_DIR);
const BUILD_DIR = path.resolve(REPO_ROOT, argValue('--build') ?? 'build');
const TARGET = argValue('--target') ?? process.env.HARPER_TARGET ?? 'http://localhost:9936';
const FILTER = argValue('--filter');
const STRICT = process.argv.includes('--strict');
const REPORT_PATH = argValue('--report') ?? path.join(APP_DIR, 'parity-report.json');
const CONCURRENCY = 12;
const WARN_SIMILARITY = 0.9;
const FAIL_SIMILARITY = 0.75;
const SKIP_URLS = new Set(['/404', '/search', '/reference']); // no-content routes: 404 page, search app, client-redirect stub

let workerErrors = 0;

if (!existsSync(BUILD_DIR)) {
	console.error(`build dir not found: ${BUILD_DIR} — run \`npm run build\` in the repo root first`);
	process.exit(2);
}

// ── Enumerate build URLs ─────────────────────────────────────────────────────

const pages = []; // {url, file}
const mdFiles = []; // build-relative .md paths from the llms plugin
for (const file of walk(BUILD_DIR)) {
	const rel = '/' + path.relative(BUILD_DIR, file).replace(/\\/g, '/');
	if (rel.startsWith('/assets/') || rel.startsWith('/img/') || rel.startsWith('/js/')) continue;
	if (rel.endsWith('.html')) {
		let url = rel.slice(0, -5);
		if (url.endsWith('/index')) url = url.slice(0, -6) || '/';
		if (SKIP_URLS.has(url)) continue;
		if (FILTER && !url.includes(FILTER)) continue;
		// The client-redirects plugin emits stub pages for every redirect rule;
		// those are covered by the redirect checks, not page parity.
		if (readFileSync(file, 'utf8').includes('http-equiv="refresh"')) continue;
		pages.push({ url, file });
	} else if (rel.endsWith('.md')) {
		if (FILTER && !rel.includes(FILTER)) continue;
		mdFiles.push(rel);
	}
}
pages.sort((a, b) => a.url.localeCompare(b.url));
console.log(`parity: ${pages.length} pages, ${mdFiles.length} md files from ${BUILD_DIR}\n       vs ${TARGET}`);

// ── Page comparison ──────────────────────────────────────────────────────────

const results = [];
await pool(pages, CONCURRENCY, async ({ url, file }) => {
	const result = { url };
	try {
		const expected = extract(readFileSync(file, 'utf8'), 'build');
		const res = await fetch(TARGET + url, { redirect: 'manual' });
		result.status = res.status;
		if (res.status !== 200) {
			results.push({ ...result, fail: `status ${res.status}` });
			return;
		}
		const actual = extract(await res.text(), 'harper');
		result.titleMatch = coreTitle(expected.title) === coreTitle(actual.title);
		result.title = result.titleMatch ? undefined : { expected: expected.title, actual: actual.title };
		result.descriptionMatch = (expected.description ?? '') === (actual.description ?? '');
		result.canonicalMatch = !expected.canonical || expected.canonical === actual.canonical;
		// Only real (letter-bearing) anchors gate parity. Docusaurus emits
		// degenerate ids like "-1".."-5" for headings that slugify to empty
		// (e.g. version-number-only headings); those are build artifacts.
		const realAnchors = expected.anchors.filter((a) => /[a-z]/i.test(a));
		result.anchorTotal = realAnchors.length;
		result.anchorMissing = realAnchors.filter((a) => !actual.anchors.includes(a));
		result.similarity = similarity(expected.text, actual.text);
		results.push(result);
	} catch (err) {
		// A worker error is a failure, not an omission — count it as one.
		results.push({ ...result, fail: `error: ${err.message}` });
	}
});

// ── Redirects ────────────────────────────────────────────────────────────────

const redirectResults = [];
const redirectRules = await loadRedirects();
await pool(redirectRules, CONCURRENCY, async ({ from, to }) => {
	const res = await tryFetch(TARGET + from, { redirect: 'manual' });
	const location = (res?.headers.get('location') ?? '').replace(TARGET, '');
	const ok = (res?.status === 301 || res?.status === 302) && normalize(location) === normalize(to);
	redirectResults.push({ from, to, status: res?.status ?? 0, location, ok });
});

// ── Sitemap + md routes + llms ───────────────────────────────────────────────

const buildSitemap = sitemapPaths(readFileSync(path.join(BUILD_DIR, 'sitemap.xml'), 'utf8'));
const harperSitemap = await tryFetch(`${TARGET}/sitemap.xml`)
	.then((res) => (res?.ok ? res.text() : ''))
	.then((xml) => sitemapPaths(xml));
// If Harper's sitemap didn't load, every build URL is "only in build" (a fail).
const onlyInBuild = [...buildSitemap].filter((p) => !harperSitemap.has(p) && !SKIP_URLS.has(p));
const onlyInHarper = [...harperSitemap].filter((p) => !buildSitemap.has(p));

const mdResults = [];
await pool(mdFiles, CONCURRENCY, async (rel) => {
	const res = await tryFetch(TARGET + rel, { method: 'HEAD' });
	mdResults.push({ path: rel, ok: res?.status === 200, status: res?.status ?? 0 });
});

const llms = {};
for (const f of ['/llms.txt', '/llms-full.txt']) {
	const res = await tryFetch(TARGET + f, { method: 'HEAD' });
	llms[f] = res?.status === 200 && existsSync(path.join(BUILD_DIR, f.slice(1)));
}

// ── Report ───────────────────────────────────────────────────────────────────

const missing = results.filter((r) => r.fail);
const titleMiss = results.filter((r) => !r.fail && !r.titleMatch);
const descMiss = results.filter((r) => !r.fail && !r.descriptionMatch);
const canonicalMiss = results.filter((r) => !r.fail && !r.canonicalMatch);
const anchorMiss = results.filter((r) => !r.fail && r.anchorMissing.length > 0);
const totalAnchors = results.reduce((n, r) => n + (r.anchorTotal ?? 0), 0);
const totalAnchorsMissing = results.reduce((n, r) => n + (r.anchorMissing?.length ?? 0), 0);
const sims = results
	.filter((r) => !r.fail)
	.map((r) => r.similarity)
	.sort((a, b) => a - b);
const simWarn = results.filter((r) => !r.fail && r.similarity < WARN_SIMILARITY && r.similarity >= FAIL_SIMILARITY);
const simFail = results.filter((r) => !r.fail && r.similarity < FAIL_SIMILARITY);
const redirectFail = redirectResults.filter((r) => !r.ok);
const mdFail = mdResults.filter((r) => !r.ok);

console.log(`
── Pages ────────────────────────────────────────────
  served 200:        ${results.length - missing.length}/${results.length}${list(missing, (r) => `${r.url} → ${r.fail}`)}
  title match:       ${results.length - missing.length - titleMiss.length}/${results.length - missing.length}${list(titleMiss, (r) => `${r.url}: "${r.title.expected}" vs "${r.title.actual}"`)}
  description match: ${results.length - missing.length - descMiss.length}/${results.length - missing.length}${list(descMiss.slice(0, 10), (r) => r.url)}
  canonical match:   ${results.length - missing.length - canonicalMiss.length}/${results.length - missing.length}${list(canonicalMiss.slice(0, 10), (r) => r.url)}
  anchors present:   ${totalAnchors - totalAnchorsMissing}/${totalAnchors} across ${anchorMiss.length} pages with gaps${list(anchorMiss.slice(0, 10), (r) => `${r.url}: missing ${r.anchorMissing.slice(0, 5).join(', ')}`)}

── Article text similarity ──────────────────────────
  median ${pct(sims[Math.floor(sims.length / 2)] ?? 0)} · p10 ${pct(sims[Math.floor(sims.length * 0.1)] ?? 0)} · min ${pct(sims[0] ?? 0)}
  < ${WARN_SIMILARITY} (warn): ${simWarn.length}${list(simWarn.slice(0, 15), (r) => `${r.url} (${pct(r.similarity)})`)}
  < ${FAIL_SIMILARITY} (fail): ${simFail.length}${list(simFail.slice(0, 15), (r) => `${r.url} (${pct(r.similarity)})`)}

── Routing ──────────────────────────────────────────
  redirects:  ${redirectResults.length - redirectFail.length}/${redirectResults.length}${list(redirectFail.slice(0, 10), (r) => `${r.from} → got ${r.status} ${r.location || '(none)'} want ${r.to}`)}
  md routes:  ${mdResults.length - mdFail.length}/${mdResults.length}${list(mdFail.slice(0, 10), (r) => `${r.path} → ${r.status}`)}
  llms.txt: ${llms['/llms.txt'] ? 'ok' : 'MISSING'} · llms-full.txt: ${llms['/llms-full.txt'] ? 'ok' : 'MISSING'}
  sitemap:    only-in-build ${onlyInBuild.length}${list(onlyInBuild.slice(0, 10), (p) => p)}
              only-in-harper ${onlyInHarper.length}${list(onlyInHarper.slice(0, 10), (p) => p)}
`);

writeFileSync(
	REPORT_PATH,
	JSON.stringify(
		{
			target: TARGET,
			buildDir: BUILD_DIR,
			generatedAt: null,
			results,
			redirectResults,
			mdResults,
			onlyInBuild,
			onlyInHarper,
		},
		null,
		'\t'
	)
);
console.log(`report: ${REPORT_PATH}`);

// ── Strict gate ──────────────────────────────────────────────────────────────
// Each gate is a hard contract for the migration. Description and canonical
// and warn-level similarity stay advisory (Docusaurus's excerpt algorithm and
// small-page word-swings are not worth blocking a deploy over).
const gates = {
	'missing/broken pages': missing.length,
	'title mismatches': titleMiss.length,
	'anchor gaps (real)': anchorMiss.length,
	'similarity < fail threshold': simFail.length,
	'redirect failures': redirectFail.length,
	'md route failures': mdFail.length,
	'llms.txt missing': llms['/llms.txt'] ? 0 : 1,
	'llms-full.txt missing': llms['/llms-full.txt'] ? 0 : 1,
	'sitemap only-in-build': onlyInBuild.length,
	'sitemap only-in-harper': onlyInHarper.length,
	'worker errors': workerErrors,
};
const hardFailures = Object.values(gates).reduce((a, b) => a + b, 0);
if (STRICT) {
	const breached = Object.entries(gates).filter(([, n]) => n > 0);
	if (breached.length) {
		console.error(`\nSTRICT FAIL (${hardFailures}):`);
		for (const [name, n] of breached) console.error(`  ✗ ${name}: ${n}`);
		process.exit(1);
	}
	console.log('\nSTRICT PASS — all gated dimensions clean.');
}

// ── Extraction & helpers ─────────────────────────────────────────────────────

function extract(html, kind) {
	const root = parse(html);
	const title = root.querySelector('title')?.text ?? '';
	const description = root.querySelector('meta[name="description"]')?.getAttribute('content');
	const canonicalHref = root.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
	const canonical = canonicalHref ? normalize(canonicalHref.replace(/^https?:\/\/[^/]+/, '')) : undefined;
	// Docusaurus: .theme-doc-markdown is exactly the rendered markdown (no
	// breadcrumbs/pagination/edit-footer). Harper skeleton: <article>.
	const article =
		kind === 'build'
			? (root.querySelector('.theme-doc-markdown') ?? root.querySelector('article'))
			: root.querySelector('article');
	let text = '';
	const anchors = [];
	if (article) {
		for (const el of article.querySelectorAll('nav, aside.theme-doc-toc-mobile, script, style, .page-footer'))
			el.remove();
		for (const h of article.querySelectorAll('h2[id], h3[id]')) anchors.push(h.getAttribute('id'));
		// Extract from innerHTML, not `.text`: node-html-parser's `.text`
		// concatenates adjacent elements with no separator ("Tucker4.7.32") and
		// leaks raw <pre> markup, and the build vs Harper DOMs differ in
		// incidental whitespace. Turning every tag into a space boundary makes
		// tokenization identical on both sides regardless of element structure.
		text = decodeEntities(article.innerHTML.replace(/<[^>]*>/g, ' '))
			.toLowerCase()
			.replace(/[​ ]/g, ' ')
			.replace(/[^\p{L}\p{N}]+/gu, ' ')
			.trim();
	}
	return { title, description, canonical, article: !!article, anchors, text };
}

function decodeEntities(s) {
	return s
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

function coreTitle(t) {
	return (t ?? '').split('|')[0].trim().toLowerCase();
}

function normalize(p) {
	if (!p) return p;
	let out = p.split('?')[0];
	if (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
	return out;
}

// Word-frequency dice coefficient over the extracted article text.
function similarity(a, b) {
	if (!a && !b) return 1;
	const fa = freq(a);
	const fb = freq(b);
	let inter = 0;
	let totalA = 0;
	let totalB = 0;
	for (const [w, c] of fa) {
		totalA += c;
		if (fb.has(w)) inter += Math.min(c, fb.get(w));
	}
	for (const c of fb.values()) totalB += c;
	return totalA + totalB === 0 ? 1 : (2 * inter) / (totalA + totalB);
}

function freq(text) {
	const map = new Map();
	for (const w of text.split(' ')) {
		if (w) map.set(w, (map.get(w) ?? 0) + 1);
	}
	return map;
}

function sitemapPaths(xml) {
	const out = new Set();
	for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
		out.add(normalize(m[1].replace(/^https?:\/\/[^/]+/, '') || '/'));
	}
	return out;
}

async function loadRedirects() {
	const { writeFileSync: write, unlinkSync } = await import('node:fs');
	const shimPath = path.join(REPO_ROOT, '.redirects-shim.ts');
	const source = readFileSync(path.join(REPO_ROOT, 'redirects.ts'), 'utf8').replace(
		"'./historic-redirects'",
		"'./historic-redirects.ts'"
	);
	write(shimPath, source);
	let mod;
	try {
		mod = await import(shimPath);
	} finally {
		unlinkSync(shimPath);
	}
	const rules = [];
	for (const rule of mod.redirects) {
		for (const from of Array.isArray(rule.from) ? rule.from : [rule.from]) rules.push({ from, to: rule.to });
	}
	return FILTER ? rules.filter((r) => r.from.includes(FILTER)) : rules;
}

async function pool(items, size, worker) {
	let i = 0;
	await Promise.all(
		Array.from({ length: Math.min(size, items.length) }, async () => {
			while (i < items.length) {
				const item = items[i++];
				try {
					await worker(item);
				} catch (err) {
					// Last-resort guard so one item can't reject the whole batch.
					// Counted so --strict fails rather than silently under-reporting.
					workerErrors++;
					console.error(`worker error on ${JSON.stringify(item).slice(0, 80)}: ${err.message}`);
				}
			}
		})
	);
}

// Fetch that never throws — a down target must produce gated failures with a
// clean breakdown, not an uncaught crash that skips the strict report.
async function tryFetch(url, opts) {
	try {
		return await fetch(url, opts);
	} catch {
		workerErrors++;
		return null;
	}
}

function walk(dir) {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else out.push(full);
	}
	return out;
}

function list(items, fmt) {
	if (!items.length) return '';
	return '\n' + items.map((i) => `      · ${fmt(i)}`).join('\n');
}

function pct(n) {
	return `${(n * 100).toFixed(1)}%`;
}

function argValue(flag) {
	const i = process.argv.indexOf(flag);
	return i >= 0 ? process.argv[i + 1] : undefined;
}
