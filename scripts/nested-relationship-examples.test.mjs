import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert';
import ts from 'typescript';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
// Keep these fixtures identical to integrationTests/resources/nested-relationship-docs in Harper core.
const fixture = './fixtures/nested-relationship-docs/';
const examples = JSON.parse(read(fixture + 'examples.json'));
const rest = read('../reference/rest/querying.md')
	.split('### Filtering and Paging Each Relationship')[1]
	.split('### Many-to-Many Relationships')[0];
const resource = read('../reference/resources/resource-api.md')
	.split('#### Constraining related records')[1]
	.split('### `sort`')[0];
const blocks = (source, language) =>
	[...source.matchAll(new RegExp('```' + language + '\\n([\\s\\S]*?)```', 'g'))].map((match) => match[1].trim());
const normalize = (text) => text.replace(/\s+/g, ' ').trim();

test('all five REST requests and complete responses match the executable core fixture', () => {
	assert.deepStrictEqual(
		blocks(rest, 'http'),
		examples.cases.map((example) => 'GET ' + example.url)
	);
	assert.deepStrictEqual(
		blocks(rest, 'json').map(JSON.parse),
		examples.cases.map((example) => example.response)
	);
});

test('the schema matches the schema loaded by the core HTTP tests', () => {
	assert.strictEqual(normalize(blocks(rest, 'graphql')[0]), normalize(read(fixture + 'schema.graphql')));
});

test('the sample-data table matches the seeded brands and products', () => {
	const rows = [...rest.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*(p\d+)\s*\|\s*([^|]+)\|\s*(\d+)\s*\|$/gm)];
	assert.deepStrictEqual(
		rows.map((row) => ({ id: row[3], brandId: Number(row[1]), name: row[4].trim(), price: Number(row[5]) })),
		examples.products
	);
	assert.deepStrictEqual(
		[...new Map(rows.map((row) => [Number(row[1]), { id: Number(row[1]), name: row[2].trim() }])).values()],
		examples.brands
	);
});

function javascriptTokens(source) {
	const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, source);
	const tokens = [];
	while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) tokens.push(scanner.getTokenText());
	return JSON.stringify(tokens.filter((token, i) => token !== ',' || ![']', '}'].includes(tokens[i + 1]))).slice(1, -1);
}

test('both programmatic requests and complete responses match the executed fixture resource', () => {
	const snippets = blocks(resource, 'javascript');
	assert.strictEqual(snippets.length, 2);
	const source = read(fixture + 'resources.js');
	for (const snippet of snippets)
		assert(
			javascriptTokens(source).includes(javascriptTokens(snippet)),
			'programmatic snippet drifted from the executable fixture'
		);
	assert.deepStrictEqual(blocks(resource, 'json').map(JSON.parse), [examples.single, examples.programmatic]);
});

async function readPeerFile(path) {
	const response = await fetch(
		'https://raw.githubusercontent.com/HarperFast/harper/' +
			peerRevision +
			'/integrationTests/resources/nested-relationship-docs/' +
			path,
		{ signal: AbortSignal.timeout(15_000) }
	);
	assert.strictEqual(response.status, 200, 'Cannot read peer fixture: ' + response.url);
	return response.text();
}
let peerRevision = '';
test(
	'paired documentation fixtures stay synchronized across repositories',
	{ skip: !process.env.CI && !process.env.HARPER_CORE_FIXTURE_ROOT },
	async () => {
		const peerRoot = process.env.HARPER_CORE_FIXTURE_ROOT;
		if (!peerRoot) {
			const response = await fetch('https://api.github.com/repos/HarperFast/harper/pulls/3279', {
				signal: AbortSignal.timeout(15_000),
			});
			assert.strictEqual(response.status, 200, 'Cannot resolve companion PR revision');
			const pr = await response.json();
			peerRevision = pr.merged_at ? 'main' : pr.head.sha;
			assert(peerRevision === 'main' || /^[a-f0-9]{40}$/.test(peerRevision));
		}
		for (const name of ['examples.json', 'schema.graphql', 'resources.js']) {
			const expected = readFileSync(new URL(name, new URL(fixture, import.meta.url)), 'utf8');
			const actual = peerRoot ? readFileSync(resolve(peerRoot, name), 'utf8') : await readPeerFile(name);
			assert.strictEqual(
				actual.replace(/\r\n/g, '\n'),
				expected.replace(/\r\n/g, '\n'),
				name + ' differs from the companion repository; update both fixtures together'
			);
		}
	}
);
