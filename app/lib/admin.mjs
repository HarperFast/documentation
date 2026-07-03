// Server-rendered admin dashboard for ingest observability. Pure HTML + inline
// SVG (no client JS) so it works under the site's strict CSP. Auth is enforced
// by the caller (Basic auth via server.authenticateUser).

const STATUS = {
	activated: { color: '#128a6c', bg: '#e4f5ef', label: 'activated' },
	rejected: { color: '#a06a14', bg: '#faf1de', label: 'rejected' },
	failed: { color: '#b3261e', bg: '#fce8e6', label: 'failed' },
	running: { color: '#5a5772', bg: '#ecebf6', label: 'running' },
};
const statusOf = (s) => STATUS[s] ?? STATUS.running;

export function renderAdminDashboard(runs) {
	// runs: newest first. Summary + duration chart + table.
	const total = runs.length;
	const counts = { activated: 0, rejected: 0, failed: 0, running: 0 };
	for (const r of runs) counts[r.status] = (counts[r.status] ?? 0) + 1;
	const durations = runs.filter((r) => r.durationMs != null).map((r) => r.durationMs);
	const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
	const latest = runs[0];

	const cards = [
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

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ingest Observability — Harper Docs Admin</title>
<link rel="stylesheet" href="/assets/styles.css">
<link rel="stylesheet" href="/assets/admin.css">
</head>
<body class="admin">
<header class="admin-header">
	<div><span class="admin-eyebrow">Harper Docs · Admin</span><h1>Ingest Observability</h1></div>
	<a class="admin-home" href="/">← Docs</a>
</header>
<section class="admin-cards">
	${cards.map((c) => `<div class="admin-card"><div class="admin-card-value"${c.color ? ` style="color:${c.color}"` : ''}>${esc(c.value)}</div><div class="admin-card-label">${esc(c.label)}</div></div>`).join('')}
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
</section>
</body>
</html>`;
}

function row(r) {
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
function durationChart(runs) {
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

function shortRelease(id) {
	// "<sha>-<timestamp>" → "<sha> · <time>"
	const m = /^(.+?)-(\d{10,})$/.exec(id);
	if (!m) return id;
	return `${m[1]}·${new Date(Number(m[2])).toISOString().slice(11, 16)}`;
}
function fmtDuration(ms) {
	if (ms == null) return '—';
	if (ms < 1000) return `${Math.round(ms)}ms`;
	const s = ms / 1000;
	return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m${Math.round(s % 60)}s`;
}
function fmtWhen(d) {
	if (!d) return '—';
	return new Date(d).toISOString().replace('T', ' ').slice(0, 16) + 'Z';
}
function num(n) {
	return n == null ? '—' : Number(n).toLocaleString('en-US');
}
function esc(s) {
	return String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
