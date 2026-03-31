# Harper v4 Documentation Rewrite — Project Retrospective

**Date**: 2026-03-31
**Branch**: `major-version-reorg`
**Duration**: ~6 weeks (2026-02-18 → 2026-03-31)

---

## What We Set Out to Do

The Harper v4 reference documentation had accumulated across seven minor version folders (`versioned_docs/version-4.1/` through `versioned_docs/version-4.7/`). Each minor version was a near-complete copy of the previous with additions — so any given page existed seven times, with subtle diffs that were nearly impossible to reason about together. On top of that, the content was organized by _user role_ ("Developers", "Administration", "Deployments") rather than by _feature_, which made individual capabilities like MQTT or Static Files genuinely hard to discover.

The project had two simultaneous transformation goals:

**Horizontal consolidation**: Merge seven versioned folders into a single `reference/v4/` document, using inline version annotations (Node.js documentation style) to record when features were added, changed, or deprecated across minor versions.

**Vertical reorganization**: Restructure content from role-based groupings to a flat, feature-based hierarchy where each Harper built-in plugin or capability is a top-level section immediately visible in the sidebar.

An additional constraint: the old `/docs/` URL space had been live for years, with backlinks across the internet and real traffic measured in Google Analytics. Every page needed a redirect to its new location — and the redirect mapping needed to be driven by data, not guesswork.

---

## Planning Phase (2026-02-17 → 2026-02-19)

### The Research Foundation

Before any migration tooling or structure was created, manual research was done to map the evolution of Harper features across all seven minor versions. This is documented in [v4-docs-research.md](./v4-docs-research.md), which walks through what changed at each version from v4.1 to v4.7.

Notable findings from this research:

