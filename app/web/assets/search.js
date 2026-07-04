// Search modal — framework-free. Opens on click or ⌘K/Ctrl-K, debounced
// queries to /api/search scoped to the current docs section, keyboard-navigable.
(() => {
	const trigger = document.getElementById('search-trigger');
	if (!trigger) return;

	// Contextual scope: which section (and reference version) is the reader in?
	function currentScope() {
		const seg = location.pathname.replace(/^\//, '').split('/');
		if (seg[0] === 'reference') return { section: 'reference', version: seg[1] || 'v5' };
		if (['learn', 'release-notes', 'fabric'].includes(seg[0])) return { section: seg[0] };
		return {};
	}

	const overlay = document.createElement('div');
	overlay.className = 'search-overlay';
	overlay.hidden = true;
	overlay.innerHTML = `
		<div class="search-modal" role="dialog" aria-modal="true" aria-label="Search docs">
			<div class="search-box">
				<input type="search" class="search-input" placeholder="Search the docs…" autocomplete="off" spellcheck="false" aria-label="Search">
				<label class="search-scope"><input type="checkbox" class="search-allscope"> All docs</label>
			</div>
			<ul class="search-results" role="listbox"></ul>
			<div class="search-empty" hidden>No results.</div>
			<div class="search-hint"><kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>↵</kbd> to open · <kbd>esc</kbd> to close</div>
		</div>`;
	document.body.appendChild(overlay);

	const input = overlay.querySelector('.search-input');
	const list = overlay.querySelector('.search-results');
	const empty = overlay.querySelector('.search-empty');
	const allScope = overlay.querySelector('.search-allscope');
	let items = [];
	let active = -1;
	let seq = 0;
	let lastQuery = ''; // the query the currently-rendered results belong to
	let lastCount = 0; // result count for lastQuery
	let loggedQuery = ''; // last query already committed this session (dedupe)
	let pendingQuery = ''; // a commit intent whose results haven't rendered yet

	function open() {
		overlay.hidden = false;
		input.value = '';
		list.innerHTML = '';
		empty.hidden = true;
		lastQuery = '';
		loggedQuery = '';
		pendingQuery = '';
		input.focus();
	}
	function close() {
		overlay.hidden = true;
		items = [];
		active = -1;
	}

	const debounce = (fn, ms) => {
		let t;
		return (...a) => {
			clearTimeout(t);
			t = setTimeout(() => fn(...a), ms);
		};
	};

	async function run(q) {
		// Bump seq FIRST so a slow in-flight request from before a clear can't
		// pass the staleness check below and repopulate the emptied list.
		const mine = ++seq;
		if (!q.trim()) {
			list.innerHTML = '';
			empty.hidden = true;
			lastQuery = '';
			loggedQuery = '';
			pendingQuery = '';
			return;
		}
		const scope = allScope.checked ? {} : currentScope();
		const params = new URLSearchParams({ q, limit: '8', ...scope });
		let data;
		try {
			data = await (await fetch(`/api/search?${params}`)).json();
		} catch {
			return;
		}
		if (mine !== seq) return; // a newer query already returned
		const results = data.results ?? [];
		render(results);
		// Remember what these results are for, so a commit logs the right count.
		lastQuery = q.trim();
		lastCount = results.length;
		// If a commit was requested before these results were in (search slower
		// than the settle debounce, or Enter pressed early), complete it now.
		if (pendingQuery && pendingQuery === lastQuery) commit(lastQuery);
	}

	// Fire the commit beacon for query q (its results — hence count — are known).
	// Sends the count the user actually saw; keepalive lets it survive navigation.
	function commit(q) {
		if (q === loggedQuery) return; // already logged this query this session
		loggedQuery = q;
		pendingQuery = '';
		const scope = allScope.checked ? {} : currentScope();
		const params = new URLSearchParams({ q, log: '1', n: String(lastCount), ...scope });
		try {
			fetch(`/api/search?${params}`, { keepalive: true }).catch(() => {});
		} catch {
			/* best-effort */
		}
	}

	// Commit-logging: called only when a query is "committed" — typing has settled
	// (see settleLog) or the user acted on a result — so debounced keystroke
	// partials never reach the server-side query log. Logs now if results are in;
	// otherwise records the intent so run() completes it when results render.
	function logCommit() {
		const q = input.value.trim();
		if (q.length < 2) return;
		pendingQuery = q;
		if (q === lastQuery) commit(q);
	}

	function render(results) {
		items = results;
		active = results.length ? 0 : -1;
		empty.hidden = results.length > 0;
		list.innerHTML = results
			.map(
				(r, i) => `
			<li class="search-result${i === active ? ' active' : ''}" role="option" data-url="${escapeHtml(r.url)}">
				<a href="${escapeHtml(r.url)}">
					<div class="search-result-title">${escapeHtml(r.heading || r.title)}
						${r.version ? `<span class="search-result-badge">${escapeHtml(r.version)}</span>` : ''}</div>
					<div class="search-result-crumb">${escapeHtml((r.breadcrumb || []).join(' › ') || r.title)}</div>
					<div class="search-result-snippet">${escapeHtml(r.snippet || '')}</div>
				</a>
			</li>`
			)
			.join('');
	}

	function move(delta) {
		if (!items.length) return;
		active = (active + delta + items.length) % items.length;
		[...list.children].forEach((li, i) => li.classList.toggle('active', i === active));
		list.children[active]?.scrollIntoView({ block: 'nearest' });
	}
	function go() {
		logCommit(); // committing by acting on a result
		const url = items[active]?.url;
		if (url) location.href = url;
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
	}

	trigger.addEventListener('click', open);
	const liveSearch = debounce((v) => run(v), 140);
	const settleLog = debounce(logCommit, 1100); // "commit" once typing rests ~1.1s
	input.addEventListener('input', (e) => {
		liveSearch(e.target.value);
		settleLog();
	});
	allScope.addEventListener('change', () => run(input.value));
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) close();
	});
	overlay.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowDown') {
			e.preventDefault();
			move(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			move(-1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			go();
		}
	});
	document.addEventListener('keydown', (e) => {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			overlay.hidden ? open() : close();
		}
	});
})();
