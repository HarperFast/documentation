# AGENTS.md

Review `README.md` and `CONTRIBUTING.md` for all relevant repository information.

## Development Tips

- Use `npm install` to install dependencies.
- Use `npm run dev` to start the local development server (runs `prebuild` automatically).
- Use `npm run build` to produce a production build (also runs `prebuild` automatically).
- Do not edit files in `build/`; it is compiled output.
- The `scripts/prebuild.js` script must run before the dev server or build — it is wired into `predev`/`prebuild` hooks, so calling `npm run dev` or `npm run build` is sufficient.

## Code Style

- TypeScript (config files and scripts), MDX/Markdown (content).
- Prettier is configured via `@harperdb/code-guidelines/prettier` (see `package.json`).
- **Required before every commit/PR:** run `npm run format:write`, then confirm `npm run format:check` is clean. This is a hard gate, not advisory — CI fails any unformatted PR (see [CI](#ci)).
- Formatting applies to **every file in the repo**, not just content. Prettier runs against the whole tree (`prettier .`) — `.ts`, `.md`, `.mdx`, `.json`, and files under `plans/`, `scripts/`, etc. Do not assume a directory is exempt because it is not user-facing docs.
- The lint script is a no-op (`echo 0`); do not expect `npm run lint` to catch issues.

## Content Style

Prefer plain ASCII characters in Markdown unless a typographic character is genuinely needed for meaning. This keeps content searchable, easy to type, and consistent with the rest of the docs.

- **Separators between fields** — use a regular hyphen with spaces (`-`), not bullet characters (`•`, `·`) or HTML entities (`&nbsp;`). For `Type:` / `Default:` reference blocks, put each on its own line separated by a blank line (the established pattern in `reference/logging/configuration.md`, `reference/http/configuration.md`, etc.):

  ```markdown
  ### `some.option`

  Type: `boolean`

  Default: `false`

  Description text here.
  ```

- **Type annotations** — use the form `` `<type>` (<modifier>) `` when a hint is useful, e.g. `` `string` (duration) ``, `` `number` (ratio) ``. Do not invent compound type names like `` `duration string` ``.
- **Hyphens vs. dashes** — em dashes (`—`) are fine for parenthetical asides and match existing prose; do not use them as field separators. Do not use en dashes (`–`) except for numeric ranges like `9229–9231`.
- **No HTML entities for whitespace** — let Markdown / Prettier handle spacing; never reach for `&nbsp;` to force layout.
- **Lists** — use `-` for bullets (Prettier's default) and avoid mixing with `*` or `•`.
- **Emoji** — only when the user explicitly requests it.

## Content Structure

- Content lives in four directories: `learn/`, `reference/`, `release-notes/`, and `fabric/`.
- Sidebar configs: `sidebarsLearn.ts`, `sidebarsReference.ts`, `sidebarsReleaseNotes.ts`, `sidebarsFabric.ts`.
- Reference is versioned; current version is v5 (`reference/`). Archived v4 content is in `reference_versioned_docs/version-v4/`.
- Do not modify `reference_versioned_docs/` for current (v5) work; edit `reference/` instead.
- The `<VersionBadge>` component is globally registered — no import needed in `.md`/`.mdx` files.
- The `<EngineBadge>` component (also global) tags storage-engine support inline: `<EngineBadge engines="RocksDB" />` or `<EngineBadge engines="RocksDB, LMDB" />`.
- See the complete repository organization in `CONTRIBUTING.md`

## Versioning Content

- Tag minor-version availability inline: `<VersionBadge version="vX.Y.0" />` for new surface, `<VersionBadge type="changed" version="vX.Y.0" />` for behavior changes to existing surface.
- Derive the version from the core release the change ships in, stripping prerelease suffixes (`5.1.0-beta.1` → `v5.1.0`).
- Each minor release gets a file under `release-notes/<major-codename>/` (e.g. `release-notes/v5-lincoln/5.1.md`); the sidebar picks it up automatically.
- Absolute links from `release-notes/` (or `learn/`) into current reference docs use the versioned path `/reference/v5/...` — the reference plugin maps the current version to the `v5` URL path.
- When documenting a change from a core/pro PR, cross-link the feature PR and the docs PR in both descriptions.

## Testing

- There is no automated test suite. Verification is done by running the dev server or build.
- `npm run build` is the best end-to-end check — it will fail on broken links, missing imports, or MDX errors.
- `npm run typecheck` checks TypeScript config files only.
- Known issue: `npm run serve` (post-build preview) 404s on paths like `/docs/4.X` locally due to an upstream `serve-handler` bug. This is not a real breakage — see CONTRIBUTING.md for details.

## CI

- CI runs `npm run build` and `npm run format:check` on pull requests.
- If CI fails on formatting, run `npm run format:write` locally and commit the result.

## Issues & Project Management

- Issues are filed via the issue forms (blank issues are disabled). Each form sets an issue **type**: **Bug** (documented content is wrong/broken, or a site defect), **Feature** (new or expanded docs/site capability), or **Task** (smaller edits/cleanup, usually applied during triage).
- **Area labels:** `content` (documentation text/examples) vs `platform` (the docs site itself — build, search, navigation, styling). These are the only area labels; there are no per-subsystem labels.
- Kind is captured by the issue **type**, not labels — do not reintroduce `bug`/`enhancement` labels.
- **Milestones:** `v5.x` release milestones, named to match the `harper`/`harper-pro` repos. Tag an issue with the milestone of the release whose docs it must ship with, so docs work is tracked per release. Do not delete the empty release milestones — they are the canonical per-release buckets.
- See `CONTRIBUTING.md` (Reporting Issues) for the contributor-facing version.
