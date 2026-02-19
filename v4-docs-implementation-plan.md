# Harper v4 Documentation Migration Implementation Plan

This document outlines the concrete steps for migrating Harper v4 documentation from `versioned_docs/version-4.X/` into a consolidated `reference_versioned_docs/version-v4/` structure as defined in [v4-docs-reference-plan.md](./v4-docs-reference-plan.md) and mapped in [v4-docs-migration-map.md](./v4-docs-migration-map.md).

## Overview

**Branch Strategy**: All work happens on `major-version-reorg` branch. Once complete, merge to `main` in one go.

**Target Directory**: All new content goes into `reference_versioned_docs/version-v4/` (NOT `reference/`). After v4 migration is complete, we'll copy to `reference/` to kickstart v5 (out of scope for this plan).

**Approach**: AI agents do initial content generation → humans review and edit → merge → repeat until complete → cleanup passes.

---

## Part 1: Initial Content Generation (AI-Driven)

### Overview
AI agents work through the migration map, creating PRs for each top-level section. All PRs are opened simultaneously from the same base commit. Each PR adds new files without removing anything from `versioned_docs/`.

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

11. **Create PR** with comprehensive description (template below)

12. **Update migration-map.md** status to "In Progress" for that section

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

Based on migration map, recommend this order:

**Phase 1A - Simple, Stable Sections (Parallel PRs)**
1. CLI (`reference_versioned_docs/version-v4/cli/`)
2. Content Types (`reference_versioned_docs/version-v4/rest/content-types.md`)
3. Headers (`reference_versioned_docs/version-v4/rest/headers.md`)
4. GraphQL Querying (`reference_versioned_docs/version-v4/graphql-querying/`)
5. Studio (`reference_versioned_docs/version-v4/studio/`)

**Phase 1B - Medium Complexity (Parallel PRs)**
6. Security (`reference_versioned_docs/version-v4/security/`)
7. Environment Variables (`reference_versioned_docs/version-v4/environment-variables/`)
8. Static Files (`reference_versioned_docs/version-v4/static-files/`)
9. HTTP (`reference_versioned_docs/version-v4/http/`)
10. MQTT (`reference_versioned_docs/version-v4/mqtt/`)
11. Logging (`reference_versioned_docs/version-v4/logging/`)
12. Analytics (`reference_versioned_docs/version-v4/analytics/`)

**Phase 1C - Complex Sections (Parallel PRs, expect longer review)**
13. REST (`reference_versioned_docs/version-v4/rest/`)
14. Replication (`reference_versioned_docs/version-v4/replication/`)
15. Database (`reference_versioned_docs/version-v4/database/`)
16. Resources (`reference_versioned_docs/version-v4/resources/`)
17. Components (`reference_versioned_docs/version-v4/components/`)

**Phase 1D - Cross-Cutting Sections (After others to minimize placeholders)**
18. Operations API (`reference_versioned_docs/version-v4/operations-api/`)
19. Configuration (`reference_versioned_docs/version-v4/configuration/`)

**Phase 1E - Legacy Content (Simple moves)**
20. Legacy (`reference_versioned_docs/version-v4/legacy/`)

### Progress Tracking

Create GitHub issue to track progress:

**Title**: "v4 Documentation Migration Progress Tracker"

**Body**:
```markdown
Tracking migration of v4 documentation to consolidated structure.

## Phase 1A - Simple Sections
- [ ] #[PR] CLI
- [ ] #[PR] Content Types
- [ ] #[PR] Headers
- [ ] #[PR] GraphQL Querying
- [ ] #[PR] Studio

## Phase 1B - Medium Complexity
- [ ] #[PR] Security
- [ ] #[PR] Environment Variables
- [ ] #[PR] Static Files
- [ ] #[PR] HTTP
- [ ] #[PR] MQTT
- [ ] #[PR] Logging
- [ ] #[PR] Analytics

## Phase 1C - Complex Sections
- [ ] #[PR] REST
- [ ] #[PR] Replication
- [ ] #[PR] Database
- [ ] #[PR] Resources
- [ ] #[PR] Components

## Phase 1D - Cross-Cutting
- [ ] #[PR] Operations API
- [ ] #[PR] Configuration

## Phase 1E - Legacy
- [ ] #[PR] Legacy Content

## Part 2 - Link Resolution
- [ ] Links resolved

## Part 3 - Cross-References
- [ ] Release notes updated
- [ ] Learn guides updated

## Part 4 - Finalization
- [ ] Sidebars created
- [ ] Old content removed
- [ ] Redirects configured
```

After each PR is created, agent adds comment to this issue:
```markdown
Created PR #123 for [Section Name] migration
- Files: X created
- Placeholders: Y links need resolution
- Status: Awaiting human review
```

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
5. **Human checks off tracking issue**

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
1. Scan all files in `learn/` (or wherever learn content lives)
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

## Part 5: Sidebar Configuration (AI-Assisted)

Create Docusaurus sidebar configuration for new structure.

### Agent Instructions

1. **Read the reference plan outline** to understand hierarchy
2. **Scan `reference_versioned_docs/version-v4/`** to see what actually exists
3. **Generate sidebar JSON/JS** following Docusaurus conventions:
   ```javascript
   {
     type: 'category',
     label: 'CLI',
     items: [
       'cli/overview',
       'cli/commands',
       'cli/operations-api-commands',
       'cli/authentication'
     ]
   }
   ```
4. **Follow existing sidebar patterns** from current docs
5. **Ensure non-collapsible sections** (as noted in reference plan)
6. **Create PR** with sidebar configuration

---

## Part 6: Redirects Configuration (AI-Assisted)

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
2. Squash/organize commits if needed
3. Merge to `main`
4. Deploy

---

## Agent Configuration Summary

### Files Agents Should Reference

**Primary**:
- `v4-docs-migration-map.md` - The authoritative source for what goes where
- `v4-docs-reference-plan.md` - Understanding structure and philosophy
- `versioned_docs/version-4.X/**/*.md` - Source content
- `release_notes/*.md` - Version annotation validation

**Secondary**:
- `v4-docs-research.md` - Manual research notes
- `v4-feature-history-ai-gen.md` - AI-generated feature history (use with caution)

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
