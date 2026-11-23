import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { findMissingPages, isBuilt, redirectHome, sitemapPaths } from './check-removed-pages.mjs';

const buildDir = mkdtempSync(path.join(tmpdir(), 'removed-pages-'));
try {
	for (const file of [
		'index.html',
		'learn.html',
		'release-notes/v4-tucker/4.6.8.html',
		'release-notes/v5-lincoln/index.html',
		'docs/getting-started/index.html',
		'reference/v5/rest/overview.html',
	]) {
		mkdirSync(path.dirname(path.join(buildDir, file)), { recursive: true });
		writeFileSync(path.join(buildDir, file), '');
	}

	const xml = (...urls) => `<urlset>${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
	assert.deepStrictEqual(sitemapPaths(xml('https://docs.harperdb.io/', 'https://docs.harperdb.io/learn')), [
		'/',
		'/learn',
	]);
	assert.deepStrictEqual(
		sitemapPaths(
			xml('https://example.com/documentation/', 'https://example.com/documentation/learn'),
			'/documentation/'
		),
		['/', '/learn'],
		'strips the base path'
	);
	assert.deepStrictEqual(
		sitemapPaths(
			xml('https://example.com/documentation', 'https://example.com/documentation/learn'),
			'//documentation/'
		),
		['/', '/learn'],
		'handles a root URL without its trailing slash and a doubled slash in the base path'
	);
	assert.deepStrictEqual(
		sitemapPaths(xml('https://example.com/documentation-old/learn'), '/documentation/'),
		['/documentation-old/learn'],
		'strips only a whole base path segment'
	);

	assert(isBuilt(buildDir, '/'), 'the root page');
	assert(isBuilt(buildDir, '/learn'), 'a page');
	assert(isBuilt(buildDir, '/release-notes/v4-tucker/4.6.8'), 'a nested page');
	assert(isBuilt(buildDir, '/release-notes/v5-lincoln'), 'an index page');
	assert(isBuilt(buildDir, '/release-notes/v5-lincoln/'), 'a trailing slash');
	assert(isBuilt(buildDir, '/docs/getting-started'), 'a redirect');
	assert(!isBuilt(buildDir, '/fabric'), 'a missing page');

	assert.deepStrictEqual(
		findMissingPages(
			['/learn', '/search', '/reference/v5/rest/old', '/fabric', '/fabric', '/docs/getting-started'],
			buildDir
		),
		['/fabric', '/reference/v5/rest/old'],
		'reports each missing page once, sorted, and skips /search'
	);

	assert.match(redirectHome('/reference/v5/rest/old'), /_redirects\.json/);
	assert.match(redirectHome('/learn/old'), /redirects\.ts/);
	assert.match(redirectHome('/reference/v4/old'), /redirects\.ts/);

	console.log('check-removed-pages: all tests passed');
} finally {
	rmSync(buildDir, { recursive: true, force: true });
}
