// Docs chat — framework-free. A floating launcher opens a chat panel that
// streams answers from /api/chat (SSE). On the /chat page (an element with
// id="chat-root") the same transcript renders inline instead of a panel.
// Strict-CSP-safe: no inline handlers, all wiring via addEventListener.
(() => {
	const root = document.getElementById('chat-root');
	const launcher = document.getElementById('chat-launcher');
	const panel = document.getElementById('chat-panel');
	// Nothing to enhance (widget skeleton absent and not the /chat page).
	if (!root && !(launcher && panel)) return;

	// ── Session ────────────────────────────────────────────────────────────
	const SESSION_KEY = 'harper-chat-session';
	function sessionId() {
		let id;
		try {
			id = localStorage.getItem(SESSION_KEY);
		} catch {
			/* storage blocked — fall through to a per-load id */
		}
		if (!id) {
			id =
				typeof crypto !== 'undefined' && crypto.randomUUID
					? crypto.randomUUID()
					: 's-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
			try {
				localStorage.setItem(SESSION_KEY, id);
			} catch {
				/* best-effort */
			}
		}
		return id;
	}
	const SID = sessionId();

	// Contextual scope: mirror search.js so answers can be section-aware.
	function currentScope() {
		const seg = location.pathname.replace(/^\//, '').split('/');
		if (seg[0] === 'reference') return { section: 'reference', version: seg[1] || 'v5' };
		if (['learn', 'release-notes', 'fabric'].includes(seg[0])) return { section: seg[0] };
		return {};
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
	}

	// Escape the answer, then turn inline [n] markers into citation links when a
	// matching source exists. Escaping first is safe: it never touches [ ] digits.
	function renderAnswer(text, sources) {
		let html = escapeHtml(text);
		html = html.replace(/\[(\d+)\]/g, (m, n) => {
			const src = sources[Number(n) - 1];
			if (!src || !src.url) return m;
			return `<a class="chat-cite" href="${escapeHtml(src.url)}">[${escapeHtml(n)}]</a>`;
		});
		return html;
	}

	// ── UI construction (shared by panel + full-page) ──────────────────────
	// Builds the transcript + composer into `mount`. Returns the wired API.
	function buildChat(mount, opts) {
		const floating = !!opts.floating;
		mount.classList.add('chat-ui');
		mount.innerHTML = `
			<div class="chat-transcript" role="log" aria-live="polite" aria-label="Conversation"></div>
			<form class="chat-composer">
				<textarea class="chat-input" rows="1" placeholder="Ask about Harper…"
					aria-label="Ask a question" autocomplete="off" spellcheck="false"></textarea>
				<button type="submit" class="chat-send" aria-label="Send">Send</button>
			</form>`;

		const transcript = mount.querySelector('.chat-transcript');
		const form = mount.querySelector('.chat-composer');
		const input = mount.querySelector('.chat-input');
		const send = mount.querySelector('.chat-send');
		let streaming = false;

		if (!transcript.children.length) {
			const hint = document.createElement('div');
			hint.className = 'chat-hello';
			hint.textContent = 'Ask a question about the Harper documentation.';
			transcript.appendChild(hint);
		}

		function scrollToEnd() {
			transcript.scrollTop = transcript.scrollHeight;
		}

		function addUser(text) {
			const el = document.createElement('div');
			el.className = 'chat-msg chat-msg-user';
			el.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
			transcript.appendChild(el);
			scrollToEnd();
		}

		// Creates an assistant message shell and returns handles to update it.
		function addAssistant() {
			const el = document.createElement('div');
			el.className = 'chat-msg chat-msg-assistant';
			el.innerHTML = `
				<div class="chat-bubble chat-streaming"><div class="chat-answer"></div></div>
				<ol class="chat-sources" hidden></ol>
				<div class="chat-meta" hidden></div>`;
			transcript.appendChild(el);
			scrollToEnd();
			const bubble = el.querySelector('.chat-bubble');
			const answer = el.querySelector('.chat-answer');
			const sourcesEl = el.querySelector('.chat-sources');
			const metaEl = el.querySelector('.chat-meta');
			let sources = [];
			let text = '';

			return {
				setSources(list) {
					sources = Array.isArray(list) ? list : [];
					if (!sources.length) return;
					sourcesEl.hidden = false;
					sourcesEl.innerHTML = sources
						.map(
							(s) =>
								`<li class="chat-source"><a href="${escapeHtml(s.url)}">${escapeHtml(
									s.heading || s.title || s.path || s.url,
								)}</a></li>`,
						)
						.join('');
					// Re-render any already-streamed text so [n] markers can link.
					answer.innerHTML = renderAnswer(text, sources);
					scrollToEnd();
				},
				appendToken(delta) {
					text += delta;
					answer.innerHTML = renderAnswer(text, sources);
					scrollToEnd();
				},
				finish(meta) {
					bubble.classList.remove('chat-streaming');
					if (!text.trim()) answer.innerHTML = '<span class="chat-error">No answer was returned.</span>';
					if (meta && meta.model) {
						metaEl.hidden = false;
						const lat = meta.latencyMs != null ? ` · ${Math.round(meta.latencyMs)}ms` : '';
						metaEl.textContent = `${meta.model}${lat}`;
					}
				},
				fail(message) {
					bubble.classList.remove('chat-streaming');
					answer.innerHTML = `<span class="chat-error">${escapeHtml(message)}</span>`;
				},
			};
		}

		function setStreaming(on) {
			streaming = on;
			input.disabled = on;
			send.disabled = on;
			mount.classList.toggle('is-streaming', on);
		}

		async function ask(question) {
			addUser(question);
			const msg = addAssistant();
			setStreaming(true);
			let res;
			try {
				res = await fetch('/api/chat', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ question, sessionId: SID, ...currentScope() }),
				});
			} catch {
				msg.fail('Network error — please try again.');
				setStreaming(false);
				return;
			}

			// Non-stream error paths return JSON, not SSE.
			if (res.status === 429) {
				const j = await res.json().catch(() => ({}));
				const cap = j && j.cap != null ? ` (cap ${j.cap})` : '';
				msg.fail(`Daily limit reached${cap}. Please try again tomorrow.`);
				setStreaming(false);
				return;
			}
			if (res.status === 400) {
				await res.json().catch(() => ({}));
				msg.fail("Couldn't process that — try rephrasing your question.");
				setStreaming(false);
				return;
			}
			const ctype = res.headers.get('content-type') || '';
			if (!res.ok || !res.body || !ctype.includes('text/event-stream')) {
				msg.fail('Something went wrong. Please try again.');
				setStreaming(false);
				return;
			}

			try {
				await readStream(res.body, msg);
			} catch {
				msg.fail('The connection was interrupted.');
			} finally {
				setStreaming(false);
				input.focus();
			}
		}

		// Parse a single SSE frame ("event: X\ndata: Y" possibly multi-line).
		function dispatch(frame, msg) {
			let event = 'message';
			const dataLines = [];
			for (const line of frame.split(/\r?\n/)) {
				if (line.startsWith(':')) continue; // comment/keep-alive
				if (line.startsWith('event:')) event = line.slice(6).trim();
				else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
			}
			const raw = dataLines.join('\n');
			if (!raw && event === 'message') return;
			let data;
			try {
				data = JSON.parse(raw);
			} catch {
				data = raw; // tolerate a non-JSON payload
			}
			if (event === 'sources') msg.setSources(data);
			else if (event === 'token') msg.appendToken(typeof data === 'string' ? data : String(data));
			else if (event === 'done') msg.finish(data || {});
			else if (event === 'error') msg.fail((data && data.message) || 'The server reported an error.');
		}

		async function readStream(body, msg) {
			const reader = body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				// Frames are separated by a blank line; keep the trailing partial.
				let idx;
				while ((idx = buffer.indexOf('\n\n')) !== -1) {
					const frame = buffer.slice(0, idx);
					buffer = buffer.slice(idx + 2);
					if (frame.trim()) dispatch(frame, msg);
				}
			}
			buffer += decoder.decode();
			if (buffer.trim()) dispatch(buffer, msg);
		}

		function submit() {
			if (streaming) return;
			const q = input.value.trim();
			if (!q) return;
			input.value = '';
			autosize();
			ask(q);
		}

		function autosize() {
			input.style.height = 'auto';
			input.style.height = Math.min(input.scrollHeight, 160) + 'px';
		}

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			submit();
		});
		input.addEventListener('input', autosize);
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				submit();
			}
		});

		return { input, focus: () => input.focus() };
	}

	// ── Full-page mode ──────────────────────────────────────────────────────
	if (root) {
		buildChat(root, { floating: false });
		return;
	}

	// ── Floating panel mode ─────────────────────────────────────────────────
	panel.innerHTML = `
		<div class="chat-header">
			<span class="chat-title">Ask Harper Docs</span>
			<button type="button" class="chat-close" aria-label="Close chat">✕</button>
		</div>
		<div class="chat-body"></div>`;
	const body = panel.querySelector('.chat-body');
	const closeBtn = panel.querySelector('.chat-close');
	const api = buildChat(body, { floating: true });
	let open = false;

	function setOpen(next) {
		open = next;
		panel.hidden = !open;
		launcher.setAttribute('aria-expanded', String(open));
		launcher.classList.toggle('is-open', open);
		if (open) api.focus();
	}

	launcher.addEventListener('click', () => setOpen(!open));
	closeBtn.addEventListener('click', () => setOpen(false));
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && open) {
			setOpen(false);
			launcher.focus();
		}
	});
})();
