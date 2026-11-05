import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import yaml from 'js-yaml';
import {
	CLEANUP_EVENT,
	COMMENT_MARKER,
	DEPLOY_EVENT,
	checkOutputs,
	decide,
	failedBody,
	findComment,
	parsePayload,
	readyBody,
	removedBody,
	resolveSource,
	upsertComment,
} from './source-pr-preview.mjs';

const sha = (c) => c.repeat(40);
const notFound = () => Object.assign(new Error('Not Found'), { status: 404 });

function fakeGithub({ prs = {}, branches = {}, gitlinks = {}, commits = [], comments = [] } = {}) {
	const calls = [];
	const github = {
		calls,
		rest: {
			pulls: {
				get: async ({ owner, repo, pull_number }) => {
					const pr = prs[`${owner}/${repo}#${pull_number}`];
					if (!pr) throw notFound();
					return { data: pr };
				},
			},
			repos: {
				getBranch: async ({ repo, branch }) => {
					const commit = branches[`${repo}:${branch}`];
					if (!commit) throw notFound();
					return { data: { commit: { sha: commit } } };
				},
				getCommit: async ({ repo, ref }) => {
					if (!commits.includes(`${repo}:${ref}`)) throw notFound();
					return { data: { sha: ref } };
				},
				getContent: async ({ repo, path, ref }) => {
					const link = gitlinks[`${repo}:${ref}:${path}`];
					if (link === undefined) throw notFound();
					return { data: link };
				},
			},
			issues: {
				listComments: 'LIST',
				createComment: async (params) => calls.push(['create', params]),
				updateComment: async (params) => calls.push(['update', params]),
			},
		},
		paginate: async (method, params) => {
			assert.equal(method, 'LIST');
			calls.push(['list', params]);
			return comments;
		},
	};
	return github;
}

function pr({ state = 'open', head = sha('a'), base = 'main', headRepo = 'HarperFast/harper' } = {}) {
	return { state, head: { sha: head, repo: headRepo ? { full_name: headRepo } : null }, base: { ref: base } };
}

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('accepts the two source repos with a positive integer', () => {
	assert.deepEqual(parsePayload({ repo: 'HarperFast/harper', number: 12 }), {
		owner: 'HarperFast',
		repo: 'harper',
		fullName: 'HarperFast/harper',
		number: 12,
		project: 'harper-pr-12',
	});
	assert.equal(parsePayload({ repo: 'HarperFast/harper-pro', number: 7 }).project, 'harper-pro-pr-7');
});

test('rejects any other repo', () => {
	for (const repo of [
		'HarperFast/documentation',
		'harperfast/harper',
		'HarperFast/harper ',
		'evil/harper',
		'HarperFast/harper/../x',
		undefined,
		['HarperFast/harper'],
	]) {
		assert.throws(() => parsePayload({ repo, number: 1 }), /client_payload.repo/, String(repo));
	}
});

test('rejects numbers that are not positive integers', () => {
	for (const number of [0, -1, 1.5, '12', '1; rm -rf /', NaN, Infinity, 2 ** 53, null, undefined]) {
		assert.throws(() => parsePayload({ repo: 'HarperFast/harper', number }), /client_payload.number/, String(number));
	}
	assert.throws(() => parsePayload(undefined), /client_payload/);
});

test('harper PR builds its head with harper-pro at the branch named like its base', async () => {
	const github = fakeGithub({
		prs: { 'HarperFast/harper#5': pr({ head: sha('a'), base: 'v5.3' }) },
		branches: { 'harper-pro:v5.3': sha('b') },
	});
	const resolved = await resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper', number: 5 });
	assert.equal(resolved.action, 'deploy');
	assert.equal(resolved.harperSha, sha('a'));
	assert.equal(resolved.proSha, sha('b'));
	assert.equal(resolved.fork, false);
	assert.equal(resolved.error, '');
	checkOutputs(resolved);
});

