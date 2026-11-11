#!/usr/bin/env node

/**
 * Preview a PR's build artifact locally
 * Usage: node scripts/preview-pr.mjs <PR_NUMBER>
 *
 * SECURITY WARNING:
 * This script downloads and serves built artifacts from GitHub Actions.
 * Only use this with PRs from trusted contributors, as the built files
 * may contain arbitrary JavaScript that will execute in your browser.
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const PR_NUMBER = process.argv[2];
const SKIP_CONFIRMATION = process.argv.includes('--yes') || process.argv.includes('-y');

if (!PR_NUMBER || !/^\d+$/.test(PR_NUMBER)) {
	console.error('Usage: node scripts/preview-pr.mjs <PR_NUMBER> [--yes]');
	process.exit(1);
}

/**
 * Sanitize shell arguments to prevent command injection
 */
function sanitizeShellArg(arg) {
	// Only allow alphanumeric, hyphens, underscores, slashes, and dots
	if (!/^[a-zA-Z0-9\-_/.]+$/.test(arg)) {
		throw new Error(`Invalid characters in argument: ${arg}`);
	}
	return arg;
}

/**
 * Prompt user for confirmation
 */
async function confirm(message) {
	if (SKIP_CONFIRMATION) return true;

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(`${message} (y/N): `, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
		});
	});
}

const PREVIEW_DIR = join(process.cwd(), '.preview');
const PR_DIR = join(PREVIEW_DIR, `pr-${PR_NUMBER}`);
const BUILD_DIR = join(PR_DIR, 'build');

