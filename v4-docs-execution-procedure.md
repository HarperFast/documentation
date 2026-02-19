# Harper v4 Documentation Migration - Execution Procedure

This document outlines the practical execution approach for implementing the v4 documentation migration defined in [v4-docs-implementation-plan.md](./v4-docs-implementation-plan.md).

## Overview

**Goal**: Use AI agents (Claude Code) to generate initial documentation drafts, then have humans review and refine.

**Approach**: Start with a pilot section to validate the process, then scale to remaining sections.

**Timeline**: Estimated 3-4 weeks total (1-2 days AI generation + 2-3 weeks human review)

---

## Execution Strategy

### Recommended Approach: VSCode Extension with Pilot

We'll use Claude Code in VSCode to orchestrate the migration. This gives us:
- ✅ Full visibility and control over what's being generated
- ✅ Ability to course-correct between sections
- ✅ Easy local testing before pushing
- ✅ Familiar development workflow

**Alternative considered**: Fully automated Agent SDK script. While this could generate all 20 PRs at once, we prefer the hybrid approach to validate quality first and maintain control.

### Three-Phase Approach

**Phase 1: Pilot (2 sections)**
- Run CLI section migration to test the process
- Review output quality and completeness
- Run Security section as validation
- Refine prompts and procedures based on learnings

**Phase 2: Scale (Remaining 18 sections)**
- Continue with VSCode approach for remaining sections
- Run 2-3 sections in parallel (multiple VSCode windows)
- Option to build Agent SDK automation if VSCode becomes tedious

**Phase 3: Finalization**
- Resolve link placeholders
- Update cross-references
- Configure sidebars and redirects
- Final cleanup

---

## Prerequisites

### Environment Setup

```bash
# Ensure on correct branch
git checkout major-version-reorg
git pull

# Create directory for tracking metadata
mkdir -p migration-context/link-placeholders

# Verify gh CLI is authenticated
gh auth status

# Verify VSCode with Claude Code extension is installed and configured
```

### Required Files (Already Created)

- ✅ `v4-docs-implementation-plan.md` - Detailed implementation instructions
- ✅ `v4-docs-migration-map.md` - Mapping of old → new paths
- ✅ `v4-docs-reference-plan.md` - Target structure and philosophy
- ✅ `v4-docs-research.md` - Manual research notes
- ✅ `v4-feature-history-ai-gen.md` - AI-generated feature history

---

## Phase 1: Pilot Execution

### Pilot Section 1: CLI

**Why CLI first?**
- Relatively stable across versions
- Simple structure (4 files)
- Good test of the entire workflow
- Low risk if something goes wrong

**Steps:**

1. **Start Claude Code in VSCode**
   - Open VSCode in the documentation repository
   - Start a new Claude Code chat

2. **Provide the prompt:**
   ```
   I need you to migrate the CLI section following the implementation plan.

   Context files to read:
   - v4-docs-implementation-plan.md (Part 1: Initial Content Generation)
   - v4-docs-migration-map.md (CLI Section)
   - v4-docs-reference-plan.md (overall structure)

   Task:
   1. Read the CLI section entry from the migration map
   2. Read all source files listed (versioned_docs/version-4.7/deployments/harper-cli.md, etc.)
   3. Read release notes for version annotations
   4. Generate new files in reference_versioned_docs/version-v4/cli/ with:
      - Inline source comments
      - Version annotations with confidence levels
      - Link placeholders for cross-references (TODO: for external, relative paths for internal)
   5. After generating all files, replace TODO placeholders with relative paths for internal section links
   6. Update reference_versioned_sidebars/version-v4-sidebars.json to add the CLI section
   7. Create migration-context/link-placeholders/cli-link-placeholders.md
   8. Create branch: migration/cli
   9. Commit changes (use git commit --fixup for subsequent changes)
   10. Open PR using the template from implementation plan
   11. Update v4-docs-migration-map.md status to "In Progress"

   Follow all agent instructions from Part 1 of the implementation plan.
   ```

3. **Monitor the process:**
   - Watch as Claude Code reads files and generates content
   - Review generated files as they're created
   - Check that inline source comments are present
   - Verify branch and commit are created

