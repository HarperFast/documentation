#!/usr/bin/env node
/**
 * Pageview data redirect/availability test
 *
 * Reads paths from the GA pageview CSV and checks each one against a running
 * Docusaurus server (default: http://localhost:3000).
 *
 * Run after:
 *   npm run build
 *   npm run serve   (in a separate terminal)
 *
 * Usage:
 *   node scripts/pageview-data-test.js [base-url] [--only-problems] [--min-views N]
 *
 * Options:
 *   base-url        Server to test against (default: http://localhost:3000)
 *   --only-problems Only print 404s and unexpected results, not 200s/3xxs
 *   --min-views N   Only test paths with at least N views (default: 1)
 *
 * Examples:
 *   node scripts/pageview-data-test.js
 *   node scripts/pageview-data-test.js http://localhost:3000 --only-problems
 *   node scripts/pageview-data-test.js http://localhost:3000 --min-views 10 --only-problems
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const baseUrl = args.find((a) => a.startsWith('http')) ?? 'http://localhost:3000';
const onlyProblems = args.includes('--only-problems');
const minViewsArg = args.find((a) => a.startsWith('--min-views'));
const minViews = minViewsArg ? parseInt(minViewsArg.split('=')[1] ?? args[args.indexOf(minViewsArg) + 1], 10) : 1;

const CSV_PATH = path.join(__dirname, 'harper-docs-analytics.csv');
const CONCURRENCY = 10; // simultaneous requests

// ── Parse CSV ─────────────────────────────────────────────────────────────────
async function parseCsv(filePath) {
	const entries = [];
	const rl = readline.createInterface({ input: fs.createReadStream(filePath) });

	let headerParsed = false;
	let pathCol = -1;
	let viewsCol = -1;

	for await (const line of rl) {
		// Skip comment lines
		if (line.startsWith('#') || line.trim() === '') continue;

		const cols = line.split(',');

		if (!headerParsed) {
			pathCol = cols.indexOf('Page path');
			viewsCol = cols.indexOf('Views');
			headerParsed = true;
			continue;
		}

		const pagePath = cols[pathCol]?.trim();
		const views = parseInt(cols[viewsCol]?.trim(), 10);

		if (!pagePath || isNaN(views)) continue;
		if (views < minViews) continue;

		// Skip non-doc paths that aren't relevant to redirect testing
		// (robots.txt, search, etc.)
		if (pagePath === '/robots.txt' || pagePath === '/search') continue;

		entries.push({ path: pagePath, views });
	}

	// Sort by views descending so highest-traffic paths appear first in output
	return entries.sort((a, b) => b.views - a.views);
}

// ── Check a single path ───────────────────────────────────────────────────────
async function checkPath(pagePath) {
	const url = `${baseUrl}${pagePath}`;
	try {
		const res = await fetch(url, {
			method: 'GET',
			redirect: 'manual', // don't follow redirects — we want to see the 3xx
		});

		let finalStatus = res.status;
		let redirectTarget = null;

		if (res.status >= 300 && res.status < 400) {
			redirectTarget = res.headers.get('location') ?? '(no location header)';
		}

		return { path: pagePath, status: finalStatus, redirectTarget, error: null };
	} catch (err) {
		return { path: pagePath, status: null, redirectTarget: null, error: err.message };
	}
}

// ── Run checks with concurrency limit ────────────────────────────────────────
async function runChecks(entries) {
	const results = [];
	const total = entries.length;
	let completed = 0;

	// Process in batches of CONCURRENCY
	for (let i = 0; i < entries.length; i += CONCURRENCY) {
		const batch = entries.slice(i, i + CONCURRENCY);
		const batchResults = await Promise.all(
			batch.map(({ path: p, views }) => checkPath(p).then((r) => ({ ...r, views })))
		);
		results.push(...batchResults);
		completed += batch.length;
		process.stderr.write(`\rProgress: ${completed}/${total}`);
	}
	process.stderr.write('\n');

	return results;
}

// ── Print results ─────────────────────────────────────────────────────────────
function printResults(results) {
	const counts = { ok: 0, redirect: 0, notFound: 0, error: 0, other: 0 };

	const notFound = [];
	const errors = [];
	const redirects = [];
	const ok = [];

	for (const r of results) {
		if (r.error) {
			counts.error++;
			errors.push(r);
		} else if (r.status === 200) {
			counts.ok++;
			ok.push(r);
		} else if (r.status >= 300 && r.status < 400) {
			counts.redirect++;
			redirects.push(r);
		} else if (r.status === 404) {
			counts.notFound++;
			notFound.push(r);
		} else {
			counts.other++;
			errors.push(r);
		}
	}

	// ── 404s (most important) ─────────────────────────────────────────────────
	if (notFound.length > 0) {
		console.log('\n── 404 Not Found ────────────────────────────────────────────');
		for (const r of notFound) {
			console.log(`  [${r.views} views]  ${r.path}`);
		}
	}

	// ── Connection/fetch errors ───────────────────────────────────────────────
	if (errors.length > 0) {
		console.log('\n── Errors ───────────────────────────────────────────────────');
		for (const r of errors) {
			const detail = r.error ?? `HTTP ${r.status}`;
			console.log(`  [${r.views} views]  ${r.path}  →  ${detail}`);
		}
	}

	if (!onlyProblems) {
		// ── Redirects ─────────────────────────────────────────────────────────
		if (redirects.length > 0) {
			console.log('\n── Redirects (3xx) ──────────────────────────────────────────');
			for (const r of redirects) {
				console.log(`  [${r.views} views]  ${r.path}  →  ${r.redirectTarget}  (${r.status})`);
			}
		}

		// ── 200 OK ────────────────────────────────────────────────────────────
		if (ok.length > 0) {
			console.log('\n── 200 OK ───────────────────────────────────────────────────');
			for (const r of ok) {
				console.log(`  [${r.views} views]  ${r.path}`);
			}
		}
	}

	// ── Summary ───────────────────────────────────────────────────────────────
	console.log('\n── Summary ──────────────────────────────────────────────────');
	console.log(`  200 OK:      ${counts.ok}`);
	console.log(`  3xx redirect:${counts.redirect}`);
	console.log(`  404 not found:${counts.notFound}`);
	console.log(`  errors:      ${counts.error}`);
	console.log(`  total tested:${results.length}`);
	if (minViews > 1) console.log(`  (paths with >= ${minViews} views only)`);

	if (notFound.length > 0 || errors.length > 0) {
		process.exitCode = 1;
	}
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
	console.log(`Testing against: ${baseUrl}`);
	console.log(`Min views filter: ${minViews}`);
	console.log(`CSV: ${CSV_PATH}\n`);

	const entries = await parseCsv(CSV_PATH);
	console.log(`Paths to test: ${entries.length}`);

	const results = await runChecks(entries);
	printResults(results);
}

main().catch((err) => {
	console.error('Fatal:', err);
	process.exit(1);
});
