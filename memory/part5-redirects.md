# Part 5: Redirects Work

## Status: Implementation complete — needs build verification + human review of LOW TRAFFIC items

## Overview

Rewriting `redirects.ts` to handle migrations from old `/docs/` paths to new `/reference/v4/` paths.
The redirect plugin is currently commented out in `docusaurus.config.ts` (lines 218-225).

**Key constraint:** No redirects needed for the new `/reference/` section itself. The `/learn/`, `/release-notes/`, and `/fabric/` sections need very few redirects (flag exceptions).

## The New URL Structure

New reference paths live at `/reference/v4/[section]/[page]`:

| Section              | Key Pages                                                                 |
|----------------------|---------------------------------------------------------------------------|
| analytics            | overview, operations                                                      |
| cli                  | overview, commands, authentication, operations-api-commands               |
| components           | overview, applications, extension-api, javascript-environment, plugin-api |
| configuration        | overview, options, operations                                             |
| database             | overview, schema, api, data-loader, storage-algorithm, jobs, system-tables, compaction, transaction, sql |
| environment-variables| overview                                                                  |
| fastify-routes       | overview                                                                  |
| graphql-querying     | overview                                                                  |
| http                 | overview, configuration, api, tls                                         |
| legacy               | cloud, custom-functions                                                   |
| logging              | overview, configuration, api, operations                                  |
| mqtt                 | overview, configuration                                                   |
| operations-api       | overview, operations                                                       |
| replication          | overview, clustering, sharding                                            |
| resources            | overview, resource-api, query-optimization                                |
| rest                 | overview, querying, headers, content-types, websockets, server-sent-events|
| security             | overview, basic-authentication, jwt-authentication, mtls-authentication, certificate-management, certificate-verification, configuration, api |
| static-files         | overview                                                                  |
| studio               | overview                                                                  |
| users-and-roles      | overview, configuration, operations                                       |

## Old Path Structure (v4.7)

The old docs were at `/docs/` serving the latest (4.7) content:

