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

import { Resource, tables } from 'harper';
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
				for (const [term, docFreq] of df) {
					await Term.put({
						id: `${body.release}:${term}`,
						release: body.release,
						term,
						docFreq,
						trigrams: trigrams(term),
					});
				}
				const staged = await ContentRelease.get(body.release);
				const avgChunkLength = chunkCount ? totalLength / chunkCount : 0;
				await ContentRelease.put({ ...plainRelease(staged, body.release), chunkCount, avgChunkLength });
				return { ok: true, terms: df.size, chunks: chunkCount, avgChunkLength };
			}
			case 'activate': {
				let pageCount = 0;
				for await (const _page of Page.search({
					conditions: [{ attribute: 'release', value: body.release }],
					select: ['id'],
				}))
					pageCount++;
				if (pageCount === 0) throw new Error(`release ${body.release} has no pages; refusing to activate`);
				// TODO(M1): whole-release link validation + llms contract assertions before activation
				// Activation = one primary-key write; serving reads the pointer by
				// primary key. Status flags below are bookkeeping only.
				const staged = await ContentRelease.get(body.release);
				await ContentRelease.put({
					...plainRelease(staged, body.release),
					status: 'active',
					gitSha: staged?.gitSha ?? body.gitSha ?? '',
					pageCount,
					activatedAt: new Date(),
				});
				await SitePointer.put({ id: 'active', release: body.release });
				// Best-effort bookkeeping: mark everything else archived.
				// NOTE: table records are lazy proxies — spread does not copy fields; write explicit objects.
				const toArchive = [];
				for await (const rel of ContentRelease.search({ conditions: [{ attribute: 'status', value: 'active' }] })) {
					if (rel.id !== body.release) toArchive.push({ ...plainRelease(rel, rel.id), status: 'archived' });
				}
				for (const rel of toArchive) await ContentRelease.put(rel);
				return { ok: true, release: body.release, pageCount, active: true };
			}
			default:
				throw new Error(`unknown action: ${body.action}`);
		}
	}
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
