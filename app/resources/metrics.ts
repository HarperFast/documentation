// Metrics recording endpoint: the validation CLIs (search-eval, parity) POST
// their results here after a run, so the admin Validation panel can chart the
// trend. Authenticated the same way as /Ingest (admin/super_user Basic auth).
//
// Protocol (POST /Metrics, authenticated):
//   {action:'record-eval',   gitSha, mrr, recall5, recall10, zeroRate, cases, weak?, passed?}
//   {action:'record-parity', gitSha, pages, titlesOk, redirectsOk, simMedian, simMin, hardFailures, strict?, passed}

import { Resource, tables } from '../lib/harper.ts';

const { EvalRun, ParityRun } = tables;

function newId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class Metrics extends Resource {
	static async post(_target: any, data: any): Promise<any> {
		const body = await data;
		switch (body.action) {
			case 'record-eval': {
				const id = newId();
				await EvalRun.put({
					id,
					gitSha: body.gitSha ?? '',
					mrr: body.mrr ?? null,
					recall5: body.recall5 ?? null,
					recall10: body.recall10 ?? null,
					zeroRate: body.zeroRate ?? null,
					cases: body.cases ?? null,
					weak: body.weak ?? 0,
					passed: body.passed ?? null,
				});
				return { ok: true, id };
			}
			case 'record-parity': {
				const id = newId();
				await ParityRun.put({
					id,
					gitSha: body.gitSha ?? '',
					pages: body.pages ?? null,
					titlesOk: body.titlesOk ?? null,
					redirectsOk: body.redirectsOk ?? null,
					simMedian: body.simMedian ?? null,
					simMin: body.simMin ?? null,
					hardFailures: body.hardFailures ?? null,
					strict: body.strict ?? false,
					passed: body.passed ?? null,
				});
				return { ok: true, id };
			}
			default:
				return { ok: false, error: `unknown action: ${body.action}` };
		}
	}
}
