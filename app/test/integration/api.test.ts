// Integration tests against a RUNNING Harper instance. They exercise the real
// HTTP surface — search API, admin auth, dev-login session, metrics recording —
// so they need `npm run dev` up (with ADMIN_DEV_LOGIN=true for the dev-login
// tests). Tests self-skip when the server is unreachable or credentials are
// absent, so the suite never fails just because nothing is running.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCreds } from '../../scripts/lib/record.ts';

const BASE = process.env.HARPER_TARGET ?? 'http://localhost:9936';
const CREDS = loadCreds();

let reachable: boolean | undefined;
async function serverUp(): Promise<boolean> {
	if (reachable !== undefined) return reachable;
	try {
		const r = await fetch(`${BASE}/`, { redirect: 'manual' });
		reachable = r.status > 0;
	} catch {
		reachable = false;
	}
	return reachable;
}

test('GET /api/search returns ranked results and respects limit', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const res = await fetch(`${BASE}/api/search?q=replication&limit=3`);
	assert.equal(res.status, 200);
	const data = await res.json();
	assert.ok(Array.isArray(data.results), 'results is an array');
	assert.ok(data.results.length > 0 && data.results.length <= 3, 'respects limit');
	assert.ok(data.results[0].path, 'result carries a path');
});

test('GET /api/search scopes by section', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const res = await fetch(`${BASE}/api/search?q=schema&section=reference&limit=5`);
	assert.equal(res.status, 200);
	const data = await res.json();
	assert.ok(Array.isArray(data.results));
	assert.ok(data.results.length > 0, 'scoped query still returns results');
	for (const r of data.results) assert.match(r.path, /reference/, `${r.path} is in reference`);
});

test('GET /api/search?log=1 is a commit beacon (204, no search body)', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const res = await fetch(`${BASE}/api/search?q=integration-beacon&log=1&n=0`);
	assert.equal(res.status, 204);
	assert.equal(await res.text(), '', 'commit beacon returns no body');
});

test('GET /admin/ingest requires auth (302 → Google OAuth)', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	const res = await fetch(`${BASE}/admin/ingest`, { redirect: 'manual' });
	assert.equal(res.status, 302);
	assert.match(res.headers.get('location') ?? '', /\/oauth\/google\/login/);
});

test('dev-login mints a session cookie that alone authorizes every tab', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!CREDS) return t.skip('no admin credentials (set HARPER_CLI_USERNAME/PASSWORD)');
	const login = await fetch(`${BASE}/admin/dev-login`, {
		redirect: 'manual',
		headers: { authorization: `Basic ${CREDS}` },
	});
	if (login.status !== 302) return t.skip('dev-login disabled (start the server with ADMIN_DEV_LOGIN=true)');
	assert.equal(login.headers.get('location'), '/admin/ingest');
	const setCookie = login.headers.get('set-cookie');
	assert.ok(setCookie, 'dev-login issues a Set-Cookie');
	const cookie = setCookie.split(';')[0]; // "<name>=<id>"

	const expected: Record<string, string> = { ingest: 'Ingest', search: 'Search', validation: 'Validation' };
	for (const [view, label] of Object.entries(expected)) {
		const r = await fetch(`${BASE}/admin/${view}`, { headers: { cookie } });
		assert.equal(r.status, 200, `/admin/${view} authorized by session cookie`);
		const html = await r.text();
		assert.match(html, new RegExp(`class="admin-tab is-active"[^>]*>${label}`), `${view} highlights its tab`);
	}
});

test('POST /Metrics records an eval run', async (t) => {
	if (!(await serverUp())) return t.skip(`server not reachable at ${BASE}`);
	if (!CREDS) return t.skip('no admin credentials');
	const res = await fetch(`${BASE}/Metrics`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `Basic ${CREDS}` },
		body: JSON.stringify({
			action: 'record-eval',
			gitSha: 'itest',
			mrr: 0.9,
			recall5: 1,
			recall10: 1,
			zeroRate: 0,
			cases: 44,
			weak: 0,
			passed: null,
		}),
	});
	assert.ok(res.ok, `POST /Metrics ok (got ${res.status})`);
	const data = await res.json();
	assert.equal(data.ok, true);
	assert.ok(data.id, 'returns the new row id');
});
