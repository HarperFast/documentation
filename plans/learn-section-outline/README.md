# Learn Section Outline

Plan for building out the **Learn** guided-learning track. Tracks
[#519](https://github.com/HarperFast/documentation/issues/519).

This plan is **agentic-first**: it is written so an AI agent (or a contributor
driving one) can execute it end-to-end — generating tracking issues, then
authoring each guide in its own branch with a local review pass and an individual
PR. Humans review the PRs.

---

## 1. Background

The Learn track was bootstrapped from a Confluence content outline. The original
outline referenced a `/docs/...` structure that **no longer exists** — the docs
were restructured into `learn/`, `reference/`, and `fabric/` in commit `01c78b8e`
("initializing the new learn tab", #404).

Two things this plan corrects from the original outline:

1. **Paths moved `/docs/` → `/reference/`** (and the legacy tree is recoverable —
   see §3).
2. **Several planned guides already shipped** — they must be skipped (see §2).

## 2. Current state of `learn/`

```
learn/
  index.mdx
  _guide-template.mdx                          ← author template (follow this)
  getting-started/
    install-and-connect-harper.mdx             ✅ shipped
    create-your-first-application.mdx          ✅ shipped
    using-agents.mdx                           ✅ shipped (was "AI Best Practices")
  developers/
    harper-applications-in-depth.mdx           ✅ shipped (was "Key Harper Application Features")
    caching-with-harper.mdx                    ✅ shipped (was "Caching Pt. 1")
    active-caching-subscriptions.mdx           ✅ shipped (caching series)
    semantic-caching-vector-indexing.mdx       ✅ shipped (caching series)
    write-through-caching.mdx                  ✅ shipped (caching series)
    caching-ai-generations.mdx                 ✅ shipped (caching series)
  administration/
    coming-soon.md                             placeholder
```

**The entire caching series shipped ahead of plan.** But **Custom Resources** —
declared a _prerequisite_ for caching in the original outline — does **not** exist
yet. The dependency is currently inverted; Custom Resources (guide #9 below) should
be prioritized and the shipped caching guides back-linked to it once it lands.

## 3. Path resolution: `/docs/` → `/reference/`

For each planned guide, prefer the **current `reference/` doc** as the source of
truth. The deleted legacy `/docs/` page is available for narrative/tutorial framing
that may not have survived the reference rewrite.

> **Legacy content** lives at git ref **`0f754c5f`** (parent of `01c78b8e`):
>
> ```bash
> git show 0f754c5f:docs/<path>
> git ls-tree -r --name-only 0f754c5f | grep '^docs/'
> ```

| Topic                        | Legacy `/docs/` path                                                         | Current `reference/` source                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Architecture / core concepts | `foundations/harper-architecture`, `foundations/core-concepts`               | `components/overview.md`, `index.md`                                                         |
| Applications                 | `developers/applications/index`                                              | `components/applications.md`                                                                 |
| Debugging                    | `developers/applications/debugging`                                          | `configuration/debugging.md`                                                                 |
| Schema                       | `developers/applications/defining-schemas`                                   | `database/schema.md`                                                                         |
| Data Loader                  | `developers/applications/data-loader`                                        | `database/data-loader.md`                                                                    |
| Roles                        | `developers/applications/defining-roles`                                     | `users-and-roles/configuration.md`                                                           |
| Users & roles                | `developers/security/users-and-roles`                                        | `users-and-roles/overview.md`                                                                |
| Custom resources             | `developers/applications/index`                                              | `resources/resource-api.md`, `resources/overview.md`                                         |
| Query optimization           | `reference/resources/query-optimization`                                     | `resources/query-optimization.md`                                                            |
| REST                         | `developers/rest`                                                            | `rest/overview.md`, `rest/querying.md`                                                       |
| Real-time                    | `developers/real-time`                                                       | `rest/websockets.md`, `rest/server-sent-events.md`                                           |
| Web apps / routes            | `developers/applications/web-applications`, `.../define-routes`              | `static-files/overview.md`, `components/nextjs.md`, `fastify-routes/overview.md`             |
| Plugins / extensions         | `reference/components/plugins`, `.../extensions`                             | `components/plugin-api.md`, `components/extension-api.md`                                    |
| Replication / sharding       | `developers/replication/sharding`, `.../index`                               | `replication/sharding.md`, `replication/overview.md`, `replication/clustering.md`            |
| Logging                      | `administration/logging/*`                                                   | `logging/overview.md`, `logging/configuration.md`, `logging/api.md`, `logging/operations.md` |
| Analytics                    | `developers/operations-api/analytics`                                        | `analytics/overview.md`, `analytics/operations.md`                                           |
| Certificates                 | `developers/security/certificate-management`, `.../certificate-verification` | `security/certificate-management.md`, `security/certificate-verification.md`                 |
| Security config              | `developers/security/configuration`                                          | `security/configuration.md`, `http/configuration.md`, `http/tls.md`                          |
| Compaction                   | `administration/compact` _(named `compact`)_                                 | `database/compaction.md`                                                                     |
| Jobs                         | `administration/jobs`                                                        | `database/jobs.md`, `operations-api/operations.md`                                           |

> **In-guide links** should use the published doc URL form `/reference/v5/...`
> (the current docs version), not raw repo paths. Repo paths above are for the
> author/agent to read source material.

## 4. Guide inventory & ordering

20 guides to produce (3 already shipped are omitted). The order encodes the
intended authoring sequence; the Developers track is a dependency chain.

**Getting Started**

1. Deploy to Fabric

**Developers** (author roughly in order — each builds on the previous) 4. Defining Databases and Tables 5. Loading Data 6. Users & Roles 7. Querying and Interacting with Data 8. Real-Time Data Access Introduction 9. **Custom Resources** — _prioritize; prerequisite for the already-shipped caching guides_ 10. Web Apps 12. Data with Replication 13. Plugin Development

**Administration** 14. Running Harper Locally · 15. Running Harper in a Container · 16. Fabric
Deployment Guide · 17. Manual / Local Replication Setup · 18. Logging · 19. Analytics & Grafana Plugin · 20. Certificate Management & Verification · 21. Security Configuration · 22. Compaction · 23. Jobs

_(Numbers 2, 3, 11 intentionally absent — already shipped.)_

Full per-guide scope is in [`issues/`](./issues) — one Markdown file per guide,
used verbatim as the GitHub issue body in Phase 1.

### Overlaps with existing open issues

Dedupe before/at issue creation — cross-link, and close pure duplicates:

- #16 Fabric Deployment ↔ **#502** (CI/CD Fabric deploy) — strongest overlap; merge.
- #1 Deploy to Fabric ↔ #478, #502.
- #5 Loading Data / #13 Plugin Dev ↔ **#513** (restart behavior).
- #12 / #17 / #20 ↔ #510, #511 (clustering & TLS).
- #7 Querying ↔ #490 (relational selects).

## 5. Conventions

- **Template:** every guide follows `learn/_guide-template.mdx` — intro,
  _What You Will Learn_, _Prerequisites_, body sections, _Additional Resources_.
- **Location:** `learn/<section>/<slug>.mdx` (`getting-started` | `developers` |
  `administration`).
- **Sidebar:** register the new doc in `sidebarsLearn.ts`. Getting Started and
  Developers use explicit ordered entries; Administration is `autogenerated` —
  adding a file there is enough, but set front-matter `sidebar_position` for order.
  Remove `administration/coming-soon.md` once the first admin guide lands.
- **Issues:** label `content`, issue **type `Feature`**, title prefix `[Learn]`.
- **PRs:** one PR per guide. Title `docs: add Learn guide — <name>`. Link the PR to
  its issue with `Closes #<n>`. Request review from **`@HarperFast/developers`**
  (per `.github/CODEOWNERS`).
- **Branches/commits:** use a worktree per guide (see §7). Commit messages follow
  the repo's `docs: ...` convention.

## 6. Phase 1 — generate tracking issues

[`create-issues.sh`](./create-issues.sh) creates the 20 `[Learn]` issues from the
body files in [`issues/`](./issues), each labeled `content` and typed `Feature`.

```bash
cd plans/learn-section-outline
./create-issues.sh             # dry-run — preview
./create-issues.sh --create    # create the issues
```

It skips the shipped guides and applies the `Feature` type via the REST API (since
`gh` has no `--type` flag). Record the resulting issue numbers — Phase 2 references
them.

## 7. Phase 2 — agentic guide generation

For **each** guide issue, an agent runs this loop. One guide → one branch → one PR.
Do them one or a few at a time; respect the §4 ordering (Custom Resources early).

1. **Isolate.** Create a worktree + branch off latest `main`:
   ```bash
   git worktree add "$PWD/.claude/worktrees/learn-<slug>" -b learn/<slug>
   ```
2. **Gather source.** Read the linked issue body, the `reference/` sources it
   names (§3), the shipped guides it builds on, and `learn/_guide-template.mdx`.
   Pull legacy narrative with `git show 0f754c5f:docs/...` where useful.
3. **Draft.** Write `learn/<section>/<slug>.mdx` against the template. Use real,
   runnable examples (`curl`/`fetch`, Operations API, CLI). Link related guides and
   `/reference/v5/...` docs. Register it in `sidebarsLearn.ts`.
4. **Self-review (local, agentic).** Run the internal review skill on the diff
   before opening the PR:
   ```
   /review
   ```
   Use `/code-review` for prose/example correctness and `/deep-review` when a guide
   ships runnable code/config worth a reliability pass. Address findings, repeat
   until clean.
5. **Verify the build.** `node scripts/prebuild.js && docusaurus build` (or
   `docusaurus start`) — confirm the page renders, sidebar entry appears, and links
   resolve. See `CONTRIBUTING.md` for the `serve-handler` patch caveat.
6. **Commit & push.**
   ```bash
   git add learn/<section>/<slug>.mdx sidebarsLearn.ts
   git commit -m "docs: add Learn guide — <name>"
   git push -u origin learn/<slug>
   ```
7. **Open the PR.** `Closes #<issue>`; request review from
   `@HarperFast/developers`:
   ```bash
   gh pr create --base main --head learn/<slug> \
     --title "docs: add Learn guide — <name>" \
     --body "Closes #<issue>. ..." \
     --reviewer HarperFast/developers
   ```
8. **Iterate** on review feedback. On merge, clean up:
   `git worktree remove "$PWD/.claude/worktrees/learn-<slug>"`.

### Guardrails for the agent

- One guide per PR — keep diffs reviewable.
- Never invent APIs/behavior: every claim traces to a `reference/` doc or verified
  example. When unsure, flag it in the PR description rather than guessing.
- Match the voice and depth of the already-shipped guides
  (`learn/developers/caching-with-harper.mdx` is a good exemplar).
- Honor prerequisites: a guide may assume only Getting Started + guides earlier in
  the §4 order.

## 8. Open decisions (for maintainers)

- Whether to close/merge #502 into guide #16.
- Whether to add a dedicated `learn` label for track-wide filtering (currently
  `content` only).
- v4 vs v5 scope for guides #12/#14/#17 (replication/install) given `reference/` is
  versioned.
