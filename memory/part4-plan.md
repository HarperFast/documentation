# Part 4: Cross-Reference Updates — Plan & Procedure

## Overview

Update links in `release-notes/` and `learn/` that point to old doc paths, mapping them to the new `reference_versioned_docs/version-v4/` structure.

**Branch**: Create a new branch `cross-reference-updates` off `major-version-reorg` (after `link-resolution` is merged).

**Commit strategy**: One commit per file group (release notes in one commit, learn guides in another, or broken down further if large).

---

## Scope of Changes

### Release Notes (`release-notes/v4-tucker/`)

171 files total. Only ~7 files have `/docs/` links that need updating. The full list of unique links found (grep: `(/docs/[^)"\ ]*)` across all `release-notes/v4-tucker/*.md`):

| Old Path                                                                              | New Path                                                     | Notes                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `/docs/deployments/configuration`                                                     | `/docs/v4/configuration/overview`                            | 7 occurrences                                       |
| `/docs/reference/resources`                                                           | `/docs/v4/resources/overview`                                | 4 occurrences                                       |
| `/docs/developers/applications/defining-schemas`                                      | `/docs/v4/database/schema`                                   | 4 occurrences                                       |
| `/docs/reference/graphql`                                                             | `/docs/v4/graphql-querying/overview`                         | 1 occurrence                                        |
| `/docs/reference/components/extensions`                                               | `/docs/v4/components/extension-api`                          | 1 occurrence                                        |
| `/docs/reference/components/applications?_highlight=github#adding-components-to-root` | `/docs/v4/components/applications#adding-components-to-root` | 1 occurrence                                        |
| `/docs/reference/blob`                                                                | `/docs/v4/database/schema#blob-storage`                      | 1 occurrence                                        |
| `/docs/developers/rest`                                                               | `/docs/v4/rest/overview`                                     | 1 occurrence                                        |
| `/docs/developers/replication/sharding`                                               | `/docs/v4/replication/sharding`                              | 1 occurrence                                        |
| `/docs/developers/replication/`                                                       | `/docs/v4/replication/overview`                              | 1 occurrence                                        |
| `/docs/developers/real-time`                                                          | `/docs/v4/rest/websockets`                                   | 1 occurrence (real-time = websockets+SSE+MQTT)      |
| `/docs/developers/operations-api/clustering`                                          | `/docs/v4/replication/clustering`                            | 1 occurrence                                        |
| `/docs/developers/applications/data-loader`                                           | `/docs/v4/database/data-loader`                              | 1 occurrence                                        |
| `/docs/deployments/harper-cli`                                                        | `/docs/v4/cli/overview`                                      | 1 occurrence                                        |
| `/docs/administration/logging/`                                                       | `/docs/v4/logging/overview`                                  | 1 occurrence                                        |
| `/docs/administration/cloning`                                                        | N/A — learn guide (not in reference)                         | Leave or link to learn guide if exists              |
| `/docs/4.1/custom-functions/host-static`                                              | `/docs/v4/legacy/custom-functions`                           | Legacy redirect                                     |
| `/docs/4.1/configuration#storage`                                                     | `/docs/v4/configuration/options#storage`                     | 1 occurrence                                        |
| `/docs/4.1/configuration#session-affinity`                                            | `/docs/v4/configuration/options#http`                        | 1 occurrence (http section covers session affinity) |
| `/docs/4.1/configuration#schemas`                                                     | `/docs/v4/database/schema`                                   | 1 occurrence                                        |

> **NOTE**: The exact URL prefix for the new structure (`/docs/v4/`) needs to be verified. Check `docusaurus.config.js` or `reference_versioned_sidebars/version-v4-sidebars.json` for the versioned path prefix. It may be `/docs/v4/` or `/reference/v4/` or similar.

**Files that contain links (to edit):**

