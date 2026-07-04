// Shared metrics-recording client for the validation CLIs (search-eval, parity).
// Posts a result row to the authenticated /Metrics endpoint so the admin
// Validation panel can chart the trend. Recording is best-effort — a failure
// here must never fail the underlying eval/parity run.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';

// Admin Basic-auth credentials: env first, then the shared credentials file.
// Returns a base64 `user:pass` string, or null when no credentials are found.
export function loadCreds(): string | null {
	let user = process.env.HARPER_CLI_USERNAME;
	let pass = process.env.HARPER_CLI_PASSWORD;
	if (!user || !pass) {
		try {
			const credFile = path.join(homedir(), 'hdb-docs-replatform', '.admin-credentials');
			for (const line of readFileSync(credFile, 'utf8').split('\n')) {
				const eq = line.indexOf('=');
				if (eq < 0) continue;
				const k = line.slice(0, eq).trim();
				const v = line.slice(eq + 1).trim();
				if (k === 'HARPER_CLI_USERNAME') user = v;
				if (k === 'HARPER_CLI_PASSWORD') pass = v;
			}
		} catch {
			// no credentials file — fall through
		}
	}
	if (!user || !pass) return null;
	return Buffer.from(`${user}:${pass}`).toString('base64');
}

// Short git SHA of the working tree, or '' when unavailable.
export function gitSha(cwd: string = process.cwd()): string {
	try {
		return execSync('git rev-parse --short HEAD', { cwd }).toString().trim();
	} catch {
		return '';
	}
}

// POST a metrics row to /Metrics. Best-effort: logs a warning and returns on any
// failure rather than throwing.
export async function recordMetric(target: string, body: Record<string, any>): Promise<void> {
	const creds = loadCreds();
	if (!creds) {
		console.warn('  (metrics not recorded: no credentials)');
		return;
	}
	try {
		const res = await fetch(`${target}/Metrics`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: `Basic ${creds}` },
			body: JSON.stringify(body),
		});
		if (!res.ok) console.warn(`  (metrics record failed: HTTP ${res.status})`);
	} catch (err: any) {
		console.warn(`  (metrics record failed: ${err.message})`);
	}
}
