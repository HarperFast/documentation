// Test harness for the companion-check workflow's embedded github-script.
// Usage: node scripts/companion-check.test.mjs [path-to-companion-check.yaml]
import { readFileSync } from 'node:fs';
import assert from 'node:assert';

const yaml = readFileSync(
	process.argv[2] || new URL('../.github/workflows/companion-check.yaml', import.meta.url),
	'utf8'
);
const script = yaml
	.split('\n')
	.filter((l) => /^ {12}/.test(l) || l.trim() === '')
	.map((l) => l.slice(12))
	.join('\n');
assert(script.includes('parseDeps'), 'script extraction failed');

const OWN = 'HarperFast/documentation';

// Dep PR database: "owner/repo#n" -> PR data | 'private' | 'flaky500'
const prDb = {
	'HarperFast/harper#2147': { merged: false, state: 'open' },
	'HarperFast/harper#2000': { merged: true, state: 'closed' },
	'HarperFast/harper#1999': { merged: false, state: 'closed' },
	'HarperFast/harper#1500': { merged: true, state: 'closed' },
	'HarperFast/harper-pro#512': 'private',
	'HarperFast/harper#666': 'flaky500',
	'HarperFast/documentation#600': { merged: true, state: 'closed' },
};

function makeEnv(eventName, openPrs, payloadPr) {
	const posted = [];
	const getCalls = [];
	const github = {
		rest: {
			pulls: {
				get: async ({ owner, repo, pull_number }) => {
					const key = `${owner}/${repo}#${pull_number}`;
					getCalls.push(key);
					const fresh = openPrs.find((p) => key === `${OWN}#${p.number}`);
					if (fresh) return { data: fresh }; // sweep re-read of our own PR
					const rec = prDb[key];
					if (rec === 'flaky500') throw Object.assign(new Error('boom'), { status: 500 });
					if (!rec || rec === 'private') throw Object.assign(new Error('nf'), { status: 404 });
					return { data: rec };
				},
				list: 'LIST',
			},
			repos: {
				listCommitStatusesForRef: async ({ ref }) => ({
					data:
						ref === 'ddd'
							? [
									{
										context: 'companion-check',
										state: 'failure',
										description: 'HarperFast/harper#1999 closed without merging',
									},
								]
							: ref === 'heal'
								? [{ context: 'companion-check', state: 'pending', description: 'Waiting on HarperFast/harper#2147' }]
								: [],
				}),
				createCommitStatus: async (s) => posted.push(s),
			},
		},
		paginate: async (fn) => (assert.equal(fn, 'LIST'), openPrs),
	};
	const core = { info: () => {}, warning: () => {}, setFailed: (m) => (core.failed = m) };
	const context = {
		repo: { owner: 'HarperFast', repo: 'documentation' },
		eventName,
		payload: { pull_request: payloadPr },
		serverUrl: 'https://github.com',
		runId: 1,
	};
	return { github, core, context, posted, getCalls };
}

async function run(env) {
	await new Function('github', 'context', 'core', `return (async()=>{${script}})()`)(env.github, env.context, env.core);
	return Object.fromEntries(env.posted.map((s) => [s.sha, s]));
}

const ownHead = { repo: { full_name: OWN } };
const pr = (number, body, sha, head = {}) => ({ number, body, head: { sha, ...ownHead, ...head } });

process.env.COMPANION_CHECK_TOKEN = '';
globalThis.fetch = async () => ({ ok: false, status: 403 });

