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

	function open() {
		overlay.hidden = false;
		input.value = '';
		list.innerHTML = '';
		empty.hidden = true;
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
		if (!q.trim()) {
			list.innerHTML = '';
			empty.hidden = true;
			return;
		}
		const scope = allScope.checked ? {} : currentScope();
		const params = new URLSearchParams({ q, limit: '8', ...scope });
		const mine = ++seq;
		let data;
		try {
			data = await (await fetch(`/api/search?${params}`)).json();
		} catch {
			return;
		}
		if (mine !== seq) return; // a newer query already returned
		render(data.results ?? []);
	}

	function render(results) {
		items = results;
		active = results.length ? 0 : -1;
		empty.hidden = results.length > 0;
		list.innerHTML = results
			.map(
				(r, i) => `
			<li class="search-result${i === active ? ' active' : ''}" role="option" data-url="${r.url}">
				<a href="${r.url}">
					<div class="search-result-title">${escapeHtml(r.heading || r.title)}
						${r.version ? `<span class="search-result-badge">${r.version}</span>` : ''}</div>
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
		const url = items[active]?.url;
		if (url) location.href = url;
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
	}

	trigger.addEventListener('click', open);
	input.addEventListener(
		'input',
		debounce((e) => run(e.target.value), 140)
	);
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