4. **Review the PR:**
   - Check PR description follows template
   - Verify all required sections are filled out
   - Note quality of content, version annotations, placeholders
   - Verify internal links use relative paths (not TODO placeholders)
   - Verify sidebar was updated with the new section

5. **Merge the PR:**
   - Use GitHub's "Squash and merge" option
   - This combines all fixup commits into a single clean commit
   - Development history (with fixup commits) is preserved in the PR for review
   - Main branch maintains clean, atomic commits per section

6. **Document findings:**
   - What worked well?
   - What needs improvement?
   - Any prompt refinements needed?

### Pilot Section 2: Security

**Why Security second?**
- More complex than CLI (8 files)
- Tests handling of cross-cutting concerns
- Validates the process scales beyond simple sections

**Steps:**

1. **Refine prompt based on CLI learnings**
2. **Run same process** with Security section
3. **Compare results** - is quality consistent?
4. **Decide on scaling approach:**
   - If both pilots successful → continue with VSCode
   - If quality issues → refine prompts, try again
   - If tedious/repetitive → consider Agent SDK automation

---

## Phase 2: Scale Execution

### Batch Processing

Organize remaining 18 sections into batches based on the implementation plan:

**Batch 1: Simple sections (3 sections)**
- Content Types
- Headers
- GraphQL Querying

**Batch 2: Medium complexity (7 sections)**
- Environment Variables
- Static Files
- HTTP
- MQTT
- Logging
- Analytics
- Studio

**Batch 3: Complex sections (5 sections)**
- REST
- Replication
- Database
- Resources
- Components

**Batch 4: Cross-cutting (2 sections)**
- Operations API
- Configuration

**Batch 5: Legacy (1 section)**
- Legacy content

### Parallel Execution

**Option A: Sequential**
- Run one section at a time
- Safest approach
- Slower but easier to manage

**Option B: Parallel (Recommended)**
- Open 2-3 VSCode windows
- Run 2-3 sections simultaneously
- Faster while maintaining control
- Can handle ~5 sections per day

**Option C: Automated**
- Build Agent SDK script after successful pilots
- Generate all remaining PRs at once
- Fastest but less control

### Prompt Template

For each section, use this template (customize [PLACEHOLDERS]):

```
Migrate the [SECTION] section following the implementation plan.

Context files:
- v4-docs-implementation-plan.md (Part 1 instructions)
- v4-docs-migration-map.md ([SECTION] Section entry)
- v4-docs-reference-plan.md (structure reference)

Key details for this section:
- Output directory: reference_versioned_docs/version-v4/[section]/
- Primary source: [PRIMARY_SOURCE_PATH from migration map]
- Additional sources: [LIST from migration map]
- Link placeholder tracker: migration-context/link-placeholders/[section]-link-placeholders.md

Task:
1. Read the [SECTION] section entry from migration map
2. Read all source files
3. Read relevant release notes
4. Generate new reference files following the structure
5. Include inline source comments for traceability
6. Add version annotations with confidence levels
7. Use link placeholders for cross-references
8. Create link placeholder tracker
9. Create branch: migration/[section]
10. Commit with message: "docs: migrate [section] to v4 consolidated reference"
11. Open PR using the template
12. Update migration map status to "In Progress"

Follow all Part 1 agent instructions carefully.
```

---

## Phase 3: Human Review Process

### For Each PR

**Review Checklist:**

1. **Content Quality**
   - [ ] Is the content accurate and complete?
   - [ ] Does it make sense to a reader?
   - [ ] Are examples clear and correct?

2. **Version Annotations**
   - [ ] Are version annotations present where appropriate?
   - [ ] Do they match release notes/version comparisons?
   - [ ] Are confidence levels noted (verified vs. inferred)?

3. **Source Documentation**
   - [ ] Are inline source comments present?
   - [ ] Can we trace content back to original sources?
   - [ ] Is the PR description complete?

4. **Link Placeholders**
   - [ ] Are placeholders in the correct format?
   - [ ] Is the link tracker file created?
   - [ ] Do placeholders make sense for targets?

5. **Structure**
   - [ ] Files in correct location (reference_versioned_docs/version-v4/)?
   - [ ] Follows the structure from reference plan?
   - [ ] No removal of versioned_docs content?

### Review Workflow

