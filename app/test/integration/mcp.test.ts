// Integration tests for the MCP server (POST /mcp) against a RUNNING Harper
// instance with an ingested corpus. No model key needed — search uses the
// keyword+semantic lanes (semantic degrades gracefully without embeddings), and
// fetch reads a page directly. Self-skips when the server is unreachable.

import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.HARPER_TARGET ?? 'http://localhost:9936';
const MCP = `${BASE}/mcp`;

let reachable: boolean | undefined;
async function serverUp(): Promise<boolean> {
	if (reachable !== undefined) return reachable;
	try {
		reachable = (await fetch(`${BASE}/`, { redirect: 'manual' })).status > 0;
	} catch {
		reachable = false;
	}
	return reachable;
}

// Send one JSON-RPC message; returns { status, json }.
async function rpc(msg: unknown): Promise<{ status: number; body: any }> {
	const res = await fetch(MCP, {
		method: 'POST',
		headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
		body: JSON.stringify(msg),
	});
	const text = await res.text();
	return { status: res.status, body: text ? JSON.parse(text) : null };
}
const call = (name: string, args: object) => rpc({ jsonrpc: '2.0', id: 9, method: 'tools/call', params: { name, arguments: args } });

test('MCP initialize returns protocol version, tools capability, serverInfo', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const { status, body } = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {} } });
	assert.equal(status, 200);
	assert.match(body.result.protocolVersion, /^\d{4}-\d{2}-\d{2}$/);
	assert.ok(body.result.capabilities.tools, 'advertises tools capability');
	assert.equal(body.result.serverInfo.name, 'harper-docs');
});

test('MCP tools/list exposes search_docs and fetch_doc with input schemas', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const { body } = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
	const tools: any[] = body.result.tools;
	const byName = Object.fromEntries(tools.map((x) => [x.name, x]));
	assert.ok(byName.search_docs && byName.fetch_doc, 'both tools present');
	assert.equal(byName.search_docs.inputSchema.required[0], 'query');
	assert.equal(byName.fetch_doc.inputSchema.required[0], 'path');
});

test('MCP search_docs returns ranked doc results for a NL query', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const { body } = await call('search_docs', { query: 'how does replication work', limit: 3 });
	const textOut = body.result.content[0].text;
	assert.equal(body.result.isError ?? false, false);
	assert.match(textOut, /replication/i, 'surfaces a replication page');
	assert.match(textOut, /path:\s*reference\//, 'includes a doc path');
});

test('MCP fetch_doc returns page Markdown; accepts an anchored url; errors on a bad path', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const ok = await call('fetch_doc', { path: '/reference/v5/database/schema#table' }); // url form + anchor
	assert.equal(ok.body.result.isError ?? false, false, 'anchored url resolves');
	assert.match(ok.body.result.content[0].text, /^# /, 'returns Markdown starting with a heading');

	const bad = await call('fetch_doc', { path: 'nope/does-not-exist' });
	assert.equal(bad.body.result.isError, true, 'missing page is a tool error');
});

test('MCP protocol edges: notification → 202, unknown method → -32601, bad tool → -32602', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const note = await fetch(MCP, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) });
	assert.equal(note.status, 202, 'notification gets no response body');

	const unknown = await rpc({ jsonrpc: '2.0', id: 3, method: 'bogus/method' });
	assert.equal(unknown.body.error.code, -32601);

	const badTool = await rpc({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'no_such_tool', arguments: {} } });
	assert.equal(badTool.body.error.code, -32602);
});

test('MCP rejects batches, and answers an id:null request (not as a notification)', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	// Batching removed in MCP 2025-06-18 + a DoS-amplification vector → rejected.
	const batch = await rpc([{ jsonrpc: '2.0', id: 1, method: 'ping' }]);
	assert.equal(batch.body.error.code, -32600, 'array body is an invalid request');
	// id:null is a valid request id, NOT a notification — it must get a response.
	const nullId = await rpc({ jsonrpc: '2.0', id: null, method: 'bogus/method' });
	assert.equal(nullId.status, 200);
	assert.equal(nullId.body.id, null, 'response echoes the null id');
	assert.equal(nullId.body.error.code, -32601);
});

test('MCP CORS preflight (OPTIONS) allows cross-origin', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const res = await fetch(MCP, { method: 'OPTIONS' });
	assert.equal(res.status, 204);
	assert.equal(res.headers.get('access-control-allow-origin'), '*');
});
