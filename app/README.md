# Harper docs-site application

The Harper-native replatform of docs.harperdb.io. Design doc: `plans/harper-replatform/README.md`
(in Kyle's main working copy, untracked) / https://claude.ai/code/artifact/d6526d21-c7be-4593-8106-22997dba354d

## Admin area — observability dashboards

Server-rendered, CSP-safe (inline SVG charts, no client JS), four tabs sharing one shell
(`lib/admin.ts` renders; `lib/metrics.ts` aggregates; routed in `resources/site.ts`):

- **`/admin/ingest`** — the `IngestRun` table: one row per ingest, created at `begin`
  (`status: running`, so a stuck row flags a crashed/hung ingest) and finalized at `activate`
  with pages/chunks/terms/nav/redirects, the activation-guard result, prune count, and duration.
  Summary cards, a duration-by-run bar chart (colored by status), and a runs table.
- **`/admin/search`** — search analytics over `SearchQueryLog` (last 14 days): total queries,
  zero-result rate, top queries, the **content-gap report** (zero-result queries), per-day volume,
  and a section breakdown. Only *committed* queries are logged — the UI beacons `/api/search?log=1`
  when a query settles (~1.1s) or is acted on, so debounced keystroke partials and the relevance
  eval's own `/api/search` calls never pollute the analytics.
- **`/admin/validation`** — relevance + parity trends. `search-eval` writes an `EvalRun` row
  (MRR/Recall@k) and `parity` writes a `ParityRun` row (pages, similarity, hard failures) via
  `POST /Metrics` (`resources/metrics.ts`, admin-authed like `/Ingest`); the panel charts the
  latest run + a sparkline trend. Best-effort recording — a failure never fails the CLI. Opt out
  with `--no-record`.
- **`/admin/chat`** — chat analytics over `ChatLog` (see M3 below): total chats, grounded rate,
  avg latency, top questions, per-day volume, model + feedback breakdowns, and a recent-conversations
  table.

All observability tables carry a 90-day TTL via `@table(expiration:)`.

**Auth**: Google OAuth via the `@harperfast/oauth` plugin (configured in `config.yaml`;
`GOOGLE_CLIENT_ID`/`_SECRET` from `.env`, gitignored). The plugin writes the signed-in profile
onto the Harper session as `oauthUser`; `adminAuth` reads `session.oauthUser.email` and requires
it to match `ADMIN_ALLOWED_DOMAINS` (default `harperdb.io,harper.fast`). Unauthenticated hits
redirect to `/oauth/google/login`. Register the callback `https://<host>/oauth/google/callback`
in the Google Cloud OAuth client.

> **Gotcha (cost a redirect loop):** `request.session` is only populated for handlers that run
> *after* Harper's auth stage. A bare `server.http(handler)` runs **before** it and gets no
> session, so every session gate silently fails (→ infinite redirect to Google). This middleware
> must register as `server.http(handler, { after: 'authentication' })` — matching how Harper's own
> REST/GraphQL/static layers opt in. Session cookies are `SameSite=None; Secure`, which browsers
> accept over `http://localhost` (a secure context) and require for the cross-site OAuth callback.

**Dev/verification login** (`GET /admin/dev-login`): establishes a real admin session without the
Google round-trip, so the dashboard can be driven locally (e.g. Playwright). Two gates, both
required: `ADMIN_DEV_LOGIN=true` in the env (unset in production) **and** the request is already
locally authorized as a super_user — which the isolated instance grants either via
`authorizeLocal` (currently `false`) or a Basic-auth super_user (the `~/hdb-docs-replatform/.admin-credentials`
used for ingest). It writes the same `oauthUser.email` session shape the plugin does, so `adminAuth`
stays one code path. Verify with:
`ADMIN_DEV_LOGIN=true npm run dev`, then `curl -u <admin> -c jar http://localhost:9936/admin/dev-login`
followed by `curl -b jar http://localhost:9936/admin/ingest`.

Deploy note: the plugin derives its callback from the request host; the local instance runs on
:9936 while the plugin logged Harper's default :9926 — reconcile the callback host per environment.

## M2 (search) — hybrid: keyword-primary + semantic recall

Both lanes are built (design §8). **Keyword-primary fusion**: the BM25 keyword lane owns the
ranking (precise, deterministic); the HNSW vector lane is appended below it as pure recall for
queries keyword can't answer, and its embeddings back M3 chat grounding. A golden-set weight
sweep drove this — equal-weight RRF monotonically *lowered* MRR (0.91 keyword-only → 0.75 at
semantic weight 0.5) and made scores vary run-to-run with HNSW rebuilds; keyword-primary is
**MRR 0.907, Recall@5 100%, deterministic**. (Natural-language search is better served by chat.)

- **Table-backed inverted index, no standing in-memory structures.** At ingest each page is
  chunked by h2/h3 section (`collectChunks` in the render pass); every chunk stores its
  `tokens` (indexed), `termCounts`, and `length`. A `buildIndex` pass writes the `Term`
  dictionary (per-term `docFreq` + indexed `trigrams`) and the corpus stats
  (`chunkCount`, `avgChunkLength`) on the release. 2,578 chunks / 7,778 terms currently.
- **BM25 scoring** (`lib/search.mjs`) computed at query time from the stored stats — term
  frequency saturation (k1) × inverse document frequency × length normalization (b) — plus
  title/heading field boosts and a multi-term coverage bonus. Per-query memory is bounded to
  a capped candidate set; nothing is held resident.
- **Typo tolerance at launch**: trigrams *generate* candidate terms (broad recall), then a
  term is *accepted* if it's within a length-scaled Damerau-Levenshtein edit-distance budget
  (1 for short words, 2 for long) OR has high trigram overlap. Edit distance catches
  single-char typos trigrams miss on short words (`vektor`→`vector`, `replciation`→`replication`).
- **Contextual scoping** (`?section=&version=`), **best-section-per-page** dedup, snippets, and
  `SearchQueryLog` (zero-result rows = the content-gap report).
- **UI**: a framework-free modal (`web/assets/search.js`) — ⌘K / click, debounced, scoped to
  the reader's section with an "all docs" toggle, keyboard-navigable. Browser-verified 9/9
  (`npm run … scripts/verify-search-ui.mjs`, Playwright).
- `GET /api/search?q=…&section=…&version=…&limit=…` → JSON.

Tokenizer/trigram/edit-distance helpers live in `lib/tokenize.mjs`, shared byte-identically
between index time and query time.

### Relevance eval (golden set)

`npm run search-eval` runs a labeled query set (`eval/golden-set.json`) against `/api/search`
and scores ranking with **MRR / Recall@5 / Recall@10 / zero-result rate** — the tuning loop
and the pre-cutover relevance gate (sibling to `parity.mjs`, for relevance instead of content).
`--min-mrr <x>` makes it a CI gate (wired at 0.85 in the parity workflow); `--verbose` lists
every case. Current on the seed set (44 hand-authored cases): **MRR 0.907, Recall@5 100%,
0-result 0%**, and now deterministic run-to-run.

Tuning workflow: change a knob in `lib/search.mjs` (boosts, `k1`/`b`, `maxEdits`, coverage
bonus), re-run `search-eval`, keep the change only if MRR rises and nothing regresses. The seed
set is hand-authored; **replace/augment it with real queries** from `SearchQueryLog` (and
Algolia's analytics export) once traffic exists — that, plus curating labels and signing off the
MRR floor for cutover, is a docs-team task (design open-question #5).

**Follow-ups**: expand the golden set with natural-language queries (the current set is
keyword-shaped, so it under-measures the semantic lane's recall value); a query-adaptive blend
(lean on semantic when the keyword lane returns few/weak results) if NL search in the box proves
important. The vector lane uses Gemini `gemini-embedding-001` via `@embed` (see the model-name
note in the schema and Harper issues #1593/#1594).

## M3 (chat) — grounded, streamed answers

Retrieval-augmented chat over the docs (`lib/chat.ts`). A question runs through the M2 hybrid
search; the top distinct pages' rendered markdown becomes numbered grounding context; an LLM
streams a cited answer.

- **`POST /api/chat`** streams Server-Sent Events — one `sources` event (the citations), then
  `token` deltas, then `done`/`error`. `resources/site.ts` reads the body (16KB cap), validates,
  quota-gates, retrieves, streams, and writes a `ChatLog` row on completion.
- **Generation**: Claude via the Anthropic Messages API (`CHAT_MODEL`, default `claude-sonnet-5`),
  streaming. With **no `ANTHROPIC_API_KEY`** it falls back to a deterministic **dev stub** that
  streams a grounded pointer — so the whole pipeline runs keyless. Set `ANTHROPIC_API_KEY` (in
  `.env`, gitignored, and as a CI secret) for real answers.
- **Quota**: per-IP daily cap (`CHAT_DAILY_CAP`, default 50) in `ChatQuota` (id `"<ipHash>:<date>"`,
  2-day TTL, resets each UTC day). Over cap → `429`. The client IP is the **socket peer** by default
  (unspoofable); set `CHAT_TRUST_PROXY=true` only behind a proxy that appends the real client IP
  (then the rightmost `X-Forwarded-For` hop is used). IPs are **hashed** (`ChatLog.ipHash`), never
  stored raw — set `CHAT_IP_SALT` to a stable secret in production so hashes stay private and the
  quota window survives restarts (otherwise a random per-process salt is used).
- **UI**: a framework-free, CSP-safe widget injected site-wide via the layout (floating launcher +
  panel) and a dedicated `/chat` page (`web/assets/chat.{js,css}`, `lib/chat-ui.ts`). Streams via
  `fetch` + a `ReadableStream` reader, renders inline `[n]` citation links + a sources list.
- **Observability**: the admin **Chat** tab (above).

**Retrieval tuning**: chat retrieval calls `runSearch` with `blend: true` (equal-weight RRF, so the
semantic lane counts for NL questions — the search box stays keyword-primary and unchanged) and
`withText: true` (grounds on the actual matched **section** text, not a page-head truncation). A
grounding eval measures it: `npm run chat-eval` runs `eval/chat-grounding.json` (NL questions →
expected doc-page substrings) via the `retrieveOnly` endpoint (no model/quota) and scores Recall@5 /
MRR — currently **Recall@5 75%, MRR 0.75**; CI gates it at `--min-recall 0.6`. Add cases from real
`ChatLog` questions to grow it.

**Follow-ups**: the remaining eval misses (blob/binary, Fabric deploy, TypeScript-no-build) are the
next retrieval targets. Thumbs feedback is modeled (`ChatLog.feedback`) but not yet wired to a UI
control. MCP server exposure is a later step.

## Current state: M1 (render/serve) at parity

Working end-to-end: repo markdown → ingest (rendered **inside Harper**) → release-scoped tables →
served pages with layout/sidebar/TOC, ETag/304, per-page `.md` projections, `llms.txt`,
`sitemap.xml`, and server-side 301 redirects. Publication is atomic via `ContentRelease`
(staged → activated in one write via the `SitePointer` singleton; previous release archived).

MDX-lite compatibility (in `lib/render.mjs` for self-contained components, `lib/expand.mjs`
for file/data ones): admonitions, tabs, `VersionBadge`, `CustomDocCardList`, npm2yarn,
explicit `{#id}` heading anchors, `.mdx` partial inlining, and `ReleaseNotesList` /
`LatestPatchLink` driven by `release-notes-data.json`.

**Parity harness** (`npm run parity`, `--strict` to gate): diffs a Docusaurus build against
the served site. Current state — 392/392 pages, titles 392/392, redirects 1376/1376, sitemaps
identical, `.md`/llms present, real anchors complete, text similarity median 99.9% / min 84.2%,
**zero hard failures**. `--strict` gates status, titles, real anchors, redirects, md/llms,
sitemap set equality (both directions), similarity floor, and worker errors; description and
canonical and warn-level similarity stay advisory. Wired into CI on the replatform branch
(`.github/workflows/replatform-parity.yaml`).

Not yet built (see design doc): whole-release validation before activation, rendered-markdown
cleanup projection for the llms contract, search (Term/trigram/BM25 + HNSW), chat/MCP,
observability, page cache. Remaining advisory parity noise: meta descriptions (Docusaurus's
excerpt algorithm isn't replicated) and 8 tiny release-note pages at 84–90% similarity.

## Local development

Uses the **isolated** Harper instance (never the main install) — see
`plans/harper-replatform/local-instance.md`. Ports: HTTP **9936**, Operations **9935**.

```bash
cd app
npm install
npm run dev        # harper dev against the isolated instance (foreground)
npm run ingest     # full content ingest + atomic activate (server must be up)
npm run typecheck  # tsc --noEmit — no build step, just checking
```

Auth for ingest comes from `~/hdb-docs-replatform/.admin-credentials` or
`HARPER_CLI_USERNAME`/`HARPER_CLI_PASSWORD`.

### TypeScript

The app is TypeScript with **no build step** — Harper and Node 24 strip types at load time
(`config.yaml` points `jsResource` at `resources/*.ts`; CLI scripts run via `node scripts/*.ts`).
Local imports carry explicit `.ts` extensions. `lib/harper.ts` is a thin shim over the `harper`
package that permissively types `tables`/`server` (Harper 5.x types `search()` for `RequestTarget`
only, but we pass plain option objects). `npm run typecheck` gates types; there is no emit.

### Tests

Three tiers, all `node:test` (zero deps; Playwright for e2e):

```bash
npm test              # unit — pure logic (tokenize/BM25, admin renderers, record client)
npm run test:integration  # live HTTP: /api/search, admin auth, dev-login, /Metrics (server must be up)
npm run test:e2e      # Playwright: search modal + admin auth/tabs (server must be up)
npm run test:all      # all three in sequence
```

Integration + e2e self-skip when the server is unreachable or admin credentials are absent, so
`npm test` stays hermetic. All three run in CI (`replatform-parity.yaml`), alongside the parity
and relevance gates.

### Known issues

- `harper dev` file-watch restarts sometimes fail to rebind the HTTP port (macOS,
  Harper 5.1.15) — kill and relaunch `npm run dev` after editing resources.
  TODO: file as platform feedback.
- The static plugin's `urlPath` option is broken in Harper 5.1.15: with
  `static: {files: 'web/**', urlPath: 'assets'}` files never serve (404 at every
  candidate path). Bisected in a minimal component — defaults work, adding
  `urlPath` breaks it. Workaround: nest files under `web/assets/` so the
  glob-base strip produces the same URLs. TODO: file as platform feedback.
- Table records are lazy proxies: `{...record}` does not copy fields. Write explicit
  objects (see `resources/ingest.ts` activate handler).

## Layout

```
app/
├── config.yaml          # Harper component config (replaces defaults entirely)
├── tsconfig.json        # type-checking only (noEmit); no build step
├── schemas/docs.graphql # ContentRelease, Page, Navigation, Redirect, IngestRun,
│                        #   SearchChunk, Term, SearchQueryLog, EvalRun, ParityRun
├── resources/
│   ├── ingest.ts        # POST /Ingest — staged ingest + atomic activate
│   ├── metrics.ts       # POST /Metrics — records EvalRun / ParityRun rows
│   └── site.ts          # server.http middleware — pages, search API, admin, .md, llms, sitemap
├── lib/
│   ├── harper.ts        # typed shim over the `harper` package (tables/server)
│   ├── render.ts        # markdown → html/toc/rendered-md (remark/rehype pipeline)
│   ├── layout.ts        # SSR layout shell
│   ├── search.ts        # hybrid keyword + semantic search
│   ├── admin.ts         # server-rendered admin dashboards (3 tabs)
│   └── metrics.ts       # admin data-aggregation layer
├── scripts/
│   ├── ingest.ts        # client: walks repo content + sidebars + redirects → /Ingest
│   ├── parity.ts        # parity harness (records ParityRun)
│   ├── search-eval.ts   # relevance eval (records EvalRun)
│   └── lib/record.ts    # shared /Metrics recording client
├── test/                # unit/ · integration/ · e2e/  (node:test + Playwright)
└── web/assets/          # styles + client search modal (served at /assets/)
```
