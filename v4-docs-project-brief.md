# Harper v4 Documentation Migration - Project Brief

**Last Updated**: 2026-02-18
**Status**: Planning Complete - Ready to Execute
**Phase**: Pre-Pilot
**Branch**: `major-version-reorg`

---

## Executive Summary

We are consolidating Harper v4 documentation from seven versioned folders (v4.1 through v4.7) into a single, unified v4 reference using inline version annotations (Node.js style). Simultaneously, we're reorganizing from role-based categories ("Developers," "Administration") to a flat, feature-based structure (CLI, Database, REST, Components, etc.).

This consolidation will improve documentation maintainability, make features more discoverable, and establish a strong foundation for v5 documentation. The migration involves 20 top-level sections, ~100+ individual pages, and will be executed using AI agents (Claude Code) for initial content generation with human review and refinement.

**Target**: `reference_versioned_docs/version-v4/` (NOT `reference/` - that's for v5 later)

---

## Quick Links

- **[Reference Plan](./v4-docs-reference-plan.md)** - Target structure and philosophy (the "what" and "why")
- **[Migration Map](./v4-docs-migration-map.md)** - Detailed file-by-file mapping (the "where")
- **[Implementation Plan](./v4-docs-implementation-plan.md)** - Technical specifications for agents (the "how")
- **[Execution Procedure](./v4-docs-execution-procedure.md)** - Team workflow and process (the "who/when")
- **[Research Notes](./v4-docs-research.md)** - Manual research on feature evolution
- **[AI Feature History](./v4-feature-history-ai-gen.md)** - AI-generated feature timeline (use with caution)

---

## Current Status

### Phase Status

- ✅ Planning & Documentation Complete
- ⏸️ Team Review Pending
- ⏳ Pilot Execution Not Started
- ⏳ Scale Execution Not Started
- ⏳ Cleanup Not Started

### Sections Status (0/20 Complete)

**Phase 1A - Simple** (0/5)

- [ ] CLI
- [ ] Content Types
- [ ] Headers
- [ ] GraphQL Querying
- [ ] Studio

**Phase 1B - Medium** (0/7)

- [ ] Security
- [ ] Environment Variables
- [ ] Static Files
- [ ] HTTP
- [ ] MQTT
- [ ] Logging
- [ ] Analytics

**Phase 1C - Complex** (0/5)

- [ ] REST
- [ ] Replication
- [ ] Database
- [ ] Resources
- [ ] Components

**Phase 1D - Cross-Cutting** (0/2)

- [ ] Operations API
- [ ] Configuration

**Phase 1E - Legacy** (0/1)

- [ ] Legacy Content

### Metrics

- **PRs Opened**: 0/20
- **PRs Merged**: 0/20
- **Link Placeholders Created**: 0
- **Link Placeholders Resolved**: 0
- **Days Elapsed**: 0
- **Estimated Days Remaining**: 21-28

---

## Key Decisions Log

### 2026-02-18: Initial Planning

- **Decision**: Use VSCode + Claude Code approach (vs fully automated Agent SDK)
- **Rationale**: Provides visibility and control; can pivot to automation if needed
- **Impact**: Requires manual orchestration but allows quality validation throughout

### 2026-02-18: Target Directory

- **Decision**: Output to `reference_versioned_docs/version-v4/` not `reference/`
- **Rationale**: Clean separation; `reference/` will be used for v5 kickstart later
- **Impact**: Additional step required later to copy to `reference/` for v5

### 2026-02-18: Transaction Logging Reorganization

- **Decision**: Move transaction/audit logging from `logging/` to `database/`
- **Rationale**: Transaction logging is a database-level concern, not application logging
- **Impact**: Better conceptual organization; `logging/` focuses on app/system logs

### 2026-02-18: Link Placeholder Strategy

- **Decision**: Use `TODO:path` format in actual markdown links with per-section tracker files
- **Rationale**: Easy to find/replace, works with markdown parsers, no merge conflicts
- **Impact**: Separate cleanup phase needed to resolve placeholders

### 2026-02-18: Complete Sections in Single PRs

- **Decision**: Don't split large sections (like Configuration) into multiple PRs
- **Rationale**: Easier to review section holistically; context is preserved
- **Impact**: Some PRs will be large but provide complete picture

### 2026-02-18: Pilot-First Approach

- **Decision**: Run CLI and Security as pilots before scaling
- **Rationale**: Validate quality and process before committing to full migration
- **Impact**: Adds ~2-3 days upfront but reduces risk of rework

### 2026-02-19: Temporary Build Simplifications

- **Decision**: Temporarily disable local search plugin and set `onBrokenLinks: 'warn'`
- **Rationale**: Allows build to succeed during migration while reference docs are being populated
- **Impact**: Must remember to re-enable before merging to main:
  - Re-enable local search plugin in `docusaurus.config.ts` themes section
  - Change `onBrokenLinks` back to `'throw'`
- **Note**: prebuild.js and postbuild.js scripts are still needed and should remain:
  - prebuild.js generates release-notes-data.json used by React components
  - postbuild.js creates index.html files for URL flexibility (/path and /path/)
  - Remove or update prebuild/postbuild scripts if no longer needed

---

## Known Issues & Blockers

### Current Blockers

_None - ready to begin execution_

### Potential Risks

1. **Version annotation accuracy** - AI might infer wrong introduction versions
   - _Mitigation_: Confidence levels + human verification + release notes validation

2. **Content quality variability** - Some sections might need significant editing
   - _Mitigation_: Pilot sections first; refine prompts based on learnings

3. **Review capacity** - Team might be overwhelmed by 20 large PRs
   - _Mitigation_: Flexible timeline; can slow down review velocity as needed

4. **Link placeholder confusion** - Placeholders might be unclear or incorrect
   - _Mitigation_: Clear format specification; dedicated cleanup phase

### Watch Items

- [ ] Current `reference/` and `reference_versioned_docs/version-v4/` directories are empty (confirmed reset)
- [ ] All planning documents are up to date
- [ ] Team has capacity for 2-3 PR reviews per day
- [ ] GitHub tracking issue needs to be created before execution

---

## Upcoming Milestones

### Next Steps (Immediate)

1. **Present to team** - Review all planning docs, get feedback and buy-in
2. **Environment setup** - Verify VSCode, Claude Code, gh CLI ready
3. **Create tracking issue** - Set up GitHub issue for progress tracking
4. **Run Pilot 1 (CLI)** - Execute first section, evaluate quality
5. **Team sync** - Review pilot results, refine approach

### Near-Term Milestones (Next 2 Weeks)

- [ ] Pilot sections complete (CLI + Security)
- [ ] Decision on scaling approach (continue VSCode or build automation)
- [ ] Phase 1A complete (5 simple sections)
- [ ] Phase 1B started (medium complexity sections)

### Medium-Term Milestones (Next 4 Weeks)

- [ ] All 20 sections have PRs merged
- [ ] Link resolution complete
- [ ] Cross-references updated
- [ ] Sidebars configured

### Long-Term Milestones (Next 6 Weeks)

- [ ] Redirects configured
- [ ] Old versioned_docs removed
- [ ] Final validation complete
- [ ] Merged to main

---

## For AI Agents: Quick Context

**Project Goal**: Migrate v4 docs from `versioned_docs/version-4.X/` → `reference_versioned_docs/version-v4/` with restructuring.

**Your Role**: Generate initial content drafts by:

1. Reading migration map entry for assigned section
2. Reading all source files listed (primary + additional)
3. Reading release notes for version info
4. Generating new files with inline source comments and version annotations
5. Creating link placeholders for cross-references
6. Creating branch, committing, opening PR

**Key Constraints**:

- ✅ DO add files to `reference_versioned_docs/version-v4/`
- ✅ DO include inline source comments
- ✅ DO use `TODO:path` format for link placeholders
- ✅ DO note confidence levels on version annotations
- ❌ DON'T remove anything from `versioned_docs/` yet
- ❌ DON'T add files to `reference/` (that's for v5)
- ❌ DON'T guess at version dates without noting uncertainty

