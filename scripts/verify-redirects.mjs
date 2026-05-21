#!/usr/bin/env node

/**
 * Verify that every configured redirect path on docs.harperdb.io does not 404.
 *
 * Reads `redirects.ts` and `historic-redirects.ts` from the project root,
 * extracts every `from` path (string or string[]), then issues a fetch against
 * the live docs site for each one and asserts the final response is not 404.
 *
 * Usage: node scripts/verify-redirects.mjs [--host=https://docs.harperdb.io] [--concurrency=20]
 *
 * Exit codes:
 *   0 — every redirect resolved to a non-404 response
 *   1 — one or more redirects 404'd or errored out
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const args = Object.fromEntries(
	process.argv.slice(2).map((a) => {
		const [k, ...v] = a.replace(/^--/, '').split('=');
		return [k, v.join('=') || true];
	})
);

const HOST = (args.host || 'https://docs.harperdb.io').replace(/\/$/, '');
const CONCURRENCY = Number(args.concurrency) || 20;
const TIMEOUT_MS = Number(args.timeout) || 15000;

/**
 * Extract every `from:` path from a redirect-config source file.
 * Handles both `from: '/x'` and `from: ['/x', '/y', ...]` forms.
 */
function extractFromPaths(source) {
	const paths = new Set();

	// Match `from: '...'` or `from: "..."` (single value), excluding the array form.
	const singleRe = /from:\s*(['"])(\/[^'"]*)\1/g;
	for (const m of source.matchAll(singleRe)) {
		paths.add(m[2]);
	}

	// Match `from: [ ... ]` (multi-value). Capture the array body, then pull
	// every quoted string out of it.
	const arrayRe = /from:\s*\[([\s\S]*?)\]/g;
	for (const m of source.matchAll(arrayRe)) {
		const body = m[1];
		const strRe = /(['"])(\/[^'"]*)\1/g;
		for (const s of body.matchAll(strRe)) {
			paths.add(s[2]);
		}
	}

	return [...paths];
}

function loadAllFromPaths() {
	const files = ['redirects.ts', 'historic-redirects.ts'];
	const all = new Set();
	for (const file of files) {
		const src = readFileSync(resolve(repoRoot, file), 'utf8');
		for (const p of extractFromPaths(src)) {
			all.add(p);
		}
	}
	return [...all].sort();
}

async function fetchOnce(url) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		// `redirect: 'follow'` — we care whether the final destination is a real
		// page, not whether the source 301s.
		const res = await fetch(url, {
			method: 'GET',
			redirect: 'follow',
			signal: controller.signal,
			headers: { 'user-agent': 'harper-docs-redirect-verifier/1.0' },
		});
		return { status: res.status, finalUrl: res.url };
	} finally {
		clearTimeout(timer);
	}
}

async function checkPath(path) {
	const url = HOST + path;
	let last = { status: 0, finalUrl: null, error: null };

	// Retry transient failures (5xx or network) once after a short delay.
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const r = await fetchOnce(url);
			last = r;
			if (r.status < 500) break;
		} catch (err) {
			last = { status: 0, finalUrl: null, error: err.message };
		}
		if (attempt === 0) await new Promise((r) => setTimeout(r, 750));
	}

	return {
		path,
		url,
		status: last.status,
		finalUrl: last.finalUrl,
		error: last.error,
		ok: last.status !== 0 && last.status !== 404 && last.status < 500,
	};
}

/** Worker-pool concurrency. */
async function runWithConcurrency(items, worker, limit) {
	const results = new Array(items.length);
	let i = 0;
	let done = 0;
	const total = items.length;

	async function next() {
		while (true) {
			const idx = i++;
			if (idx >= total) return;
			results[idx] = await worker(items[idx]);
			done++;
			if (done % 25 === 0 || done === total) {
				process.stderr.write(`\r  checked ${done}/${total}…`);
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, total) }, next));
	process.stderr.write('\n');
	return results;
}

async function main() {
	const paths = loadAllFromPaths();
	console.log(`Found ${paths.length} unique redirect source paths`);
	console.log(`Checking against ${HOST} with concurrency=${CONCURRENCY}\n`);

	const results = await runWithConcurrency(paths, checkPath, CONCURRENCY);

	const notFound = results.filter((r) => r.status === 404);
	const serverErrors = results.filter((r) => r.status >= 500);
	const networkErrors = results.filter((r) => r.status === 0);
	const ok = results.filter((r) => r.ok);

	console.log('Summary:');
	console.log(`  OK (non-404):        ${ok.length}`);
	console.log(`  404 Not Found:       ${notFound.length}`);
	console.log(`  5xx server errors:   ${serverErrors.length}`);
	console.log(`  Network/timeout:     ${networkErrors.length}`);

	if (notFound.length) {
		console.log('\n404s:');
		for (const r of notFound) {
			console.log(`  ${r.path}  →  ${r.finalUrl}`);
		}
	}
	if (serverErrors.length) {
		console.log('\n5xx errors:');
		for (const r of serverErrors) {
			console.log(`  ${r.path}  →  ${r.status}  (${r.finalUrl})`);
		}
	}
	if (networkErrors.length) {
		console.log('\nNetwork errors:');
		for (const r of networkErrors) {
			console.log(`  ${r.path}  →  ${r.error}`);
		}
	}

	const failed = notFound.length + serverErrors.length + networkErrors.length;
	if (failed > 0) {
		console.error(`\n✗ ${failed} redirect(s) failed verification`);
		process.exit(1);
	}
	console.log('\n✓ All redirects resolved to non-404 responses');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
