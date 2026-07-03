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
	return (tree) => {
		visit(tree, 'containerDirective', (node) => {
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

function mdastText(node) {
	if (node.value) return node.value;
	return (node.children ?? []).map(mdastText).join('');
}

// Map raw-HTML component tags (lowercased by the HTML parser) to plain HTML.
function rehypeComponents() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
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

function collectToc() {
	return (tree, file) => {
		const toc = [];
		visit(tree, 'element', (node) => {
			if (node.tagName === 'h2' || node.tagName === 'h3') {
				const text = textOf(node);
				toc.push({ depth: node.tagName === 'h2' ? 2 : 3, text, id: node.properties?.id ?? '' });
			}
		});
		file.data.toc = toc;
	};
}

function textOf(node) {
	if (node.type === 'text') return node.value;
	return (node.children ?? []).map(textOf).join('');
}

// MDX-lite preprocessing: drop import/export statements and {/* comments */}.
function stripMdx(markdown) {
	return markdown
		.replace(/^import\s.+?;?\s*$/gm, '')
		.replace(/^export\s.+?;?\s*$/gm, '')
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

// Indented <Tabs>/<TabItem> tags parse as code/text in CommonMark — dedent
// them to column 0 so they form proper HTML blocks.
function dedentTabTags(markdown) {
	return markdown.replace(/^[ \t]+(<\/?Tab(?:s|Item)\b)/gm, '$1');
}

// Docusaurus admonition titles (`:::info Join us`) → remark-directive labels
// (`:::info[Join us]`), which strict directive syntax requires.
function normalizeAdmonitionTitles(markdown) {
	return markdown.replace(/^(:{3,})(note|tip|info|warning|caution|danger)[ \t]+([^\[\n{].*)$/gm, '$1$2[$3]');
}

// Data-driven MDX components. Multi-line JSX with {…} props is not a valid
// CommonMark HTML block (remark escapes it to text), so these are rendered to
// plain HTML before parsing. Content is trusted (our own repo).
function renderDataComponents(markdown) {
	markdown = markdown.replace(/<CustomDocCardList[\s\S]*?\/>/g, (block) => {
		const columns = /columns=\{(\d+)\}/.exec(block)?.[1] ?? '2';
		const itemsSrc = /items=\{(\[[\s\S]*\])\}/.exec(block)?.[1];
		if (!itemsSrc) return '';
		let items;
		try {
			items = new Function(`return (${itemsSrc})`)();
		} catch {
			return '';
		}
		const cards = items
			.map(
				(item) =>
					`<a class="card" href="${item.href}"><span class="card-title">${escapeHtml(item.label ?? '')}` +
					(item.badge ? `<span class="card-badge">${escapeHtml(item.badge)}</span>` : '') +
					`</span><span class="card-desc">${escapeHtml(item.description ?? '')}</span></a>`
			)
			.join('\n');
		return `<div class="card-grid card-grid-${columns}">\n${cards}\n</div>`;
	});
	// TODO(M1): server-render these from the release-notes tables (design doc §6)
	markdown = markdown.replace(/<ReleaseNotesList[\s\S]*?\/>/g, '<div class="todo-component">Release notes index (table-driven render pending)</div>');
	markdown = markdown.replace(/<LatestPatchLink[\s\S]*?\/>/g, '<span class="todo-component">latest patch</span>');
	return markdown;
}

function escapeHtml(s) {
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const pipeline = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkDirective)
	.use(remarkAdmonitions)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeRaw)
	.use(rehypeComponents)
	.use(rehypeSlug)
	.use(collectToc)
	.use(rehypeStringify);

export async function renderDoc(source) {
	const { data: frontmatter, content } = matter(source);
	const body = renderDataComponents(normalizeAdmonitionTitles(dedentTabTags(stripMdx(content))));
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
	};
}

// Docusaurus derives a meta description from content when frontmatter has
// none; approximate with the first paragraph's text.
function firstParagraphText(html) {
	const match = html.match(/<p>([\s\S]*?)<\/p>/);
	if (!match) return '';
	const text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
	return text.length > 210 ? `${text.slice(0, 207)}...` : text;
}

function firstHeading(markdown) {
	const match = markdown.match(/^#\s+(.+)$/m);
	return match ? match[1].trim() : undefined;
}