- `release-notes/v4-tucker/4.1.0.md` — `/docs/4.1/configuration#*` and `/docs/4.1/custom-functions/*`
- `release-notes/v4-tucker/4.2.0.md` — `/docs/reference/resources`, `/docs/reference/components/*`
- `release-notes/v4-tucker/4.3.0.md` — `/docs/reference/resources`
- `release-notes/v4-tucker/4.4.0.md` — `/docs/developers/applications/defining-schemas`, `/docs/reference/resources`, `/docs/reference/graphql`
- `release-notes/v4-tucker/4.5.0.md` — `/docs/reference/blob`, `/docs/deployments/configuration`

**To find all affected files precisely**: `grep -rl "/docs/" release-notes/v4-tucker/`

---

### Learn Guides (`learn/`)

Only 4 content files currently exist (most are stubs):

- `learn/developers/harper-applications-in-depth.mdx`
- `learn/getting-started/create-your-first-application.mdx`
- `learn/getting-started/install-and-connect-harper.mdx`
- `learn/index.mdx`

Links found in `harper-applications-in-depth.mdx`:

| Old Path                                         | New Path                                                     |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `/docs/reference/components/built-in-extensions` | `/docs/v4/components/overview#built-in-extensions-reference` |
| `/docs/reference/resources`                      | `/docs/v4/resources/overview`                                |
| `/docs/reference/globals#logger`                 | `/docs/v4/logging/api`                                       |
| `/docs/reference/resources/`                     | `/docs/v4/resources/overview`                                |
| `/docs/reference/components/`                    | `/docs/v4/components/overview`                               |

---

## Procedure

### Step 1: Verify URL prefix

Before editing any links, confirm what the new URL prefix is for `reference_versioned_docs/version-v4/`. Check:

```bash
cat docusaurus.config.js | grep -A5 "reference_versioned"
# or
cat reference_versioned_sidebars/version-v4-sidebars.json | head -5
```

The prefix is likely `/docs/v4/` but confirm before proceeding.

### Step 2: Find all affected release note files

```bash
grep -rl "/docs/" release-notes/v4-tucker/
```

This gives the exact list of files to edit.

### Step 3: Edit release notes

For each affected file, replace old `/docs/` paths with new `/docs/v4/` paths per the mapping table above.

### Step 4: Edit learn guides

Read each of the 4 learn guide files, apply the mapping table above.

### Step 5: Check for any remaining old-path links across the whole repo

```bash
grep -rn "/docs/reference/" --include="*.md" --include="*.mdx" release-notes/ learn/
grep -rn "/docs/developers/" --include="*.md" --include="*.mdx" release-notes/ learn/
grep -rn "/docs/deployments/" --include="*.md" --include="*.mdx" release-notes/ learn/
grep -rn "/docs/administration/" --include="*.md" --include="*.mdx" release-notes/ learn/
grep -rn "/docs/4\." --include="*.md" --include="*.mdx" release-notes/ learn/
```

### Step 6: Commit

- Commit release notes changes: `docs(cross-refs): update old /docs/ links in release notes to v4 reference paths`
- Commit learn guide changes: `docs(cross-refs): update old /docs/ links in learn guides to v4 reference paths`

---

## Key Uncertainties to Resolve

1. **URL prefix** — Confirm whether new reference pages are served at `/docs/v4/`, `/reference/v4/`, or another prefix. **Critical before editing any links.**
2. **`/docs/administration/cloning`** — This was flagged in migration map as "move to Learn guide." If no learn guide exists yet, either leave as-is (broken link) or remove the link text.
3. **`/docs/developers/real-time`** — This page covered WebSockets, SSE, and MQTT. Best split into: WebSockets content → `rest/websockets`, MQTT content → `mqtt/overview`. In context of release notes, pick whichever is most relevant to the surrounding text.

---

## Non-Goals for Part 4

- Do NOT edit `versioned_docs/` files
- Do NOT edit `reference_versioned_docs/` files (those were handled in Part 3)
- Do NOT update links in the v1/v2/v3 release notes (out of scope)
- Do NOT update links in other config files (docusaurus.config.js, sidebars, etc.) — that's Part 5

---

## After Part 4

Proceed to **Part 5: Redirects** — configure redirects from old `/docs/developers/`, `/docs/reference/`, etc. paths to the new `/docs/v4/` equivalents in `docusaurus.config.js` (or wherever redirects are configured).