async function main() {
	console.log(`📦 Fetching PR #${PR_NUMBER} build artifact...\n`);

	try {
		// Get the PR's branch name and author info
		const prInfo = JSON.parse(
			execSync(`gh pr view ${PR_NUMBER} --json headRefName,author,title,url,isDraft,commits`, { encoding: 'utf-8' })
		);

		if (!prInfo.headRefName) {
			console.error(`❌ Could not find PR #${PR_NUMBER}`);
			process.exit(1);
		}

		// Sanitize branch name to prevent command injection
		const sanitizedBranch = sanitizeShellArg(prInfo.headRefName);

		console.log(`\n📋 PR Information:`);
		console.log(`   Number: #${PR_NUMBER}`);
		console.log(`   Title: ${prInfo.title}`);
		console.log(`   Author: ${prInfo.author.login}`);
		console.log(`   Branch: ${prInfo.headRefName}`);
		console.log(`   URL: ${prInfo.url}`);
		console.log(`   Draft: ${prInfo.isDraft ? 'Yes' : 'No'}`);

		console.log(`\n⚠️  SECURITY WARNING:`);
		console.log(`   This will download and serve built files that may contain arbitrary code.`);
		console.log(`   Only proceed if you trust the PR author: ${prInfo.author.login}`);
		console.log(`   The built site will execute JavaScript in your browser.\n`);

		const shouldContinue = await confirm('Do you want to continue?');
		if (!shouldContinue) {
			console.log('❌ Aborted by user');
			process.exit(0);
		}

		console.log(`\n✓ PR branch: ${prInfo.headRefName}`);

		// The newest successful build of this PR's branch (using sanitized branch name) at one of its
		// commits: a later PR can reuse the branch name. The API lists a workflow's runs newest first.
		const prCommits = new Set(prInfo.commits.map((commit) => commit.oid));
		const run = JSON.parse(
			execSync(
				`gh api repos/HarperFast/documentation/actions/workflows/preview-build.yaml/runs -X GET -f branch=${sanitizedBranch} -f status=success -f per_page=100 --jq '[.workflow_runs[] | {id, head_sha}]'`,
				{ encoding: 'utf-8' }
			)
		).find((candidate) => prCommits.has(candidate.head_sha));

		if (!run) {
			console.error(`❌ No successful workflow run found for PR #${PR_NUMBER}`);
			console.log('\nMake sure:');
			console.log('  1. The PR number is correct');
			console.log('  2. The PR has a successful build');
			console.log('  3. The build artifact exists');
			process.exit(1);
		}

		console.log(`✓ Found workflow run: ${run.id}`);

		// Validate workflow run ID is numeric
		if (!/^\d+$/.test(String(run.id))) {
			throw new Error('Invalid workflow run ID format');
		}

		// Get the artifacts for this run
		const artifacts = JSON.parse(
			execSync(`gh api repos/HarperFast/documentation/actions/runs/${run.id}/artifacts --jq '.artifacts'`, {
				encoding: 'utf-8',
			})
		);

		const artifactName = `pr-${PR_NUMBER}-build`;
		const artifact = artifacts.find((a) => a.name === artifactName);

		if (!artifact) {
			console.error(`❌ No '${artifactName}' artifact found for this PR`);
			process.exit(1);
		}

		// Validate artifact ID is numeric
		if (!/^\d+$/.test(String(artifact.id))) {
			throw new Error('Invalid artifact ID format');
		}

		const sizeMB = (artifact.size_in_bytes / 1024 / 1024).toFixed(2);
		console.log(`✓ Found artifact: ${artifact.name} (${sizeMB} MB)`);

		// Warn about large artifacts
		if (artifact.size_in_bytes > 100 * 1024 * 1024) {
			console.log(`\n⚠️  WARNING: Large artifact detected (${sizeMB} MB)`);
			const proceedLarge = await confirm('Artifact is unusually large. Continue?');
			if (!proceedLarge) {
				console.log('❌ Aborted by user');
				process.exit(0);
			}
		}

		// Create preview directory
		if (existsSync(PR_DIR)) {
			console.log(`\n🧹 Cleaning up existing preview for PR #${PR_NUMBER}...`);
			rmSync(PR_DIR, { recursive: true, force: true });
		}
		mkdirSync(PR_DIR, { recursive: true });

		// Download the artifact
		console.log('⬇️  Downloading artifact...');
		const artifactZip = join(PR_DIR, 'artifact.zip');
		execSync(`gh api repos/HarperFast/documentation/actions/artifacts/${artifact.id}/zip > "${artifactZip}"`, {
			stdio: 'inherit',
		});

		// Verify the downloaded file exists and is non-empty
		if (!existsSync(artifactZip)) {
			throw new Error('Downloaded artifact file not found');
		}

		// Extract the artifact (it's a direct zip of the build directory)
		console.log('📂 Extracting artifact...');
		mkdirSync(BUILD_DIR, { recursive: true });
		execSync(`unzip -q "${artifactZip}" -d "${BUILD_DIR}"`, { stdio: 'inherit' });

		// Verify extracted files are within expected directory
		const resolvedBuildDir = join(BUILD_DIR);
		if (!resolvedBuildDir.startsWith(PREVIEW_DIR)) {
			throw new Error('Security violation: extracted files outside preview directory');
		}

		// Clean up zip file
		rmSync(artifactZip, { force: true });

		console.log('\n✅ Preview ready!\n');
		console.log(`📁 Build location: ${BUILD_DIR}`);
		console.log(`\n⚠️  REMINDER: Only interact with the preview if you trust the PR author.`);
		console.log(`             Do not enter sensitive information in the preview.\n`);

		const startServer = await confirm('Start preview server?');
		if (!startServer) {
			console.log(`\n💡 You can manually serve the build later with:`);
			console.log(`   npm run serve -- --dir "${BUILD_DIR}"`);
			process.exit(0);
		}

		console.log(`\n🚀 Starting preview server...\n`);

		// Start the server with quoted path to prevent injection
		// Previews build with the default base URL (/), so serve with it too.
		execSync(`npm run serve -- --dir "${BUILD_DIR}"`, {
			stdio: 'inherit',
			env: { ...process.env, DOCUSAURUS_BASE_URL: '/' },
		});
	} catch (error) {
		console.error('\n❌ Error:', error.message);
		process.exit(1);
	}
}

// Run the main function
main();