1. Reviewer assigned to PR
2. Reviewer goes through checklist
3. Reviewer edits content directly in PR (or requests changes)
4. Reviewer resolves any "needs verification" annotations
5. Reviewer handles image decisions (if any)
6. Reviewer approves and merges
7. Reviewer updates migration-map.md status to "Complete"
8. Reviewer checks off tracking issue

### Review Velocity

- Target: 2-3 PRs reviewed per day
- Simple sections: 30-60 minutes each
- Complex sections: 2-4 hours each
- Total review time: ~2-3 weeks

---

## Phase 4: Post-Generation Cleanup

After all sections are merged, run cleanup phases from implementation plan.

### 4.1: Link Resolution

**Using Claude Code:**

```
Resolve link placeholders following Part 3 of the implementation plan.

Context:
- All migration-context/link-placeholders/*.md files
- All reference_versioned_docs/version-v4/ files

Task:
1. Read all placeholder tracker files
2. Scan reference_versioned_docs/version-v4/ to see what exists
3. For each placeholder, replace TODO:path with correct relative path
4. Create PR(s) for link resolution (one per section recommended)
5. Flag any unresolvable links for human review

Follow Part 3 instructions from implementation plan.
```

### 4.2: Cross-Reference Updates

Update links in release_notes/ and learn/ content:

```
Update cross-references following Part 4 of the implementation plan.

Task:
1. Scan release_notes/ for old documentation paths
2. Map to new paths using migration map
3. Update links
4. Create PR

Do the same for learn/ content.
```

### 4.3: Sidebar Configuration

```
Create Docusaurus sidebar configuration following Part 5 of the implementation plan.

Task:
1. Read reference plan outline for hierarchy
2. Scan reference_versioned_docs/version-v4/ for actual files
3. Generate sidebar JSON/JS following Docusaurus conventions
4. Ensure non-collapsible sections as noted in plan
5. Create PR
```

### 4.4: Redirects

```
Configure redirects following Part 6 of the implementation plan.

Task:
1. Analyze existing redirects.ts
2. Use migration map to determine new paths
3. Generate redirect rules (prioritize most-visited pages)
4. Create PR
```

### 4.5: Final Cleanup

**Human tasks:**
1. Review orphaned content (files not in migration map)
2. Remove old versioned_docs/version-4.X/ folders
3. Build docs locally and validate
4. Test redirects
5. Final spot-checks

---

## Progress Tracking

### GitHub Tracking Issue

Create an issue titled "v4 Documentation Migration Progress Tracker" with this body:

```markdown
Tracking migration of v4 documentation to consolidated structure.

## Phase 1: Pilots
- [ ] #[PR] CLI (Pilot 1)
- [ ] #[PR] Security (Pilot 2)

## Phase 2: Batch 1 - Simple
- [ ] #[PR] Content Types
- [ ] #[PR] Headers
- [ ] #[PR] GraphQL Querying

## Phase 2: Batch 2 - Medium
- [ ] #[PR] Environment Variables
- [ ] #[PR] Static Files
- [ ] #[PR] HTTP
- [ ] #[PR] MQTT
- [ ] #[PR] Logging
- [ ] #[PR] Analytics
- [ ] #[PR] Studio

## Phase 2: Batch 3 - Complex
- [ ] #[PR] REST
- [ ] #[PR] Replication
- [ ] #[PR] Database
- [ ] #[PR] Resources
- [ ] #[PR] Components

## Phase 2: Batch 4 - Cross-cutting
- [ ] #[PR] Operations API
- [ ] #[PR] Configuration

## Phase 2: Batch 5 - Legacy
- [ ] #[PR] Legacy Content

## Phase 3: Cleanup
- [ ] Link resolution
- [ ] Cross-references updated
- [ ] Sidebars configured
- [ ] Redirects configured
- [ ] Old content removed

## Phase 4: Finalization
- [ ] Final validation complete
- [ ] Merged to main
```

### Migration Map Status

Update `v4-docs-migration-map.md` status field for each section:
- "In Progress" when PR is opened
- "Complete" when PR is merged

---

## Team Roles

### AI Agent (Claude Code)
- Generate initial content drafts
- Follow migration map and implementation plan
- Create branches, commits, PRs
- Track placeholders and sources

