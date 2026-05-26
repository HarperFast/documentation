// rehype plugin: clean Docusaurus-specific HTML idioms for LLM consumption.
//
// Used by @signalwire/docusaurus-plugin-llms-txt in its rehypePlugins chain
// (see docusaurus.config.ts). Runs on the parsed HTML AST before it is
// stringified to markdown, normalizing constructs whose default HTML→MD
// translation produces noisy or misleading output for an LLM reader.
//
// Transforms applied:
//
//   1. Tab containers (<div class="tabs-container">) become sequential h4
//      subsections. The default conversion stacks tab labels as a bullet
//      list followed by all panel contents concatenated together, which
//      reads as if every tab's content applies under every label. Splitting
//      into labeled subsections preserves the original intent.
//
//   2. Hash-link anchors (<a class="hash-link">) are removed entirely.
//      These are Docusaurus's "direct link to this heading" UI affordances
//      and have no semantic value to an LLM. The default conversion emits
//      noise like `[​](#anchor "Direct link to ...")` next to every heading.
//
//   3. Version badge spans (<span class="badge_*">Added in<!-- -->: ...</span>)
//      are collapsed into clean italic text. The React render leaves empty
//      comment markers between text fragments which the HTML→MD converter
//      faithfully preserves as `<!-- -->`, producing output like
//      `Added in<!-- --> : <!-- -->v4.2.0`. We strip those and emit
//      `*Added in: v4.2.0*` instead.

import { visit, SKIP } from 'unist-util-visit';

// className in hast can be an array (typical) or sometimes a string. Handle
// both, and tolerate undefined.
function hasClass(node, className) {
	const cls = node?.properties?.className;
	if (Array.isArray(cls)) return cls.includes(className);
	if (typeof cls === 'string') return cls.split(/\s+/).includes(className);
	return false;
}

function classListSome(node, predicate) {
	const cls = node?.properties?.className;
	if (Array.isArray(cls)) return cls.some(predicate);
	if (typeof cls === 'string') return cls.split(/\s+/).some(predicate);
	return false;
}

// Collect plain text content from a hast subtree, ignoring comments (which
// React's renderer leaves between adjacent text fragments) and other non-text
// nodes.
function getTextContent(node) {
	if (!node) return '';
	if (node.type === 'text') return node.value || '';
	if (node.type === 'comment') return '';
	if (!Array.isArray(node.children)) return '';
	return node.children.map(getTextContent).join('');
}

// --- Tabs ---

function findTabsStructure(container) {
	const labels = [];
	const panels = [];
	const walk = (node) => {
		if (!node || !Array.isArray(node.children)) return;
		for (const child of node.children) {
			if (child.type !== 'element') continue;
			if (child.tagName === 'ul' && child.properties?.role === 'tablist') {
				for (const li of child.children) {
					if (li.type === 'element' && li.tagName === 'li') {
						labels.push(getTextContent(li).trim());
					}
				}
			} else if (child.tagName === 'div' && child.properties?.role === 'tabpanel') {
				panels.push(child);
			} else {
				// Recurse into wrapper divs (e.g. <div class="margin-top--md">).
				walk(child);
			}
		}
	};
	walk(container);
	return { labels, panels };
}

function tabsToSubsections(tree) {
	visit(tree, 'element', (node, index, parent) => {
		if (!parent || index == null) return;
		if (node.tagName !== 'div' || !hasClass(node, 'tabs-container')) return;

		const { labels, panels } = findTabsStructure(node);
		if (labels.length === 0 || panels.length === 0) return;

		const replacement = [];
		for (let i = 0; i < labels.length; i++) {
			const panel = panels[i];
			if (!panel) continue;
			replacement.push({
				type: 'element',
				tagName: 'h4',
				properties: {},
				children: [{ type: 'text', value: labels[i] }],
			});
			replacement.push(...(panel.children || []));
		}

		parent.children.splice(index, 1, ...replacement);
		// Skip ahead past the inserted replacement; we don't want to recurse
		// into our own output and re-process anything.
		return [SKIP, index + replacement.length];
	});
}

// --- Hash links ---

function stripHashLinks(tree) {
	visit(tree, 'element', (node, index, parent) => {
		if (!parent || index == null) return;
		if (node.tagName !== 'a' || !hasClass(node, 'hash-link')) return;
		parent.children.splice(index, 1);
		return [SKIP, index];
	});
}

// --- Version badges ---

function normalizeBadgeSpans(tree) {
	visit(tree, 'element', (node) => {
		if (node.tagName !== 'span') return;
		// Docusaurus CSS-modules suffix the class name with a hash; match the
		// `badge` prefix to catch every variant (`badge_ZvRE`, `badge_AbCd`, ...).
		if (!classListSome(node, (c) => typeof c === 'string' && c.startsWith('badge'))) return;

		const text = getTextContent(node).replace(/\s+/g, ' ').trim();
		if (!text) return;

		node.tagName = 'em';
		node.properties = {};
		node.children = [{ type: 'text', value: text }];
	});
}

// --- Plugin entry ---

export default function rehypeDocusaurusToLlms() {
	return (tree) => {
		tabsToSubsections(tree);
		stripHashLinks(tree);
		normalizeBadgeSpans(tree);
	};
}
