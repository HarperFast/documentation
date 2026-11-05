#!/usr/bin/env node
/**
 * Assembles the current (v5) reference and the open release notes from the repos that own them.
 *
 * The reference and release-note docs for code in HarperFast/harper and HarperFast/harper-pro
 * live in each repo's `docs/` directory, so a code PR carries its own docs. This script builds
 * the site's content from those trees:
 *
 *   <repo>/docs/reference/**                        → reference/** (both repos overlaid; a path
 *                                                     provided by two repos is an error)
 *   <repo>/docs/reference/_redirects.json           → client redirects (array of {from, to})
 *   <repo>/docs/release-notes/<codename>/<minor>/*  → release-notes/<codename>/<minor>.generated.md
 *
 * Release notes for a minor are fragments, one per change, so PRs do not conflict on a shared
 * file. `_index.md` (in exactly one repo) holds the page title, the section order, and the text
 * above the first section. Every other file is a fragment:
 *
 *   ---
 *   section: Replication      # the `##` heading the fragment goes under
 *   order: 20                 # optional; ordered fragments come first, then by file name
 *   ---
 *
 *   ### Sharding
 *   ...
 *
 * Sources:
 *   HARPER_DOCS_PATH / HARPER_PRO_DOCS_PATH  a local checkout to read instead of fetching
 *                                            (code-repo CI overlays the PR this way)
 *   HARPER_DOCS_REF / HARPER_PRO_DOCS_REF    the git ref to fetch
 *
 * By default the site publishes harper-pro's latest published stable release, or the highest
 * docs/<release>-<n> tag of it (a docs correction between releases), so docs merged with
 * unreleased code appear when that code ships. harper's docs come from the commit harper-pro's
 * core submodule points to, the harper that harper-pro was built from; with a local harper-pro
 * checkout, from its core/ when that is checked out.
 *
 * Usage:
 *   node scripts/assemble-content.mjs           assemble once (predev/prebuild)
 *   node scripts/assemble-content.mjs --watch   start `docusaurus start` and re-assemble when a local
 *                                               source changes, reusing the fetched checkouts (npm run dev)
 *   node scripts/assemble-content.mjs --sources print the resolved sources as /content-sources.json
 *                                               would name them, without assembling (content-check)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import yaml from 'js-yaml';

const siteRoot = path.join(import.meta.dirname, '..');
const cacheDir = path.join(siteRoot, '.content');
const manifestPath = path.join(cacheDir, 'manifest.json');

function git(cwd, ...args) {
	return execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] })
		.toString()
		.trim();
}

function missing(message) {
	throw new Error(message);
}

function fetchDocs(repo, ref) {
	const checkout = path.join(cacheDir, repo);
	if (!fs.existsSync(path.join(checkout, '.git'))) {
		fs.mkdirSync(checkout, { recursive: true });
		git(checkout, 'init', '--quiet');
		git(checkout, 'remote', 'add', 'origin', `https://github.com/HarperFast/${repo}.git`);
		git(checkout, 'sparse-checkout', 'set', '--no-cone', '/docs/');
	}
	git(checkout, 'fetch', '--quiet', '--depth', '1', '--filter=blob:none', 'origin', ref);
	git(checkout, 'checkout', '--quiet', '--force', 'FETCH_HEAD');
	if (!fs.existsSync(path.join(checkout, 'docs'))) return null;
	const sha = git(checkout, 'rev-parse', 'HEAD');
	const docsTree = git(checkout, 'rev-parse', 'HEAD:docs');
	console.error(`Fetched ${repo}@${ref} (${sha.slice(0, 10)})`);
	return { repo, ref, sha, docsTree, docsDir: path.join(checkout, 'docs'), local: false };
}

async function latestRelease() {
	const tags = git(siteRoot, 'ls-remote', '--tags', '--refs', 'https://github.com/HarperFast/harper-pro.git', 'v*')
		.split('\n')
		.map((line) => line.split('\t')[1]?.slice('refs/tags/'.length))
		.filter(Boolean);
	const versions = tags
		.map((tag) => tag.match(/^v(\d+)\.(\d+)\.(\d+)$/))
		.filter(Boolean)
		.sort((a, b) => b[1] - a[1] || b[2] - a[2] || b[3] - a[3]);
	const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
	for (const [release] of versions) {
		const response = await fetch(`https://api.github.com/repos/HarperFast/harper-pro/releases/tags/${release}`, {
			headers: token ? { authorization: `Bearer ${token}` } : {},
		});
		// A release's tag is pushed before the release is approved; until then it has no published
		// release here.
		if (response.status === 404) continue;
		if (!response.ok) {
			throw new Error(
				`Reading the HarperFast/harper-pro ${release} release failed: ${response.status} ${await response.text()}`
			);
		}
		const { draft, prerelease } = await response.json();
		if (draft || prerelease) continue;
		const pattern = new RegExp(`^docs/${release.replaceAll('.', '\\.')}-(\\d+)$`);
		const patches = tags
			.map((tag) => tag.match(pattern))
			.filter(Boolean)
			.sort((a, b) => b[1] - a[1]);
		return { release, ref: patches[0]?.[0] ?? release };
	}
	throw new Error('HarperFast/harper-pro has no published releases');
}

function localSource(repo, root) {
	const docsDir = path.join(root, 'docs');
	return fs.existsSync(docsDir) ? { repo, ref: null, root, docsDir, local: true } : null;
}

// Watch mode reuses the last fetched checkout rather than fetching again.
function cachedSource(repo) {
	return { repo, ref: null, docsDir: path.join(cacheDir, repo, 'docs'), local: false };
}

async function resolvePro(fetch) {
	const local = process.env.HARPER_PRO_DOCS_PATH;
	if (local) {
		return (
			localSource('harper-pro', path.resolve(local)) ?? missing(`HARPER_PRO_DOCS_PATH=${local} has no docs/ directory`)
		);
	}
	if (!fetch) return cachedSource('harper-pro');
	const explicit = process.env.HARPER_PRO_DOCS_REF;
	if (explicit) return fetchDocs('harper-pro', explicit) ?? missing(`harper-pro@${explicit} has no docs/ directory`);
	const { release, ref } = await latestRelease();
	const source = fetchDocs('harper-pro', ref);
	if (source) return source;
	if (ref !== release) throw new Error(`harper-pro@${ref} has no docs/ directory`);
	// Releases cut before docs/ moved into the code repos have none to publish.
	console.error(`${release} predates docs/ in the code repos; publishing main until a release carries it`);
	return fetchDocs('harper-pro', 'main') ?? missing('harper-pro@main has no docs/ directory');
}

function resolveHarper(pro, fetch) {
	const local = process.env.HARPER_DOCS_PATH;
	if (local) {
		return localSource('harper', path.resolve(local)) ?? missing(`HARPER_DOCS_PATH=${local} has no docs/ directory`);
	}
	const explicit = process.env.HARPER_DOCS_REF;
	const core = !explicit && pro.local && localSource('harper', path.join(pro.root, 'core'));
	if (core) return core;
	if (!fetch) return cachedSource('harper');
	const ref =
		explicit ||
		git(pro.local ? pro.root : path.join(cacheDir, 'harper-pro'), 'ls-tree', 'HEAD', 'core').split(/\s/)[2] ||
		missing(`harper-pro@${pro.ref ?? 'HEAD'} has no core submodule`);
	return fetchDocs('harper', ref) ?? missing(`harper@${ref} has no docs/ directory`);
}

// Relative paths use `/` on every platform: they are doc ids and URLs as well as file paths.
function walk(dir, prefix = '') {
	if (!fs.existsSync(dir)) return [];
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name.startsWith('.')) return [];
		const rel = prefix + entry.name;
		return entry.isDirectory() ? walk(path.join(dir, entry.name), rel + '/') : [rel];
	});
}

function splitFrontMatter(file) {
	const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
	const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { data: {}, body: text };
	return { data: yaml.load(match[1]) ?? {}, body: text.slice(match[0].length) };
}

// Writes only what changed and removes what is gone, so a watching dev server reloads only the
// pages that were edited.
function syncFiles(outDir, files, isOwned) {
	for (const [rel, content] of files) {
		const out = path.join(outDir, rel);
		if (fs.existsSync(out) && fs.readFileSync(out).equals(content)) continue;
		fs.mkdirSync(path.dirname(out), { recursive: true });
		fs.writeFileSync(out, content);
	}
	for (const rel of walk(outDir)) {
		if (isOwned(rel) && !files.has(rel)) fs.rmSync(path.join(outDir, rel));
	}
}

function assembleReference(resolved, manifest) {
	const files = new Map();
	const owners = new Map();
	const redirects = [];
	for (const source of resolved) {
		const srcDir = path.join(source.docsDir, 'reference');
		for (const rel of walk(srcDir)) {
			if (rel === '_redirects.json') {
				redirects.push(...JSON.parse(fs.readFileSync(path.join(srcDir, rel), 'utf8')));
				continue;
			}
			if (owners.has(rel)) {
				throw new Error(`reference/${rel} is provided by both ${owners.get(rel)} and ${source.repo}`);
			}
			owners.set(rel, source.repo);
			files.set(rel, fs.readFileSync(path.join(srcDir, rel)));
			manifest.reference[rel] = { repo: source.repo };
		}
	}
	if (owners.size === 0) throw new Error('no reference content found in any source');
	manifest.redirects = redirects;
	return files;
}

function assembleReleaseNotes(resolved, manifest) {
	const outRoot = path.join(siteRoot, 'release-notes');
	const files = new Map();
	const minors = new Map();
	for (const source of resolved) {
		const srcRoot = path.join(source.docsDir, 'release-notes');
		for (const rel of walk(srcRoot)) {
			const parts = rel.split('/');
			if (parts.length !== 3 || !rel.endsWith('.md')) {
				throw new Error(`unexpected release-notes file ${source.repo}/docs/release-notes/${rel}`);
			}
			const key = `${parts[0]}/${parts[1]}`;
			if (!minors.has(key)) minors.set(key, { index: null, fragments: [] });
			const minor = minors.get(key);
			const entry = { ...splitFrontMatter(path.join(srcRoot, rel)), name: parts[2], source };
			if (parts[2] === '_index.md') {
				if (minor.index) {
					throw new Error(`${key}/_index.md is provided by both ${minor.index.source.repo} and ${source.repo}`);
				}
				minor.index = entry;
			} else {
				if (!entry.data.section) throw new Error(`${source.repo}/docs/release-notes/${rel} has no section`);
				minor.fragments.push(entry);
			}
		}
	}
	for (const [key, { index, fragments }] of minors) {
		if (!index) throw new Error(`release notes ${key} have fragments but no _index.md`);
		const [codename, minorVersion] = key.split('/');
		const committed = path.join(outRoot, codename, `${minorVersion}.md`);
		if (fs.existsSync(committed)) {
			throw new Error(`release-notes/${codename}/${minorVersion}.md is committed here and also assembled`);
		}
		const listed = index.data.sections ?? [];
		const bySection = Map.groupBy(fragments, (f) => f.data.section);
		const unlisted = [...bySection.keys()].filter((s) => !listed.includes(s)).sort();
		const byOrder = (a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity) || a.name.localeCompare(b.name);
		const sections = [...listed, ...unlisted]
			.filter((section) => bySection.has(section))
			.map((section) => {
				const bodies = bySection
					.get(section)
					.sort(byOrder)
					.map((f) => f.body.trim());
				return `## ${section}\n\n${bodies.join('\n\n')}`;
			});
		const pageData = { ...index.data, id: minorVersion };
		delete pageData.sections;
		const frontMatter = yaml.dump(pageData);
		const page = `---\n${frontMatter}---\n\n${index.body.trim()}\n\n${sections.join('\n\n')}\n`;
		files.set(`${codename}/${minorVersion}.generated.md`, Buffer.from(page));
		manifest.releaseNotes[`${codename}/${minorVersion}`] = { repo: index.source.repo };
	}
	return files;
}

function publishedSources(resolved) {
	return Object.fromEntries(
		resolved.map(({ repo, ref, sha, docsTree }) => [repo, { ref, sha: sha ?? null, docsTree: docsTree ?? null }])
	);
}

function assemble(resolved) {
	const manifest = { reference: {}, releaseNotes: {}, redirects: [] };
	// Both are built before either is written, so a failure leaves the last assembly intact and
	// consistent with its manifest.
	const reference = assembleReference(resolved, manifest);
	const releaseNotes = assembleReleaseNotes(resolved, manifest);
	syncFiles(path.join(siteRoot, 'reference'), reference, () => true);
	syncFiles(path.join(siteRoot, 'release-notes'), releaseNotes, (rel) => rel.endsWith('.generated.md'));
	fs.mkdirSync(path.join(cacheDir, 'public'), { recursive: true });
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
	// Published with the site; content-check redeploys when a repo's docs/ tree differs from this.
	fs.writeFileSync(
		path.join(cacheDir, 'public', 'content-sources.json'),
		JSON.stringify(publishedSources(resolved)) + '\n'
	);
	console.error(
		`Assembled ${Object.keys(manifest.reference).length} reference files and ${Object.keys(manifest.releaseNotes).length} release-note pages`
	);
}

// A checkout that still tracks reference/ (an older branch, or a rebase of a PR that edited it)
// would have those edits overwritten by the assembly.
const tracked = git(siteRoot, 'ls-files', '--', 'reference', ':(glob)release-notes/**/*.generated.md');
if (tracked) {
	throw new Error(
		'reference/ is tracked in this checkout, and assembling would overwrite it. Its v5 pages now live in docs/ of HarperFast/harper and HarperFast/harper-pro; move these edits there:\n' +
			tracked
	);
}

