// Ingest endpoint: builds a staged ContentRelease from posted markdown, then
// atomically activates it. Rendering happens HERE, inside Harper.
//
// Protocol (POST /Ingest, authenticated):
//   {action:'begin', release, gitSha}
//   {action:'pages', release, docs:[{path, section, version, markdown, sourcePath, editUrl}]}
//   {action:'nav', release, entries:[{section, version, tree}]}
//   {action:'redirects', release, entries:[{from, to, status, source}]}
//   {action:'buildIndex', release}  → builds the Term dictionary + corpus stats
//   {action:'activate', release}   → validates, archives previous active, activates

import { Resource, tables, server } from 'harper';
import { createHash } from 'node:crypto';
import { renderDoc } from '../lib/render.mjs';
import { tokenize, termCounts, trigrams } from '../lib/tokenize.mjs';

const { ContentRelease, Page, Navigation, Redirect, SitePointer, SearchChunk, Term } = tables;

export class Ingest extends Resource {
	static async post(_target, data) {
		const body = await data;
		switch (body.action) {
			case 'begin': {
				await ContentRelease.put({ id: body.release, status: 'staging', gitSha: body.gitSha ?? '', pageCount: 0 });
				return { ok: true, release: body.release };
			}
			case 'pages': {
				let count = 0;
				let chunkCount = 0;
				for (const doc of body.docs ?? []) {
					const rendered = await renderDoc(doc.markdown);
					const title = rendered.title || doc.path.split('/').pop(); // Docusaurus falls back to the doc id
					await Page.put({
						id: `${body.release}:${doc.path}`,
						release: body.release,
						path: doc.path,
						section: doc.section,
						version: doc.version ?? null,
						title,
						description: rendered.description,
						html: rendered.html,
						toc: rendered.toc,
						sourceMarkdown: doc.markdown,
						renderedMarkdown: rendered.renderedMarkdown,
						frontmatter: rendered.frontmatter,
						editUrl: doc.editUrl ?? null,
						sourcePath: doc.sourcePath ?? null,
						contentHash: createHash('sha256').update(doc.markdown).digest('hex'),
					});
					count++;
					chunkCount += await writeChunks(body.release, doc, title, rendered.chunks);
				}
				return { ok: true, ingested: count, chunks: chunkCount };
			}
			case 'nav': {
				for (const entry of body.entries ?? []) {
					const id = entry.version
						? `${body.release}:${entry.section}:${entry.version}`
						: `${body.release}:${entry.section}`;
					await Navigation.put({
						id,
						release: body.release,
						section: entry.section,
						version: entry.version ?? null,
						tree: entry.tree,
					});
				}
				return { ok: true };
			}
			case 'redirects': {
				let count = 0;
				for (const entry of body.entries ?? []) {
					// Open-redirect guard: only accept site-relative targets. A
					// crafted absolute/scheme URL in the redirect data would
					// otherwise become a Location header sending users off-site.
					if (typeof entry.to !== 'string' || !/^\/(?!\/)/.test(entry.to)) {
						throw new Error(
							`redirect target must be site-relative (start with a single "/"): ${entry.from} → ${entry.to}`
						);
					}
					await Redirect.put({
						id: `${body.release}:${entry.from}`,
						release: body.release,
						from: entry.from,
						to: entry.to,
						status: entry.status ?? 301,
						source: entry.source ?? 'current',
					});
					count++;
				}
				return { ok: true, ingested: count };
			}
			case 'buildIndex': {
				// Aggregate term document-frequencies + corpus stats across every
				// chunk in the release, then write the Term dictionary. A per-release
				// pass, run after all pages are staged and before activation.
				const df = new Map();
				let chunkCount = 0;
				let totalLength = 0;
				for await (const chunk of SearchChunk.search({
					conditions: [{ attribute: 'release', value: body.release }],
					select: ['termCounts', 'length'],
				})) {
					chunkCount++;
					totalLength += chunk.length ?? 0;
					for (const term of Object.keys(chunk.termCounts ?? {})) df.set(term, (df.get(term) ?? 0) + 1);
				}
				// Write the term dictionary in concurrent batches — ~7,800 terms
				// one-at-a-time serially is slow enough to risk a request timeout.
				const entries = [...df];
				for (let i = 0; i < entries.length; i += TERM_WRITE_BATCH) {
					await Promise.all(
						entries
							.slice(i, i + TERM_WRITE_BATCH)
							.map(([term, docFreq]) =>
								Term.put({
									id: `${body.release}:${term}`,
									release: body.release,
									term,
									docFreq,
									trigrams: trigrams(term),
								})
							)
					);
				}
				const staged = await ContentRelease.get(body.release);
				const avgChunkLength = chunkCount ? totalLength / chunkCount : 0;
				await ContentRelease.put({ ...plainRelease(staged, body.release), chunkCount, avgChunkLength });
				return { ok: true, terms: df.size, chunks: chunkCount, avgChunkLength };
			}
			case 'activate': {
				// Partial-publish guard: verify the staged release actually
				// persisted every record the client sent before making it live. A
				// short batch (an embed failure, a crash mid-ingest) must NOT flip
				// the pointer — it marks the release failed and refuses.
				const actual = { pages: 0, nav: 0, redirects: 0 };
				for await (const _ of Page.search({
					conditions: [{ attribute: 'release', value: body.release }],
					select: ['id'],
				}))
					actual.pages++;
				for await (const _ of Navigation.search({
					conditions: [{ attribute: 'release', value: body.release }],
					select: ['id'],
				}))
					actual.nav++;
				for await (const _ of Redirect.search({
					conditions: [{ attribute: 'release', value: body.release }],
					select: ['id'],
				}))
					actual.redirects++;
				if (actual.pages === 0) throw new Error(`release ${body.release} has no pages; refusing to activate`);
				const expect = body.expect ?? {};
				const mismatch = [];
				for (const key of ['pages', 'nav', 'redirects']) {
					if (expect[key] != null && actual[key] !== expect[key]) mismatch.push(`${key} ${actual[key]}/${expect[key]}`);
				}
				if (mismatch.length) {
					const failed = await ContentRelease.get(body.release);
					await ContentRelease.put({ ...plainRelease(failed, body.release), status: 'failed' });
					throw new Error(`release ${body.release} incomplete, refusing to activate: ${mismatch.join(', ')}`);
				}
				// Activate: one pointer write. Serving reads the pointer by primary key.
				const staged = await ContentRelease.get(body.release);
				await ContentRelease.put({
					...plainRelease(staged, body.release),
					status: 'active',
					gitSha: staged?.gitSha ?? body.gitSha ?? '',
					pageCount: actual.pages,
					activatedAt: new Date(),
				});
				await SitePointer.put({ id: 'active', release: body.release });
				// Archive the previously-active release(s).
				const toArchive = [];
				for await (const rel of ContentRelease.search({ conditions: [{ attribute: 'status', value: 'active' }] })) {
					if (rel.id !== body.release) toArchive.push({ ...plainRelease(rel, rel.id), status: 'archived' });
				}
				for (const rel of toArchive) await ContentRelease.put(rel);
				// Prune old releases so the DB doesn't grow unbounded across ingests.
				const pruned = await pruneReleases(body.release);
				return { ok: true, release: body.release, pageCount: actual.pages, active: true, pruned };
			}
			default:
				throw new Error(`unknown action: ${body.action}`);
		}
	}
}

