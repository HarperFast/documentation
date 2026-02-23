# Harper v4 Documentation Migration Implementation Plan

This document outlines the concrete steps for migrating Harper v4 documentation from `versioned_docs/version-4.X/` into a consolidated `reference_versioned_docs/version-v4/` structure as defined in [v4-docs-reference-plan.md](./v4-docs-reference-plan.md) and mapped in [v4-docs-migration-map.md](./v4-docs-migration-map.md).

## Overview

**Branch Strategy**: All work happens on `major-version-reorg` branch. Once complete, merge to `main` in one go.

**Target Directory**: All new content goes into `reference_versioned_docs/version-v4/` (NOT `reference/`). After v4 migration is complete, we'll copy to `reference/` to kickstart v5 (out of scope for this plan).

**Approach**: AI agents do initial content generation → humans review and edit → merge → repeat until complete → cleanup passes.

---

## Part 1: Initial Content Generation (AI-Driven)

### Overview
AI agents work through the migration map, creating PRs for each top-level section. Each PR adds new files without removing anything from `versioned_docs/`.

### Agent Instructions

For each section in the migration map, the agent should:

1. **Read the migration map entry** for the section
2. **Read all source files** listed in "Primary Source" and "Additional Sources"
3. **Read relevant release notes** from `release_notes/` for version annotations
4. **Generate new reference files** following the structure in the reference plan
5. **Add inline source comments** documenting what was used:
   ```markdown
   <!-- Source: versioned_docs/version-4.7/path/to/file.md (primary) -->
   <!-- Source: versioned_docs/version-4.3/path/to/file.md (for v4.3 feature annotation) -->
   <!-- Source: release_notes/4.3.0.md (confirmed feature introduction date) -->
   ```

6. **Use link placeholders** for cross-references that don't exist yet:
   ```markdown
   [JWT Authentication](TODO:reference_versioned_docs/version-v4/security/jwt-authentication.md "Will be created in security section")
   ```

   **IMPORTANT**: After generating all files in the section, replace TODO placeholders with relative paths for internal section links:
   - For links within the same section: Use relative paths like `./filename.md`
   - For links to other sections not yet migrated: Keep TODO placeholders
   - Example: `[CLI Commands](./commands.md)` NOT `[CLI Commands](TODO:reference_versioned_docs/version-v4/cli/commands.md)`

7. **Create section-specific link placeholder tracker**:
   - Store in `migration-context/link-placeholders/`
   - Named by section: `cli-link-placeholders.md`, `security-link-placeholders.md`, etc.
   - Format:
     ```markdown
     # Link Placeholders for [Section Name]

     ## reference_versioned_docs/version-v4/[section]/[file].md

     - Line 45: `[JWT Auth](TODO:reference_versioned_docs/version-v4/security/jwt-authentication.md)`
       - Context: Discussing authentication methods
       - Target should be: Main JWT authentication reference page

     - Line 123: `[Operations API](TODO:reference_versioned_docs/version-v4/operations-api/operations.md)`
       - Context: Listing all available operations
       - Target should be: Complete operations list
     ```

8. **Add version annotations** using the strategy defined in reference plan:
   ```markdown
   ## Relationships

   Added in: v4.3.0

   The `@relation` directive...
   ```

   **Include confidence levels**:
   - "Added in: v4.3.0 (confirmed via release notes)"
   - "Added in: v4.3.0 (inferred from version comparison, needs verification)"
   - "Changed in: v4.4.0 (likely, needs human verification)"

9. **Note conflicts and uncertainties** in PR description

10. **Handle images/assets** with placeholders:
    ```markdown
    <!-- TODO-IMAGE: Original image at versioned_docs/version-4.7/assets/diagram.png -->
    <!-- Human reviewer: Determine if this image should be migrated, updated, or removed -->
    ![Architecture Diagram](TODO:IMAGE)
    ```

11. **Update the versioned sidebar** at `reference_versioned_sidebars/version-v4-sidebars.json`:
    - Add a non-collapsible category for the section
    - List all pages in the appropriate order
    - Match the pattern from `sidebarsLearn.ts` (non-collapsible with `className: "learn-category-header"`)
    - Example:
    ```json
    {
        "type": "category",
        "label": "CLI",
        "collapsible": false,
        "className": "learn-category-header",
        "items": [
            {
                "type": "doc",
                "id": "cli/overview",
                "label": "Overview"
            },
            // ...
        ]
    }
    ```

12. **Update migration-map.md** status to "In Progress" for that section

