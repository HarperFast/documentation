// Server-rendered admin dashboards for docs observability. Pure HTML + inline
// SVG (no client JS) so it works under the site's strict CSP. Auth (Google
// OAuth + domain allowlist) is enforced by the caller in resources/site.js.
//
// Three tabs share one shell: Ingest, Search, Validation.

export interface SearchAnalytics {
	totals: { queries: number; zeroResult: number; zeroRate: number; windowDays: number };
	topTerms: Array<{ query: string; count: number; zero: boolean }>; // pre-sorted desc, ~15
	zeroResult: Array<{ query: string; count: number }>; // pre-sorted desc, ~15
	volume: Array<{ day: string; count: number }>; // chronological, day = 'YYYY-MM-DD'
	bySection: Array<{ section: string; count: number }>; // pre-sorted desc
}

export interface EvalRunRow {
	id: string;
	gitSha: string;
	mrr: number;
	recall5: number;
	recall10: number;
	zeroRate: number;
	cases: number;
	weak: number;
	passed: boolean | null;
	createdAt: string | number;
}

export interface EvalTrend {
	latest: EvalRunRow | null;
	runs: EvalRunRow[]; // newest-first
}

export interface ParityRunRow {
	id: string;
	gitSha: string;
	pages: number;
	titlesOk: number;
	redirectsOk: number;
	simMedian: number;
	simMin: number;
	hardFailures: number;
	strict: boolean;
	passed: boolean;
	createdAt: string | number;
}

export interface ParityTrend {
	latest: ParityRunRow | null;
	runs: ParityRunRow[]; // newest-first
}

export interface ChatEvalRunRow {
	id: string;
	gitSha: string;
	recall: number; // Recall@K
	mrr: number;
	cases: number;
	multiTurn: number; // how many cases exercise the multi-turn condenser
	passed: boolean | null;
	createdAt: string | number;
}

export interface ChatEvalTrend {
	latest: ChatEvalRunRow | null;
	runs: ChatEvalRunRow[]; // newest-first
}

export interface ChatRecent {
	question: string;
	answerPreview: string;
	sources: number;
	model: string;
	latencyMs: number;
	grounded: boolean;
	createdAt: string | number;
}

export interface ChatFlagged {
	question: string;
	faithfulness: number;
	note: string;
	createdAt: string | number;
}

export interface ChatAnalytics {
	totals: {
		chats: number;
		grounded: number;
		groundedRate: number;
		cacheHits: number; // answers served from the ChatCache (no generation)
		cacheHitRate: number; // cacheHits / chats
		avgLatencyMs: number;
		windowDays: number;
		avgFaithfulness: number; // over scored answers
		scored: number; // answers with a faithfulness score
		flaggedCount: number; // answers below the flag threshold
	};
	topQuestions: Array<{ question: string; count: number }>; // pre-sorted desc
	volume: Array<{ day: string; count: number }>; // chronological
	byModel: Array<{ model: string; count: number }>; // pre-sorted desc
	feedback: { up: number; down: number; none: number };
	flagged: ChatFlagged[]; // low-faithfulness answers, newest-first
	recent: ChatRecent[]; // newest-first
}

interface StatusStyle {
	color: string;
	bg: string;
	label: string;
}

interface Card {
	label: string;
	value?: string | number;
	color?: string;
	html?: string;
}

const STATUS: Record<string, StatusStyle> = {
	activated: { color: '#128a6c', bg: '#e4f5ef', label: 'activated' },
	rejected: { color: '#a06a14', bg: '#faf1de', label: 'rejected' },
	failed: { color: '#b3261e', bg: '#fce8e6', label: 'failed' },
	running: { color: '#5a5772', bg: '#ecebf6', label: 'running' },
};
const statusOf = (s: string): StatusStyle => STATUS[s] ?? STATUS.running;

// Brand accent used for SVG fills (CSS uses var(--brand, #403b8a)).
const BRAND = '#403b8a';

// ── Shared shell ──────────────────────────────────────────────────────────

type Tab = 'ingest' | 'search' | 'validation' | 'chat';

