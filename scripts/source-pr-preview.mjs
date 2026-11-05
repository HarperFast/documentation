/**
 * Previews of this site built from a HarperFast/harper or HarperFast/harper-pro PR that changes docs/.
 * Called from .github/workflows/source-pr-preview.yaml through actions/github-script; `github` is its
 * Octokit client. Tested by scripts/source-pr-preview.test.mjs.
 *
 * The dispatch payload is only a hint of which PR to look at: everything else (state, head, fork,
 * the refs to build) is read from the GitHub API here.
 */

const OWNER = 'HarperFast';
const SOURCE_REPOS = new Map([
	['HarperFast/harper', 'harper'],
	['HarperFast/harper-pro', 'harper-pro'],
]);
export const COMMENT_MARKER = '<!-- docs-source-pr-preview -->';
export const DEPLOY_EVENT = 'docs-source-pr-preview';
export const CLEANUP_EVENT = 'docs-source-pr-preview-cleanup';

const SHA = /^[0-9a-f]{40}$/;
const PROJECT = /^(harper|harper-pro)-pr-[1-9][0-9]*$/;

export function parsePayload(payload) {
	const fullName = payload?.repo;
	const number = payload?.number;
	const short = typeof fullName === 'string' ? SOURCE_REPOS.get(fullName) : undefined;
	if (!short) throw new Error(`client_payload.repo must be one of ${[...SOURCE_REPOS.keys()].join(', ')}`);
	if (typeof number !== 'number' || !Number.isSafeInteger(number) || number < 1) {
		throw new Error('client_payload.number must be a positive integer');
	}
	return { owner: OWNER, repo: short, fullName, number, project: `${short}-pr-${number}` };
}

function isNotFound(error) {
	return error?.status === 404;
}

async function branchSha(github, repo, branch) {
	try {
		const { data } = await github.rest.repos.getBranch({ owner: OWNER, repo, branch });
		return data.commit.sha;
	} catch (error) {
		if (isNotFound(error)) return null;
		throw error;
	}
}

async function coreGitlink(github, ref) {
	try {
		const { data } = await github.rest.repos.getContent({ owner: OWNER, repo: 'harper-pro', path: 'core', ref });
		return data.type === 'submodule' ? data.sha : null;
	} catch (error) {
		if (isNotFound(error)) return null;
		throw error;
	}
}

/**
 * What a dispatch asks for, judged against the PR as it is now. A deploy of a closed PR or a cleanup of an
 * open one is a `skip`. `error` is a reason the PR cannot be previewed that its author should see.
 */
export async function resolveSource(github, eventType, payload) {
	const source = parsePayload(payload);
	const { data: pr } = await github.rest.pulls.get({
		owner: OWNER,
		repo: source.repo,
		pull_number: source.number,
	});
	const open = pr.state === 'open';
	const base = { ...source, headSha: pr.head.sha, fork: pr.head.repo?.full_name !== source.fullName };
	if (eventType === CLEANUP_EVENT) return { ...base, action: open ? 'skip' : 'cleanup' };
	if (eventType !== DEPLOY_EVENT) throw new Error(`unexpected event ${eventType}`);
	if (!open) return { ...base, action: 'skip' };
	let harperSha;
	let proSha;
	let error = '';
	if (source.repo === 'harper') {
		harperSha = pr.head.sha;
		// The harper-pro line that harper's base branch ships with, as harper's own docs CI pairs them.
		proSha = await branchSha(github, 'harper-pro', pr.base.ref);
		if (!proSha) error = `HarperFast/harper-pro has no \`${pr.base.ref}\` branch to build this PR's base with`;
	} else {
		proSha = pr.head.sha;
		// A harper-pro PR's core pointer names the harper commit it is built and tested with.
		harperSha = await coreGitlink(github, pr.head.sha);
		if (!harperSha) error = `\`core\` is not a submodule at ${pr.head.sha.slice(0, 10)}`;
	}
	return { ...base, action: 'deploy', harperSha: harperSha ?? '', proSha: proSha ?? '', error };
}

/** The resolve job's outputs, checked again where they are consumed. */
export function checkOutputs({ project, headSha, harperSha, proSha, error }) {
	if (!PROJECT.test(project)) throw new Error(`invalid project ${project}`);
	if (!SHA.test(headSha)) throw new Error(`invalid head sha ${headSha}`);
	if (!error && !(SHA.test(harperSha) && SHA.test(proSha))) throw new Error('invalid source shas');
}

/** Whether a side effect for `expected` still applies: the PR is still open at that head (deploy) or still closed. */
export async function stillCurrent(github, source, action, expectedHead) {
	const { data: pr } = await github.rest.pulls.get({
		owner: OWNER,
		repo: source.repo,
		pull_number: source.number,
	});
	if (action === 'cleanup') return pr.state !== 'open';
	return pr.state === 'open' && pr.head.sha === expectedHead;
}

/** The preview comment this App wrote on the PR, if any. A marker in someone else's comment does not count. */
export async function findComment(github, source, botLogin) {
	const comments = await github.paginate(github.rest.issues.listComments, {
		owner: OWNER,
		repo: source.repo,
		issue_number: source.number,
		per_page: 100,
	});
	return comments.find((comment) => comment.user?.login === botLogin && comment.body?.includes(COMMENT_MARKER));
}

export async function upsertComment(github, source, botLogin, body) {
	const existing = await findComment(github, source, botLogin);
	const params = { owner: OWNER, repo: source.repo, body };
	if (existing) {
		await github.rest.issues.updateComment({ ...params, comment_id: existing.id });
	} else {
		await github.rest.issues.createComment({ ...params, issue_number: source.number });
	}
}

const short = (sha) => `\`${sha.slice(0, 10)}\``;

export function readyBody({ url, harperSha, proSha, runUrl }) {
	return `${COMMENT_MARKER}
### 📖 Docs preview

${url}

Built from harper ${short(harperSha)} and harper-pro ${short(proSha)} ([build](${runUrl})). Updates on each push to this PR; removed when it closes.
`;
}

export function failedBody({ headSha, error, runUrl }) {
	return `${COMMENT_MARKER}
### 📖 Docs preview failed

The documentation site did not build from ${short(headSha)}: ${error || 'see the build log'} ([build](${runUrl})). The next push to this PR tries again.
`;
}

export function removedBody() {
	return `${COMMENT_MARKER}
### 📖 Docs preview removed

The preview was removed when this PR closed.
`;
}