// --- schedule sweep ---
const sweepPrs = [
	pr(623, 'Docs.\n\nDepends-on: HarperFast/harper#2147\n', 'aaa'),
	pr(700, 'plain docs PR, no deps', 'bbb'),
	pr(701, 'Depends-on: https://github.com/HarperFast/harper/pull/2000, documentation#600', 'ccc'),
	pr(702, 'depends-on: HarperFast/harper#1999', 'ddd'),
	pr(703, 'Depends-on: HarperFast/harper-pro#512', 'eee'),
	pr(704, 'Depends-on: harper#1500', 'fff'), // repo#N shorthand
	pr(705, 'Depends-on: the harper PR', 'ggg'), // unparseable -> failure
	pr(706, 'Depends-on: HarperFast/harper#666', 'hhh'), // 500 -> unreadable, no crash
	pr(707, `Depends-on: ${Array.from({ length: 12 }, (_, i) => `HarperFast/harper#${i + 1}`).join(', ')}`, 'iii'),
	pr(708, 'Depends-on: harper#1500, HarperFast/harper#1500', 'jjj'), // dedupe -> 1 dep
	pr(709, 'Depends-on: HarperFast/harper#2147 (the pagination PR)', 'res1'), // residue -> failure
	pr(710, 'Depends-on:', 'res2'), // empty marker -> failure
	pr(711, 'Depends-on: ../../evil/x#1', 'res3'), // traversal segments -> failure
	pr(712, 'no marker, stale pending from removed marker', 'heal'), // heals to success
	pr(713, 'Depends-on: harper#1500', 'memo'), // same dep as 704: memoized
];
const sweep = makeEnv('schedule', sweepPrs);
const bySha = await run(sweep);

assert.equal(bySha.aaa.state, 'pending');
assert.match(bySha.aaa.description, /Waiting on HarperFast\/harper#2147/);
assert.equal(bySha.bbb.state, 'success', 'sweep backfills no-marker PRs');
assert.equal(bySha.ccc.state, 'success');
assert.match(bySha.ccc.description, /harper#2000.*documentation#600/);
assert.equal(bySha.ddd, undefined, 'unchanged status must not repost');
assert.equal(bySha.eee.state, 'pending');
assert.match(bySha.eee.description, /Cannot read HarperFast\/harper-pro#512.*404.*TOKEN needed/);
assert.equal(bySha.fff.state, 'success', 'repo#N shorthand resolves in own org');
assert.equal(bySha.ggg.state, 'failure', 'unparseable marker fails closed');
assert.match(bySha.ggg.description, /unparseable/i);
assert.equal(bySha.hhh.state, 'pending', 'HTTP 500 must degrade, not crash');
assert.match(bySha.hhh.description, /Cannot read HarperFast\/harper#666 \(500\)/);
assert.equal(bySha.iii.state, 'failure', 'dep cap enforced');
assert.equal(bySha.jjj.state, 'success', 'duplicates deduped');
assert.match(bySha.jjj.description, /^All companion PRs merged \(HarperFast\/harper#1500\)$/);
assert.equal(bySha.res1.state, 'failure', 'non-ref residue on marker line fails closed');
assert.equal(bySha.res2.state, 'failure', 'empty marker fails closed');
assert.equal(bySha.res3.state, 'failure', 'path-traversal segments fail closed');
assert.equal(bySha.heal.state, 'success', 'sweep heals stale pending after marker removal');
assert.equal(bySha.memo.state, 'success');
assert.equal(
	sweep.getCalls.filter((k) => k === 'HarperFast/harper#1500').length,
	1,
	'dep lookups memoized within a run'
);
assert.equal(sweep.core.failed, undefined, 'no PR-level failures expected');
assert.ok(sweep.posted.every((s) => s.context === 'companion-check' && s.description.length <= 140));

// --- pull_request_target: no-marker PR gets success, no sweep re-read ---
const evt = makeEnv('pull_request_target', [], pr(700, 'plain', 'bbb'));
const evtBySha = await run(evt);
assert.equal(evtBySha.bbb.state, 'success');
assert.equal(evtBySha.bbb.description, 'No companion dependencies');

// --- sweep race guard: body changed between list and post -> skip ---
const stale = pr(720, 'Depends-on: HarperFast/harper#2147', 'kkk');
const race = makeEnv('schedule', [stale]);
const origGet = race.github.rest.pulls.get;
race.github.rest.pulls.get = async (args) =>
	args.repo === 'documentation' ? { data: pr(720, 'edited body', 'kkk') } : origGet(args);
const raceBySha = await run(race);
assert.equal(raceBySha.kkk, undefined, 'sweep must not post over a changed PR');

// --- error mid-PR must downgrade a would-be-stale status to pending ---
const errEnv = makeEnv('pull_request_target', [], pr(721, 'Depends-on: HarperFast/harper#2147', 'err1'));
errEnv.github.rest.repos.listCommitStatusesForRef = async () => {
	throw new Error('api down');
};
const errBySha = await run(errEnv);
assert.equal(errBySha.err1.state, 'pending', 'failed refresh posts pending, not silence');
assert.match(errBySha.err1.description, /errored/);
assert.match(errEnv.core.failed, /1 PR/);

// --- secret guards ---
process.env.COMPANION_CHECK_TOKEN = 'tok';
let fetched = [];
globalThis.fetch = async (url) => (fetched.push(url), { ok: false, status: 404 });

// foreign org: secret withheld
const foreign = makeEnv('pull_request_target', [], pr(730, 'Depends-on: HarperFast/../evil#1', 'lll'));
await run(foreign); // traversal caught in parse; now a clean foreign ref:
const foreign2 = makeEnv('pull_request_target', [], {
	number: 731,
	body: 'Depends-on: https://github.com/evilorg/private/pull/1',
	head: { sha: 'mmm', repo: { full_name: OWN } },
});
const foreignBySha = await run(foreign2);
assert.equal(fetched.length, 0, 'secret must not be sent for foreign orgs');
assert.equal(foreignBySha.mmm.state, 'pending');

// fork PR: secret withheld even for same-org refs
const fork = makeEnv('pull_request_target', [], {
	number: 732,
	body: 'Depends-on: HarperFast/harper-pro#512',
	head: { sha: 'nnn', repo: { full_name: 'outsider/documentation' } },
});
const forkBySha = await run(fork);
assert.equal(fetched.length, 0, 'secret must not be sent for fork PRs');
assert.equal(forkBySha.nnn.state, 'pending');

// non-fork same-org: secret used; token-confirmed 404 -> failure
const typo = makeEnv('pull_request_target', [], pr(733, 'Depends-on: HarperFast/ghost#1', 'ooo'));
const typoBySha = await run(typo);
assert.equal(fetched.length, 1, 'secret used for same-org non-fork refs');
assert.equal(typoBySha.ooo.state, 'failure', 'token-confirmed 404 fails, not pending');
assert.match(typoBySha.ooo.description, /not found/);
process.env.COMPANION_CHECK_TOKEN = '';

console.log('PASS: all companion-check scenarios correct');
