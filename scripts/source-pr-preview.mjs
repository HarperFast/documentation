/**
 * Previews of this site built from a HarperFast/harper or HarperFast/harper-pro PR that changes docs/.
 * `github` is the Octokit client actions/github-script provides.
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
const REMOVED_MARKER = '<!-- docs-source-pr-preview: removed -->';
export const DEPLOY_EVENT = 'docs-source-pr-preview';
export const CLEANUP_EVENT = 'docs-source-pr-preview-cleanup';
export const DOCS_PREVIEW_LABEL = 'docs-preview';

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

export function wantsPreview(pr) {
	return (
		pr.state === 'open' && Array.isArray(pr.labels) && pr.labels.some((label) => label?.name === DOCS_PREVIEW_LABEL)
	);
}

export function removalReason(pr) {
	return pr.state === 'open' ? 'unlabeled' : 'closed';
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

async function commitExists(github, repo, ref) {
	try {
		await github.rest.repos.getCommit({ owner: OWNER, repo, ref });
		return true;
	} catch (error) {
		if (isNotFound(error) || error?.status === 422) return false;
		throw error;
	}
}

/**
 * What a dispatch asks for, judged against the PR as it is now. A deploy of a PR that does not want a preview
 * or a cleanup of one that does is a `skip`. `error` is a reason the PR cannot be previewed that its author should see.
 */
export async function resolveSource(github, eventType, payload) {
	const source = parsePayload(payload);
	const { data: pr } = await github.rest.pulls.get({
		owner: OWNER,
		repo: source.repo,
		pull_number: source.number,
	});
	const wanted = wantsPreview(pr);
	const base = { ...source, headSha: pr.head.sha, fork: pr.head.repo?.full_name !== source.fullName };
	if (eventType === CLEANUP_EVENT) return { ...base, action: wanted ? 'skip' : 'cleanup' };
	if (eventType !== DEPLOY_EVENT) throw new Error(`unexpected event ${eventType}`);
	if (!wanted) return { ...base, action: 'skip' };
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
		else if (!(await commitExists(github, 'harper', harperSha))) {
			error = `\`core\` points to ${harperSha.slice(0, 10)}, which is not in HarperFast/harper; push it there`;
		}
	}
	return { ...base, action: 'deploy', harperSha: harperSha ?? '', proSha: proSha ?? '', error };
}

export function checkOutputs({ project, headSha, harperSha, proSha, error }) {
	if (!PROJECT.test(project)) throw new Error(`invalid project ${project}`);
	if (!SHA.test(headSha)) throw new Error(`invalid head sha ${headSha}`);
	if (!error && !(SHA.test(harperSha) && SHA.test(proSha))) throw new Error('invalid source shas');
}

export async function readPr(github, source) {
	const { data } = await github.rest.pulls.get({ owner: OWNER, repo: source.repo, pull_number: source.number });
	return data;
}

/**
 * Acts on the PR's current state rather than on what the job's own dispatch asked, since a queued apply job can
 * be replaced by a newer one. The comment is written before any deploy starts, so a PR without one never had a
 * preview.
 */
export function decide({ action, pr, builtHead, buildResult, resolveError, comment }) {
	if (!wantsPreview(pr)) return comment && !comment.body.includes(REMOVED_MARKER) ? 'remove' : 'skip';
	if (action !== 'deploy' || pr.head.sha !== builtHead) return 'skip';
	return resolveError || buildResult !== 'success' ? 'fail' : 'deploy';
}

export async function findComment(github, source, botLogin) {
	const comments = await github.paginate(github.rest.issues.listComments, {
		owner: OWNER,
		repo: source.repo,
		issue_number: source.number,
		per_page: 100,
	});
	// A marker quoted in someone else's comment does not count.
	return comments.find((comment) => comment.user?.login === botLogin && comment.body?.includes(COMMENT_MARKER));
}

export async function upsertComment(github, source, existing, body) {
	const params = { owner: OWNER, repo: source.repo, body };
	if (existing) {
		const { data } = await github.rest.issues.updateComment({ ...params, comment_id: existing.id });
		return data;
	}
	const { data } = await github.rest.issues.createComment({ ...params, issue_number: source.number });
	return data;
}

const short = (sha) => `\`${sha.slice(0, 10)}\``;

export function deployingBody({ headSha, runUrl }) {
	return `${COMMENT_MARKER}
### 📖 Docs preview

Deploying ${short(headSha)} ([build](${runUrl}))…
`;
}

export function readyBody({ url, harperSha, proSha, runUrl }) {
	return `${COMMENT_MARKER}
### 📖 Docs preview

${url}

Built from harper ${short(harperSha)} and harper-pro ${short(proSha)} ([build](${runUrl})). Updates on each push to this PR while it has the \`${DOCS_PREVIEW_LABEL}\` label; removed when the label is removed or the PR closes.
`;
}

export function failedBody({ headSha, reason, url, runUrl }) {
	return `${COMMENT_MARKER}
### 📖 Docs preview failed

${short(headSha)} was not previewed: ${reason} ([build](${runUrl})). ${url} keeps the last preview that deployed, if any. The next push to this PR tries again.
`;
}

export function removedBody(reason = 'closed') {
	const why = reason === 'unlabeled' ? `the \`${DOCS_PREVIEW_LABEL}\` label was removed` : 'this PR closed';
	return `${COMMENT_MARKER}
${REMOVED_MARKER}
### 📖 Docs preview removed

The preview was removed because ${why}.
`;
}