### Human Reviewers
- Verify content accuracy
- Validate version annotations
- Edit and improve content
- Make final decisions on uncertainties
- Merge PRs

### Project Lead
- Coordinate the migration
- Assign reviewers to PRs
- Monitor progress via tracking issue
- Make decisions on edge cases

---

## Communication Plan

### Kickoff Meeting
- Present this plan to the team
- Walk through pilot sections
- Assign initial reviewers
- Set expectations for review velocity

### Weekly Syncs
- Review progress on tracking issue
- Discuss any blockers or issues
- Adjust approach if needed
- Assign upcoming reviews

### Ad-hoc Communication
- Slack/Discord for quick questions
- PR comments for content-specific discussions
- Document any process improvements

---

## Success Metrics

- [ ] All 20 sections have PRs opened
- [ ] All PRs pass initial quality review
- [ ] 95%+ of version annotations verified
- [ ] All link placeholders resolved
- [ ] Documentation builds without errors
- [ ] Old versioned_docs removed
- [ ] Successfully merged to main

---

## Risk Mitigation

### Risk: AI generates incorrect content
**Mitigation**:
- Pilot sections first to validate quality
- Inline source documentation for traceability
- Human review on every PR
- Can always reference original sources

### Risk: Process takes longer than expected
**Mitigation**:
- Flexible timeline (3-4 weeks is estimate)
- Can parallelize more aggressively if needed
- Can pause and adjust if blockers arise

### Risk: Link placeholders are confusing
**Mitigation**:
- Clear format defined upfront
- Section-specific tracker files
- Separate cleanup phase dedicated to resolving them

### Risk: Team capacity for reviews
**Mitigation**:
- Can adjust review velocity
- Can spread reviews over longer period
- Simple sections are quick to review

---

## Decision Points

### After Pilot Phase
**Decision**: Continue with VSCode or build Agent SDK automation?
- **If** pilots are successful and quality is good → Continue with VSCode
- **If** VSCode becomes tedious → Build Agent SDK script
- **If** quality issues → Refine prompts and retry

### During Scale Phase
**Decision**: Sequential or parallel execution?
- **If** team has capacity → Run 2-3 sections in parallel
- **If** reviewers are overwhelmed → Slow down to sequential
- **If** going well → Scale up to more parallelization

### Before Final Cleanup
**Decision**: Ready to remove old content?
- **If** all content migrated and verified → Proceed with removal
- **If** any uncertainties remain → Pause and resolve
- **If** redirects not ready → Complete redirects first

---

## Next Steps

1. **Review this plan with team** - Get feedback and buy-in
2. **Set up environment** - Ensure VSCode, Claude Code, gh CLI ready
3. **Create tracking issue** - Set up progress tracking
4. **Run pilot 1 (CLI)** - Execute and evaluate
5. **Team sync** - Review pilot results and decide on scaling approach
6. **Scale execution** - Continue with remaining sections
7. **Complete cleanup** - Final phases and merge to main

---

## Questions for Team Discussion

1. Who will be responsible for reviewing PRs? (Assign per section or per batch?)
2. What's our target review velocity? (How many PRs per day can we handle?)
3. Should we run pilots first, or are we confident enough to start scaling immediately?
4. Do we want to build Agent SDK automation, or stick with VSCode throughout?
5. Any concerns about the 3-4 week timeline?
6. Any sections that need special attention or domain expertise?

---

## Appendix: Troubleshooting

### If Claude Code goes off track
- Stop the generation
- Review what it's done so far
- Refine the prompt with more specific guidance
- Restart with the refined prompt

### If content quality is poor
- Check that Claude Code read the right source files
- Verify inline source comments are present
- Look at similar PRs to see if it's a pattern
- Refine the prompt to be more specific about quality expectations

### If link placeholders are confusing
- Review the placeholder tracker file
- Check the format matches the specification
- Update the placeholder with more context/description
- Flag for human reviewer to fix in the PR

### If version annotations are wrong
- Check release notes to verify
- Look at git history of source files
- Mark as "needs verification" and have human research
- Update in the review process

### If merge conflicts occur
- Should be rare since we're only adding files
- If they happen, likely in migration-map.md or tracking files
- Resolve manually, prioritizing latest changes
- Consider using more granular tracker files per section
