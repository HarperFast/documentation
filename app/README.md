# Harper docs-site application

The Harper-native replatform of docs.harperdb.io. Design doc: `plans/harper-replatform/README.md`
(in Kyle's main working copy, untracked) / https://claude.ai/code/artifact/d6526d21-c7be-4593-8106-22997dba354d

## M2 (search) — keyword lane

Hybrid search per design §8; the **keyword lane** is built:

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
`--min-mrr <x>` makes it a CI gate; `--verbose` lists every case. Current baseline on the seed
set (44 hand-authored cases): **MRR 0.896, Recall@5 97.7%, 0-result 0%**.

Tuning workflow: change a knob in `lib/search.mjs` (boosts, `k1`/`b`, `maxEdits`, coverage
bonus), re-run `search-eval`, keep the change only if MRR rises and nothing regresses. The seed
set is hand-authored; **replace/augment it with real queries** from `SearchQueryLog` (and
Algolia's analytics export) once traffic exists — that, plus curating labels and signing off the
MRR floor for cutover, is a docs-team task (design open-question #5).

**Deferred**: the **vector/semantic lane** (HNSW + `@embed`) — needs a hosted embedding model
configured — which fuses with this keyword lane and backs M3 chat. Known weak case tracked by
the golden set: `replciation` resolves but the replication *section* pages lose to the
operations page on term density (a ranking, not resolution, issue).

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
```

Auth for ingest comes from `~/hdb-docs-replatform/.admin-credentials` or
`HARPER_CLI_USERNAME`/`HARPER_CLI_PASSWORD`.

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
  objects (see `resources/ingest.js` activate handler).

## Layout

```
app/
├── config.yaml          # Harper component config (replaces defaults entirely)
├── schemas/docs.graphql # ContentRelease, Page, Navigation, Redirect
├── resources/
│   ├── ingest.js        # POST /Ingest — staged ingest + atomic activate
│   └── site.js          # server.http middleware — pages, redirects, .md, llms, sitemap
├── lib/
│   ├── render.mjs       # markdown → html/toc/rendered-md (remark/rehype pipeline)
│   └── layout.mjs       # SSR layout shell
├── scripts/ingest.mjs   # client: walks repo content + sidebars + redirects → /Ingest
└── web/styles.css       # skeleton styles (served at /assets/)
```
