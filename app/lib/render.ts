// Markdown → { html, renderedMarkdown, toc, title, description } — the ingest
// rendering pipeline. Runs inside Harper (imported by resources/ingest.js).
//
// Handles the repo's MDX-lite surface without rewriting content files:
//   - frontmatter (gray-matter)
//   - GFM tables/strikethrough/autolinks
//   - :::note/:::tip/... admonitions (remark-directive containers)
//   - <VersionBadge version="..." type="..."/> → styled span
//   - <Tabs>/<TabItem> → sequential h4-labeled sections (llms-cleanup style;
//     interactive tab UI comes with the client bundle later)
//   - MDX import/export lines stripped (plain .mdx files)
//
// TODO(M1 polish): shiki server-side highlighting; full rendered-markdown
// projection (currently source-minus-frontmatter with imports stripped).

import matter from 'gray-matter';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const ADMONITION_TYPES = new Set(['note', 'tip', 'info', 'warning', 'caution', 'danger']);

// :::note[Title] ... ::: → <aside class="admonition admonition-note">
// (Docusaurus-style `:::note Title` is normalized to `[Title]` in preprocess.)
function remarkAdmonitions() {
	return (tree: any) => {
		visit(tree, 'containerDirective', (node: any) => {
			if (!ADMONITION_TYPES.has(node.name)) return;
			const data = node.data || (node.data = {});
			data.hName = 'aside';
			data.hProperties = { className: ['admonition', `admonition-${node.name}`] };
			let title = node.name.toUpperCase();
			if (node.children[0]?.data?.directiveLabel) {
				title = mdastText(node.children.shift());
			}
			node.children.unshift({
				type: 'paragraph',
				data: { hName: 'p', hProperties: { className: ['admonition-title'] } },
				children: [{ type: 'text', value: title }],
			});
		});
	};
}

function mdastText(node: any): string {
	if (node.value) return node.value;
	return (node.children ?? []).map(mdastText).join('');
}

// Honor Docusaurus explicit heading ids: `## Title {#custom-id}`. The trailing
// `{#id}` is stripped from the visible text and attached as an hProperty so it
// survives into HTML; rehype-slug then skips headings that already have an id.
function remarkExplicitHeadingIds() {
	return (tree: any) => {
		visit(tree, 'heading', (node: any) => {
			const last = node.children[node.children.length - 1];
			if (last?.type !== 'text') return;
			const m = last.value.match(/\s*\{#([\w-]+)\}\s*$/);
			if (!m) return;
			last.value = last.value.slice(0, m.index);
			const data = node.data || (node.data = {});
			data.hProperties = { ...(data.hProperties ?? {}), id: m[1] };
		});
	};
}

// Map raw-HTML component tags (lowercased by the HTML parser) to plain HTML.
function rehypeComponents() {
	return (tree: any) => {
		visit(tree, 'element', (node: any, index: any, parent: any) => {
			if (node.tagName === 'versionbadge') {
				const { version = '', type = 'added' } = node.properties ?? {};
				// HTML5 has no self-closing unknown elements: parse5 treats
				// `<VersionBadge/>` as an open tag and nests everything after it
				// inside. Reparent those swallowed children as siblings before
				// replacing the node's content, or whole documents disappear.
				const swallowed = node.children ?? [];
				node.tagName = 'span';
				node.properties = { className: ['version-badge', `version-badge-${type}`] };
				node.children = [{ type: 'text', value: `${type} in ${version}` }];
				if (swallowed.length && parent) {
					parent.children.splice(index + 1, 0, ...swallowed);
				}
			} else if (node.tagName === 'tabs') {
				node.tagName = 'div';
				node.properties = { className: ['tab-group'] };
			} else if (node.tagName === 'tabitem') {
				const label = node.properties?.label ?? node.properties?.value ?? '';
				node.tagName = 'section';
				node.properties = { className: ['tab-item'] };
				node.children.unshift({
					type: 'element',
					tagName: 'h4',
					properties: { className: ['tab-label'] },
					children: [{ type: 'text', value: String(label) }],
				});
			}
		});
	};
}

// Surgical sanitize: the pipeline allows raw HTML (needed for our component
// transforms), so strip the actual XSS vectors before serving — dangerous
// elements, inline event handlers, and javascript:/data-URL hrefs — without an
// allowlist that would also strip our custom classes/elements. Defense in depth
// on top of the CSP header; content is git-reviewed but this closes the gap.
const DANGEROUS_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'base', 'form', 'link', 'meta']);
function rehypeSanitizeSurgical() {
	return (tree: any) => {
		visit(tree, 'element', (node: any, index: any, parent: any) => {
			if (DANGEROUS_TAGS.has(node.tagName) && parent && index != null) {
				parent.children.splice(index, 1);
				return [(visit as any).SKIP, index];
			}
			const props = node.properties ?? {};
			for (const key of Object.keys(props)) {
				if (/^on/i.test(key)) delete props[key]; // inline event handlers
				if ((key === 'href' || key === 'src') && /^\s*(javascript|data|vbscript):/i.test(String(props[key]))) {
					props[key] = '#';
				}
			}
		});
	};
}