function shell(active: Tab, bodyHtml: string, title: string): string {
	const tabs: Array<{ id: Tab; label: string; href: string }> = [
		{ id: 'ingest', label: 'Ingest', href: '/admin/ingest' },
		{ id: 'search', label: 'Search', href: '/admin/search' },
		{ id: 'validation', label: 'Validation', href: '/admin/validation' },
		{ id: 'chat', label: 'Chat', href: '/admin/chat' },
	];
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Harper Docs Admin</title>
<link rel="stylesheet" href="/assets/styles.css">
<link rel="stylesheet" href="/assets/admin.css">
</head>
<body class="admin">
<header class="admin-header">
	<div><span class="admin-eyebrow">Harper Docs · Admin</span><h1>${esc(title)}</h1></div>
	<a class="admin-home" href="/">← Docs</a>
</header>
<nav class="admin-tabs">
	${tabs.map((t) => `<a class="admin-tab${t.id === active ? ' is-active' : ''}" href="${t.href}">${esc(t.label)}</a>`).join('')}
</nav>
${bodyHtml}
</body>
</html>`;
}

// ── Ingest dashboard ────────────────────────────────────────────────────────

export function renderIngestDashboard(runs: any[]): string {
	// runs: newest first. Summary + duration chart + table.
	const total = runs.length;
	const counts: Record<string, number> = { activated: 0, rejected: 0, failed: 0, running: 0 };
	for (const r of runs) counts[r.status] = (counts[r.status] ?? 0) + 1;
	const durations = runs.filter((r) => r.durationMs != null).map((r) => r.durationMs);
	const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
	const latest = runs[0];

	const cards: Card[] = [
		{ label: 'Total runs', value: total },
		{ label: 'Activated', value: counts.activated, color: STATUS.activated.color },
		{ label: 'Rejected / failed', value: counts.rejected + counts.failed, color: STATUS.rejected.color },
		{ label: 'Avg duration', value: fmtDuration(avgMs) },
		{
			label: 'Latest',
			value: latest ? statusOf(latest.status).label : '—',
			color: latest ? statusOf(latest.status).color : undefined,
		},
	];

	const body = `<section class="admin-cards">
	${cardsHtml(cards)}
</section>
<section class="admin-panel">
	<h2>Duration by run <span class="admin-sub">most recent ${Math.min(runs.length, 24)}</span></h2>
	${durationChart(runs.slice(0, 24))}
</section>
<section class="admin-panel">
	<h2>Runs</h2>
	<div class="admin-table-scroll">
	<table class="admin-table">
		<thead><tr><th>Release</th><th>Status</th><th class="num">Pages</th><th class="num">Chunks</th><th class="num">Terms</th><th class="num">Pruned</th><th class="num">Duration</th><th>Started</th><th>Notes</th></tr></thead>
		<tbody>
		${
			runs.length
				? runs.map((r) => row(r)).join('')
				: '<tr><td colspan="9" class="admin-empty">No ingest runs recorded yet.</td></tr>'
		}
		</tbody>
	</table>
	</div>
</section>`;

	return shell('ingest', body, 'Ingest Observability');
}

function row(r: any): string {
	const s = statusOf(r.status);
	const guard = r.guard?.actual ? `${r.guard.actual.pages}p/${r.guard.actual.nav}n/${r.guard.actual.redirects}r` : '';
	const note = r.error
		? `<span class="admin-note-err">${esc(r.error)}</span>`
		: guard
			? `<span class="admin-note">${esc(guard)}</span>`
			: '';
	return `<tr>
		<td class="admin-mono">${esc(shortRelease(r.id))}</td>
		<td><span class="admin-pill" style="color:${s.color};background:${s.bg}">${s.label}</span></td>
		<td class="num">${num(r.pages)}</td>
		<td class="num">${num(r.chunks)}</td>
		<td class="num">${num(r.terms)}</td>
		<td class="num">${num(r.pruned)}</td>
		<td class="num">${r.durationMs != null ? fmtDuration(r.durationMs) : '—'}</td>
		<td class="admin-when">${esc(fmtWhen(r.startedAt))}</td>
		<td>${note}</td>
	</tr>`;
}

// Horizontal bar chart of durations, colored by status. Inline SVG, no JS.
function durationChart(runs: any[]): string {
	if (!runs.length) return '<div class="admin-empty">No runs to chart.</div>';
	const withDur = runs.filter((r) => r.durationMs != null);
	if (!withDur.length) return '<div class="admin-empty">No completed runs yet.</div>';
	const max = Math.max(...withDur.map((r) => r.durationMs), 1);
	const rowH = 22;
	const gap = 6;
	const labelW = 96;
	const chartW = 620;
	const barMax = chartW - labelW - 60;
	const h = runs.length * (rowH + gap);
	const bars = runs
		.map((r, i) => {
			const y = i * (rowH + gap);
			const s = statusOf(r.status);
			const w = r.durationMs != null ? Math.max(2, (r.durationMs / max) * barMax) : 0;
			const label = shortRelease(r.id);
			const val = r.durationMs != null ? fmtDuration(r.durationMs) : statusOf(r.status).label;
			return `<g transform="translate(0,${y})">
				<text x="0" y="${rowH / 2 + 4}" class="c-label">${esc(label)}</text>
				<rect x="${labelW}" y="2" width="${w}" height="${rowH - 4}" rx="3" fill="${s.color}"></rect>
				<text x="${labelW + w + 6}" y="${rowH / 2 + 4}" class="c-val">${esc(val)}</text>
			</g>`;
		})
		.join('');
	return `<svg class="admin-chart" viewBox="0 0 ${chartW} ${h}" width="100%" height="${h}" role="img" aria-label="Ingest duration by run">${bars}</svg>`;
}

// ── Search dashboard ────────────────────────────────────────────────────────

export function renderSearchDashboard(a: SearchAnalytics): string {
	const t = a.totals;
	const cards: Card[] = [
		{ label: 'Total queries', value: num(t.queries) },
		{ label: 'Zero-result', value: num(t.zeroResult), color: STATUS.rejected.color },
		{ label: 'Zero-result rate', value: `${pct(t.zeroRate)}%`, color: STATUS.rejected.color },
		{ label: 'Window', value: `${num(t.windowDays)} days` },
	];

	const body = `<section class="admin-cards">
	${cardsHtml(cards)}
</section>
<section class="admin-panel">
	<h2>Top queries <span class="admin-sub">${a.topTerms.length}</span></h2>
	${barList(
		a.topTerms.map((it) => ({ label: it.query, value: it.count, warn: it.zero })),
		'No queries recorded yet.',
	)}
</section>
<section class="admin-panel">
	<h2>Content gaps <span class="admin-sub">zero-result</span></h2>
	${barList(
		a.zeroResult.map((it) => ({ label: it.query, value: it.count, warn: true })),
		'No zero-result queries — every search found something.',
	)}
</section>
<section class="admin-panel">
	<h2>Query volume <span class="admin-sub">per day</span></h2>
	${volumeChart(a.volume)}
</section>
<section class="admin-panel">
	<h2>By section</h2>
	${barList(
		a.bySection.map((it) => ({ label: it.section, value: it.count })),
		'No section data yet.',
	)}
</section>`;

	return shell('search', body, 'Search Analytics');
}

// ── Validation dashboard ────────────────────────────────────────────────────

export function renderValidationDashboard(ev: EvalTrend, par: ParityTrend, chat: ChatEvalTrend): string {
	// Search relevance (golden set).
	let evalBody: string;
	if (ev.latest && ev.runs.length) {
		const e = ev.latest;
		const cards: Card[] = [
			{ label: 'MRR', value: e.mrr.toFixed(3) },
			{ label: 'Recall@5', value: `${pct(e.recall5)}%` },
			{ label: 'Recall@10', value: `${pct(e.recall10)}%` },
			{ label: '0-result rate', value: `${pct(e.zeroRate)}%`, color: STATUS.rejected.color },
			{ label: 'Cases', value: num(e.cases) },
			{ label: 'Result', html: passPill(e.passed) },
		];
		const mrr = ev.runs.map((r) => r.mrr).reverse();
		evalBody = `<div class="admin-cards">
	${cardsHtml(cards)}
</div>
${sparkline(mrr, 0, 1, (n) => n.toFixed(3), 'MRR across eval runs')}`;
	} else {
		evalBody = '<div class="admin-empty">No golden-set eval runs recorded yet.</div>';
	}

	// Content parity.
	let parBody: string;
	if (par.latest && par.runs.length) {
		const p = par.latest;
		const cards: Card[] = [
			{ label: 'Pages', value: num(p.pages) },
			{ label: 'Similarity median', value: `${pct(p.simMedian)}%` },
			{ label: 'Similarity min', value: `${pct(p.simMin)}%` },
			{
				label: 'Hard failures',
				value: num(p.hardFailures),
				color: p.hardFailures > 0 ? STATUS.rejected.color : undefined,
			},
			{ label: `Result${p.strict ? ' · strict' : ''}`, html: passPill(p.passed) },
		];
		const sims = par.runs.map((r) => r.simMedian).reverse();
		parBody = `<div class="admin-cards">
	${cardsHtml(cards)}
</div>
${sparkline(sims, 0, 1, (n) => `${pct(n)}%`, 'Similarity median across parity runs')}`;
	} else {
		parBody = '<div class="admin-empty">No content-parity runs recorded yet.</div>';
	}

	// Chat grounding (RAG retrieval golden set — the chat analogue of search relevance).
	let chatBody: string;
	if (chat.latest && chat.runs.length) {
		const c = chat.latest;
		const cards: Card[] = [
			{ label: `Recall@K`, value: `${pct(c.recall)}%` },
			{ label: 'MRR', value: c.mrr.toFixed(3) },
			{ label: 'Cases', value: num(c.cases) },
			{ label: 'Multi-turn', value: num(c.multiTurn) },
			{ label: 'Result', html: passPill(c.passed) },
		];
		const recalls = chat.runs.map((r) => r.recall).reverse();
		chatBody = `<div class="admin-cards">
	${cardsHtml(cards)}
</div>
${sparkline(recalls, 0, 1, (n) => `${pct(n)}%`, 'Recall@K across chat-grounding runs')}`;
	} else {
		chatBody = '<div class="admin-empty">No chat-grounding runs recorded yet.</div>';
	}

	const body = `<section class="admin-panel">
	<h2>Search relevance <span class="admin-sub">golden set</span></h2>
	${evalBody}
</section>
<section class="admin-panel">
	<h2>Chat grounding <span class="admin-sub">RAG retrieval golden set</span></h2>
	${chatBody}
</section>
<section class="admin-panel">
	<h2>Content parity</h2>
	${parBody}
</section>`;

	return shell('validation', body, 'Validation');
}

// ── Chat dashboard ───────────────────────────────────────────────────────────

export function renderChatDashboard(a: ChatAnalytics): string {
	const t = a.totals;
	const cards: Card[] = [
		{ label: 'Total chats', value: num(t.chats) },
		{ label: 'Grounded', value: `${pct(t.groundedRate)}%`, color: STATUS.activated.color },
		{
			label: 'Avg faithfulness',
			value: t.scored ? `${pct(t.avgFaithfulness)}%` : '—',
			color: t.scored && t.avgFaithfulness < 0.85 ? STATUS.rejected.color : STATUS.activated.color,
		},
		{
			label: 'Flagged',
			value: num(t.flaggedCount),
			color: t.flaggedCount > 0 ? STATUS.rejected.color : undefined,
		},
		{ label: 'Cache hit rate', value: `${pct(t.cacheHitRate)}%`, color: STATUS.activated.color },
		{ label: 'Avg latency', value: fmtDuration(t.avgLatencyMs) },
		{ label: 'Window', value: `${t.windowDays} days` },
	];
	const models = a.byModel.map((m) => ({ label: m.model, value: m.count }));
	const feedback = [
		{ label: 'helpful', value: a.feedback.up },
		{ label: 'not helpful', value: a.feedback.down, warn: a.feedback.down > 0 },
		{ label: 'no rating', value: a.feedback.none },
	];
	const recentRows = a.recent.length
		? a.recent.map((r) => rowChat(r)).join('')
		: '<tr><td colspan="6" class="admin-empty">No chats recorded yet.</td></tr>';

	const body = `<section class="admin-cards">
	${cardsHtml(cards)}
</section>
<section class="admin-panel">
	<h2>Top questions <span class="admin-sub">most asked</span></h2>
	${barList(
		a.topQuestions.map((q) => ({ label: q.question, value: q.count })),
		'No questions yet.'
	)}
</section>
<section class="admin-panel">
	<h2>Chat volume <span class="admin-sub">per day</span></h2>
	${volumeChart(a.volume)}
</section>
<section class="admin-panel">
	<h2>Model</h2>
	${barList(models, 'No chats yet.')}
</section>
<section class="admin-panel">
	<h2>Feedback</h2>
	${barList(feedback, 'No feedback yet.')}
</section>
<section class="admin-panel">
	<h2>Flagged answers <span class="admin-sub">low faithfulness — likely hallucination, review these</span></h2>
	<div class="admin-table-scroll">
	<table class="admin-table">
		<thead><tr><th>Question</th><th class="num">Faithfulness</th><th>Unsupported claim</th><th>When</th></tr></thead>
		<tbody>
		${
			a.flagged.length
				? a.flagged.map((f) => rowFlagged(f)).join('')
				: `<tr><td colspan="4" class="admin-empty">${t.scored ? 'No flagged answers — all scored answers are well-grounded.' : 'No faithfulness scores yet (needs a live model + traffic).'}</td></tr>`
		}
		</tbody>
	</table>
	</div>
</section>
<section class="admin-panel">
	<h2>Recent conversations</h2>
	<div class="admin-table-scroll">
	<table class="admin-table">
		<thead><tr><th>Question</th><th class="num">Sources</th><th>Model</th><th class="num">Latency</th><th>Grounded</th><th>When</th></tr></thead>
		<tbody>
		${recentRows}
		</tbody>
	</table>
	</div>
</section>`;

	return shell('chat', body, 'Chat');
}

function rowFlagged(f: ChatFlagged): string {
	return `<tr>
		<td>${esc((f.question ?? '').slice(0, 80))}</td>
		<td class="num"><span class="admin-pill" style="color:${STATUS.rejected.color};background:${STATUS.rejected.bg}">${pct(f.faithfulness)}%</span></td>
		<td>${esc((f.note ?? '').slice(0, 120))}</td>
		<td class="admin-when">${esc(fmtWhen(f.createdAt))}</td>
	</tr>`;
}

function rowChat(r: ChatRecent): string {
	const g = r.grounded ? STATUS.activated : STATUS.rejected;
	const gLabel = r.grounded ? 'grounded' : 'no context';
	return `<tr>
		<td>${esc((r.question ?? '').slice(0, 90))}</td>
		<td class="num">${num(r.sources)}</td>
		<td class="admin-mono">${esc(r.model)}</td>
		<td class="num">${r.latencyMs != null ? fmtDuration(r.latencyMs) : '—'}</td>
		<td><span class="admin-pill" style="color:${g.color};background:${g.bg}">${gLabel}</span></td>
		<td class="admin-when">${esc(fmtWhen(r.createdAt))}</td>
	</tr>`;
}

// ── Pill / card helpers ─────────────────────────────────────────────────────

function passPill(passed: boolean | null): string {
	if (passed == null) return '<span class="admin-pill" style="color:#909098;background:#f0f0f3">n/a</span>';
	const s = passed ? STATUS.activated : STATUS.rejected;
	return `<span class="admin-pill" style="color:${s.color};background:${s.bg}">${passed ? 'pass' : 'fail'}</span>`;
}

function cardsHtml(cards: Card[]): string {
	return cards
		.map(
			(c) =>
				`<div class="admin-card"><div class="admin-card-value"${c.color ? ` style="color:${c.color}"` : ''}>${c.html ?? esc(c.value)}</div><div class="admin-card-label">${esc(c.label)}</div></div>`,
		)
		.join('');
}

// ── Chart helpers ────────────────────────────────────────────────────────────

// CSS horizontal bar list. Warn entries use the rejected accent.
function barList(items: Array<{ label: string; value: number; warn?: boolean }>, emptyMsg: string): string {
	if (!items.length) return `<div class="admin-empty">${esc(emptyMsg)}</div>`;
	const max = Math.max(...items.map((i) => i.value), 1);
	const rows = items
		.map((it) => {
			const w = Math.max(2, (it.value / max) * 100);
			return `<li class="admin-bar-row${it.warn ? ' is-warn' : ''}">
			<span class="admin-bar-label" title="${esc(it.label)}">${esc(it.label)}</span>
			<span class="admin-bar-track"><span class="admin-bar-fill" style="width:${w.toFixed(1)}%"></span></span>
			<span class="admin-bar-val">${num(it.value)}</span>
		</li>`;
		})
		.join('');
	return `<ul class="admin-bars">${rows}</ul>`;
}

// Vertical bar chart, one bar per day. Inline SVG, no JS.
function volumeChart(vol: Array<{ day: string; count: number }>): string {
	if (!vol.length) return '<div class="admin-empty">No query volume yet.</div>';
	const max = Math.max(...vol.map((v) => v.count), 1);
	const barW = 22;
	const gap = 8;
	const chartH = 150;
	const padTop = 12;
	const padBottom = 22;
	const plotH = chartH - padTop - padBottom;
	const w = Math.max(vol.length * (barW + gap) - gap, 1);
	const bars = vol
		.map((v, i) => {
			const x = i * (barW + gap);
			const bh = Math.max(1, (v.count / max) * plotH);
			const y = padTop + (plotH - bh);
			const dd = v.day.slice(8, 10);
			return `<g>
			<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="2" fill="${BRAND}"></rect>
			<text x="${x + barW / 2}" y="${chartH - 6}" class="c-axis" text-anchor="middle">${esc(dd)}</text>
		</g>`;
		})
		.join('');
	return `<div class="admin-table-scroll"><svg class="admin-chart" viewBox="0 0 ${w} ${chartH}" width="100%" height="${chartH}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Query volume per day">${bars}</svg></div>`;
}

// Single-series sparkline, latest point emphasized. Inline SVG, no JS.
function sparkline(values: number[], min: number, max: number, fmt: (n: number) => string, aria: string): string {
	if (!values.length) return '<div class="admin-empty">No runs yet.</div>';
	const w = 620;
	const h = 120;
	const padX = 10;
	const padY = 16;
	const plotW = w - padX * 2;
	const plotH = h - padY * 2;
	const n = values.length;
	const span = max - min || 1;
	const x = (i: number): number => (n === 1 ? padX + plotW / 2 : padX + (i / (n - 1)) * plotW);
	const y = (v: number): number => padY + plotH - ((v - min) / span) * plotH;
	const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
	const path = n === 1 ? '' : `<path d="M ${pts.join(' L ')}" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>`;
	const dots = values
		.map((v, i) => {
			const last = i === n - 1;
			return `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${last ? 4 : 2.5}" fill="${last ? BRAND : '#b7b5cf'}"></circle>`;
		})
		.join('');
	const lastV = values[n - 1];
	const lastX = x(n - 1);
	const lastY = y(lastV);
	const anchor = n === 1 ? 'middle' : 'end';
	return `<svg class="admin-chart admin-spark" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="${esc(aria)}">
		${path}
		${dots}
		<text x="${lastX.toFixed(1)}" y="${(lastY - 8).toFixed(1)}" class="c-val" text-anchor="${anchor}">${esc(fmt(lastV))}</text>
	</svg>`;
}

// ── Formatting primitives ────────────────────────────────────────────────────

function pct(frac: number): string {
	return (Number(frac) * 100).toFixed(1);
}
function shortRelease(id: string): string {
	// "<sha>-<timestamp>" → "<sha> · <time>"
	const m = /^(.+?)-(\d{10,})$/.exec(id);
	if (!m) return id;
	return `${m[1]}·${new Date(Number(m[2])).toISOString().slice(11, 16)}`;
}
function fmtDuration(ms: number | null): string {
	if (ms == null) return '—';
	if (ms < 1000) return `${Math.round(ms)}ms`;
	const s = ms / 1000;
	return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m${Math.round(s % 60)}s`;
}
function fmtWhen(d: any): string {
	if (!d) return '—';
	return new Date(d).toISOString().replace('T', ' ').slice(0, 16) + 'Z';
}
function num(n: any): string {
	return n == null ? '—' : Number(n).toLocaleString('en-US');
}
function esc(s: any): string {
	return String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
