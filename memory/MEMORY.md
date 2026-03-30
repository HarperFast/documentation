# Documentation Migration Memory

## Project Overview

Harper v4 docs migration: consolidating `versioned_docs/version-4.X/` → `reference_versioned_docs/version-v4/` with feature-based reorganization.

- **Working branch**: `major-version-reorg` (all migration PRs target this branch)
- **Target dir**: `reference_versioned_docs/version-v4/`
- **Do NOT touch**: `versioned_docs/` or `reference/`

## Key Files

- `v4-docs-implementation-plan.md` — Agent instructions (follow Part 1 closely)
- `v4-docs-migration-map.md` — Authoritative source-to-target mapping per section
- `v4-docs-reference-plan.md` — Structure philosophy and outline
- `reference_versioned_sidebars/version-v4-sidebars.json` — Sidebar to update for each section
- ~~`migration-context/link-placeholders/`~~ — **Deleted** (Part 3 link resolution complete)

## Release Notes Location

`release-notes/v4-tucker/4.X.0.md` (NOT `release_notes/`)

## Completed Sections

All Phase 1A–1D sections are complete and merged:

- CLI, GraphQL Querying, Studio, Fastify Routes (Phase 1A)
- Environment Variables, Static Files, HTTP, MQTT, Logging, Analytics (Phase 1B)
- Security, Users & Roles, REST (PR #457), Database (PR #458), Resources (PR #459), Components (PR #460), Replication (PR #461) (Phase 1C)
- Operations API (PR #462), Configuration (PR #463) (Phase 1D)

## Key Decisions / Learnings

- Each section gets its own branch `migration/[section-name]` off `major-version-reorg` (for phase 1 content generation)
- PRs are draft by default, opened against `major-version-reorg`
- `@relationship` in v4.7 source (not `@relation` from 4.3 release notes) — needs human verification
- Audit log required for real-time messaging (MQTT/WebSocket) — verify still true
- `schema.md` kept unified (overview + blobs + vectors); consider splitting if too long
- System tables include: `hdb_raw_analytics`, `hdb_analytics`, `hdb_dataloader_hash`, `hdb_nodes`, `hdb_certificate`
- Analytics detail lives in `analytics/overview.md`, not `database/system-tables.md`
- Components section added `javascript-environment.md` (not in original plan)

## Next Steps

**Part 3 (Link Resolution) — Complete** on `link-resolution` branch (10 commits). Merge to `major-version-reorg` via PR review, then continue:

**Part 4 (Cross-Reference Updates)** — Full plan in [`memory/part4-plan.md`](part4-plan.md).
- Branch: `cross-reference-updates` off `major-version-reorg`
- Scope: ~7 release note files + 1 learn guide with old `/docs/` links
- **First step**: verify URL prefix for new reference pages (check `docusaurus.config.js`)

**Part 5 (Redirects)** — Configure redirects from old paths (`/docs/reference/`, `/docs/developers/`, etc.) to new paths in `docusaurus.config.js`.

### Part 3 Key Decisions

- Operations table category links (e.g. `../operations-api/database.md`) → `../operations-api/operations.md` with section anchors (no sub-pages exist)
- `resources/global-apis.md` never created → links redirected to `../components/javascript-environment.md`
- SQL operations link → `../database/sql.md` (SQL moved from legacy per migration map)
- `[Applications](TODO:applications/overview.md)` → `../components/overview.md`
- Malformed `[TODO:path](TODO:path)` links in `components/overview.md` fixed with proper text

Legacy section: single files only (no subfolders): `cloud.md`, `custom-functions.md`. SQL moved to `database/sql.md`.

## Sidebar Pattern

```json
{
	"type": "category",
	"label": "Section Name",
	"collapsible": false,
	"className": "learn-category-header",
	"items": [{ "type": "doc", "id": "section/page", "label": "Label" }]
}
```

Insert new sections before the Legacy category at the bottom of the sidebar.
