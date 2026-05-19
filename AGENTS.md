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
- Format command: `npm run format:write`. Run this after editing any `.ts`, `.md`, or `.mdx` files.
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
- See the complete repository organization in `CONTRIBUTING.md`

## Testing

- There is no automated test suite. Verification is done by running the dev server or build.
- `npm run build` is the best end-to-end check — it will fail on broken links, missing imports, or MDX errors.
- `npm run typecheck` checks TypeScript config files only.
- Known issue: `npm run serve` (post-build preview) 404s on paths like `/docs/4.X` locally due to an upstream `serve-handler` bug. This is not a real breakage — see CONTRIBUTING.md for details.

## CI

- CI runs `npm run build` and `npm run format:check` on pull requests.
- If CI fails on formatting, run `npm run format:write` locally and commit the result.
