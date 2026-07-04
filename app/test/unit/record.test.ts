// Unit tests for the shared metrics-recording client's pure helpers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCreds, gitSha } from '../../scripts/lib/record.ts';

test('loadCreds: base64-encodes env credentials when both are set', () => {
	const prevU = process.env.HARPER_CLI_USERNAME;
	const prevP = process.env.HARPER_CLI_PASSWORD;
	process.env.HARPER_CLI_USERNAME = 'alice';
	process.env.HARPER_CLI_PASSWORD = 's3cret:pass'; // colon in the secret must survive
	try {
		assert.equal(loadCreds(), Buffer.from('alice:s3cret:pass').toString('base64'));
	} finally {
		restore('HARPER_CLI_USERNAME', prevU);
		restore('HARPER_CLI_PASSWORD', prevP);
	}
});

test('gitSha: returns a string (short sha, or empty when unavailable)', () => {
	const sha = gitSha();
	assert.equal(typeof sha, 'string');
});

function restore(key: string, prev: string | undefined): void {
	if (prev === undefined) delete process.env[key];
	else process.env[key] = prev;
}
