// Ingest client: walks the repo's content directories, evaluates the sidebar
// files and redirect tables, and posts everything to the /Ingest endpoint as
// a staged ContentRelease, then activates it.
//
// Usage:  node scripts/ingest.mjs [--target http://localhost:9936]
// Auth:   HARPER_CLI_USERNAME / HARPER_CLI_PASSWORD env vars, or the
//         credentials file at ~/hdb-docs-replatform/.admin-credentials

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expandComponents } from '../lib/expand.mjs';

const APP_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPO_ROOT = path.dirname(APP_DIR);
const TARGET = argValue('--target') ?? process.env.HARPER_TARGET ?? 'http://localhost:9936';
const EDIT_BASE = 'https://github.com/HarperFast/documentation/blob/main';
// Smaller batches keep each `pages` POST short — with @embed, every chunk in a
// batch is embedded inline, so 40 pages (~260 embeds) would make one very long
// request. ~8 pages keeps a POST to a handful of seconds.
const BATCH_SIZE = 8;

// Release data drives ReleaseNotesList / LatestPatchLink expansion. Generated
// by the same script Docusaurus prebuild uses, so the two stay in lockstep.
const RELEASE_DATA_PATH = path.join(REPO_ROOT, 'release-notes-data.json');
if (!existsSync(RELEASE_DATA_PATH)) {
	execSync('node scripts/generateReleaseNotesData.js', { cwd: REPO_ROOT, stdio: 'inherit' });
}
const releaseData = existsSync(RELEASE_DATA_PATH) ? JSON.parse(readFileSync(RELEASE_DATA_PATH, 'utf8')) : null;

const auth = resolveAuth();
const gitSha = execSync('git rev-parse --short HEAD', { cwd: REPO_ROOT }).toString().trim();
const release = `${gitSha}-${Date.now()}`;

// ── Collect pages ────────────────────────────────────────────────────────────

const SECTIONS = [
	{ dir: 'learn', route: 'learn', section: 'learn' },
	{ dir: 'reference', route: 'reference/v5', section: 'reference', version: 'v5' },
	{ dir: 'reference_versioned_docs/version-v4', route: 'reference/v4', section: 'reference', version: 'v4' },
	{ dir: 'release-notes', route: 'release-notes', section: 'release-notes' },
	{ dir: 'fabric', route: 'fabric', section: 'fabric' },
];

const docs = [];
for (const { dir, route, section, version } of SECTIONS) {
	const abs = path.join(REPO_ROOT, dir);
	if (!existsSync(abs)) continue;
	for (const file of walk(abs)) {
		const rel = path.relative(abs, file).replace(/\\/g, '/');
		if (!/\.(md|mdx)$/.test(rel)) continue;
		if (rel.split('/').some((seg) => seg.startsWith('_'))) continue; // Docusaurus partials are not pages
		const noExt = rel.replace(/\.(md|mdx)$/, '');
		const routePath =
			noExt === 'index' ? route : noExt.endsWith('/index') ? `${route}/${noExt.slice(0, -6)}` : `${route}/${noExt}`;
		docs.push({
			path: routePath,
			section,
			version,
			markdown: expandComponents(readFileSync(file, 'utf8'), { sourceFile: file, releaseData }),
			sourcePath: `${dir}/${rel}`,
			editUrl: `${EDIT_BASE}/${dir}/${rel}`,
		});
	}
}

// Homepage
const homepageFile = path.join(REPO_ROOT, 'src/pages/index.mdx');
if (existsSync(homepageFile)) {
	docs.push({
		path: '',
		section: 'root',
		markdown: expandComponents(readFileSync(homepageFile, 'utf8'), { sourceFile: homepageFile, releaseData }),
		sourcePath: 'src/pages/index.mdx',
		editUrl: `${EDIT_BASE}/src/pages/index.mdx`,
	});
}

// ── Navigation trees ─────────────────────────────────────────────────────────