- `/docs/developers/applications/*` → Components (new path)
- `/docs/developers/operations-api/*` → Operations API + various sections
- `/docs/developers/security/*` → Security
- `/docs/developers/replication/*` → Replication
- `/docs/developers/real-time` → REST (websockets/SSE)
- `/docs/developers/rest` → REST
- `/docs/developers/clustering/*` → Replication/clustering
- `/docs/developers/components/*` → (old reference/components - different from apps)
- `/docs/deployments/configuration` → Configuration
- `/docs/deployments/harper-cli` → CLI
- `/docs/deployments/install-harper/*` → (install - no new reference page)
- `/docs/deployments/harper-cloud/*` → Legacy/cloud
- `/docs/deployments/upgrade-hdb-instance` → (no direct equivalent in new ref)
- `/docs/administration/harper-studio/*` → Studio
- `/docs/administration/logging/*` → Logging
- `/docs/administration/cloning` → Replication
- `/docs/administration/compact` → Database/compaction
- `/docs/administration/jobs` → Database/jobs
- `/docs/reference/*` → Old reference section (reference/analytics, reference/resources/*, etc.)
- `/docs/foundations/*` → learn/ (already handled)
- `/docs/getting-started/*` → learn/ (already handled)

## Analytics: Top Paths Requiring New Redirects (views > 50)

Paths from GA data (Oct 2025 – Feb 2026) that need redirects to `/reference/v4/`:

### High Priority (>200 views)
- `/docs/developers/operations-api` (1028) → `/reference/v4/operations-api/overview`
- `/docs/developers/applications` (727) → `/reference/v4/components/overview`
- `/docs/reference/resources` (667) → `/reference/v4/resources/overview`
- `/docs/deployments/configuration` (608) → `/reference/v4/configuration/overview`
- `/docs/developers/rest` (547) → `/reference/v4/rest/overview`
- `/docs/deployments/harper-cli` (467) → `/reference/v4/cli/overview`
- `/docs/reference` (459) → `/reference/v4` (index)
- `/docs/developers/applications/defining-schemas` (455) → `/reference/v4/database/schema`
- `/docs/developers/operations-api/nosql-operations` (435) → `/reference/v4/operations-api/operations`
- `/docs/developers/applications/caching` (410) → `/reference/v4/resources/overview` (or resource-api)
- `/docs/developers/real-time` (407) → `/reference/v4/rest/websockets` (or rest/overview)
- `/docs/developers/operations-api/databases-and-tables` (385) → `/reference/v4/database/overview`
- `/docs/developers/operations-api/components` (356) → `/reference/v4/operations-api/operations`
- `/docs/deployments/install-harper` (343) → keep as-is (deploy content, not in new ref)
- `/docs/developers/replication` (328) → `/reference/v4/replication/overview`
- `/docs/developers/operations-api/advanced-json-sql-examples` (158) → `/reference/v4/operations-api/operations`
- `/docs/developers/operations-api/bulk-operations` (158) → `/reference/v4/operations-api/operations`

### Medium Priority (50–200 views)
- `/docs/developers/applications/data-loader` (218) → `/reference/v4/database/data-loader`
- `/docs/developers/operations-api/system-operations` (213) → `/reference/v4/operations-api/operations`
- `/docs/reference/components/built-in-extensions` (204) → `/reference/v4/components/extension-api`
- `/docs/developers/operations-api/configuration` (203) → `/reference/v4/configuration/operations`
- `/docs/developers/applications/web-applications` (199) → `/reference/v4/components/applications`
- `/docs/developers/operations-api/users-and-roles` (195) → `/reference/v4/users-and-roles/operations`
- `/docs/developers/security` (183) → `/reference/v4/security/overview`
- `/docs/reference/resources/instance-binding` (181) → `/reference/v4/resources/resource-api`
- `/docs/developers/applications/debugging` (150) → `/reference/v4/components/overview`
- `/docs/reference/components/plugins` (150) → `/reference/v4/components/plugin-api`
- `/docs/developers/applications/define-routes` (144) → `/reference/v4/fastify-routes/overview`
- `/docs/reference/analytics` (135) → `/reference/v4/analytics/overview`
- `/docs/developers/replication/sharding` (133) → `/reference/v4/replication/sharding`
- `/docs/developers/operations-api/logs` (132) → `/reference/v4/logging/operations`
- `/docs/reference/dynamic-schema` (132) → `/reference/v4/database/schema`
- `/docs/administration/harper-studio` (130) → `/reference/v4/studio/overview`
- `/docs/reference/graphql` (109) → `/reference/v4/graphql-querying/overview`
- `/docs/reference/resources/migration` (109) → `/reference/v4/database/data-loader`
- `/docs/reference/data-types` (107) → `/reference/v4/database/schema`
- `/docs/reference/architecture` (105) → `/reference/v4` (no direct equiv - use index)
- `/docs/developers/operations-api/clustering-nats` (80) → `/reference/v4/replication/clustering`
- `/docs/developers/operations-api/token-authentication` (79) → `/reference/v4/security/jwt-authentication`
- `/docs/reference/transactions` (79) → `/reference/v4/database/transaction`
- `/docs/reference/limits` (78) → `/reference/v4/database/schema` (or overview)
- `/docs/developers/security/jwt-auth` (77) → `/reference/v4/security/jwt-authentication`
- `/docs/developers/security/certificate-management` (76) → `/reference/v4/security/certificate-management`
- `/docs/reference/blob` (76) → `/reference/v4/database/schema`
- `/docs/reference/components/configuration` (74) → `/reference/v4/components/overview`
- `/docs/developers/security/configuration` (98) → `/reference/v4/security/configuration`
- `/docs/developers/security/users-and-roles` (93) → `/reference/v4/users-and-roles/overview`
- `/docs/administration/cloning` (87) → `/reference/v4/replication/overview`
- `/docs/developers/operations-api/certificate-management` (114) → `/reference/v4/security/certificate-management`
- `/docs/developers/operations-api/custom-functions` (113) → `/reference/v4/legacy/custom-functions`
- `/docs/developers/operations-api/jobs` (113) → `/reference/v4/database/jobs`
- `/docs/developers/security/basic-auth` (83) → `/reference/v4/security/basic-authentication`
- `/docs/reference/globals` (277) → `/reference/v4/components/javascript-environment`
- `/docs/reference/components` (159) → `/reference/v4/components/overview`
- `/docs/reference/components/extensions` (102) → `/reference/v4/components/extension-api`
- `/docs/reference/components/applications` (121) → `/reference/v4/components/applications`
- `/docs/developers/applications/defining-roles` (119) → `/reference/v4/users-and-roles/overview`
- `/docs/developers/operations-api/sql-operations` (96) → `/reference/v4/database/sql`
- `/docs/administration/logging/standard-logging` (91) → `/reference/v4/logging/overview`
- `/docs/administration/logging` (68) → `/reference/v4/logging/overview`
- `/docs/reference/roles` (62) → `/reference/v4/users-and-roles/overview`
- `/docs/reference/storage-algorithm` (61) → `/reference/v4/database/storage-algorithm`
- `/docs/developers/sql-guide` (53) → `/reference/v4/database/sql`
- `/docs/developers/operations-api/registration` (59) → `/reference/v4/operations-api/operations`
- `/docs/administration/compact` (56) → `/reference/v4/database/compaction`
- `/docs/reference/resources/query-optimization` (55) → `/reference/v4/resources/query-optimization`
- `/docs/administration/jobs` (54) → `/reference/v4/database/jobs`
- `/docs/developers/operations-api/analytics` (145) → `/reference/v4/analytics/operations`
- `/docs/developers/operations-api/quickstart-examples` (145) → `/reference/v4/operations-api/operations`
- `/docs/reference/content-types` (70) → `/reference/v4/rest/content-types`
- `/docs/reference/headers` (46) → `/reference/v4/rest/headers`
- `/docs/developers/security/certificate-verification` (46) → `/reference/v4/security/certificate-verification`
- `/docs/administration/logging/audit-logging` (72) → `/reference/v4/logging/overview`
- `/docs/developers/clustering` (72) → `/reference/v4/replication/clustering`
- `/docs/administration/logging/transaction-logging` (45) → `/reference/v4/logging/overview`
- `/docs/reference/clustering` (31) → `/reference/v4/replication/clustering`
- `/docs/reference/clustering/enabling-clustering` (25) → `/reference/v4/replication/clustering`
- `/docs/reference/clustering/establishing-routes` (20) → `/reference/v4/replication/clustering`
- `/docs/reference/clustering/subscription-overview` (19) → `/reference/v4/replication/clustering`
- `/docs/reference/sql-guide` (26) → `/reference/v4/database/sql`
- `/docs/reference/sql-guide/json-search` (23) → `/reference/v4/database/sql`
- `/docs/developers/security/mtls-auth` (32) → `/reference/v4/security/mtls-authentication`
- `/docs/developers/components/built-in` (26) → `/reference/v4/components/extension-api`
- `/docs/developers/components/reference` (25) → `/reference/v4/components/extension-api`
- `/docs/developers/components` (33) → `/reference/v4/components/overview`
- `/docs/administration/harper-studio/create-account` (45) → `/reference/v4/studio/overview`

## Paths That DON'T Need Redirects to /reference/v4/

- `/docs/deployments/install-harper/*` — installation content, no equivalent in new ref
- `/docs/deployments/harper-cloud/*` — redirect to `/reference/v4/legacy/cloud` (or keep existing)
- `/docs/deployments/upgrade-hdb-instance` — keep existing redirect or drop
- `/docs/administration/harper-studio/*` (most subpages) — redirect to `/reference/v4/studio/overview`
- `/docs/getting-started/*` — already redirects to `/learn/`
- `/docs/foundations/*` — already redirects to `/learn/`

## Versioned Doc Paths (/docs/4.X/) in Analytics

Low traffic but some exist. Recommend a general catch-all pattern:
- `/docs/4.X/developers/...` → strip version prefix, apply same rules as `/docs/developers/...`
- `/docs/4.X/reference/...` → strip version prefix, apply same rules as `/docs/reference/...`
- Alternative: redirect `/docs/4.X/...` → `/docs/...` (simpler, single hop)

## Special Notes for Non-Reference Sections

### /learn/ — needs few/no new redirects
- Already has redirects for `/getting-started/*` and `/foundations/*`
- `/learn/developers/coming-soon` and `/learn/administration/coming-soon` are real pages, no redirects needed

### /release-notes/ — existing redirects are fine
- The existing `createRedirects` logic for release-notes path variants (old naming) is worth keeping
- No new redirects needed unless we change the release-notes structure

### /fabric/ — no redirects needed
- Brand new section with no old paths to redirect from

## Old redirects.ts Issues

The existing file has:
1. Many rules dragged from very old docs (HarperDB Studio → Harper Studio, HarperDB Cloud, custom-functions etc.) that are still valid but very old
2. `withBase()` abstraction that adds complexity — the basePath was used when docs were at `/docs/` but now everything is at root
3. Separate `generateRedirects()` and `createRedirects()` (wildcard) functions — the split is conceptually fine
4. Some rules still point to old paths like `/administration/harper-studio/`, `/deployments/install-harper/` etc. which still exist in the current site

## Approach for New redirects.ts

1. **Keep** existing rules that redirect very-old paths (pre-Harper) → current paths — these are still valid
2. **Add** new rules for old `/docs/developers/`, `/docs/reference/`, `/docs/administration/`, `/docs/deployments/` → `/reference/v4/`
3. **Use patterns** for versioned paths `/docs/4.X/...` — either:
   - Pattern: catch-all redirect `/docs/4.X/` → drop version and apply same rules (cleaner)
   - Or just let them 404 — traffic is low (<30 views per page)
4. **Remove** now-redundant `basePath` abstraction since redirect targets are absolute paths
5. **Simplify** `createRedirects` wildcard function to focus on the actual patterns needed

## Decisions (Confirmed)

- `/docs/` root (2854 views) → redirect to `/` (site root)
- `/docs/developers/applications/caching` → `/reference/v4/resources/overview` (add comment: eventually redirect to a dedicated learn page for database caching)
- `/docs/reference/globals` → `/reference/v4/components/javascript-environment` ✓
- Versioned `/docs/4.X/*` paths → **catch-all to `/reference/v4/`** (not per-path mappings; traffic is low)
- No `basePath`/`withBase()` abstraction — all redirect targets are absolute paths, site is served at `/`
- **Clean break**: only keep rules for paths that appear in pageview data. Paths with <10 views are marked for review — we may 404 those.
- The redirect plugin is commented out in `docusaurus.config.ts` — uncomment it as part of this work.
