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
function remarkAdmonitions() {
	return (tree) => {
		visit(tree, 'containerDirective', (node) => {
			if (!ADMONITION_TYPES.has(node.name)) return;
			const data = node.data || (node.data = {});
			data.hName = 'aside';
			data.hProperties = { className: ['admonition', `admonition-${node.name}`] };
			node.children.unshift({
				type: 'paragraph',
				data: { hName: 'p', hProperties: { className: ['admonition-title'] } },
				children: [{ type: 'text', value: node.name.toUpperCase() }],
			});
		});
	};
}

// Map raw-HTML component tags (lowercased by the HTML parser) to plain HTML.
function rehypeComponents() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'versionbadge') {
				const { version = '', type = 'added' } = node.properties ?? {};
				node.tagName = 'span';
				node.properties = { className: ['version-badge', `version-badge-${type}`] };
				node.children = [{ type: 'text', value: `${type} in ${version}` }];
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
	const body = stripMdx(content);
	const file = await pipeline.process(body);
	const html = String(file);
	const toc = file.data.toc ?? [];
	const title = frontmatter.title ?? firstHeading(body) ?? '';
	return {
		html,
		toc,
		title,
		description: frontmatter.description ?? '',
		frontmatter,
		renderedMarkdown: body.trim(),
	};
}

function firstHeading(markdown) {
	const match = markdown.match(/^#\s+(.+)$/m);
	return match ? match[1].trim() : undefined;
}