const navEntries = [];
navEntries.push({
	section: 'reference',
	version: 'v5',
	tree: await sidebarTree('sidebarsReference.ts', 'reference/v5'),
});
navEntries.push({ section: 'learn', tree: await sidebarTree('sidebarsLearn.ts', 'learn') });
navEntries.push({ section: 'fabric', tree: await sidebarTree('sidebarsFabric.ts', 'fabric') });
navEntries.push({ section: 'release-notes', tree: fallbackTree('release-notes') });
navEntries.push({
	section: 'reference',
	version: 'v4',
	tree: jsonSidebarTree('reference_versioned_sidebars/version-v4-sidebars.json', 'reference/v4'),
});
navEntries.push({ section: 'root', tree: [] });

async function sidebarTree(file, base) {
	try {
		const mod = await import(path.join(REPO_ROOT, file));
		const sidebars = mod.default;
		const items = Object.values(sidebars)[0];
		return transformItems(items, base);
	} catch (err) {
		console.warn(`sidebar ${file} failed (${err.message}); using flat fallback`);
		return fallbackTree(base.split('/')[0]);
	}
}

function jsonSidebarTree(file, base) {
	try {
		const sidebars = JSON.parse(readFileSync(path.join(REPO_ROOT, file), 'utf8'));
		const items = Object.values(sidebars)[0];
		return transformItems(items, base);
	} catch (err) {
		console.warn(`sidebar ${file} failed (${err.message}); using flat fallback`);
		return [];
	}
}