13. **Git workflow with fixup commits**:
    - Create feature branch: `git checkout -b migration/[section-name]`
    - Make initial commit with all content files
    - Use `git commit --fixup <commit-hash>` for subsequent changes
    - This allows easy squashing later while keeping development history clear
    - Example:
      ```bash
      # Initial commit
      git add reference_versioned_docs/version-v4/cli/*.md
      git commit -m "docs: migrate CLI section to v4 consolidated reference"

      # Subsequent fixes use --fixup
      git add reference_versioned_sidebars/version-v4-sidebars.json
      git commit --fixup HEAD
      ```
    - PRs will be squash-merged to maintain clean history on main branch

14. **Create PR** with comprehensive description (template below)

### PR Description Template

```markdown
# [Section Name] Migration

## Summary
Migration of [section name] documentation from versioned_docs into new reference structure.

## Files Created
- reference_versioned_docs/version-v4/[section]/overview.md
- reference_versioned_docs/version-v4/[section]/page1.md
- reference_versioned_docs/version-v4/[section]/page2.md

## Source Files Used

### reference_versioned_docs/version-v4/[section]/overview.md
- `versioned_docs/version-4.7/path/to/file.md` (primary source)
- `versioned_docs/version-4.2/path/to/file.md` (for baseline features)
- `release_notes/4.3.0.md` (feature introduction dates)

### reference_versioned_docs/version-v4/[section]/page1.md
- `versioned_docs/version-4.7/path/to/another.md` (primary)
- ...

## Version Annotations Added

### High Confidence (Confirmed via release notes)
- Feature X: Added in v4.3.0
- Feature Y: Changed in v4.4.0

### Needs Verification
- Feature Z: Likely added in v4.3.0 (inferred from version comparison)
- Config option ABC: Possibly changed in v4.5.0 (mentioned in docs but not in release notes)

## Link Placeholders Created
See `migration-context/link-placeholders/[section]-link-placeholders.md` for complete list.

Summary:
- 12 placeholders to operations-api section
- 5 placeholders to security section
- 3 placeholders to configuration section

## Images/Assets Noted
- Line 45 of overview.md: TODO-IMAGE for architecture diagram
- Line 123 of page1.md: TODO-IMAGE for flow chart

## Conflicts & Questions for Human Review

### Content Conflicts
None (reference/ directory was reset)

### Uncertainties
- Unclear if Feature Z was introduced in v4.3.0 or v4.4.0 - marked for verification
- Configuration option `foo.bar` mentioned in v4.5 docs but not in earlier versions or release notes

## Migration Map Status
Updated status for this section to "In Progress"

## Checklist for Human Reviewer
- [ ] Verify version annotations marked as "needs verification"
- [ ] Review content accuracy and completeness
- [ ] Check inline source comments are accurate
- [ ] Decide on image/asset handling
- [ ] Ensure link placeholders make sense
- [ ] Update migration-map.md status to "Complete" after merge
```

### Sections to Migrate (In Order of Priority)

Based on migration map and reference plan, recommend this order. Each section is generated as a complete unit with all its pages at once:

**Phase 1A - Simple, Stable Sections**

1. **CLI** (`reference_versioned_docs/version-v4/cli/`)
   - `overview.md`
   - `commands.md`
   - `operations-api-commands.md`
   - `authentication.md`

2. **GraphQL Querying** (`reference_versioned_docs/version-v4/graphql-querying/`)
   - `overview.md`

3. **Studio** (`reference_versioned_docs/version-v4/studio/`)
   - `overview.md`

4. **Fastify Routes** (`reference_versioned_docs/version-v4/fastify-routes/`)
   - `overview.md`

**Phase 1B - Medium Complexity**

1. **Environment Variables** (`reference_versioned_docs/version-v4/environment-variables/`)
   - `overview.md`
   - `configuration.md`

2. **Static Files** (`reference_versioned_docs/version-v4/static-files/`)
   - `overview.md`
   - `configuration.md`

3. **HTTP** (`reference_versioned_docs/version-v4/http/`)
   - `overview.md`
   - `configuration.md`
   - `api.md`

4. **MQTT** (`reference_versioned_docs/version-v4/mqtt/`)
   - `overview.md`
   - `configuration.md`

5. **Logging** (`reference_versioned_docs/version-v4/logging/`)
   - `overview.md`
   - `configuration.md`
   - `api.md`
   - `operations.md`

6.  **Analytics** (`reference_versioned_docs/version-v4/analytics/`)
    - `overview.md`
    - `operations.md`

**Phase 1C - Complex Sections**

1.  **Security** (`reference_versioned_docs/version-v4/security/`)
    - `overview.md`
    - `basic-authentication.md`
    - `jwt-authentication.md`
    - `mtls-authentication.md`
    - `certificate-management.md`
    - `certificate-verification.md`
    - `cors.md`
    - `ssl.md`
    - `users-and-roles.md`