**Key Files to Reference**:

- `v4-docs-migration-map.md` - Your primary instruction source (which files to read, where to write)
- `v4-docs-implementation-plan.md` - Detailed agent instructions (Part 1)
- `v4-docs-reference-plan.md` - Target structure and philosophy
- `release_notes/*.md` - For version annotation validation

**PR Template**: See `v4-docs-implementation-plan.md` Part 1 for complete template.

**Success Criteria**:

- All files in correct location with proper structure
- Inline source comments on all content
- Version annotations with confidence levels
- Link placeholders in correct format
- Link placeholder tracker file created
- PR description complete and accurate

---

## Team Assignments

### Project Lead

- **Name**: Ethan
- **Responsibilities**: Overall coordination, decision making, pilot execution

### Reviewers

_TBD after team discussion_

### Execution Assignments

_To be determined after pilot phase_

---

## Notes & Learnings

### Planning Phase Insights

- Horizontal consolidation (v4.1→v4.7) + vertical reorganization (role-based→feature-based) are parallel transformations
- Starting with v4.7 as base and annotating backwards is more efficient than building forward from v4.1
- Migration map revealed several complex merges (Configuration 59KB, Schema from 5+ files, Clustering 10+ files)
- Transaction/audit logging conceptually belongs with database, not application logging
- Current `reference/` folder was already partially reorganized (work in progress)