function transformItems(items, base) {
	if (!Array.isArray(items)) return [];
	return items
		.map((item) => {
			if (typeof item === 'string') return { label: item.split('/').pop(), path: docIdToPath(item, base) };
			if (item.type === 'doc' || (item.id && !item.type))
				return { label: item.label ?? item.id, path: docIdToPath(item.id, base) };
			if (item.type === 'category') {
				const node = { label: item.label, items: transformItems(item.items, base) };
				if (item.link?.type === 'doc') node.path = docIdToPath(item.link.id, base);
				return node;
			}
			if (item.type === 'autogenerated') return null; // release-notes fallback covers this
			if (item.type === 'link') return { label: item.label, path: item.href?.replace(/^\//, '') };
			return null;
		})
		.filter(Boolean);
}

function docIdToPath(id, base) {
	return id === 'index' ? base : id.endsWith('/index') ? `${base}/${id.slice(0, -6)}` : `${base}/${id}`;
}

function fallbackTree(sectionRoute) {
	return docs
		.filter((d) => d.path === sectionRoute || d.path.startsWith(`${sectionRoute}/`))
		.sort((a, b) => a.path.localeCompare(b.path))
		.map((d) => ({ label: d.path.split('/').pop(), path: d.path }));
}

// ── Redirects ────────────────────────────────────────────────────────────────

const redirectEntries = [];
try {
	// redirects.ts uses an extensionless TS import that native Node ESM can't
	// resolve — import via a shim with the specifier patched.
	const { writeFileSync, unlinkSync } = await import('node:fs');
	const shimPath = path.join(REPO_ROOT, '.redirects-shim.ts');
	const source = readFileSync(path.join(REPO_ROOT, 'redirects.ts'), 'utf8').replace(
		"'./historic-redirects'",
		"'./historic-redirects.ts'"
	);
	writeFileSync(shimPath, source);
	let mod;
	try {
		mod = await import(shimPath);
	} finally {
		unlinkSync(shimPath);
	}
	// Dedup by `from`: entries share the Redirect primary key "<release>:<from>",
	// so duplicates collapse server-side. Deduping here keeps the client's
	// expected count exact for the activation guard (last mapping wins).
	const byFrom = new Map();
	for (const rule of mod.redirects) {
		const froms = Array.isArray(rule.from) ? rule.from : [rule.from];
		for (let from of froms) {
			if (from.length > 1 && from.endsWith('/')) from = from.slice(0, -1); // match the serving path normalization
			byFrom.set(from, { from, to: rule.to, status: 301, source: 'current' });
		}
	}
	redirectEntries.push(...byFrom.values());
} catch (err) {
	console.warn(`redirects.ts import failed (${err.message}); skipping redirects`);
}

// ── Ship it ──────────────────────────────────────────────────────────────────

console.log(
	`release ${release}: ${docs.length} pages, ${navEntries.length} nav trees, ${redirectEntries.length} redirects → ${TARGET}`
);

await post({ action: 'begin', release, gitSha });
for (let i = 0; i < docs.length; i += BATCH_SIZE) {
	const batch = docs.slice(i, i + BATCH_SIZE);
	await post({ action: 'pages', release, docs: batch });
	process.stdout.write(`\r  pages ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}`);
}
console.log();
await post({ action: 'nav', release, entries: navEntries });
for (let i = 0; i < redirectEntries.length; i += 200) {
	await post({ action: 'redirects', release, entries: redirectEntries.slice(i, i + 200) });
}
const index = await post({ action: 'buildIndex', release });
console.log(`indexed: ${index.terms} terms, ${index.chunks} chunks, avg length ${index.avgChunkLength?.toFixed(1)}`);
const result = await post({
	action: 'activate',
	release,
	expect: { pages: docs.length, nav: navEntries.length, redirects: redirectEntries.length },
});
if (result.pruned) console.log(`pruned: ${result.pruned} old release(s)`);
console.log('activated:', JSON.stringify(result));

// ── Helpers ──────────────────────────────────────────────────────────────────

function walk(dir) {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else out.push(full);
	}
	return out;
}

// POST with retry + exponential backoff. `pages` batches embed inline via
// @embed, so a transient provider rate spike surfaces as a 500 — retry rather
// than abort the whole ingest. Backoff also throttles the sustained embed rate.
async function post(body, attempt = 0) {
	const backoff = async (label) => {
		if (attempt >= 5) throw new Error(`Ingest ${body.action} failed after ${attempt} retries: ${label}`);
		const waitMs = Math.min(2 ** attempt * 1000, 15000);
		process.stdout.write(`\n  ${body.action} ${label}, retry ${attempt + 1}/5 in ${waitMs}ms…`);
		await new Promise((r) => setTimeout(r, waitMs));
		return post(body, attempt + 1);
	};
	let res;
	try {
		// AbortSignal.timeout guards a hung request (e.g. a stuck embed call).
		res = await fetch(`${TARGET}/Ingest`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'authorization': `Basic ${auth}` },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(120000),
		});
	} catch (err) {
		// Network failure / DNS / reset / timeout — retriable.
		return backoff(err.name === 'TimeoutError' ? 'timed out' : `network error (${err.message})`);
	}
	if (res.ok) return res.json();
	const text = await res.text();
	if (res.status >= 500 || res.status === 429) return backoff(String(res.status));
	throw new Error(`Ingest ${body.action} failed: ${res.status} ${text}`);
}

function resolveAuth() {
	let user = process.env.HARPER_CLI_USERNAME;
	let pass = process.env.HARPER_CLI_PASSWORD;
	if (!user || !pass) {
		const credFile = path.join(homedir(), 'hdb-docs-replatform', '.admin-credentials');
		if (existsSync(credFile)) {
			for (const line of readFileSync(credFile, 'utf8').split('\n')) {
				const [k, v] = line.split('=');
				if (k === 'HARPER_CLI_USERNAME') user = v.trim();
				if (k === 'HARPER_CLI_PASSWORD') pass = v.trim();
			}
		}
	}
	if (!user || !pass) throw new Error('no credentials: set HARPER_CLI_USERNAME/HARPER_CLI_PASSWORD');
	return Buffer.from(`${user}:${pass}`).toString('base64');
}

function argValue(flag) {
	const i = process.argv.indexOf(flag);
	return i >= 0 ? process.argv[i + 1] : undefined;
}