const RETAIN_RELEASES = 3; // keep the active + this many recent, for rollback
const TERM_WRITE_BATCH = 100; // concurrent Term.put writes per batch in buildIndex

const DELETE_DB = 'data';
const DELETE_BATCH = 500;

// Delete records by primary key via the Operations API. The Resource-layer
// `table.delete(id)` path-parses composite ids (our chunk/term ids contain
// ':', '#', '/'), so it silently no-ops on them; the operations delete treats
// each id as a literal key. authorize:false runs as the system user.
async function bulkDelete(tableName, ids) {
	for (let i = 0; i < ids.length; i += DELETE_BATCH) {
		await server.operation(
			{ operation: 'delete', database: DELETE_DB, table: tableName, ids: ids.slice(i, i + DELETE_BATCH) },
			undefined,
			false
		);
	}
}

// Prune to the retention window. Keeps the currently-activating release plus
// the RETAIN_RELEASES most recent ContentReleases; deletes every record in the
// content tables whose `release` is not kept. Scanning by keep-set (rather than
// by a toDelete list from ContentRelease) makes it self-healing — it also
// removes orphaned records left by an earlier failed/partial prune. Returns the
// number of distinct releases removed.
async function pruneReleases(currentRelease) {
	const releases = [];
	for await (const rel of ContentRelease.search({ select: ['id', 'createdAt'] })) {
		releases.push({ id: rel.id, createdAt: rel.createdAt ? new Date(rel.createdAt).getTime() : 0 });
	}
	releases.sort((a, b) => b.createdAt - a.createdAt);
	const keep = new Set([currentRelease, ...releases.slice(0, RETAIN_RELEASES).map((r) => r.id)]);

	const removed = new Set();
	for (const [name, table, key] of [
		['SearchChunk', SearchChunk, 'release'],
		['Term', Term, 'release'],
		['Page', Page, 'release'],
		['Navigation', Navigation, 'release'],
		['Redirect', Redirect, 'release'],
		['ContentRelease', ContentRelease, 'id'],
	]) {
		const ids = [];
		for await (const rec of table.search({ select: ['id', key] })) {
			if (!keep.has(rec[key])) {
				ids.push(rec.id);
				removed.add(rec[key]);
			}
		}
		if (ids.length) await bulkDelete(name, ids);
	}
	return removed.size;
}

