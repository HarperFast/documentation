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

- Node.js (version 22.12.0 or later; `.node-version` selects Node 24)
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

CI runs `npm run format:check` on every pull request and will fail if anything is unformatted. If CI fails on formatting, run `npm run format:write` locally and commit the result. Prettier is configured via `@harperfast/code-guidelines/prettier` (see `package.json`).

## Code Checks

Run `npm run lint` to lint JavaScript and TypeScript with oxlint. Warnings fail the check. The vendor-provided Reo loader (`static/js/reo.js`) is excluded.

Run `npm run build` to check the whole site: it fails on broken links, missing imports and MDX errors, and CI runs it as the Site Build check. The documented-example checks for the v5 reference run in HarperFast/harper, next to the fixtures they compare against.

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
| Current (v5) content  | `docs/reference/` in harper and harper-pro (see below)  |
| Archived (v4) content | `reference_versioned_docs/version-v4/`                  |
| Current sidebar       | autogenerated from the assembled tree                   |
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

The open minor's notes (5.4 and later) are fragments in `docs/release-notes/` of harper and harper-pro, assembled at build time; released minors before 5.4 and all v4-and-older notes stay here. Release notes are non-versioned in the Docusaurus sense — major version organization is handled manually via subdirectories (`v5-lincoln/`, `v4-tucker/`, `v3-monkey/`, etc.). The sidebar uses `autogenerated` directives so new files are picked up automatically. See the [Release Notes Process](#release-notes-process) section for the full workflow.

#### Fabric

| Item          | Location                                    |
| ------------- | ------------------------------------------- |
| Content       | `fabric/`                                   |
| Sidebar       | `sidebarsFabric.ts`                         |
| Plugin config | `docusaurus.config.ts` → plugin id `fabric` |

Fabric is non-versioned. It documents the managed cloud platform independently of the Harper core product.

---

### Reference and Release Notes Content

The v5 reference and the open minor's release notes are written in the code repos, next to the code they describe: `docs/` in [HarperFast/harper](https://github.com/HarperFast/harper/tree/main/docs) and [HarperFast/harper-pro](https://github.com/HarperFast/harper-pro/tree/main/docs). [`scripts/assemble-content.mjs`](scripts/assemble-content.mjs) builds `reference/` and `release-notes/<codename>/<minor>.generated.md` from them before every build (both are git-ignored here). The section structure, version annotations and writing conventions are in [harper's docs/README.md](https://github.com/HarperFast/harper/blob/main/docs/README.md).

The site publishes harper-pro's latest published stable release (a release whose tag is pushed but which is still a draft does not count), with harper's docs from the commit harper-pro's `core` submodule points to there: the harper that release was built from. Docs merged with unreleased code appear when that code ships; a correction to the published docs appears with the next patch release (milestone the PR to the latest release line, so it is cherry-picked there), or sooner from a `docs/<release>-<n>` tag in harper-pro, which the site publishes in place of the release until the next release ([how to tag one](https://github.com/HarperFast/harper/blob/main/docs/README.md#when-docs-publish)). The site shows only the latest release, so corrections that land only on older release lines do not publish. Until a release contains `docs/`, the site publishes `main`.

To preview a local checkout, point the build at it. A harper-pro without a path is fetched at what the site publishes, or at the ref in `HARPER_PRO_DOCS_REF`; a harper without one comes from harper-pro's `core` (its `core/` checkout, when harper-pro is local), or from the ref in `HARPER_DOCS_REF`:

```bash
HARPER_DOCS_PATH=../harper HARPER_PRO_DOCS_PATH=../harper-pro npm run dev
```

The content-check workflow runs when harper-pro publishes a release or pushes a `docs/` tag (a `docs-source-changed` repository dispatch from its `publish-docs.yaml`), and hourly in case a dispatch failed: when either repo's `docs/` tree at the ref the site would publish (`node scripts/assemble-content.mjs --sources`) differs from the one the live site was built from (published at `/content-sources.json`), it redeploys both sites.

A harper or harper-pro PR that changes `docs/` gets a preview of this site built from it once someone adds the `docs-preview` label. Its `docs-preview.yaml` sends a `docs-source-pr-preview` repository dispatch when the label is added and on each push while it stays (`docs-source-pr-preview-cleanup` when the label is removed, or the PR closes with it), and [`source-pr-preview.yaml`](.github/workflows/source-pr-preview.yaml) here builds the PR's head (a harper PR with harper-pro at the branch named like its base; a harper-pro PR with harper at its `core` pointer), deploys it as `harper-pr-<n>` or `harper-pro-pr-<n>`, and keeps one comment with the link on the PR. The preview is up only while the PR is open and labeled: removing the label or closing the PR takes it down, and a build that reaches its deploy step after that is not deployed. The build runs the PR's MDX, so it holds no secrets and, for a fork's PR, waits for approval in the `preview` environment.

## Redirects

The site is hosted as a static build on GitHub Pages, so there is no server-side router that can rewrite incoming URLs. All redirect handling is therefore done **client-side** by the [`@docusaurus/plugin-client-redirects`](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-client-redirects) plugin: at build time it emits a small HTML page for every `from` path that immediately navigates the browser to the `to` path. Because the redirect HTML is generated per-path, every redirect must be enumerated explicitly — there is no pattern, prefix, or wildcard support.

### `redirects.ts` vs. `historic-redirects.ts`

The redirect rules are split across two files to keep the two distinct populations of legacy URLs visually and logically separated:

| File                                                     | Source paths                                                       | Targets                         | When to edit                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------- |
| [redirects.ts](redirects.ts)                             | Non-versioned `/docs/*` paths (e.g. `/docs/developers/rest`)       | Mostly `/reference/v5/*`        | Whenever a current Reference or Learn page is renamed or removed.    |
| `docs/reference/_redirects.json` in harper or harper-pro | Old `/reference/v5/*` paths                                        | `/reference/v5/*`               | In the PR that renames or removes a v5 reference page.               |
| [historic-redirects.ts](historic-redirects.ts)           | Versioned `/docs/4.X/*` paths and the GitBook `/docs/v/4.X/*` form | Almost always `/reference/v4/*` | Rarely — only when new analytics data surfaces a missed legacy path. |

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
