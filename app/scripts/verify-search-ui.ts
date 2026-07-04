// Browser verification of the search modal — drives it as a user would and
// asserts behavior. Run: node scripts/verify-search-ui.mjs
import { chromium } from 'playwright';

interface Check {
	name: string;
	pass: boolean;
	detail: string;
}

const BASE = process.env.TARGET ?? 'http://127.0.0.1:9936';
const SHOT = '/private/tmp/claude-502/-Users-kyle-WebstormProjects-documentation/7b0d632b-0ac2-4089-be53-454dee763f41/scratchpad';
const results: Check[] = [];
const ok = (name: string, cond: unknown, detail = ''): void => {
	results.push({ name, pass: !!cond, detail });
	console.log(`${cond ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });

// Type a query and wait until the rendered results actually reflect IT, not a
// stale prior render. Clear first so the wait can't satisfy on old results,
// then wait for the list to be non-empty and (optionally) contain an expected
// path — and settle past the debounce so `active` is stable before we act.
async function query(text: string, expectPathIncludes?: string): Promise<void> {
	await page.fill('.search-input', '');
	await page.waitForFunction(() => document.querySelectorAll('.search-result').length === 0, { timeout: 4000 });
	await page.fill('.search-input', text);
	await page.waitForFunction(
		(needle) => {
			const links = [...document.querySelectorAll('.search-result a')].map((a) => a.getAttribute('href')!);
			return links.length > 0 && (!needle || links.some((h) => h.includes(needle)));
		},
		expectPathIncludes,
		{ timeout: 4000 }
	);
	await page.waitForTimeout(200);
}

// Land on a reference/v5 page so contextual scope = reference/v5.
await page.goto(`${BASE}/reference/v5/database/schema`, { waitUntil: 'networkidle' });

// 1. ⌘K opens the modal.
await page.keyboard.press('Meta+k');
await page.waitForSelector('.search-overlay:not([hidden])', { timeout: 3000 });
ok('Cmd-K opens modal', await page.isVisible('.search-input'));

// 2. Typing runs a scoped query and renders results.
await query('vector index', '/reference/v5');
const scoped = await page.$$eval('.search-result', (els) => els.map((e) => e.querySelector('a')!.getAttribute('href')!));
ok('results render for query', scoped.length > 0, `${scoped.length} results`);
ok('contextual scope = reference/v5', scoped.every((h) => h.startsWith('/reference/v5')), scoped[0]);
await page.screenshot({ path: `${SHOT}/ui-1-scoped.png` });

// 3. "All docs" toggle broadens scope (learn/release-notes pages appear).
await page.check('.search-allscope');
await page.waitForTimeout(400);
const all = await page.$$eval('.search-result', (els) => els.map((e) => e.querySelector('a')!.getAttribute('href')!));
ok('all-docs toggle broadens scope', all.some((h) => !h.startsWith('/reference/v5')), `${all.length} results`);
await page.screenshot({ path: `${SHOT}/ui-2-alldocs.png` });

// 4. Keyboard navigation moves the active result.
await page.uncheck('.search-allscope');
await query('authentication');
const firstActive = await page.$eval('.search-result.active', (e) => e.querySelector('a')!.getAttribute('href')!);
await page.keyboard.press('ArrowDown');
const afterDown = await page.$eval('.search-result.active', (e) => e.querySelector('a')!.getAttribute('href')!);
ok('ArrowDown moves selection', firstActive !== afterDown, `${firstActive} → ${afterDown}`);

// 5. Typo query still resolves (trigram fuzzy end-to-end through the UI).
await query('authentcation');
const typo = await page.$$eval('.search-result', (els) => els.length);
ok('typo query returns results in UI', typo > 0, `${typo} results for "authentcation"`);
await page.screenshot({ path: `${SHOT}/ui-3-typo.png` });

// 6. Enter navigates to the active result.
await query('jwt token', '/reference/v5/security/jwt-authentication');
const target = await page.$eval('.search-result.active', (e) => e.querySelector('a')!.getAttribute('href')!);
const base = target.split('#')[0];
await Promise.all([page.waitForURL((u) => u.pathname === base, { timeout: 5000 }).catch(() => {}), page.keyboard.press('Enter')]);
ok('Enter navigates to result', new URL(page.url()).pathname === base, page.url());

// 7. Esc closes the modal.
await page.goto(`${BASE}/learn`, { waitUntil: 'networkidle' });
await page.click('#search-trigger');
await page.waitForSelector('.search-overlay:not([hidden])');
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
ok('Esc closes modal', await page.isHidden('.search-input'));

// 8. Scope follows the page: on /learn, default scope is learn.
await page.click('#search-trigger');
await query('application', '/learn');
const learnScoped = await page.$$eval('.search-result', (els) => els.map((e) => e.querySelector('a')!.getAttribute('href')!));
ok('scope tracks current section (learn)', learnScoped.every((h) => h.startsWith('/learn')), learnScoped[0]);
await page.screenshot({ path: `${SHOT}/ui-4-learn-scope.png`, fullPage: false });

await browser.close();
const passed = results.filter((r) => r.pass).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
