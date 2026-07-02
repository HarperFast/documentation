// Ingest endpoint: builds a staged ContentRelease from posted markdown, then
// atomically activates it. Rendering happens HERE, inside Harper.
//
// Protocol (POST /Ingest, authenticated):
//   {action:'begin', release, gitSha}
//   {action:'pages', release, docs:[{path, section, version, markdown, sourcePath, editUrl}]}
//   {action:'nav', release, entries:[{section, version, tree}]}
//   {action:'redirects', release, entries:[{from, to, status, source}]}
//   {action:'activate', release}   → validates, archives previous active, activates

import { Resource, tables } from 'harper';
import { createHash } from 'node:crypto';
import { renderDoc } from '../lib/render.mjs';

const { ContentRelease, Page, Navigation, Redirect } = tables;

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
				for (const doc of body.docs ?? []) {
					const rendered = await renderDoc(doc.markdown);
					await Page.put({
						id: `${body.release}:${doc.path}`,
						release: body.release,
						path: doc.path,
						section: doc.section,
						version: doc.version ?? null,
						title: rendered.title,
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
				}
				return { ok: true, ingested: count };
			}
			case 'nav': {
				for (const entry of body.entries ?? []) {
					const id = entry.version
						? `${body.release}:${entry.section}:${entry.version}`
						: `${body.release}:${entry.section}`;
					await Navigation.put({ id, release: body.release, section: entry.section, version: entry.version ?? null, tree: entry.tree });
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
			case 'activate': {
				let pageCount = 0;
				for await (const _page of Page.search({ conditions: [{ attribute: 'release', value: body.release }], select: ['id'] })) pageCount++;
				if (pageCount === 0) throw new Error(`release ${body.release} has no pages; refusing to activate`);
				// TODO(M1): whole-release link validation + llms contract assertions before activation
				// NOTE: table records are lazy proxies — spread does not copy fields; write explicit objects.
				const toArchive = [];
				for await (const rel of ContentRelease.search({ conditions: [{ attribute: 'status', value: 'active' }] })) {
					if (rel.id !== body.release) {
						toArchive.push({ id: rel.id, status: 'archived', gitSha: rel.gitSha ?? '', pageCount: rel.pageCount ?? 0, activatedAt: rel.activatedAt ?? null, notes: rel.notes ?? null });
					}
				}
				for (const rel of toArchive) await ContentRelease.put(rel);
				const staged = await ContentRelease.get(body.release);
				await ContentRelease.put({ id: body.release, status: 'active', gitSha: staged?.gitSha ?? body.gitSha ?? '', pageCount, activatedAt: new Date(), notes: staged?.notes ?? null });
				return { ok: true, release: body.release, pageCount, active: true };
			}
			default:
				throw new Error(`unknown action: ${body.action}`);
		}
	}
}