function collectToc() {
	return (tree: any, file: any) => {
		const toc: any[] = [];
		visit(tree, 'element', (node: any) => {
			if (node.tagName === 'h2' || node.tagName === 'h3') {
				const text = textOf(node);
				toc.push({ depth: node.tagName === 'h2' ? 2 : 3, text, id: node.properties?.id ?? '' });
			}
		});
		file.data.toc = toc;
	};
}

// Split the rendered document into search chunks — one per h2/h3 section, with
// the leading intro (content before the first h2/h3) as its own chunk. Walks
// the top-level block flow in document order so each chunk holds exactly the
// text under its heading. Runs after rehypeSlug so heading ids exist.
function collectChunks() {
	return (tree: any, file: any) => {
		const chunks: any[] = [];
		let current: any = { anchor: '', heading: '', depth: 1, parts: [] };
		for (const node of tree.children) {
			if (node.type !== 'element') continue;
			if (node.tagName === 'h2' || node.tagName === 'h3') {
				if (current.parts.length || current.heading) chunks.push(current);
				current = {
					anchor: node.properties?.id ?? '',
					heading: textOf(node),
					depth: node.tagName === 'h2' ? 2 : 3,
					parts: [],
				};
			} else if (node.tagName !== 'h1') {
				const t = textOf(node).trim();
				if (t) current.parts.push(t);
			}
		}
		if (current.parts.length || current.heading) chunks.push(current);
		file.data.chunks = chunks.map((c: any) => ({
			anchor: c.anchor,
			heading: c.heading,
			depth: c.depth,
			text: c.parts.join(' ').replace(/\s+/g, ' ').trim(),
		}));
	};
}

function textOf(node: any): string {
	if (node.type === 'text') return node.value;
	return (node.children ?? []).map(textOf).join('');
}

// Run text-level preprocessing everywhere EXCEPT inside fenced code blocks,
// which must survive verbatim (they contain the import/export/JSX lines our
// transforms would otherwise mangle). Masks fences, transforms, restores.
function preprocess(markdown: string, transform: (text: string) => string): string {
	const fences: string[] = [];
	const masked = markdown.replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[ \t]*$/gm, (block) => {
		fences.push(block);
		return ` FENCE${fences.length - 1} `;
	});
	const out = transform(masked);
	return out.replace(/ FENCE(\d+) /g, (_, i) => fences[Number(i)]);
}

