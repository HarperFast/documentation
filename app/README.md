# Harper docs-site application

The Harper-native replatform of docs.harperdb.io. Design doc: `plans/harper-replatform/README.md`
(in Kyle's main working copy, untracked) / https://claude.ai/code/artifact/d6526d21-c7be-4593-8106-22997dba354d

## Current state: M1 walking skeleton

Working end-to-end: repo markdown → ingest (rendered **inside Harper**) → release-scoped tables →
served pages with layout/sidebar/TOC, ETag/304, per-page `.md` projections, `llms.txt`,
`sitemap.xml`, and server-side 301 redirects. Publication is atomic via `ContentRelease`
(staged → activated in one write; previous release archived for rollback).

Not yet built (see design doc): whole-release validation before activation, rendered-markdown
cleanup projection, search (Term/trigram/BM25 + HNSW), chat/MCP, observability, page cache,
parity harness.

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
