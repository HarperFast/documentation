// Server-render helpers for the docs chat UI. Emits only static HTML skeletons
// that web/assets/chat.js enhances at runtime — no framework, strict-CSP-safe.
// The caller wires the asset <link>/<script> tags (for the widget) itself.

// Inline chat-bubble glyph for the launcher. Inline SVG (not an external asset)
// keeps this CSP-safe.
const LAUNCHER_ICON =
	'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>';

// The floating widget: a launcher button plus an empty panel container that the
// client script fills in. Inject at the end of <body> on every page. Contains no
// <script>/<link> — the caller adds those separately.
export function chatWidgetHtml(): string {
	return `<button type="button" id="chat-launcher" class="chat-launcher" aria-label="Ask Harper Docs" aria-haspopup="dialog" aria-expanded="false">
	<span class="chat-launcher-icon">${LAUNCHER_ICON}</span>
	<span class="chat-launcher-label">Ask</span>
</button>
<div id="chat-panel" class="chat-panel" role="dialog" aria-label="Ask Harper Docs" hidden></div>`;
}

// A complete HTML document for GET /chat — the full-page chat experience.
// chat.js renders the transcript + composer into #chat-root.
export function renderChatPage(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ask — Harper Docs</title>
<link rel="stylesheet" href="/assets/styles.css">
<link rel="stylesheet" href="/assets/chat.css">
</head>
<body class="chat-page">
<header class="chat-page-header">
	<span class="chat-page-eyebrow">Harper Docs · Ask</span>
	<a class="chat-page-home" href="/">← Docs</a>
</header>
<main class="chat-page-main">
	<div id="chat-root"></div>
</main>
<script src="/assets/chat.js"></script>
</body>
</html>`;
}