2.  **REST** (`reference_versioned_docs/version-v4/rest/`)
    - `overview.md`
    - `querying.md`
    - `headers.md`
    - `content-types.md`
    - `websockets.md`
    - `server-sent-events.md`

3.  **Database** (`reference_versioned_docs/version-v4/database/`)
    - `overview.md`
    - `schema.md`
    - `data-loader.md`
    - `storage-algorithm.md`
    - `jobs.md`
    - `system-tables.md`
    - `compaction.md`
    - `transaction.md`

4.  **Resources** (`reference_versioned_docs/version-v4/resources/`)
    - `overview.md`
    - `resource-api.md`
    - `global-apis.md`
    - `query-optimization.md`

5.  **Components** (`reference_versioned_docs/version-v4/components/`)
    - `overview.md`
    - `applications.md`
    - `extension-api.md`
    - `plugin-api.md`

6.  **Replication** (`reference_versioned_docs/version-v4/replication/`)
    - `overview.md`
    - `clustering.md`
    - `sharding.md`

**Phase 1D - Cross-Cutting Sections**

1.  **Operations API** (`reference_versioned_docs/version-v4/operations-api/`)
    - `overview.md`
    - `operations.md`

2.  **Configuration** (`reference_versioned_docs/version-v4/configuration/`)
    - `overview.md`
    - `options.md`
    - `operations.md`

**Phase 1E - Legacy Content**

1.  **Legacy** (`reference_versioned_docs/version-v4/legacy/`)
    - `cloud/` (entire folder as-is)
    - `custom-functions/` (entire folder as-is)
    - `sql/` (entire folder as-is)

(But ensure we reflect version changes from v4.1 to v4.7 using version annotations)

---

## Part 2: Human Review & Merge

### For Each PR

1. **Human reviews PR** using checklist in PR description
2. **Human edits content** as needed:
   - Verify version annotations
   - Improve writing/clarity
   - Resolve uncertainties
   - Handle image decisions
3. **Human approves and merges PR**
4. **Human updates migration-map.md** status to "Complete"

---

## Part 3: Link Resolution (AI-Driven)

Once all Part 1 PRs are merged, resolve link placeholders.

### Agent Instructions

1. **Read all `migration-context/link-placeholders/*.md` files**
2. **Scan all `reference_versioned_docs/version-v4/` files** to build index of what exists
3. **For each placeholder**:
   - Determine if target file exists
   - If exists: replace `TODO:path` with actual relative path
   - If doesn't exist: flag for human review (might be typo in original plan)
4. **Create PR(s)** for link resolution:
   - Option A: One PR per section
   - Option B: One large PR for all links
   - Recommend: One PR per section for easier review
5. **PR description** should list:
   - How many links resolved
   - How many links couldn't be resolved (and why)

### Link Resolution PR Template

```markdown
# Link Resolution: [Section Name]

## Summary
Resolved link placeholders in [section name] now that target pages exist.

## Links Resolved
- `reference_versioned_docs/version-v4/[section]/file1.md` line 45: JWT Auth → `../security/jwt-authentication.md`
- `reference_versioned_docs/version-v4/[section]/file1.md` line 67: Operations → `../operations-api/operations.md`
- ... (X total links resolved)

## Links Unable to Resolve
- `reference_versioned_docs/version-v4/[section]/file2.md` line 123: Target `TODO:reference_versioned_docs/version-v4/foo/bar.md` doesn't exist
  - Recommendation: This might be a typo, should probably link to `../foo/baz.md` instead

## Checklist
- [ ] Human verify resolved links are correct
- [ ] Human resolve any unresolvable links
- [ ] Delete corresponding `migration-context/link-placeholders/[section]-link-placeholders.md` after merge
```

---

## Part 4: Cross-Reference Updates (AI-Assisted)

Update other parts of documentation that reference the old structure.

### 4.1: Release Notes

**Task**: Update internal links in release notes to point to new structure.

**Agent Instructions**:
1. Scan all files in `release_notes/`
2. Find links to old paths (e.g., `/docs/4.7/...`, `/docs/developers/...`)
3. Map to new paths based on migration map
4. Create PR with updates

### 4.2: Learn Guides

**Task**: Update links in learn guides to point to new reference structure.

**Agent Instructions**:
1. Scan all files in `learn/`
2. Find links to old reference paths
3. Map to new paths
4. Create PR with updates

### 4.3: Other Documentation

**Task**: Find and update any other references to old paths.

**Agent Instructions**:
1. Search entire repo for common old path patterns
2. Update as appropriate
3. Create PR with updates

---

## Part 5: Redirects Configuration (AI-Assisted)

Configure redirects from old paths to new paths.

### Agent Instructions

