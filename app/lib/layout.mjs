// Layout shell: composes the full HTML document around a Page record's
// rendered body. Server-side only — no framework, no client rendering.

const SECTIONS = [
	{ label: 'Learn', path: 'learn' },
	{ label: 'Reference', path: 'reference/v5' },
	{ label: 'Release Notes', path: 'release-notes' },
	{ label: 'Fabric', path: 'fabric' },
];

export function layout({ page, navTree }) {
	const title = page.title ? `${page.title} | Harper Docs` : 'Harper Docs';
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${page.description ? `<meta name="description" content="${esc(page.description)}">` : ''}
<link rel="canonical" href="/${esc(page.path)}">
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<header class="site-header">
	<a class="brand" href="/">Harper Docs</a>
	<nav class="sections">
		${SECTIONS.map((s) => `<a href="/${s.path}"${page.path.startsWith(s.path.split('/')[0]) ? ' class="active"' : ''}>${s.label}</a>`).join('\n\t\t')}
	</nav>
</header>
<div class="page-grid">
	<nav class="sidebar">${renderNav(navTree, page.path)}</nav>
	<main class="content">
		<article>${page.html}</article>
		<footer class="page-footer">
			${safeUrl(page.editUrl) ? `<a href="${esc(page.editUrl)}">Edit this page</a>` : ''}
		</footer>
	</main>
	<aside class="toc">${renderToc(page.toc)}</aside>
</div>
</body>
</html>`;
}

function renderNav(tree, currentPath) {
	if (!tree?.length) return '';
	return `<ul>${tree
		.map((item) => {
			const link = item.path != null ? `<a href="/${esc(item.path)}"${item.path === currentPath ? ' class="active"' : ''}>${esc(item.label)}</a>` : `<span class="nav-category">${esc(item.label)}</span>`;
			const children = item.items?.length ? renderNav(item.items, currentPath) : '';
			return `<li>${link}${children}</li>`;
		})
		.join('')}</ul>`;
}

function renderToc(toc) {
	if (!toc?.length) return '';
	return `<div class="toc-title">On this page</div><ul>${toc
		.map((h) => `<li class="toc-depth-${h.depth}"><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`)
		.join('')}</ul>`;
}

function esc(s) {
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Only emit http(s) and site-relative hrefs — blocks javascript:/data: URLs
// from reaching an href even though content is trusted (defense in depth).
function safeUrl(url) {
	if (!url) return false;
	return /^https?:\/\//i.test(url) || url.startsWith('/');
}