### Process Improvements

_To be filled in as we learn from pilots and execution_

### Template Refinements

_To be filled in as we refine prompts based on pilot results_

### Common Issues

_To be filled in as patterns emerge during execution_

---

## Change Log

### 2026-02-18 - Project Initialization

- Created all planning documents
- Completed migration map (20 sections, ~100+ files mapped)
- Defined reference structure and philosophy
- Established execution procedure
- Ready for team review and pilot execution

---

## Future Considerations

### Post-Migration Tasks (Out of Scope for Now)

- Copy content from `reference_versioned_docs/version-v4/` to `reference/` to kickstart v5
- Begin v5 documentation structure planning
- Consider automation for future minor version consolidations
- Evaluate if this approach works for v3 historical docs

### Process Improvements for Next Time

- Could build Agent SDK automation upfront if this approach proves successful
- Template-based content generation for consistent structure
- Automated version annotation extraction from git history
- Automated redirect generation from sitemap analysis

### Documentation Enhancements

- Consider adding diagrams/flowcharts to planning docs
- Video walkthrough of the process for future team members
- Automated progress dashboard from migration map status fields

---

## Quick Reference

### Directory Structure

```
documentation/
├── versioned_docs/
│   ├── version-4.1/          # Historical (source)
│   ├── version-4.2/          # Historical (source)
│   ├── version-4.3/          # Historical (source)
│   ├── version-4.4/          # Historical (source)
│   ├── version-4.5/          # Historical (source)
│   ├── version-4.6/          # Historical (source)
│   └── version-4.7/          # Latest (primary source)
├── reference_versioned_docs/
│   └── version-v4/           # TARGET (new consolidated docs)
├── reference/                # Empty (for v5 later)
├── migration-context/
│   └── link-placeholders/    # Per-section placeholder trackers
└── *.md                      # Planning documents
```

### Common Commands

```bash
# Switch to migration branch
git checkout major-version-reorg

# Create placeholder tracker directory
mkdir -p migration-context/link-placeholders

# Check current status
git status

# Create new migration branch for section
git checkout -b migration/[section-name]

# Open PR via gh CLI
gh pr create --base major-version-reorg --title "..." --body "..."

# Check all migration map status
grep "Status:" v4-docs-migration-map.md
```

### Key Metrics to Track

- Sections complete: `X/20`
- PRs open: `X`
- PRs merged: `X`
- Link placeholders: `X created, Y resolved`
- Days elapsed: `X`
- Average review time: `X hours/PR`

---

## Questions & Decisions Needed

### Before Pilot

- [ ] Team reviewed all planning docs?
- [ ] Reviewers assigned for pilot sections?
- [ ] GitHub tracking issue created?
- [ ] Environment setup verified?

### After Pilot

- [ ] Is content quality acceptable?
- [ ] Are version annotations accurate?
- [ ] Is link placeholder format working?
- [ ] Continue with VSCode or build automation?
- [ ] Any prompt refinements needed?

### Before Scaling

- [ ] Pilot learnings documented?
- [ ] Prompts refined based on pilot?
- [ ] Review assignments made?
- [ ] Ready to open 15-18 more PRs?

### Before Cleanup

- [ ] All sections merged?
- [ ] Ready to start link resolution?
- [ ] Any orphaned content to address?
- [ ] Ready to configure sidebars/redirects?

### Before Merge to Main

- [ ] All cleanup phases complete?
- [ ] Documentation builds successfully?
- [ ] Redirects tested?
- [ ] Final validation complete?
- [ ] Ready to remove old versioned_docs?

---

**Note**: This is a living document. Update status, metrics, decisions, and learnings as the project progresses.
