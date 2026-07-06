// Model Context Protocol (MCP) server over the docs corpus. It exposes the SAME
// hybrid retrieval the search UI and chat use, so agents and IDEs can search and
// read the Harper docs.
//
// Transport: Streamable HTTP (JSON-RPC 2.0 over POST /mcp), stateless (no session),
// single-JSON response — a read-only search/fetch server has no server-initiated
// messages, so no SSE stream is needed. The corpus is public and read-only, so
// CORS is open: MCP's Origin-validation hardening exists to stop DNS-rebinding
// against LOCAL/stdio servers, not a public docs endpoint.

import { tables } from './harper.ts';
import { runSearch, logQuery } from './search.ts';

const { Page, SitePointer } = tables;

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'harper-docs', title: 'Harper Documentation', version: '1.0.0' };
const SECTIONS = ['learn', 'reference', 'fabric', 'release-notes'];

// Public, read-only corpus → permissive CORS so any agent/browser client reaches it.
const CORS: Record<string, string> = {
	'access-control-allow-origin': '*',
	'access-control-allow-methods': 'POST, OPTIONS',
	'access-control-allow-headers': 'content-type, mcp-session-id, mcp-protocol-version',
	'access-control-max-age': '86400',
};

const TOOLS = [
	{
		name: 'search_docs',
		description:
			'Search the Harper documentation (hybrid keyword + semantic). Returns ranked pages with title, path, url, and a snippet. Use this to find the right page, then read it with fetch_doc.',
		inputSchema: {
			type: 'object',
			properties: {
				query: { type: 'string', description: 'Natural-language question or keywords.' },
				section: { type: 'string', enum: SECTIONS, description: 'Optional: restrict to a docs section.' },
				version: { type: 'string', enum: ['v4', 'v5'], description: 'Optional: restrict to a major version.' },
				limit: { type: 'number', description: 'Max results (default 8, max 20).' },
			},
			required: ['query'],
		},
	},
	{
		name: 'fetch_doc',
		description:
			'Fetch the full Markdown of a documentation page by its path (e.g. "reference/v5/database/schema"), as returned in a search_docs result.',
		inputSchema: {
			type: 'object',
			properties: { path: { type: 'string', description: 'Doc path or url, with or without a leading slash.' } },
			required: ['path'],
		},
	},
];

// ── JSON-RPC helpers ─────────────────────────────────────────────────────────
const rpcResult = (id: any, result: any) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id: any, code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
const toolText = (text: string, isError = false) => ({ content: [{ type: 'text', text }], isError });

function json(obj: unknown): Response {
	return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json', ...CORS } });
}

// CORS preflight for POST /mcp.
export function handleMcpOptions(): Response {
	return new Response(null, { status: 204, headers: CORS });
}

// The public MCP surface. site.ts reads the JSON body and passes it here (null on
// a parse failure). Handles a single JSON-RPC message or a batch (array).
export async function handleMcp(body: any): Promise<Response> {
	if (body === null || typeof body !== 'object') return json(rpcError(null, -32700, 'Parse error'));
	if (Array.isArray(body)) {
		const out = (await Promise.all(body.map(dispatch))).filter((r) => r !== null);
		return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
	}
	const res = await dispatch(body);
	return res === null ? new Response(null, { status: 202, headers: CORS }) : json(res);
}

async function dispatch(msg: any): Promise<any | null> {
	if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return rpcError(msg?.id ?? null, -32600, 'Invalid Request');
	const { id, method, params } = msg;
	const isNotification = id === undefined || id === null;
	switch (method) {
		case 'initialize':
			return rpcResult(id, {
				protocolVersion: PROTOCOL_VERSION,
				capabilities: { tools: { listChanged: false } },
				serverInfo: SERVER_INFO,
				instructions: 'Search the Harper docs with search_docs, then read a page with fetch_doc using its path.',
			});
		case 'notifications/initialized':
		case 'notifications/cancelled':
			return null; // notifications get no response
		case 'ping':
			return rpcResult(id, {});
		case 'tools/list':
			return rpcResult(id, { tools: TOOLS });
		case 'tools/call':
			return callTool(id, params);
		default:
			return isNotification ? null : rpcError(id, -32601, `Method not found: ${method}`);
	}
}

async function callTool(id: any, params: any): Promise<any> {
	const name = params?.name;
	const args = params?.arguments ?? {};
	try {
		if (name === 'search_docs') return rpcResult(id, await searchDocs(args));
		if (name === 'fetch_doc') return rpcResult(id, await fetchDoc(args));
		return rpcError(id, -32602, `Unknown tool: ${name}`);
	} catch (err: any) {
		// Per MCP, a tool's own failure is reported in the result (isError), not as a
		// protocol-level error — the model should see and can recover from it.
		return rpcResult(id, toolText(`Tool "${name}" failed: ${err?.message ?? err}`, true));
	}
}

// ── Tools ────────────────────────────────────────────────────────────────────
async function searchDocs(args: any) {
	const query = String(args.query ?? '').trim();
	if (!query) return toolText('search_docs requires a non-empty "query".', true);
	const limit = Math.max(1, Math.min(Number(args.limit) || 8, 20));
	const section = typeof args.section === 'string' ? args.section : null;
	const version = typeof args.version === 'string' ? args.version : null;
	// blend = semantic + keyword: better for the natural-language questions agents ask.
	const { results } = await runSearch({ q: query, section, version, limit, blend: true });
	void logQuery(query, section, version, results.length, 'mcp'); // content-gap report, source=mcp
	if (!results.length) return toolText(`No documentation found for "${query}".`);
	const lines = results.map((r, i) => {
		const heading = r.heading ? ` › ${r.heading}` : '';
		return `${i + 1}. ${r.title}${heading}\n   path: ${r.path}\n   url: ${r.url}\n   ${r.snippet ?? ''}`.trim();
	});
	return toolText(`${results.length} result(s) for "${query}":\n\n${lines.join('\n\n')}`);
}

async function fetchDoc(args: any) {
	let path = String(args.path ?? '').trim();
	if (!path) return toolText('fetch_doc requires a "path".', true);
	// Accept a full url or a path, with or without a leading slash, .md suffix, or a
	// #anchor / ?query (search_docs returns anchored urls, so agents pass them back).
	path = path
		.replace(/^https?:\/\/[^/]+/, '')
		.replace(/[#?].*$/, '')
		.replace(/^\/+/, '')
		.replace(/\/+$/, '')
		.replace(/\.md$/, '');
	const release = (await SitePointer.get('active'))?.release;
	if (!release) return toolText('The docs are not currently available.', true);
	const page = await Page.get(`${release}:${path}`);
	if (!page?.renderedMarkdown) return toolText(`No page at "${path}". Use search_docs to find the right path.`, true);
	return toolText(`# ${page.title}\n\n${page.renderedMarkdown}`);
}