1. **Analyze existing `redirects.ts`** (or wherever redirects are configured)
2. **Read sitemap** (if available) for list of old paths
3. **Use migration map** to determine new paths for old URLs
4. **Generate redirect rules**:
   - Perfect redirects for mapped pages
   - Catch-all redirects for unmapped pages (to appropriate section overview)
5. **Create PR** with redirect configuration

### Redirect Priority

Focus on:
1. Most visited pages (if analytics data available)
2. All `/docs/4.7/` paths (current latest)
3. Common paths across v4.2-v4.6 (many are duplicates)
4. Catch-all for everything else

---

## Part 7: Cleanup & Finalization

### 7.1: Orphaned Content Review

**Human Task**:
1. Review "Files Being Removed" section in migration map
2. Confirm these files are intentionally not migrated
3. Document decision (move to legacy, move to learn, delete entirely)

### 7.2: Remove Old Content

**After all above steps complete**:
1. Create PR that removes old `versioned_docs/version-4.X/` folders
2. Only do this after confirming:
   - All content is migrated or intentionally deprecated
   - All orphaned content is accounted for
   - Redirects are working
   - Sidebars are updated

### 7.3: Final Validation

**Human Task**:
1. Build documentation locally
2. Spot check various pages
3. Test redirects
4. Verify no broken links
5. Check version annotations make sense

### 7.4: Merge to Main

Once everything on `major-version-reorg` branch is complete:
1. Final review of entire branch
3. Squash/organize commits if needed
4. Format
5. Merge to `main`
6. Deploy

---

## Agent Configuration Summary

### Files Agents Should Reference

**Primary**:
- `v4-docs-migration-map.md` - The authoritative source for what goes where
- `v4-docs-reference-plan.md` - Understanding structure and philosophy
- `versioned_docs/version-4.X/**/*.md` - Source content
- `release_notes/*.md` - Version annotation validation
- `v4-docs-research.md` - Manual research notes

### Agent Constraints

**DO**:
- Add new files to `reference_versioned_docs/version-v4/`
- Include inline source comments
- Use link placeholders with TODO: prefix
- Create section-specific link placeholder trackers
- Add version annotations with confidence levels
- Flag uncertainties for human review
- Update migration-map.md status

**DO NOT**:
- Remove anything from `versioned_docs/` (wait until Part 7)
- Add files to `reference/` (that's for v5 later)
- Guess at version annotations without noting confidence
- Skip inline source documentation
- Make assumptions about image handling without flagging

### Link Placeholder Format

**Standard format**:
```markdown
[Link Text](TODO:reference_versioned_docs/version-v4/section/page.md "Optional description of expected target")
```

**For images**:
```markdown
<!-- TODO-IMAGE: Original at versioned_docs/version-4.7/path/to/image.png -->
<!-- Human: Decide if this should be migrated, updated, or removed -->
![Alt text](TODO:IMAGE)
```

### Version Annotation Format

**High confidence**:
```markdown
Added in: v4.3.0
```

**Needs verification**:
```markdown
Added in: v4.3.0 (inferred from version comparison, needs verification)
```

**Changed features**:
```markdown
Changed in: v4.4.0

[Describe the change]
In previous versions: [Describe old behavior]
```

**Deprecated features**:
```markdown
Deprecated in: v4.X.0 (moved to legacy in v4.7+)

[Feature] is still supported but discouraged. See [alternative] for modern approach.
```

---

## Success Criteria

- [ ] All sections from migration map have PRs created
- [ ] All PRs reviewed and merged by humans
- [ ] All link placeholders resolved
- [ ] Cross-references in release_notes and learn updated
- [ ] Sidebars configured
- [ ] Redirects configured
- [ ] Old versioned_docs removed
- [ ] Documentation builds without errors
- [ ] Spot checks confirm accuracy
- [ ] Branch merged to main

---

## Estimated Timeline

- **Part 1** (AI generation): Agents can work in parallel, ~1-2 days for all PRs
- **Part 2** (Human review): Depends on reviewer availability, estimate 1-2 weeks
- **Part 3** (Link resolution): ~1 day for agent work + ~2-3 days human review
- **Part 4** (Cross-references): ~1 day for agent work + ~1 day human review
- **Part 5** (Sidebars): ~1 day total
- **Part 6** (Redirects): ~1-2 days total
- **Part 7** (Cleanup): ~2-3 days total

**Total estimated**: 3-4 weeks (heavily dependent on human review throughput)

---

## Notes

- Keep `versioned_docs/` intact throughout process as source of truth
- All work on `major-version-reorg` branch
- Human review is critical - AI does heavy lifting, humans ensure quality
- Link placeholders prevent getting blocked on interdependencies
- Section-specific placeholder files prevent merge conflicts
- Version annotations preserve historical context
- Inline source comments maintain traceability