// Table records are lazy proxies — spread does not copy fields. Build a plain
// object carrying every ContentRelease field so writes never drop stats.
function plainRelease(rel, id) {
	return {
		id,
		status: rel?.status ?? 'staging',
		gitSha: rel?.gitSha ?? '',
		pageCount: rel?.pageCount ?? 0,
		chunkCount: rel?.chunkCount ?? 0,
		avgChunkLength: rel?.avgChunkLength ?? 0,
		notes: rel?.notes ?? null,
		activatedAt: rel?.activatedAt ?? null,
	};
}

// Write one SearchChunk per rendered section. Skips empty chunks.
async function writeChunks(release, doc, title, chunks) {
	const breadcrumb = doc.path ? doc.path.split('/') : [];
	let written = 0;
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const text = [chunk.heading, chunk.text].filter(Boolean).join('. ');
		if (!text.trim()) continue;
		// Tokenize heading + body for retrieval/BM25. (Folding the page title in —
		// to make title-only terms retrievable — measurably lowered golden-set MRR
		// and the recall gap it addresses is not represented in the eval, so it's
		// left out. Title still contributes via TITLE_BOOST at score time and via
		// the embedText the vector lane uses.)
		const tokens = tokenize(`${chunk.heading} ${chunk.text}`);
		if (tokens.length === 0) continue;
		await SearchChunk.put({
			id: `${release}:${doc.path}#${chunk.anchor}:${i}`,
			release,
			pageId: `${release}:${doc.path}`,
			path: doc.path,
			section: doc.section,
			version: doc.version ?? null,
			title,
			heading: chunk.heading,
			anchor: chunk.anchor,
			breadcrumb,
			position: i,
			text: chunk.text.slice(0, 2000),
			tokens: [...new Set(tokens)],
			termCounts: termCounts(tokens),
			length: tokens.length,
			// heading-prefixed text is the @embed source (carries section context
			// into the vector); capped to keep well under the model's token limit.
			embedText: `${title}. ${text}`.slice(0, 4000),
		});
		written++;
	}
	return written;
}