const watch = process.argv.includes('--watch');
const pro = await resolvePro(!watch);
const resolved = [resolveHarper(pro, !watch), pro];
if (process.argv.includes('--sources')) {
	console.log(JSON.stringify(publishedSources(resolved)));
} else if (!watch) {
	assemble(resolved);
} else {
	let timer;
	// Watchers first: one that cannot start fails the command before a server exists.
	const watchers = resolved
		.filter((source) => source.local)
		.map(({ docsDir }) => {
			const watcher = fs.watch(docsDir, { recursive: true }, () => {
				clearTimeout(timer);
				timer = setTimeout(() => {
					try {
						assemble(resolved);
					} catch (error) {
						// Keep serving the last good assembly while the source is mid-edit.
						console.error(error.message);
					}
				}, 200);
			});
			console.log(`Watching ${docsDir}`);
			return { docsDir, watcher };
		});
	const server = spawn('docusaurus', ['start', ...process.argv.slice(process.argv.indexOf('--watch') + 1)], {
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});
	server.on('exit', (code) => process.exit(code ?? 1));
	// A server that no longer reflects edits is worse than none.
	for (const { docsDir, watcher } of watchers) {
		watcher.on('error', (error) => {
			console.error(`Stopped watching ${docsDir}: ${error.message}`);
			server.kill();
		});
	}
}