test('harper PR whose base has no harper-pro branch reports why', async () => {
	const github = fakeGithub({ prs: { 'HarperFast/harper#5': pr({ base: 'main-test' }) } });
	const resolved = await resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper', number: 5 });
	assert.equal(resolved.action, 'deploy');
	assert.match(resolved.error, /no `main-test` branch/);
	checkOutputs(resolved);
});

test('harper-pro PR builds its head with harper at its core gitlink', async () => {
	const github = fakeGithub({
		prs: { 'HarperFast/harper-pro#9': pr({ head: sha('c'), headRepo: 'HarperFast/harper-pro' }) },
		gitlinks: { [`harper-pro:${sha('c')}:core`]: { type: 'submodule', sha: sha('d') } },
		commits: [`harper:${sha('d')}`],
	});
	const resolved = await resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper-pro', number: 9 });
	assert.equal(resolved.error, '');
	assert.equal(resolved.proSha, sha('c'));
	assert.equal(resolved.harperSha, sha('d'));
	assert.equal(resolved.project, 'harper-pro-pr-9');
});

test('harper-pro PR without a core submodule reports why', async () => {
	for (const gitlinks of [{}, { [`harper-pro:${sha('c')}:core`]: { type: 'dir', sha: sha('d') } }]) {
		const github = fakeGithub({
			prs: { 'HarperFast/harper-pro#9': pr({ head: sha('c'), headRepo: 'HarperFast/harper-pro' }) },
			gitlinks,
		});
		const resolved = await resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper-pro', number: 9 });
		assert.match(resolved.error, /`core` is not a submodule/);
	}
});

test('harper-pro PR whose core commit is not in harper reports why', async () => {
	const github = fakeGithub({
		prs: { 'HarperFast/harper-pro#9': pr({ head: sha('c'), headRepo: 'HarperFast/harper-pro' }) },
		gitlinks: { [`harper-pro:${sha('c')}:core`]: { type: 'submodule', sha: sha('d') } },
	});
	const resolved = await resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper-pro', number: 9 });
	assert.match(resolved.error, /not in HarperFast\/harper/);
});

test('a fork, or a deleted head repo, counts as a fork', async () => {
	for (const headRepo of ['someone/harper', null]) {
		const github = fakeGithub({
			prs: { 'HarperFast/harper#5': pr({ headRepo }) },
			branches: { 'harper-pro:main': sha('b') },
		});
		const resolved = await resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper', number: 5 });
		assert.equal(resolved.fork, true, String(headRepo));
	}
});

test('deploy of a closed PR and cleanup of an open one are skipped', async () => {
	const closed = fakeGithub({ prs: { 'HarperFast/harper#5': pr({ state: 'closed' }) } });
	assert.equal((await resolveSource(closed, DEPLOY_EVENT, { repo: 'HarperFast/harper', number: 5 })).action, 'skip');
	assert.equal(
		(await resolveSource(closed, CLEANUP_EVENT, { repo: 'HarperFast/harper', number: 5 })).action,
		'cleanup'
	);
	const open = fakeGithub({ prs: { 'HarperFast/harper#5': pr() } });
	assert.equal((await resolveSource(open, CLEANUP_EVENT, { repo: 'HarperFast/harper', number: 5 })).action, 'skip');
});