// MDX-lite preprocessing: drop import/export statements and {/* comments */}.
// Only runs on non-fenced text (see preprocess).
function stripMdx(markdown: string): string {
	return markdown
		.replace(/^import\s[\s\S]+?(?:;|(?=\n\s*\n))/gm, '')
		.replace(/^export\s[\s\S]+?(?:;|(?=\n\s*\n))/gm, '')
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

// Indented <Tabs>/<TabItem> tags parse as code/text in CommonMark — dedent
// them to column 0 so they form proper HTML blocks.
function dedentTabTags(markdown: string): string {
	return markdown.replace(/^[ \t]+(<\/?Tab(?:s|Item)\b)/gm, '$1');
}

// Docusaurus admonition titles (`:::info Join us`) → remark-directive labels
// (`:::info[Join us]`), which strict directive syntax requires.
function normalizeAdmonitionTitles(markdown: string): string {
	return markdown.replace(/^(:{3,})(note|tip|info|warning|caution|danger)[ \t]+([^\[\n{].*)$/gm, '$1$2[$3]');
}

// Data-driven MDX components. Multi-line JSX with {…} props is not a valid
// CommonMark HTML block (remark escapes it to text), so these are rendered to
// plain HTML before parsing. Content is trusted (our own repo).
function renderDataComponents(markdown: string): string {
	markdown = markdown.replace(/<CustomDocCardList[\s\S]*?\/>/g, (block) => {
		const columns = /columns=\{(\d+)\}/.exec(block)?.[1] ?? '2';
		const itemsSrc = /items=\{(\[[\s\S]*\])\}/.exec(block)?.[1];
		if (!itemsSrc) return '';
		const items = parseJsObjectArray(itemsSrc);
		if (!items) return '';
		const cards = items
			.map(
				(item: any) =>
					`<a class="card" href="${escapeAttr(item.href ?? '#')}"><span class="card-title">${escapeHtml(item.label ?? '')}` +
					(item.badge ? `<span class="card-badge">${escapeHtml(item.badge)}</span>` : '') +
					`</span><span class="card-desc">${escapeHtml(item.description ?? '')}</span></a>`
			)
			.join('\n');
		return `<div class="card-grid card-grid-${columns}">\n${cards}\n</div>`;
	});
	// TODO(M1): server-render these from the release-notes tables (design doc §6)
	markdown = markdown.replace(
		/<ReleaseNotesList[\s\S]*?\/>/g,
		'<div class="todo-component">Release notes index (table-driven render pending)</div>'
	);
	markdown = markdown.replace(/<LatestPatchLink[\s\S]*?\/>/g, '<span class="todo-component">latest patch</span>');
	return markdown;
}

function escapeHtml(s: any): string {
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(url: string): string {
	const safe = /^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('#') ? url : '#';
	return escapeHtml(safe);
}

// Parse a JSON-ish array-of-objects from JSX props without evaluating code:
// tolerates unquoted keys, single quotes, and trailing commas, then JSON.parse.
// Returns null on anything it can't parse (never executes the string).
function parseJsObjectArray(src: string): any[] | null {
	try {
		const json = src
			.replace(/\/\/[^\n]*/g, '')
			.replace(/,\s*([\]}])/g, '$1')
			.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
			.replace(/'((?:[^'\\]|\\.)*)'/g, (_, s) => JSON.stringify(s.replace(/\\'/g, "'")));
		const value = JSON.parse(json);
		return Array.isArray(value) ? value : null;
	} catch {
		return null;
	}
}

const pipeline = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkDirective)
	.use(remarkAdmonitions)
	.use(remarkExplicitHeadingIds)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeComponents)
	.use(rehypeSanitizeSurgical)
	.use(rehypeSlug)
	.use(collectToc)
	.use(collectChunks)
	.use(rehypeStringify);

export async function renderDoc(source: string) {
	const { data: frontmatter, content } = matter(source);
	const body = preprocess(content, (text) =>
		renderDataComponents(normalizeAdmonitionTitles(dedentTabTags(stripMdx(text))))
	);
	const file = await pipeline.process(body);
	const html = String(file);
	const toc = file.data.toc ?? [];
	const title = frontmatter.title ?? firstHeading(body) ?? '';
	return {
		html,
		toc,
		title,
		description: frontmatter.description ?? firstParagraphText(html),
		frontmatter,
		renderedMarkdown: body.trim(),
		chunks: file.data.chunks ?? [],
	};
}

// Docusaurus derives a meta description from content when frontmatter has
// none; approximate with the first paragraph's text.
function firstParagraphText(html: string): string {
	const match = html.match(/<p>([\s\S]*?)<\/p>/);
	if (!match) return '';
	const text = match[1]
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > 210 ? `${text.slice(0, 207)}...` : text;
}

// Docusaurus infers the title only from a LEADING h1 — the first heading in
// the document must itself be an h1. A `#` heading buried later in the doc is
// not the title (the caller then falls back to the doc id).
function firstHeading(markdown: string): string | undefined {
	const match = markdown.match(/^(#{1,6})\s+(.+)$/m);
	if (!match || match[1] !== '#') return undefined;
	return match[2].replace(/\s*\{#[\w-]+\}\s*$/, '').trim();
}
