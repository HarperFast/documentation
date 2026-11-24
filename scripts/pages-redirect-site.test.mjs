import assert from 'node:assert';
import { notFoundPage, pageFile, redirectFiles, redirectPage } from './pages-redirect-site.mjs';

const to = 'https://docs.harper.fast/';

assert.strictEqual(pageFile('/'), 'index.html');
assert.strictEqual(pageFile('/learn'), 'learn.html');
assert.strictEqual(
	pageFile('/reference/v5/rest/overview/'),
	'reference/v5/rest/overview.html',
	'drops a trailing slash'
);
assert.strictEqual(pageFile('/learn/caf%C3%A9'), 'learn/café.html', 'decodes the path as Pages does');
assert.strictEqual(pageFile('/learn/%2E%2E/%2E%2E/etc'), null, 'refuses a path that leaves the site');
assert.strictEqual(pageFile('/learn//page'), null, 'refuses an empty segment');

const files = redirectFiles(['/', '/learn', '/learn/', '/release-notes/v5-lincoln/5.4/5.4.1', '/../x'], to);
assert.deepStrictEqual(
	[...files.keys()],
	['404.html', 'index.html', 'learn.html', 'release-notes/v5-lincoln/5.4/5.4.1.html'],
	'writes one file per page and skips a path outside the site'
);
assert.strictEqual(files.get('learn.html'), redirectPage('https://docs.harper.fast/learn'));
assert.match(files.get('index.html'), /content="0; url=https:\/\/docs\.harper\.fast\/"/);

assert.match(
	redirectFiles(['/javascript:alert(1)'], to).get('javascript:alert(1).html'),
	/url=https:\/\/docs\.harper\.fast\/javascript:alert\(1\)"/,
	'a path that looks like a scheme stays on the target host'
);

const page = redirectPage('https://docs.harper.fast/a"b<c>&d');
assert.match(
	page,
	/<link rel="canonical" href="https:\/\/docs\.harper\.fast\/a&quot;b&lt;c&gt;&amp;d">/,
	'escapes the URL in HTML'
);
assert.match(
	page,
	/location\.replace\("https:\/\/docs\.harper\.fast\/a\\"b\\u003cc>&d" \+/,
	'escapes the URL in the script'
);
assert.ok(
	!redirectPage('https://docs.harper.fast/</script>').includes('</script>"'),
	'cannot close its script element'
);

assert.match(
	notFoundPage(to),
	/location\.replace\("https:\/\/docs\.harper\.fast\/" \+ location\.pathname\.slice\(1\) \+ location\.search \+ location\.hash\)/,
	'404.html appends the requested path to the target rather than resolving it'
);

console.log('pages-redirect-site tests passed');
