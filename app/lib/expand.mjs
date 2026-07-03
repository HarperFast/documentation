// Client-side (ingest) expansion of MDX components that need repo-filesystem
// or cross-file data — partials imported from other files, and the release
// data components. Runs in scripts/ingest.mjs BEFORE posting to /Ingest, so
// the in-Harper renderer only ever sees self-contained markdown.
//
// (CustomDocCardList is self-contained — its data is inline — so it stays in
// lib/render.mjs. The split rule: needs-a-file-or-dataset → here; inline → render.)

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ORDINAL = { 1: '1st', 2: '2nd', 3: '3rd' };
const ordinal = (n) => ORDINAL[n] ?? `${n}th`;

// Resolve `import Name from '<rel>.mdx'` and inline `<Name/>` occurrences with
// the partial's body (frontmatter stripped). One level deep is enough for the
// corpus; guards against self-reference.
function expandPartials(markdown, sourceFile, seen = new Set()) {
	const imports = new Map();
	for (const m of markdown.matchAll(/^import\s+(\w+)\s+from\s+['"]([^'"]+\.mdx?)['"];?\s*$/gm)) {
		imports.set(m[1], m[2]);
	}
	if (imports.size === 0) return markdown;
	let out = markdown;
	for (const [name, rel] of imports) {
		const abs = path.resolve(path.dirname(sourceFile), rel);
		let body = '';
		if (existsSync(abs) && !seen.has(abs)) {
			const raw = readFileSync(abs, 'utf8');
			body = matter(raw).content.trim();
			body = expandPartials(body, abs, new Set([...seen, abs])); // nested partials
		}
		// Replace <Name/> and <Name></Name> (with or without attrs) by the body.
		const tag = new RegExp(`<${name}(\\s[^>]*)?/>|<${name}(\\s[^>]*)?>\\s*</${name}>`, 'g');
		out = out.replace(tag, () => `\n\n${body}\n\n`);
	}
	return out;
}

// Render <ReleaseNotesList/> to markdown matching the Docusaurus component,
// driven by release-notes-data.json (the same source the component reads).
function releaseNotesListMarkdown(releaseData) {
	const majors = Object.keys(releaseData)
		.map(Number)
		.sort((a, b) => b - a);
	if (majors.length === 0) return '';
	const [current, ...previous] = majors;
	const cur = releaseData[current];
	const slug = (major, pup) => `/release-notes/v${major}-${pup.toLowerCase()}`;
	const lines = [];

	lines.push(`## Current Release - Version ${current} (${cur.pupName})`, '');
	lines.push(`[Meet ${cur.pupName}](${slug(current, cur.pupName)}/${cur.pupName.toLowerCase()}) Our ${ordinal(current)} Release Pup`, '');
	for (const v of cur.versions) lines.push(`- [${v} ${cur.pupName}](${slug(current, cur.pupName)}/${v})`);
	lines.push('');

	if (previous.length) {
		lines.push('## Previous Major Releases', '');
		for (const major of previous) {
			const rd = releaseData[major];
			if (!rd?.versions?.length) continue;
			lines.push(`### Version ${major} - ${rd.pupName}`, '');
			lines.push(`[Meet ${rd.pupName}](${slug(major, rd.pupName)}/) Our ${ordinal(major)} Release Pup`, '');
			for (const v of rd.versions) lines.push(`- [${v} ${rd.pupName}](${slug(major, rd.pupName)}/${v})`);
			lines.push('');
		}
	}
	return lines.join('\n');
}

// <LatestPatchLink major={M} minor={N} label="..."/> → link to the latest
// M.N.x patch (or bracketed fallback when unknown), matching the component.
function expandLatestPatchLink(markdown, releaseData) {
	return markdown.replace(/<LatestPatchLink\s+([^>]*?)\/>/g, (_, attrs) => {
		const major = Number(/major=\{?(\d+)\}?/.exec(attrs)?.[1]);
		const minor = Number(/minor=\{?(\d+)\}?/.exec(attrs)?.[1]);
		const label = /label=["']([^"']+)["']/.exec(attrs)?.[1] ?? `${major}.${minor}`;
		const rd = releaseData[major];
		const patch = rd?.versions?.find((v) => v.startsWith(`${major}.${minor}.`));
		if (!rd || !patch) return `[${label}]`;
		return `[${label}](/release-notes/v${major}-${rd.pupName.toLowerCase()}/${patch})`;
	});
}

export function expandComponents(markdown, { sourceFile, releaseData }) {
	let out = expandPartials(markdown, sourceFile);
	if (releaseData) {
		out = out.replace(/<ReleaseNotesList\s*\/>/g, () => releaseNotesListMarkdown(releaseData));
		out = expandLatestPatchLink(out, releaseData);
	}
	return out;
}
