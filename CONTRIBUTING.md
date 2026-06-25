# Contributing

Thanks for helping improve the Harper documentation. You can contribute by [reporting an issue](#reporting-issues) or opening a pull request.

## Reporting Issues

Issues are filed through the issue forms (the blank issue box is disabled, so choose the form that fits):

- **📝 Content Issue** / **📚 Content Request** — for the documentation itself (errors, gaps, new or expanded pages).
- **🐛 Platform Bug** / **⚡️ Platform Feature Request** — for the docs _site_ (search, navigation, build, styling).

Issues are organized along three axes:

- **Type** (set automatically by the form): **Bug** — something documented is wrong or broken, or a site defect; **Feature** — new or substantially expanded documentation or site capability; **Task** — smaller content edits and cleanup (usually applied by maintainers during triage). Kind is tracked by issue type, not by labels.
- **Area label**: **`content`** (documentation text and examples) or **`platform`** (the docs site — Docusaurus, build, search, navigation, styling). These are the only area labels — there are intentionally no per-subsystem labels. A few flags also appear: `from-jira` (provenance), `good first issue`, `help wanted`.
- **Milestone**: the **`v5.x` release** the work should ship with. Milestone names mirror the `harper` / `harper-pro` repos, so documentation work is tracked per release alongside the product. Maintainers set a milestone on issues that must land in a given release; issues that aren't tied to a release are left without one.

You don't need to get type, area, or milestone exactly right when filing — maintainers confirm them during triage.

## Prerequisites

Before contributing, please ensure you have the following installed:

- Node.js (version 22)
- npm (version 10 - included with Node.js)

## Set Up

1. Install the dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Make and test your changes
4. Format your code:

```bash
npm run format:write
```

5. Push changes to a branch and create a pull request

## Formatting

**Every contribution must be formatted before it is committed.** This applies to _all_ files in the repository — content (`.md`/`.mdx`), TypeScript, config, and anything else under `plans/`, `scripts/`, etc. — not just docs content.

```bash
# Format everything (run before committing):
npm run format:write

# Check formatting without writing (what CI runs):
npm run format:check
```

CI runs `npm run format:check` on every pull request and will fail if anything is unformatted. If CI fails on formatting, run `npm run format:write` locally and commit the result. Prettier is configured via `@harperdb/code-guidelines/prettier` (see `package.json`).

## Site Organization

This site is powered by Docusaurus. The documentation is split into four distinct sections, each serving a different purpose and configured as its own Docusaurus plugin instance.

### The Four Sections

| Section           | URL              | Purpose                                                                                                                      |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Learn**         | `/learn`         | Guides, tutorials, and conceptual introductions. How-to content that walks users through a goal.                             |
| **Reference**     | `/reference/vN`  | Complete technical reference for every feature, API, configuration option, and operation. Versioned by major Harper version. |
| **Release Notes** | `/release-notes` | Changelog for every Harper release. Organized by major version codename (e.g. `v4-tucker`).                                  |
| **Fabric**        | `/fabric`        | Documentation for Harper's managed cloud platform. Separate from the core Harper product docs.                               |

**Rule of thumb**: if it explains _how something works_ or _what something does_, it belongs in Reference. If it explains _how to accomplish something_, it belongs in Learn. New feature documentation always goes in Reference first; Learn guides can link to it.

### Section Configuration Map

Each section maps to specific source directories and config files:

#### Learn

| Item          | Location                                   |
| ------------- | ------------------------------------------ |
| Content       | `learn/`                                   |
| Sidebar       | `sidebarsLearn.ts`                         |
| Plugin config | `docusaurus.config.ts` → plugin id `learn` |

Learn is non-versioned. All content lives directly in `learn/` organized into categories that match the sidebar.

#### Reference

| Item                  | Location                                                |
| --------------------- | ------------------------------------------------------- |
| Current (v5) content  | `reference/`                                            |
| Archived (v4) content | `reference_versioned_docs/version-v4/`                  |
| Current sidebar       | `sidebarsReference.ts`                                  |
| v4 sidebar            | `reference_versioned_sidebars/version-v4-sidebars.json` |
| Version list          | `reference_versions.json`                               |
| Plugin config         | `docusaurus.config.ts` → plugin id `reference`          |

Reference is versioned by major Harper version. The `reference_versions.json` file lists all archived versions — currently `["current", "v4"]`. The `current` version maps to `v5` (the _current_ major).

#### Release Notes

| Item          | Location                                           |
| ------------- | -------------------------------------------------- |
| Content       | `release-notes/`                                   |
| Sidebar       | `sidebarsReleaseNotes.ts`                          |
| Plugin config | `docusaurus.config.ts` → plugin id `release-notes` |

Release notes are non-versioned in the Docusaurus sense — major version organization is handled manually via subdirectories (`v5-lincoln/`, `v4-tucker/`, `v3-monkey/`, etc.). The sidebar uses `autogenerated` directives so new files are picked up automatically. See the [Release Notes Process](#release-notes-process) section for the full workflow.

#### Fabric

| Item          | Location                                    |
| ------------- | ------------------------------------------- |
| Content       | `fabric/`                                   |
| Sidebar       | `sidebarsFabric.ts`                         |
| Plugin config | `docusaurus.config.ts` → plugin id `fabric` |

Fabric is non-versioned. It documents the managed cloud platform independently of the Harper core product.

---

### Reference Section Structure

The Reference section is organized as a flat list of feature-based sections — no deep nesting. Each top-level section corresponds to one Harper feature or subsystem.

#### Section Layout

Every section follows this pattern:

```
reference/
└── {feature}/
    ├── overview.md        # General introduction, architecture, concepts
    ├── configuration.md   # Config options specific to this feature (if applicable)
    ├── api.md             # JS/programmatic API reference (if applicable)
    └── operations.md      # Operations API operations for this feature (if applicable)
```

Not every section needs all four files — some features only warrant an `overview.md`. The filenames above are conventions, not requirements.

#### Section Order

Sections are ordered in the sidebar by who needs them first:

1. **Data & Application** — Database, Resources, Components
2. **Access & Security** — REST, HTTP, Security, Users & Roles
3. **Setup & Operation** — CLI, Configuration, Operations API
4. **Features** — Logging, Analytics, MQTT, Static Files, Environment Variables, Replication, GraphQL Querying, Studio, Fastify Routes
5. **Legacy** — Deprecated or discouraged features

#### Sidebar Headers

Reference sidebar headers use `className: "reference-category-header"` for compact styling. This is set on each category entry in the sidebar config. Do not use `learn-category-header` in reference sidebars.

#### Legacy Section

Deprecated or discouraged features belong in `reference/legacy/`. Each legacy page should briefly explain what the feature was and direct users to the modern alternative.

---

### Version Annotations

Because the Reference section consolidates all minor versions of a major into one document, features are annotated inline to indicate when they were introduced or changed.

Use the `<VersionBadge>` component. It is registered globally and requires no import in `.md` or `.mdx` files.

```mdx
<VersionBadge version="v4.3.0" />
<VersionBadge type="changed" version="v4.5.0" />
<VersionBadge type="deprecated" version="v4.2.0" />
```

The `type` prop defaults to `"added"`, so the most common case is just `version`. Place the badge on its own line directly below the heading it describes:

**New feature:**

```mdx
## Relationships

<VersionBadge version="v4.3.0" />

The `@relation` directive allows you to define relationships between tables...
```

**Changed behavior:**

```mdx
### Default Port

<VersionBadge type="changed" version="v4.5.0" />

The default MQTT port changed from 9925 to 9933.
In previous versions of v4, the default was 9925.
```

**Deprecated feature:**

```mdx
## SQL Querying

<VersionBadge type="deprecated" version="v4.2.0" />

SQL is still supported but discouraged. See [Database](../database/overview.md) for modern alternatives.
```

**Stabilized feature:**

```mdx
## Plugin API

{/* Now stable! */}

<VersionBadge type="stable" version="v5.0" />
{/* Was "experimental" */}
<VersionBadge version="v4.6" />

The Plugin API is the primary way to implement additional functionality in Harper.
```

**Configuration option** (inline in a list):

```mdx
- `logger.level` — Log level; _Default_: `"info"` (Added in: v4.1.0)
```

For inline config option annotations inside list items, plain text `(Added in: vX.Y.Z)` is fine — using the component mid-sentence is awkward. Reserve `<VersionBadge>` for standalone placement after headings.

## Redirects

The site is hosted as a static build on GitHub Pages, so there is no server-side router that can rewrite incoming URLs. All redirect handling is therefore done **client-side** by the [`@docusaurus/plugin-client-redirects`](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-client-redirects) plugin: at build time it emits a small HTML page for every `from` path that immediately navigates the browser to the `to` path. Because the redirect HTML is generated per-path, every redirect must be enumerated explicitly — there is no pattern, prefix, or wildcard support.

### `redirects.ts` vs. `historic-redirects.ts`

The redirect rules are split across two files to keep the two distinct populations of legacy URLs visually and logically separated:

| File                                           | Source paths                                                       | Targets                         | When to edit                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------- |
| [redirects.ts](redirects.ts)                   | Non-versioned `/docs/*` paths (e.g. `/docs/developers/rest`)       | Mostly `/reference/v5/*`        | Whenever a current Reference or Learn page is renamed or removed.    |
| [historic-redirects.ts](historic-redirects.ts) | Versioned `/docs/4.X/*` paths and the GitBook `/docs/v/4.X/*` form | Almost always `/reference/v4/*` | Rarely — only when new analytics data surfaces a missed legacy path. |

The split exists because `historic-redirects.ts` is treated as a frozen, append-only artifact derived from historical analytics, while `redirects.ts` is part of the day-to-day editing surface. Both files export `RedirectRule[]`; `redirects.ts` simply re-exports the concatenation as `redirects` for the plugin config to consume.

### How historic redirects were populated

The full set of versioned and GitBook-era paths in `historic-redirects.ts` was generated from real traffic, not guesswork:

1. Export pageview data from Google Analytics 4 (property `harper.fast - GA4`) for the past several months. The current snapshot is checked in as [scripts/harper-docs-analytics.csv](scripts/harper-docs-analytics.csv) (Oct 2025 – Feb 2026).
2. Filter to paths under `/docs/4.X/*` and `/docs/v/4.X/*` that the modern site no longer serves.
3. For each path, hand-map it to the closest equivalent under `/reference/v4/*` (or `/learn`, `/release-notes`, etc. when the page has no direct successor) and group multiple sources onto a single target.
4. Add the result as a new rule in `historic-redirects.ts`.

To regenerate this list when fresh analytics become available, re-export the CSV, run [scripts/verify-redirects.mjs](scripts/verify-redirects.mjs) to confirm the existing rules still resolve, and then diff the CSV against the configured `from` paths to find the new omissions.

### Paths intentionally not redirected

A small set of paths show up in analytics but are deliberately not given redirects, because they are not real pages the user meant to visit:

- `/docs/4.X/~gitbook/pdf` and `/docs/v/4.X/~gitbook/pdf` — GitBook's PDF export endpoint, not a content page.
- `/docs/4.X/4.X/...` (double version prefix) — malformed URLs from broken inbound links.
- `/docs/4.4./getting-started/` — typo path with an extra dot in the version segment.
- `/robots.txt`, `/404.html`, `/search` — site infrastructure, served directly by Docusaurus.
- One-off junk in analytics (`/learnjira`, `/view/<id>/<token>/`, etc.) — unrelated to docs traffic.

A handful of very-low-traffic non-versioned strays (e.g. `/docs/developers/`, `/docs/foundations/`, `/docs/administration/edge`, `/docs/5.0/migration-guide`) are also not currently redirected. They are candidates for future cleanup but each accounts for only one or two pageviews per quarter, so the maintenance cost outweighs the win.

### Verifying redirects

To make sure no configured redirect silently starts 404'ing — for example after a Reference page is renamed or removed — there is a verification script that checks every `from` path against the live docs site:

```bash
node scripts/verify-redirects.mjs
```

The script parses both redirect files, extracts every unique `from` path, then issues a `GET` against the live site with `redirect: 'follow'` and asserts the final response is not 404. Any path that returns 404 (or a non-recoverable 5xx / network error after one retry) is printed in the failure summary, and the script exits non-zero.

Common flags:

- `--host=<url>` — target a different host. Defaults to `https://docs.harperdb.io`. Useful for testing a staging or preview deployment.
- `--concurrency=<N>` — number of parallel requests. Defaults to `20`.
- `--timeout=<ms>` — per-request timeout. Defaults to `15000`.

Run it after editing either redirect file, after large Reference reorganizations, or as part of a periodic check.

### Future work

The current setup is the most we can do under static hosting: every redirect is an enumerated rule that compiles to its own HTML stub. This has two notable limitations:

- **No wildcard or prefix support.** Patterns like "redirect every `/docs/v/4.X/*` URL by stripping the `/v/` segment" cannot be expressed as a single rule — each path must be listed individually. The full `/v/` GitBook rewrite alone took 100+ explicit rules.
- **Build-time only.** Adding a redirect requires a new build and deploy. There is no way to author a redirect quickly without going through CI.

If the site is eventually re-hosted on a platform with a real request lifecycle — Harper Fabric is the natural candidate, but any Node.js host (or even a CDN edge-rewrite layer) would do — we should migrate the redirect handling to a server-side router with pattern support. At that point we could:

- Replace the entire GitBook `/v/` block with a single regex rule (`/^\/docs\/v\/(.*)$/` → `/docs/$1`).
- Normalize trailing slashes once in the router instead of as duplicated rules.
- Author redirects without needing a full Docusaurus rebuild.
- Optionally emit redirect metrics (which legacy paths still receive traffic) directly from the router rather than relying on GA exports.

Until then, every new redirect goes in `redirects.ts` (or, for historical paths discovered later, `historic-redirects.ts`) as an explicit rule.

## Known Issues

### `docusaurus serve` 404s on `/docs/4.X` paths

`docusaurus serve` uses `serve-handler`, which treats ending URL path segments containing a singular dot (e.g. `4.6`) as file extensions rather than directory names. This causes `/docs/4.6` to 404 locally even though the redirect page exists at `build/docs/4.6/index.html`. This doesn't apply to nested paths such as `/docs/4.6/developers`.

A fix has been submitted upstream at https://github.com/vercel/serve-handler/pull/230. Once it merges and Docusaurus upgrades its dependency, the local patch can be removed.

In the meantime, if you need to test these redirects locally, apply a change in `node_modules/serve-handler/src/index.js` around line 608 where you clear the `stats` variable from `lstat` if it is a directory so it falls through to the nested `index.html`.

```js
if (path.extname(relativePath) !== '') {
	try {
		stats = await handlers.lstat(absolutePath);
		if (stats && stats.isDirectory()) {
			stats = null;
		}
	} catch (err) {
		if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
			return internalError(absolutePath, response, acceptsJSON, current, handlers, config, err);
		}
	}
}
```

## Release Notes Process

When adding release notes for a new HarperDB version, follow these steps:

### 1. Create the Release Note File

Add a new markdown file in the appropriate version directory:

- Path: `release-notes/v4-tucker/{version}.md` (e.g., `4.7.1.md`)
- Include the standard frontmatter with title
- Add the date and version details
- List all changes, fixes, and improvements

Example structure:

```markdown
---
title: 4.7.1
---

# 4.7.1

MM/DD/YYYY

- Feature or fix description
- Another change description
```

For alpha/beta releases, include the appropriate warning admonition.

### 2. Update the Version Index (Minor Versions Only)

For new minor versions (e.g., 4.8.0), update the version index file at `release-notes/v4-tucker/index.mdx`:

- Add a new `<LatestPatchLink>` component section for the new minor version
- Include a summary of the major features introduced in that minor version line
- Place the newest minor version at the top of the file

**Note**: For patch releases (e.g., 4.7.1, 4.7.2), you do NOT need to update the index file. The `<LatestPatchLink>` component automatically finds and links to the latest patch version.

Example:

```mdx
## <LatestPatchLink major={4} minor={7} label="4.7" />

- Major feature summary for 4.7.x releases
- Another significant capability added
```

### 3. Automatic Updates

The following updates happen automatically through the system:

- **Sidebar Navigation**: The release notes sidebar uses `autogenerated` directives, so new release note files are automatically included
- **Latest Version Links**: The `<LatestPatchLink>` component automatically finds and links to the latest patch version for a given major.minor combination
- **Sorting**: Release notes are automatically sorted by semantic version in the sidebar

### 4. Considerations

- Release notes are separate from the main documentation versioning system
- All release notes live in the `release-notes/` directory, not in `versioned_docs/`
- The release notes plugin is configured in `docusaurus.config.ts` with its own routing and sidebar
- The main navigation links directly to v4 Tucker release notes as the default