test('an unknown event or PR fails', async () => {
	const github = fakeGithub({ prs: { 'HarperFast/harper#5': pr() } });
	await assert.rejects(resolveSource(github, 'other', { repo: 'HarperFast/harper', number: 5 }), /unexpected event/);
	await assert.rejects(resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper', number: 6 }), /Not Found/);
});

test('outputs are checked again where they are consumed', () => {
	const good = { project: 'harper-pr-1', headSha: sha('a'), harperSha: sha('a'), proSha: sha('b'), error: '' };
	checkOutputs(good);
	assert.throws(() => checkOutputs({ ...good, project: 'pr-1' }), /invalid project/);
	assert.throws(() => checkOutputs({ ...good, project: 'harper-pr-1/../x' }), /invalid project/);
	assert.throws(() => checkOutputs({ ...good, headSha: 'main' }), /invalid head sha/);
	assert.throws(() => checkOutputs({ ...good, proSha: 'refs/heads/main' }), /invalid source shas/);
	checkOutputs({ ...good, proSha: '', error: 'no branch' });
});

const removed = { id: 4, body: removedBody() };
const live = { id: 4, body: readyBody({ url: 'U', harperSha: sha('a'), proSha: sha('b'), runUrl: 'R' }) };
const decision = (overrides) =>
	decide({ action: 'deploy', pr: pr(), builtHead: sha('a'), buildResult: 'success', resolveError: '', ...overrides });

test('an open PR at the built head deploys, or reports why it cannot', () => {
	assert.equal(decision({}), 'deploy');
	assert.equal(decision({ buildResult: 'failure' }), 'fail');
	assert.equal(decision({ buildResult: 'skipped', resolveError: 'no branch' }), 'fail');
});

test('a job for a head the PR has moved past, or a cleanup of an open PR, does nothing', () => {
	assert.equal(decision({ builtHead: sha('b') }), 'skip');
	assert.equal(decision({ builtHead: sha('b'), buildResult: 'failure' }), 'skip');
	assert.equal(decision({ action: 'cleanup', builtHead: '', buildResult: 'skipped', comment: live }), 'skip');
});

test('a closed PR loses its preview whichever event queued the job', () => {
	const closed = pr({ state: 'closed' });
	assert.equal(decision({ pr: closed, comment: live }), 'remove');
	assert.equal(decision({ pr: closed, action: 'cleanup', buildResult: 'skipped', comment: live }), 'remove');
	assert.equal(decision({ pr: closed, builtHead: sha('b'), buildResult: 'failure', comment: live }), 'remove');
});

test('a closed PR with no comment never deployed, and one already removed needs nothing', () => {
	const closed = pr({ state: 'closed' });
	assert.equal(decision({ pr: closed, action: 'cleanup', comment: undefined }), 'skip');
	assert.equal(decision({ pr: closed, action: 'cleanup', comment: removed }), 'skip');
	assert.equal(
		decision({
			pr: closed,
			comment: { id: 4, body: failedBody({ headSha: sha('a'), reason: 'r', url: 'U', runUrl: 'R' }) },
		}),
		'remove'
	);
});

const BOT = 'harperfastaibot[bot]';
const source = { repo: 'harper', number: 5 };

test('creates the comment when this App has none', async () => {
	const github = fakeGithub({
		comments: [
			{ id: 1, user: { login: 'someone' }, body: `quoting ${COMMENT_MARKER}` },
			{ id: 2, user: { login: BOT }, body: 'an unrelated comment' },
		],
	});
	const existing = await findComment(github, source, BOT);
	assert.equal(existing, undefined);
	await upsertComment(github, source, existing, 'new body');
	const [list, create] = github.calls;
	assert.deepEqual(list[1], { owner: 'HarperFast', repo: 'harper', issue_number: 5, per_page: 100 });
	assert.deepEqual(create, ['create', { owner: 'HarperFast', repo: 'harper', body: 'new body', issue_number: 5 }]);
});

test("updates this App's marked comment in place", async () => {
	const github = fakeGithub({
		comments: [
			{ id: 1, user: { login: 'someone' }, body: COMMENT_MARKER },
			{ id: 3, user: { login: BOT }, body: `${COMMENT_MARKER}\nold` },
		],
	});
	const existing = await findComment(github, source, BOT);
	assert.equal(existing.id, 3);
	await upsertComment(github, source, existing, 'new body');
	assert.deepEqual(github.calls.at(-1), [
		'update',
		{ owner: 'HarperFast', repo: 'harper', body: 'new body', comment_id: 3 },
	]);
});

test('comment bodies carry the marker, the link and both shas', () => {
	const body = readyBody({ url: 'https://p.example/harper-pr-5/', harperSha: sha('a'), proSha: sha('b'), runUrl: 'R' });
	assert(body.startsWith(COMMENT_MARKER));
	assert(body.includes('https://p.example/harper-pr-5/'));
	assert(body.includes(sha('a').slice(0, 10)) && body.includes(sha('b').slice(0, 10)));
});

const workflow = yaml.load(
	readFileSync(new URL('../.github/workflows/source-pr-preview.yaml', import.meta.url), 'utf8')
);

test('no job can write caches, and the workflow grants nothing by default', () => {
	assert.equal(workflow['cache-mode'], 'none');
	assert.deepEqual(workflow.permissions, {});
	for (const [name, job] of Object.entries(workflow.jobs)) {
		assert.equal(job['cache-mode'], undefined, `${name} overrides cache-mode`);
		for (const [scope, level] of Object.entries(job.permissions ?? {})) {
			assert.equal(level, 'read', `${name} has ${scope}: ${level}`);
		}
	}
});

test('the build holds no secret, gates forks, and keeps no git credentials', () => {
	const build = workflow.jobs.build;
	assert(!JSON.stringify(build).includes('secrets.'), 'build references a secret');
	assert.match(build.environment, /fork == 'true' && 'preview'/);
	const checkout = build.steps.find((step) => step.uses?.startsWith('actions/checkout@'));
	assert.equal(checkout.with['persist-credentials'], false);
	assert.equal(checkout.with.ref, undefined, 'build checks out something other than this repo at the dispatch');
	assert(!build.steps.some((step) => step.uses?.startsWith('actions/setup-node@') && step.with?.cache));
});

test('only apply holds secrets, and it never installs or builds the site', () => {
	const secretJobs = Object.entries(workflow.jobs).filter(([, job]) => JSON.stringify(job).includes('secrets.'));
	assert.deepEqual(
		secretJobs.map(([name]) => name),
		['apply']
	);
	const { apply } = workflow.jobs;
	for (const step of apply.steps) {
		assert(!/npm (ci|run)|npm install(?! -g harper$)/m.test(step.run ?? ''), step.run);
	}
	assert.equal(apply.concurrency.group, 'source-pr-preview-${{ needs.resolve.outputs.project }}');
	assert.equal(apply.concurrency['cancel-in-progress'], false);
});

test('every resolve output names a key resolveSource returns', async () => {
	const github = fakeGithub({
		prs: { 'HarperFast/harper#5': pr() },
		branches: { 'harper-pro:main': sha('b') },
	});
	const keys = Object.keys(await resolveSource(github, DEPLOY_EVENT, { repo: 'HarperFast/harper', number: 5 }));
	for (const [name, value] of Object.entries(workflow.jobs.resolve.outputs)) {
		const key = value.match(/^\$\{\{ steps\.resolve\.outputs\.(\w+) \}\}$/)?.[1];
		assert(keys.includes(key), `output ${name} reads ${key}`);
	}
});

test('payload-derived values reach scripts only through validated outputs and env', () => {
	const text = readFileSync(new URL('../.github/workflows/source-pr-preview.yaml', import.meta.url), 'utf8');
	assert(!text.includes('client_payload.'), 'a client_payload field is interpolated into the workflow');
	for (const job of Object.values(workflow.jobs)) {
		for (const step of job.steps) {
			assert(!/\$\{\{/.test(step.run ?? ''), `expression interpolated into run: ${step.run}`);
			assert(!/\$\{\{/.test(step.with?.script ?? ''), 'expression interpolated into a script');
		}
	}
});

let failed = 0;
for (const [name, fn] of tests) {
	try {
		await fn();
		console.log(`ok - ${name}`);
	} catch (error) {
		failed++;
		console.log(`not ok - ${name}\n${error.stack}`);
	}
}
console.log(`${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
