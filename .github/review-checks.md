---
layers: universal
---

## Repo-specific checks (Harper documentation)

Docusaurus site, MDX + TypeScript config. The product here is PROSE that
readers act on, so a wrong sentence is a defect with the same standing as a
wrong line of code.

- **Doc-to-doc contradiction is the top measured defect class in this repo.**
  When a page changes a documented default, option name, flag, endpoint or
  version, the SIBLING pages that state the old value are now wrong. Check
  whether the same fact is asserted elsewhere and left stale; that single class
  accounted for 12 findings across 6 PRs in one post-mortem window.
- **Verify claims against Harper, not against the surrounding prose.** A code
  sample, config key, CLI flag or default that no longer exists in the product
  is a defect even when the paragraph reads well. Say so when you cannot verify
  a claim from this repo alone.
- **Versioned docs**: the reference is versioned by major Harper version
  (`reference_versions.json`: `current` is v5, plus `v4`). v4 is an archived
  snapshot in `reference_versioned_docs/version-v4/`; v5 is not in this repo.
  A correction to a fact that v4 also states may need the same fix in that
  snapshot — flag which copies it needs — but v5 work must not edit
  `reference_versioned_docs/`.
- **Redirects**: Docusaurus client redirects keep old URLs alive. Renaming or
  moving a page without a redirect breaks external links. Add the rule to
  `redirects.ts` for a page this repo owns (Learn, Fabric, release notes), or to
  `docs/reference/_redirects.json` in harper or harper-pro for a v5 reference
  page. `historic-redirects.ts` is a frozen, append-only set of legacy
  `/docs/4.X/*` rules: add to it only for a missed legacy path that analytics
  surfaced, never for a renamed page.
- **Tooling**: `npm run typecheck` (tsc) and `format:check` (prettier).
  `npm run lint` runs oxlint with warnings treated as errors. The v5 reference
  and the open release notes are not in this repo: they are assembled at build
  time from `docs/` in HarperFast/harper and HarperFast/harper-pro.
- Do not comment on formatting; prettier owns it.