- The role-based navigation (`Developers` / `Administration`) had silently broken in v4.4 when [PR #303](https://github.com/HarperFast/documentation/blob/ade07fd9428b0321c047ac8243ad1106bb0de2a8/versioned_sidebars/version-4.4-sidebars.json) restructured developer onboarding and removed the `developers/` tab from the sidebar — those paths existed but were invisible for ~4 months.
- The evolution of "Custom Functions → Components → Applications/Extensions → Plugins" was one of the trickiest naming threads to track, since AI-generated timelines kept getting confused by the naming history.
- Transaction logging and audit logging had historically lived under `logging/` but conceptually belonged in `database/` — this was one of several reorganization decisions made during research.

An AI-generated feature history file ([v4-feature-history-ai-gen.md](./v4-feature-history-ai-gen.md)) was also produced but flagged explicitly as "use with caution" — AI struggled with the naming evolution and the research notes reflect that the human was better positioned to piece it together.

### The Plan Documents

On **2026-02-18**, commit [`78eca4be`](https://github.com/HarperFast/documentation/commit/78eca4bed4630fd81f8f9328c7ed7e0e603a9589) created five planning documents in one shot (4,487 lines across 7 files):

- **[v4-docs-project-brief.md](./v4-docs-project-brief.md)** — executive summary, status dashboard, key decisions log, team assignments
- **[v4-docs-reference-plan.md](./v4-docs-reference-plan.md)** — target structure philosophy, version annotation strategy, the full reference outline (directory tree), redirect philosophy
- **[v4-docs-migration-map.md](./v4-docs-migration-map.md)** — file-by-file mapping from old paths to new paths, with primary sources, additional sources, and merge requirements for each page
- **[v4-docs-implementation-plan.md](./v4-docs-implementation-plan.md)** — agent instructions, PR template, link placeholder format, section ordering
- **[v4-docs-research.md](./v4-docs-research.md)** — manual research notes (pre-existing, also committed here)

Key architectural decisions made during planning:

1. **Feature-first organization**: Stop grouping by "Developers" / "Administration". Make every Harper capability (CLI, MQTT, Static Files, Components, etc.) a top-level sidebar section. This mirrors how Stripe, Node.js, and other API docs are organized, and more accurately maps to how Harper is actually built — around plugins and features.

2. **`overview.md` instead of `index.md`**: Following the Learn section pattern, reference sections use non-collapsible sidebar headers with an explicit `overview.md` at the top. No hidden index pages.

3. **Primary vs. secondary reference pattern**: For features that span multiple sections (like Operations APIs), there's one exhaustive primary reference that other sections link to with only quick-reference summaries. Prevents duplication while maintaining discoverability.

4. **Inline version annotations**: Node.js-style annotations (`Added in: v4.3.0`) placed inline in the content, not in YAML frontmatter. Confidence levels were required — agents had to distinguish `(confirmed via release notes)` from `(inferred from version comparison, needs verification)`.

5. **`TODO:path` link placeholders**: Since 20 sections were being written in parallel across PRs, cross-section links couldn't be real until after all sections existed. The format `[Text](TODO:reference_versioned_docs/version-v4/section/page.md 'description')` was chosen for easy grep/replace in a later cleanup pass.

6. **AI-first, human-review workflow**: AI agents (Claude Code in VSCode) do initial content generation from the source files; humans review, edit, and merge. Not fully automated — visibility and quality control were prioritized over speed.

7. **Target directory**: Content goes to `reference_versioned_docs/version-v4/` first (not `reference/`), with a later copy step to `reference/` to kickstart v5. This kept v5 concerns out of scope.

On **2026-02-19**, commit [`241f8cbe`](https://github.com/HarperFast/documentation/commit/241f8cbeab330140999a045c5db6e3b4eadf08d8) configured the build system for the migration branch:

- Temporarily disabled the local search plugin
- Set `onBrokenLinks: 'warn'` (would throw in production; needed to allow incremental builds during migration)
- Added redirect page infrastructure
- The site now built successfully, ready for migration PRs

Also in this commit: `scripts/harper-docs-analytics.csv` — 1,635 rows of Google Analytics pageview data (Oct 2025 – Feb 2026) that would later drive the redirect priority decisions.

A `scripts/analyze-pageview-data.mjs` script was also created to process the CSV and surface the top-trafficked paths.

---

## Content Migration Phase (2026-02-23 → 2026-03-27)

The migration was structured into five phases based on complexity. Each section was a separate PR merged into `major-version-reorg`, with Claude Code generating initial content from the source versioned files.

### Phase 1A — Simple, Stable Sections

| Section          | PR Merged  | Commit                                                                                                    |
| ---------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| CLI              | 2026-02-23 | [`021d8000`](https://github.com/HarperFast/documentation/commit/021d80004f8a3b8be9d2be9faecbc33ca583e30d) |
| GraphQL Querying | 2026-02-24 | [`af96a726`](https://github.com/HarperFast/documentation/commit/af96a726203b35952583bd3eba6e226c419cb7a5) |
| Studio           | 2026-02-24 | [`2c599700`](https://github.com/HarperFast/documentation/commit/2c599700eb40ab9ea9c91587e270026018515fc2) |
| Fastify Routes   | 2026-02-24 | [`c6c99e5f`](https://github.com/HarperFast/documentation/commit/c6c99e5f6a94901bae80bdc98524bce7fd82dbce) |

### Phase 1B — Medium Complexity

| Section               | PR Merged  | Commit                                                                                                    |
| --------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| Environment Variables | 2026-02-25 | [`cd47bee3`](https://github.com/HarperFast/documentation/commit/cd47bee3d2bc5e48c4fe88d5b7f56bb9a5b1c20f) |
| HTTP                  | 2026-02-26 | [`fa4d2f38`](https://github.com/HarperFast/documentation/commit/fa4d2f38db2c6668dc336700375f2528ee36477b) |
| Static Files          | 2026-03-02 | [`2d5d2939`](https://github.com/HarperFast/documentation/commit/2d5d2939003f612ff3f773c14b68fd0a5b217fc6) |
| Logging               | 2026-03-04 | [`5271417c`](https://github.com/HarperFast/documentation/commit/5271417cb87021a21f078584b95d729e2d37aad9) |
| Analytics             | 2026-03-10 | [`5fa17671`](https://github.com/HarperFast/documentation/commit/5fa176712840179889e16adb64e2cfe2c4deade7) |
| MQTT                  | 2026-03-11 | [`e46a359f`](https://github.com/HarperFast/documentation/commit/e46a359f2b0b6d9d9e08a80bfe84dadf19e80d95) |

### Phase 1C — Complex Sections

| Section                  | PR Merged  | Commit                                                                                                    |
| ------------------------ | ---------- | --------------------------------------------------------------------------------------------------------- |
| Security + Users & Roles | 2026-03-17 | [`37580219`](https://github.com/HarperFast/documentation/commit/3758021962bc06ccd8e4ebaef5aea4cd4e7173a2) |
| REST                     | 2026-03-18 | [`ac8b9c90`](https://github.com/HarperFast/documentation/commit/ac8b9c90fb32e48a2e3eec05e86831d9cb3e0ebe) |
| Database                 | 2026-03-26 | [`3508aabc`](https://github.com/HarperFast/documentation/commit/3508aabcf6da255b696100710d2f1e68ccea02c0) |
| Resources                | 2026-03-26 | [`625fa2b6`](https://github.com/HarperFast/documentation/commit/625fa2b615e6079bf4b082100c10b2bdedd67174) |
| Components               | 2026-03-27 | [`7359fcbb`](https://github.com/HarperFast/documentation/commit/7359fcbb9c1b1d5d24ef0b65f0f1b1be8d7e1963) |
| Replication              | 2026-03-27 | [`ef09307e`](https://github.com/HarperFast/documentation/commit/ef09307e382a49b743aefee3a4ec0caa23665033) |

### Phase 1D — Cross-Cutting Sections

| Section        | PR Merged  | Commit                                                                                                    |
| -------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| Operations API | 2026-03-27 | [`4f7fc1e0`](https://github.com/HarperFast/documentation/commit/4f7fc1e03eb6dd99cff69c28fc4f8117afac67c4) |
| Configuration  | 2026-03-27 | [`ffc57e0d`](https://github.com/HarperFast/documentation/commit/ffc57e0d2bdf4b811d951d1a6015486433727549) |

### Phase 1E — Legacy Content

Added during migration in commit [`92ef6d5b`](https://github.com/HarperFast/documentation/commit/92ef6d5bc29c4b387261f6ab1fc6f6152d2dacb8):

- `legacy/cloud.md` — Harper Cloud landing page directing to Fabric
- `legacy/custom-functions.md` — what Custom Functions were; points to Components
- `database/sql.md` — SQL is documented content, not just a deprecation notice, so it got a real page rather than a legacy stub

### Adaptations from the Original Plan

Several sections evolved during migration:

- **Security split**: RBAC content was broken out from `security/` into its own top-level `users-and-roles/` section. The breadth of content (operations API, config file roles, permission structure) warranted its own section.
- **HTTP TLS page**: `http/tls.md` was added during migration — TLS config warranted its own page beyond what the plan specified.
- **Components JS environment**: `components/javascript-environment.md` was added to capture JS globals (server, logger, etc.) that didn't fit cleanly elsewhere.
- **Environment Variables no config page**: `environment-variables/configuration.md` was not created — the content was ported directly into `configuration/overview.md` instead.
- **Database API page**: `database/api.md` was added for JS globals (`tables`, `databases`, `transaction()`, `createBlob()`) that didn't have a clear home in the original plan.
- **Resources global APIs not created**: `resources/global-apis.md` was skipped because that content was covered by `components/javascript-environment.md`.

---

## Link Resolution Phase (2026-03-30)

Once all 20 sections were merged, all `TODO:path` placeholders were resolved in a single PR:

- **Link Resolution PR #467** — commit [`dd8fc4fe`](https://github.com/HarperFast/documentation/commit/dd8fc4feddf047dcaceadacc0a8043c54cca62ae)

This was done section-by-section, resolving placeholders by scanning the actual files that now existed and replacing `TODO:path` strings with real relative paths. The per-section tracker files in `migration-context/link-placeholders/` were deleted after the PR merged.

**Cross-reference updates PR #468** — commit [`13e1f53b`](https://github.com/HarperFast/documentation/commit/13e1f53bb59bc49553bbf42ad7b8e7bd4f50cb36) updated old `/docs/` links in both release notes and learn guides to point to the new `/reference/v4/` paths.

---

## Redirect Strategy (2026-03-30)

### The Input Data

The redirect work was driven by two inputs:

1. **Google Analytics CSV** (`scripts/harper-docs-analytics.csv`, committed in [`fb672f4b`](https://github.com/HarperFast/documentation/commit/fb672f4bec334e05e64b1da87a1f466b8d8aff27)) — 1,635 rows of pageview data from October 2025 through February 2026. This gave traffic volumes for every old path.

2. **`scripts/analyze-pageview-data.mjs`** — a script to process the CSV and rank paths by visit count, committed alongside the analytics data.

The planning for redirects was documented in [memory/part5-redirects.md](./memory/part5-redirects.md), which contains:

- The full new URL structure (`/reference/v4/[section]/[page]`)
- Annotated list of every old path with visit counts (50+ views) and their mapped targets
- Paths explicitly identified as needing no new redirect (install guides, `/learn/`, `/fabric/`)
- Notes on the old `redirects.ts` issues (stale `withBase()` abstraction, very old HarperDB-era rules)

### The Tier System

Redirects were prioritized by traffic volume:

- **High priority (>200 views)**: 17 paths — explicit per-path redirects with comments
- **Medium priority (50–200 views)**: ~40 paths — explicit redirects
- **Low traffic (<50 views)**: Catch-all patterns rather than individual rules
- **Versioned paths (`/docs/4.X/...`)**: Low traffic across the board — catch-all redirect to `/reference/v4/`

Notable redirect decisions:

- `/docs/` root (2,854 views) → `/` (site root)
- `/docs/developers/applications/caching` (410 views) → `/reference/v4/resources/overview` (with a comment noting this should eventually point to a dedicated Learn guide)
- `/docs/reference/globals` (277 views) → `/reference/v4/components/javascript-environment` (the globals page became the JS environment page)

### The Output

Commit [`5e84ecf0`](https://github.com/HarperFast/documentation/commit/5e84ecf03a583129c5b752e79369b94d5c4d4691) (2026-03-30) — "finish redirects":

- **`redirects.ts`** — rewritten (469 lines, net +153): non-versioned `/docs/*` paths → new `/reference/v4/` paths
- **`historic-redirects.ts`** — new file (1,811 lines): versioned `/docs/4.X/*` paths → new paths
- **`scripts/pageview-data-test.js`** — 215-line test script to validate redirect coverage against the analytics data
- **`CONTRIBUTING.md`** — added notes on the `docusaurus serve` bug with `4.X` paths (the `serve-handler` bug that treats `4.6` as a file extension) and the patch procedure

---

## Old Content Deletion and Final Wiring (2026-03-30)

Three commits on the same day completed the transition:

1. **[`99bf4d81`](https://github.com/HarperFast/documentation/commit/99bf4d819d64604c8ebbda49153ca147f29ac96c)** — "checkpoint before deleting old content files" — final snapshot before deletion

2. **[`48764459`](https://github.com/HarperFast/documentation/commit/487644598ddf55344c3c1c0e908ebabeeb4c84b4)** — "delete old docs content" — removed the entire `docs/` tree: `docs/administration/`, `docs/deployments/`, `docs/developers/`, `docs/reference/`, etc. (~34 files, thousands of lines)

3. **[`0ebea43a`](https://github.com/HarperFast/documentation/commit/0ebea43acfc82215ff5d44d14ee8d40922bf4f63)** — "copy new content to reference/" — copied the finalized content from `reference_versioned_docs/version-v4/` into `reference/` to serve as the v5 starting point (as planned from the beginning)

Additional cleanup on the same day:

- [`7c62241a`](https://github.com/HarperFast/documentation/commit/7c62241afc25a184a1a0c7a82adc0c7acec12272) — removed paginator from reference section
- [`9aee72d7`](https://github.com/HarperFast/documentation/commit/9aee72d714cb458c7622f4b9f8bfa9f5cf67251a) — format pass
- [`256de664`](https://github.com/HarperFast/documentation/commit/256de664cf4526bfc78c7a82d259db929f84845f) — re-enabled `onBrokenLinks: 'throw'` (the temporary `'warn'` setting from the planning phase was finally reverted)

---

## What the Final Structure Looks Like

The new reference lives at `/reference/v4/` with 20 top-level sections, each with an `overview.md` and additional pages:

```
reference/v4/
├── analytics/          (overview, operations)
├── cli/                (overview, commands, authentication, operations-api-commands)
├── components/         (overview, applications, extension-api, javascript-environment, plugin-api)
├── configuration/      (overview, options, operations)
├── database/           (overview, schema, api, data-loader, storage-algorithm, jobs, system-tables, compaction, transaction, sql)
├── environment-variables/ (overview)
├── fastify-routes/     (overview)
├── graphql-querying/   (overview)
├── http/               (overview, configuration, api, tls)
├── legacy/             (cloud, custom-functions)
├── logging/            (overview, configuration, api, operations)
├── mqtt/               (overview, configuration)
├── operations-api/     (overview, operations)
├── replication/        (overview, clustering, sharding)
├── resources/          (overview, resource-api, query-optimization)
├── rest/               (overview, querying, headers, content-types, websockets, server-sent-events)
├── security/           (overview, basic-authentication, jwt-authentication, mtls-authentication, certificate-management, certificate-verification, configuration, api)
├── static-files/       (overview)
├── studio/             (overview)
└── users-and-roles/    (overview, configuration, operations)
```

The `versioned_docs/version-4.X/` folders were removed. The seven-version structure is gone. Version history for any feature is now expressed inline within the single v4 reference using version annotations.

---

## Notable Technical Decisions and Tradeoffs

### Why AI Agents, Not Pure Automation

The original plan considered building an Agent SDK pipeline to fully automate migrations. The decision was made to use Claude Code in VSCode instead — providing visibility at each step and allowing human intervention on each PR. The project brief ([v4-docs-project-brief.md](./v4-docs-project-brief.md#key-decisions-log)) explicitly called out: "Provides visibility and control; can pivot to automation if needed."

In practice, this meant each section still had a "manual review" commit before merging. Examples: [`253d3aae`](https://github.com/HarperFast/documentation/commit/253a3eae), [`55432eaa`](https://github.com/HarperFast/documentation/commit/55432eaa), [`c7286b58`](https://github.com/HarperFast/documentation/commit/c7286b58).

### The `--fixup` Commit Strategy

Migration branches used `git commit --fixup <hash>` for corrections to keep the development history clean while allowing easy squashing. This is described in the implementation plan and visible in the commit history of individual migration branches before squash-merge.

### Preview Deployments for the Migration Branch

Commit [`296064fd`](https://github.com/HarperFast/documentation/commit/296064fd05761486bc2861ccc6cae12a68ca6190) updated GitHub Actions workflows to generate preview deployments for PRs against `major-version-reorg` (not just PRs against `main`). This allowed reviewing each section in the rendered site before merging.

### The `docusaurus serve` / `4.X` Path Bug

While testing the final historic redirects, a bug was discovered in `serve-handler` (a Vercel library used by `docusaurus serve`) where directory paths ending in a number like `4.6` are treated as files rather than directories (because `4.6` looks like a file extension). This caused 404s on all `/docs/4.X/` paths locally. The fix required patching `node_modules/serve-handler/src/index.js` — the patch instructions were added to `CONTRIBUTING.md` in commit [`5e84ecf0`](https://github.com/HarperFast/documentation/commit/5e84ecf03a583129c5b752e79369b94d5c4d4691). An upstream PR was filed at https://github.com/vercel/serve-handler/pull/230.

### Redirect Testing with Real Analytics Data

Rather than manually checking redirects, a `scripts/pageview-data-test.js` script (215 lines, added in the "finish redirects" commit) validates redirect coverage against the actual analytics CSV. This makes the redirect file auditable — you can run the test and see which high-traffic paths have explicit redirects vs. fallthrough.

---

## By the Numbers

- **Duration**: ~6 weeks (Feb 18 – Mar 31, 2026)
- **Sections migrated**: 20
- **PRs merged (migration)**: ~20 section PRs + link resolution + cross-references
- **Source version folders eliminated**: 7 (`version-4.1` through `version-4.7`)
- **Old `docs/` files deleted**: ~100+ files across administration, deployments, developers, and reference subdirectories
- **New reference pages created**: ~60+ files
- **Redirects configured**: ~150+ explicit rules in `redirects.ts` + 1,811 lines of versioned path rules in `historic-redirects.ts`
- **Analytics paths analyzed**: 1,635 rows of pageview data used to prioritize redirect targets
- **Planning documents written**: 5 documents (~4,500 lines) before a single migration PR was opened
