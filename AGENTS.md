# AGENTS.md

Review `README.md` and `CONTRIBUTING.md` for all relevant repository information.

## Development Tips

- Use `npm install` to install dependencies.
- Use `npm run dev` to start the local development server (runs `prebuild` automatically).
- Use `npm run build` to produce a production build (also runs `prebuild` automatically).
- Do not edit files in `build/`; it is compiled output.
- `scripts/prebuild.js` and `scripts/assemble-content.mjs` must run before the dev server or build — they are wired into the `predev`/`prebuild`/`prestart` hooks, so calling `npm run dev` or `npm run build` is sufficient. The assembler fetches `docs/` from harper and harper-pro `main`; set `HARPER_DOCS_PATH` / `HARPER_PRO_DOCS_PATH` to build against local checkouts (`npm run dev` then reloads on edits there).

## Code Style

- TypeScript (config files and scripts), MDX/Markdown (content).
- Prettier is configured via `@harperfast/code-guidelines/prettier` (see `package.json`).
- **Required before every commit/PR:** run `npm run format:write`, then confirm `npm run format:check` is clean. This is a hard gate, not advisory — CI fails any unformatted PR (see [CI](#ci)).
- Formatting applies to **every file in the repo**, not just content. Prettier runs against the whole tree (`prettier .`) — `.ts`, `.md`, `.mdx`, `.json`, and files under `plans/`, `scripts/`, etc. Do not assume a directory is exempt because it is not user-facing docs.
- `npm run lint` runs oxlint over JavaScript and TypeScript with warnings treated as errors.

## Content Structure

- This repo holds `learn/`, `fabric/`, the archived v4 reference (`reference_versioned_docs/version-v4/`), and release notes up to 5.3. Sidebar configs: `sidebarsLearn.ts`, `sidebarsReference.ts`, `sidebarsReleaseNotes.ts`, `sidebarsFabric.ts`.
- The v5 reference and the open minor's release notes live in `docs/` of HarperFast/harper and HarperFast/harper-pro. `scripts/assemble-content.mjs` copies them into `reference/` and `release-notes/<codename>/<minor>.generated.md` before every build; never edit or commit those generated paths here. Writing rules for that content, including version badges, are in harper's `docs/AGENTS.md`, and they apply to `learn/` too.
- Do not modify `reference_versioned_docs/` for current (v5) work.
- The `<VersionBadge>` and `<EngineBadge>` components are globally registered — no import needed in `.md`/`.mdx` files.
- See the complete repository organization in `CONTRIBUTING.md`

## Testing

- `npm run test:workflows` checks companion workflow scenarios.
- `npm run build` is the best end-to-end check — it will fail on broken links, missing imports, or MDX errors.
- `npm run typecheck` checks TypeScript config files only.
- Known issue: `npm run serve` (post-build preview) 404s on paths like `/docs/4.X` locally due to an upstream `serve-handler` bug. This is not a real breakage — see CONTRIBUTING.md for details.
- Before shipping a command a page documents, run it as harper's `docs/AGENTS.md` describes.

## CI

- CI runs the production build, TypeScript Check, Lint Check, Format Check and Workflow Tests on pull requests.
- If CI fails on formatting, run `npm run format:write` locally and commit the result.

## Issues & Project Management

- Issues are filed via the issue forms (blank issues are disabled). Each form sets an issue **type**: **Bug** (documented content is wrong/broken, or a site defect), **Feature** (new or expanded docs/site capability), or **Task** (smaller edits/cleanup, usually applied during triage).
- **Area labels:** `content` (documentation text/examples) vs `platform` (the docs site itself — build, search, navigation, styling). These are the only area labels; there are no per-subsystem labels.
- Kind is captured by the issue **type**, not labels — do not reintroduce `bug`/`enhancement` labels.
- **Milestones:** `v5.x` release milestones, named to match the `harper`/`harper-pro` repos. Tag an issue with the milestone of the release whose docs it must ship with, so docs work is tracked per release. Do not delete the empty release milestones — they are the canonical per-release buckets.
- See `CONTRIBUTING.md` (Reporting Issues) for the contributor-facing version.
