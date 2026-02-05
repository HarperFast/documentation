# HarperDB v4 Feature Mapping & Version History
## Consolidation Reference Document

**Purpose**: This document maps all features across HarperDB v4.1 through v4.7 to guide the consolidation of versioned documentation into a single unified directory. It tracks feature introductions, changes, deprecations, and removals.

**Created**: 2026-02-05
**Source Analysis**: versioned_docs (v4.1-v4.7) + release-notes/v4-tucker

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Critical Deprecations & Removals](#critical-deprecations--removals)
3. [Major Feature Additions by Version](#major-feature-additions-by-version)
4. [Feature-by-Feature Version History](#feature-by-feature-version-history)
5. [Operations API Evolution](#operations-api-evolution)
6. [Documentation Structure Evolution](#documentation-structure-evolution)
7. [Consolidation Action Items](#consolidation-action-items)

---

## Executive Summary

### Major Architectural Changes

**v4.2.0 (January 2024)** - THE PIVOTAL RELEASE
- Complete documentation restructuring from feature-based to role-based organization
- Introduction of Component Architecture (Applications + Extensions) to replace Custom Functions
- Resource API introduced as unified data access interface
- 11 top-level directories reduced to 5 organized categories

**v4.3.0 (March 2024)** - "Tucker Release"
- Relationships and foreign key support
- Query optimization and BigInt support

**v4.4.0 (October 2024)**
- Native replication system (Plexus)
- GraphQL support
- Sharding
cxxsx
**v4.5.0 (March 2025)**
- Blob storage system
- Password hashing upgrades

**v4.6.0 (June 2025)**
- Vector indexing (HNSW)
- Data loader component
- New Extension/Plugin API

**v4.7.0 (October 2025)**
- Component status monitoring
- OCSP certificate support
- Formal deprecation of Custom Functions

### Key Statistics

| Version | Total Docs | Major Features Added | Deprecations |
|---------|-----------|---------------------|--------------|
| v4.1 | 92 files | (baseline) | - |
| v4.2 | 101 files | Component Architecture, Resource API | Custom Functions moved to Ops API |
| v4.3 | 101+ files | Relationships, BigInt, CRDT | - |
| v4.4 | 101+ files | Native Replication, GraphQL, Sharding | - |
| v4.5 | 114+ files | Blob Storage, HTTP/2 | - |
| v4.6 | 114+ files | Vector Indexing, Plugin API | - |
| v4.7 | 114+ files | Status Monitoring, OCSP | Custom Functions deprecated |

---

## Critical Deprecations & Removals

### 1. Custom Functions → Component Architecture

**Status**: DEPRECATED in v4.7, replaced by Applications + Extensions + Plugins

#### Version Timeline
- **v4.1**: Featured as top-level `custom-functions/` directory (12 files)
- **v4.2**: Moved to `developers/operations-api/custom-functions.md` (consolidated)
- **v4.2**: Component Architecture introduced as replacement
- **v4.7**: Marked with `:::warning Deprecated` banner

#### Files Affected (v4.1)
```
custom-functions/
├── create-project.md
├── custom-functions-operations.md
├── debugging-custom-function.md
├── define-helpers.md
├── define-routes.md
├── example-projects.md
├── host-static.md
├── requirements-definitions.md
├── templates.md
└── using-npm-git.md
```

#### Migration Path
- **Custom Functions** → **Applications** (for HTTP routes and APIs)
- **Custom Functions** → **Extensions** (for background services)
- **Custom Functions** → **Plugins** (for system integrations, v4.6+)

#### Consolidation Action
- ✅ Retain documentation under "Legacy/Deprecated" section
- ✅ Add prominent deprecation warning
- ✅ Cross-reference to Applications/Extensions/Plugins documentation
- ✅ Include migration guide

---

### 2. Deprecated NoSQL Operation Parameters

**Status**: DEPRECATED in v4.2+, alternatives provided

#### Changed Parameters
| Deprecated Parameter | Replacement | Version Introduced | File |
|---------------------|-------------|-------------------|------|
| `search_attribute` | `attribute` | v4.2 | nosql-operations.md |
| `search_value` | `value` | v4.2 | nosql-operations.md |
| `search_type` | `comparator` | v4.2 | nosql-operations.md |

#### Consolidation Action
- ✅ Document both old and new parameters
- ✅ Mark deprecated parameters with version labels
- ✅ Show equivalent examples using both syntaxes
- ✅ Add "Version History" section to nosql-operations documentation

---

### 3. HarperDB Studio → Harper Studio

**Status**: RENAMED in v4.2+

#### Version Timeline
- **v4.1**: `harperdb-studio/` (top-level)
- **v4.2**: `administration/harperdb-studio/`
- **v4.7**: `administration/harper-studio/`

#### Documentation Changes
**Removed Files** (tied to Custom Functions):
- `manage-functions.md` (replaced by `manage-applications.md`)
- `manage-charts.md`

**Added Files** (new features):
- `manage-applications.md` (v4.2+)
- `manage-replication.md` (v4.4+)

#### Consolidation Action
- ✅ Use "Harper Studio" as primary name
- ✅ Add redirect/note mentioning previous "HarperDB Studio" name
- ✅ Merge manage-functions content into historical section

---

## Major Feature Additions by Version

### v4.2.0 (January 2024) - MAJOR RELEASE

#### New Architecture
- **Component Architecture** - Applications, Extensions framework
  - Files: `developers/applications/` (6 files), `developers/components/` (7 files)

#### New APIs
- **Resource API** - Unified data access interface
  - Files: `developers/resources/` directory
- **REST Interface** - RESTful data access
  - Files: `developers/rest-interface.md`

#### New Features
- **Real-Time Messaging** - MQTT, WebSockets, Server-Sent Events
  - Files: `developers/real-time-messaging.md`
- **Configurable Database Schemas** - GraphQL schema syntax
  - Files: `developers/applications/defining-schemas.md`
- **Clone Node Operation** - Database cloning
  - Files: `developers/operations-api/clustering.md`

---

### v4.3.0 (March 2024) - "Tucker Release"

#### Data Model Enhancements
- **Relationships and Joins** - Foreign keys, many-to-one, one-to-many
  - Files: Added to resource API documentation
- **Indexing Nulls** - Null value indexing support
- **BigInt Support** - Large integers (up to 1000 bits)
  - Files: `reference/data-types.md` updated
- **CRDT Support** - Conflict-free replicated data types
  - Files: Added to resource API documentation

#### Developer Tools
- **OpenAPI Specification** - `/openapi` endpoint
  - Files: `developers/operations-api/` updated
- **CLI Expansion** - Operations API commands from CLI
  - Files: `deployments/harperdb-cli.md` updated
- **Query Optimizations** - Improved query planning
  - Files: `reference/resources/query-optimization.md` (added in later version)

#### Operations
- **Database Compaction** - `compact_database` operation
  - Files: `developers/operations-api/system-operations.md`

---

### v4.4.0 (October 2024)

#### Clustering & Distribution
- **Native Replication (Plexus)** - New replication system via WebSocket
  - Files: `developers/replication/` directory (NEW)
    - `index.md`
    - `configuration.md`
    - `monitoring.md`
    - `troubleshooting.md`
- **Sharding Support** - Data distribution across nodes
  - Files: Integrated into replication documentation

#### Data Model
- **Computed Properties** - Dynamic calculated properties
  - Files: `reference/` updated
- **Custom Indexing** - Composite and full-text indexing via computed properties
  - Files: `reference/` updated
- **Auto-incrementing Primary Keys** - Automatic numeric key generation
  - Files: `reference/` updated

#### APIs
- **GraphQL Support** - Native GraphQL querying
  - Files: `reference/graphql.md` (NEW)

#### Security
- **Dynamic Certificate Management** - Runtime certificate changes
  - Files: `developers/operations-api/certificate-management.md` (NEW)

#### System
- **Status Report on Startup** - Service status display
  - Files: Logging documentation updated

---

### v4.5.0 (March 2025)

#### Storage
- **Blob Storage** - Efficient binary object handling with streaming
  - Files: `reference/blob.md` (NEW)
- **Storage Reclamation** - Automatic cleanup when storage low
  - Files: `reference/storage-algorithm.md` updated

#### Security
- **Password Hashing Upgrade** - SHA256 and Argon2id support
  - Files: `developers/security/` updated
- **Certificate Revocation** - Revoked certificate list support
  - Files: `developers/security/certificate-verification.md` (NEW)

#### Performance
- **HTTP/2 Support** - HTTP/2 protocol
  - Files: `reference/` updated
- **Property Forwarding** - Standard property access syntax
  - Files: `reference/` updated

#### Analytics
- **Resource/Storage Analytics** - Enhanced metrics
  - Files: `reference/analytics.md` (NEW)

#### APIs
- **Table.getRecordCount()** - Record counting API
  - Files: Resource API documentation updated

#### Documentation Enhancements
- **Resources Directory** - New consolidated reference section
  - Files: `reference/resources/` (NEW)
    - `index.md`
    - `instance-binding.md`
    - `migration.md`
    - `query-optimization.md`

---

### v4.6.0 (June 2025)

#### AI/ML
- **Vector Indexing (HNSW)** - Hierarchical Navigable Small World algorithm
  - Files: Added to operations API documentation, resource API

#### Component System
- **New Extension API** - Dynamic reloading support
  - Files: `reference/components/extensions.md` updated
- **Data Loader** - JSON data loading component
  - Files: `developers/applications/data-loader.md` (NEW)
- **Plugin API** - New iteration of extension system
  - Files: `reference/components/plugins.md` (NEW)

#### Operations
- **Logging Improvements** - Component-specific logging configuration
  - Files: `administration/logging/` updated
- **Resource API Upgrades** - Improved ease of use
  - Files: `developers/resource-api/` updated
- **only-if-cached behavior** - Improved caching directives
  - Files: `developers/applications/caching.md` updated

---

### v4.7.0 (October 2025)

#### Monitoring
- **Component Status Monitoring** - Status collection from components
  - Files: Operations API updated

#### Security
- **OCSP Support** - Online Certificate Status Protocol for revocation
  - Files: `developers/security/` updated

#### Integration
- **Analytics/Licensing** - Fabric integration
  - Files: `reference/analytics.md` updated, `developers/operations-api/analytics.md` (NEW)

#### Component System
- **Plugin API Improvements** - Enhanced plugin system
  - Files: `reference/components/plugins.md` updated

#### Major Reorganization
- **Components Moved to Reference** - `developers/components/` → `reference/components/`
  - 9 files reorganized

---

## Feature-by-Feature Version History

### Applications

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Custom Functions** | ✅ Featured | ⚠️ In Ops API | ⚠️ In Ops API | ⚠️ In Ops API | ⚠️ Deprecated | ⚠️ Deprecated | ❌ Deprecated |
| **Component Architecture** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ Enhanced | ✅ |
| **Applications** | ❌ | ✅ New | ✅ | ✅ | ✅ | ✅ Enhanced | ✅ |
| **Extensions** | ❌ | ✅ New | ✅ | ✅ | ✅ | ✅ Enhanced | ✅ |
| **Plugins** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ |
| **Data Loader** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ |
| **Define Routes** | ✅ (CF) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Defining Schemas** | ❌ | ✅ New | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Defining Roles** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced |
| **Caching** | ❌ | ✅ New | ✅ | ✅ | ✅ | ✅ Enhanced | ✅ |
| **Debugging** | ✅ (CF) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Example Projects** | ✅ (CF) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Web Applications** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced |

**Files**:
- v4.1: `custom-functions/` (12 files)
- v4.2-v4.6: `developers/applications/` (6 files)
- v4.7: `developers/applications/` (8 files)

---

### Data Access APIs

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Operations API** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Resource API** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ Enhanced | ✅ Enhanced | ✅ |
| **REST Interface** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |
| **GraphQL** | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| **SQL** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **NoSQL** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **OpenAPI Spec** | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ |

**Files**:
- v4.1: `reference/` (7 files)
- v4.2: `developers/operations-api/` (16 files), `developers/resource-api/` (NEW)
- v4.7: `developers/operations-api/` (20 files), `reference/graphql.md`

---

### Data Model Features

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Dynamic Schema** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Configurable Schemas** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Relationships/Joins** | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ |
| **Foreign Keys** | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ |
| **Computed Properties** | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| **Custom Indexing** | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| **Auto-increment Keys** | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| **Vector Indexing** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ |
| **BigInt Support** | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ |
| **CRDT Support** | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ |
| **Null Indexing** | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ |
| **Blob Storage** | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ |

**Files**:
- v4.1-v4.2: `reference/data-types.md`, `reference/dynamic-schema.md`
- v4.3+: Enhanced data type documentation
- v4.4+: `reference/` expanded with computed properties, indexing
- v4.5+: `reference/blob.md`
- v4.6+: Vector indexing in operations API

---

### Clustering & Replication

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Clustering (Legacy)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **NATS Clustering** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Native Replication (Plexus)** | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| **Sharding** | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| **Clone Node** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |

**Files**:
- v4.1: `clustering/` (13 files, top-level)
- v4.2-v4.7: `reference/clustering/` (13 files, moved)
- v4.4+: `developers/replication/` (NEW - 4 files)
- v4.7: `developers/operations-api/clustering-nats.md` (split from clustering.md)

---

### Security Features

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Authentication** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Authorization/Roles** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **TLS/SSL** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **JWT** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **LDAP** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SAML** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dynamic Cert Management** | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| **Password Hashing Upgrade** | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ |
| **Certificate Revocation** | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ |
| **Certificate Verification** | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ |
| **mTLS Auth** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced |
| **OCSP Support** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced |

**Files**:
- v4.1: `security/` (6 files, top-level)
- v4.2-v4.6: `developers/security/` (6 files)
- v4.7: `developers/security/` (8 files)
  - Added: `certificate-verification.md`, `mtls-auth.md`

---

### Real-Time & Messaging

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **MQTT** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |
| **WebSockets** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Server-Sent Events** | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |

**Files**:
- v4.2+: `developers/real-time-messaging.md`

---

### Operations API - Specific Operations

#### System Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `restart` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `get_system_information` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `get_configuration` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `set_configuration` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `compact_database` | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ |

**Files**: `developers/operations-api/system-operations.md` (v4.7+)

---

#### Schema Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `create_schema` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `describe_schema` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `drop_schema` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

#### Table Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `create_table` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `describe_table` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `drop_table` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `create_attribute` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `drop_attribute` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

#### NoSQL Data Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `insert` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `update` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `upsert` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `delete` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `search_by_hash` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `search_by_value` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `search_by_conditions` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Parameter Changes**:
- v4.2+: `search_attribute` → `attribute` (deprecated)
- v4.2+: `search_value` → `value` (deprecated)
- v4.2+: `search_type` → `comparator` (deprecated)

---

#### SQL Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `sql` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

#### User & Role Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `add_user` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `alter_user` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `drop_user` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `user_info` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `list_users` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `add_role` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `alter_role` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `drop_role` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

#### Clustering Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `add_node` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `update_node` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `remove_node` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `cluster_status` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `cluster_network` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `clone_node` | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |

**File Split** (v4.7):
- `clustering.md` → `clustering.md` + `clustering-nats.md`

---

#### Custom Functions Operations (DEPRECATED)

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `get_functions` | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ Deprecated |
| `set_functions` | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ Deprecated |
| `drop_function` | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ Deprecated |
| `deploy` | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ Deprecated |
| `package` | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ Deprecated |

**Files**:
- v4.1: `custom-functions/custom-functions-operations.md`
- v4.2+: `developers/operations-api/custom-functions.md`
- v4.7: Marked with `:::warning Deprecated`

---

#### Component Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `deploy_component` | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |
| `drop_component` | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |
| `package_component` | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |
| `get_components` | ❌ | ✅ Introduced | ✅ | ✅ | ✅ | ✅ | ✅ |

**Options Added** (tracked by version):
- `deploy_component`:
  - v4.2: Initial implementation
  - **Need to check**: When was `install_command` option added?

---

#### Certificate Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `add_certificate` | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| `list_certificates` | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |
| `delete_certificate` | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ | ✅ |

**Files**: `developers/operations-api/certificate-management.md` (v4.4+)

---

#### Analytics Operations

| Operation | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|-----------|------|------|------|------|------|------|------|
| `get_analytics` | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ | ✅ |

**Files**: `developers/operations-api/analytics.md` (v4.7)

---

### Logging Features

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Standard Logging** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Enhanced | ✅ |
| **Transaction Logging** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Audit Logging** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Component Logging** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Introduced | ✅ |

**Files**:
- v4.1: `logging.md`, `transaction-logging.md`, `audit-logging.md` (top-level)
- v4.2+: `administration/logging/` (directory)
  - `index.md`
  - `standard-logging.md`
  - `transaction-logging.md`
  - `audit-logging.md`

---

### Administration Tools

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **HarperDB Studio** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Harper Studio** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Renamed |
| **Jobs** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Configuration** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Studio Files**:
- v4.1: `harperdb-studio/` (top-level)
- v4.2-v4.6: `administration/harperdb-studio/` (9 files)
- v4.7: `administration/harper-studio/` (9 files)

**Configuration Files**:
- v4.1: `configuration.md` (top-level)
- v4.2+: `deployments/configuration.md`

---

### SQL Features

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **SQL Operations** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SQL Functions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Geospatial Functions** | ✅ (9 files) | ✅ (9 files) | ✅ (9 files) | ✅ (9 files) | ✅ (9 files) | ✅ (consolidated) | ✅ (consolidated) |
| **Math Functions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **String Functions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Date/Time Functions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Geospatial Consolidation**:
- v4.1-v4.5: `sql-guide/sql-geospatial-functions/` (9 individual files)
  - `geoarea.md`, `geocontains.md`, `geoconvert.md`, `geocrosses.md`, `geodifference.md`, `geodistance.md`, `geoequal.md`, `geolength.md`, `geonear.md`
- v4.6+: `reference/sql-guide/sql-geospatial-functions.md` (consolidated)

**Files**:
- v4.1: `sql-guide/` (13 files, top-level)
- v4.2+: `reference/sql-guide/` (6 files)

---

### Deployment Options

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Docker** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Linux** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Windows** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **macOS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HarperDB Cloud** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Files**:
- v4.1: `install-harperdb/` (top-level), `harperdb-cloud/` (top-level)
- v4.2+: `deployments/install-harperdb/`, `deployments/harperdb-cloud/`

---

### SDKs & Integrations

| Feature | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|---------|------|------|------|------|------|------|------|
| **Node.js SDK** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Python SDK** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Java Driver** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ODBC/JDBC** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Google Data Studio** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Files**:
- v4.1: `add-ons-and-sdks/` (3 files, top-level)
- v4.2: `developers/components/` includes SDK information

---

## Documentation Structure Evolution

### v4.1 Organization (Feature-Based)

```
version-4.1/
├── add-ons-and-sdks/                [3 files]
├── clustering/                      [13 files]
├── custom-functions/                [12 files] → DEPRECATED
├── getting-started/                 [2 files]
├── harperdb-cloud/                  [5 files]
├── harperdb-studio/                 [9 files]
├── install-harperdb/                [3 files]
├── reference/                       [7 files]
├── security/                        [6 files]
├── sql-guide/                       [13 files]
├── audit-logging.md
├── configuration.md
├── harperdb-cli.md
├── index.md
├── jobs.md
├── logging.md
├── support.md
├── transaction-logging.md
└── upgrade-hdb-instance.md

Total: 92 files
```

---

### v4.2-v4.6 Organization (Role-Based)

```
version-4.2+/
├── administration/
│   ├── harper-studio/              [9 files] (v4.7 renamed)
│   ├── harperdb-studio/            [9 files] (v4.2-v4.6)
│   ├── logging/                    [4 files]
│   ├── configuration.md
│   ├── jobs.md
│   └── index.md
├── deployments/
│   ├── harperdb-cloud/             [5 files]
│   ├── install-harperdb/           [3 files]
│   ├── configuration.md
│   ├── harperdb-cli.md
│   └── index.md
├── developers/
│   ├── applications/               [6-8 files, grew in v4.7]
│   ├── components/                 [6-7 files] → moved to reference/ in v4.7
│   ├── operations-api/             [16-20 files, grew over time]
│   ├── replication/                [4 files] (v4.4+)
│   ├── resource-api/               [multiple files]
│   ├── security/                   [6-8 files]
│   ├── getting-started.md
│   ├── harperdb-applications-in-depth.md
│   ├── harperdb-cli.md
│   ├── real-time-messaging.md      (v4.2+)
│   ├── rest-interface.md           (v4.2+)
│   └── index.md
├── reference/
│   ├── clustering/                 [13 files] (moved from top-level)
│   ├── components/                 [9 files] (v4.7+, moved from developers/)
│   ├── resources/                  [4 files] (v4.5+)
│   ├── sql-guide/                  [6 files]
│   ├── analytics.md                (v4.5+)
│   ├── architecture.md
│   ├── blob.md                     (v4.5+)
│   ├── content-types.md
│   ├── data-types.md
│   ├── dynamic-schema.md
│   ├── globals.md
│   ├── graphql.md                  (v4.4+)
│   ├── headers.md
│   ├── limits.md
│   ├── roles.md
│   ├── storage-algorithm.md
│   ├── transactions.md
│   └── index.md
└── index.md

Total (v4.7): 114+ files
```

---

### Key Structural Changes

#### v4.1 → v4.2 (Major Reorganization)

**Moved to Administration**:
- `harperdb-studio/` → `administration/harperdb-studio/`
- `logging.md`, `transaction-logging.md`, `audit-logging.md` → `administration/logging/`
- `jobs.md` → `administration/jobs.md`

**Moved to Deployments**:
- `install-harperdb/` → `deployments/install-harperdb/`
- `harperdb-cloud/` → `deployments/harperdb-cloud/`
- `configuration.md` → `deployments/configuration.md`
- `harperdb-cli.md` → `deployments/harperdb-cli.md`

**Moved to Developers**:
- `security/` → `developers/security/`
- `getting-started/` → `developers/getting-started.md`

**Moved to Reference**:
- `clustering/` → `reference/clustering/`
- `sql-guide/` → `reference/sql-guide/`

**New Directories Created**:
- `developers/applications/`
- `developers/components/`
- `developers/operations-api/`
- `developers/resource-api/`

**Deprecated/Removed**:
- `custom-functions/` → consolidated to `developers/operations-api/custom-functions.md`
- `add-ons-and-sdks/` → integrated into `developers/components/`

---

#### v4.6 → v4.7 (Components Reorganization)

**Moved**:
- `developers/components/` → `reference/components/`

**Reasoning**: Components (Applications, Extensions, Plugins) became core reference documentation rather than developer tools.

---

## Operations API Evolution

### Operations API File Structure by Version

#### v4.1 (Implied from reference docs)
- Basic operations documented but not in dedicated directory

#### v4.2 (16 files)
```
developers/operations-api/
├── clustering.md
├── custom-functions.md
├── index.md
├── nosql-operations.md
├── registration.md
├── schema-table-operations.md
├── sql-operations.md
├── user-role-operations.md
└── [8 more files]
```

#### v4.7 (20 files)
```
developers/operations-api/
├── analytics.md                    [NEW]
├── certificate-management.md       [NEW - v4.4]
├── clustering-nats.md              [NEW - split from clustering.md]
├── clustering.md
├── configuration.md                [NEW]
├── custom-functions.md             [DEPRECATED]
├── index.md
├── nosql-operations.md
├── registration.md
├── schema-table-operations.md
├── sql-operations.md
├── system-operations.md            [NEW]
├── user-role-operations.md
└── [7 more files]
```

**Notable Additions**:
- v4.3: `compact_database` operation added to system operations
- v4.4: `certificate-management.md` for dynamic certificate operations
- v4.5: Enhanced system operations for storage reclamation
- v4.7: `analytics.md` for Fabric integration, `system-operations.md` consolidated

**Notable Removals**:
- v4.7: `utilities.md` removed (content integrated elsewhere)

---

## Consolidation Action Items

### Phase 1: Deprecated Features Documentation

#### 1.1 Custom Functions (CRITICAL)

**Goal**: Create comprehensive legacy documentation with clear deprecation warnings and migration paths.

**Actions**:
- [ ] Create new section: `legacy/custom-functions/`
- [ ] Migrate all 12 files from v4.1 `custom-functions/` directory
- [ ] Add deprecation banner to every page:
  ```markdown
  :::warning Deprecated in v4.7
  Custom Functions have been deprecated as of v4.7.0 (October 2025) and replaced by the [Component Architecture](/developers/applications/).

  **Migration Path**:
  - For HTTP routes and APIs → [Applications](/developers/applications/)
  - For background services → [Extensions](/reference/components/extensions/)
  - For system integrations → [Plugins](/reference/components/plugins/)

  See the [Migration Guide](/legacy/custom-functions/migration-guide/) for detailed instructions.
  :::
  ```
- [ ] Create `legacy/custom-functions/migration-guide.md` with:
  - Side-by-side code examples (Custom Functions vs. Applications)
  - Feature mapping table
  - Common migration scenarios
  - Troubleshooting section
- [ ] Add version labels to all Custom Functions operations in Operations API docs
- [ ] Create redirect from old paths to legacy section

**Files to Migrate**:
1. `create-project.md`
2. `custom-functions-operations.md`
3. `debugging-custom-function.md`
4. `define-helpers.md`
5. `define-routes.md`
6. `example-projects.md`
7. `host-static.md`
8. `requirements-definitions.md`
9. `templates.md`
10. `using-npm-git.md`

---

#### 1.2 Deprecated NoSQL Parameters

**Goal**: Document parameter evolution with clear version labels.

**Actions**:
- [ ] Add "Parameter History" section to `nosql-operations.md`
- [ ] Create comparison table:
  ```markdown
  | Deprecated (v4.1) | Current (v4.2+) | Status |
  |------------------|-----------------|---------|
  | `search_attribute` | `attribute` | Deprecated |
  | `search_value` | `value` | Deprecated |
  | `search_type` | `comparator` | Deprecated |
  ```
- [ ] Show side-by-side examples with version labels
- [ ] Add deprecation warnings to examples using old parameters
- [ ] Document when support might be fully removed

---

### Phase 2: Renamed Features

#### 2.1 HarperDB Studio → Harper Studio

**Goal**: Use current naming while acknowledging historical name.

**Actions**:
- [ ] Use "Harper Studio" as primary name throughout consolidated docs
- [ ] Add note at top of Harper Studio section:
  ```markdown
  :::info Historical Note
  Harper Studio was previously known as "HarperDB Studio" in versions prior to v4.7.
  :::
  ```
- [ ] Create redirect rule: `/administration/harperdb-studio/*` → `/administration/harper-studio/*`
- [ ] Update all cross-references to use new name
- [ ] Merge v4.1 `manage-functions.md` content into legacy/custom-functions section
- [ ] Document feature evolution:
  - v4.1: `manage-functions.md`, `manage-charts.md`
  - v4.7: `manage-applications.md`, `manage-replication.md`

---

### Phase 3: Relocated/Reorganized Features

#### 3.1 Clustering Documentation

**Goal**: Consolidate under reference section with version history.

**Actions**:
- [ ] Use v4.7 structure: `reference/clustering/`
- [ ] Add version note explaining the relocation:
  ```markdown
  :::info Location History
  - v4.1: Top-level `clustering/` directory
  - v4.2+: Moved to `reference/clustering/`
  :::
  ```
- [ ] Ensure all 13 files are present
- [ ] Update cross-references throughout documentation
- [ ] Add links to related features:
  - Native Replication (v4.4+): `developers/replication/`
  - Clustering Operations: `developers/operations-api/clustering.md`
  - NATS Clustering: `developers/operations-api/clustering-nats.md`

---

#### 3.2 Components Documentation

**Goal**: Place in reference section with clear distinction between Applications, Extensions, and Plugins.

**Actions**:
- [ ] Use v4.7 structure: `reference/components/`
- [ ] Add version timeline:
  ```markdown
  ## Version History

  - **v4.2**: Component Architecture introduced
  - **v4.6**: Plugin API introduced
  - **v4.7**: Components documentation moved to reference section
  ```
- [ ] Create clear sections:
  - `applications.md` - HTTP routes, APIs, web applications
  - `extensions.md` - Background services, data processing
  - `plugins.md` - System integrations (v4.6+)
  - `built-in-extensions.md` - Core system extensions
  - `configuration.md` - Component configuration
- [ ] Cross-reference to `developers/applications/` for hands-on guides
- [ ] Document evolution from Custom Functions → Components

---

#### 3.3 SQL Geospatial Functions

**Goal**: Use consolidated file with internal navigation.

**Actions**:
- [ ] Use v4.6+ structure: Single `reference/sql-guide/sql-geospatial-functions.md`
- [ ] Ensure all 9 functions are documented:
  1. `GEOAREA()`
  2. `GEOCONTAINS()`
  3. `GEOCONVERT()`
  4. `GEOCROSSES()`
  5. `GEODIFFERENCE()`
  6. `GEODISTANCE()`
  7. `GEOEQUAL()`
  8. `GEOLENGTH()`
  9. `GEONEAR()`
- [ ] Add table of contents at top for easy navigation
- [ ] Use consistent format for each function:
  - Syntax
  - Parameters
  - Return value
  - Examples
  - Version availability
- [ ] Note the consolidation at the top:
  ```markdown
  :::info Documentation Consolidation
  Prior to v4.6, each geospatial function was documented in a separate file. This documentation has been consolidated for easier reference.
  :::
  ```

---

### Phase 4: Version-Specific Feature Documentation

#### 4.1 Operations API Operations

**Goal**: Document all operations with version introduced and option changes.

**Actions**:
- [ ] Create "Version History" section for each operation
- [ ] Format example for `deploy_component`:
  ```markdown
  ## deploy_component

  **Introduced**: v4.2.0

  ### Syntax
  ```json
  {
    "operation": "deploy_component",
    "project": "string",
    "package": "string" // optional
  }
  ```

  ### Options

  | Option | Type | Required | Introduced | Description |
  |--------|------|----------|------------|-------------|
  | `project` | string | Yes | v4.2 | Component project path |
  | `package` | string | No | v4.2 | Package file path |
  | `install_command` | string | No | v4.X | Custom install command |

  ### Version History

  - **v4.2.0**: Operation introduced
  - **v4.X.0**: Added `install_command` option [NEED TO VERIFY VERSION]
  ```

**Operations Requiring Version Tracking**:
1. `compact_database` (v4.3)
2. `clone_node` (v4.2)
3. All certificate operations (v4.4):
   - `add_certificate`
   - `list_certificates`
   - `delete_certificate`
4. Component operations (v4.2):
   - `deploy_component` - Track option additions
   - `drop_component`
   - `package_component`
   - `get_components`
5. `get_analytics` (v4.5)

**RESEARCH NEEDED**:
- [ ] When was `install_command` added to `deploy_component`?
- [ ] Review each operation's release notes for option additions

---

#### 4.2 Data Model Features

**Goal**: Document feature availability by version.

**Actions**:
- [ ] Create "Feature Availability" tables in relevant sections
- [ ] Example for Relationships documentation:
  ```markdown
  ## Relationships

  **Introduced**: v4.3.0 (Tucker Release)

  Harper allows you to define relationships between tables using foreign keys.

  ### Feature Matrix

  | Feature | Since | Description |
  |---------|-------|-------------|
  | Foreign Keys | v4.3 | Link records across tables |
  | Many-to-One | v4.3 | Multiple records reference one record |
  | One-to-Many | v4.3 | One record references multiple records |
  | Cascade Delete | v4.3 | Automatic deletion of related records |
  ```

**Features Requiring Version Labels**:
1. Relationships & Joins (v4.3)
2. Computed Properties (v4.4)
3. Custom Indexing (v4.4)
4. Auto-increment Keys (v4.4)
5. Vector Indexing (v4.6)
6. BigInt Support (v4.3)
7. CRDT Support (v4.3)
8. Null Indexing (v4.3)
9. Blob Storage (v4.5)

---

#### 4.3 API Features

**Goal**: Document API evolution and new endpoints.

**Actions**:
- [ ] Create API comparison table:
  ```markdown
  ## Data Access APIs

  | API | Introduced | Primary Use Case |
  |-----|------------|------------------|
  | Operations API | v4.0 | Administrative and data operations |
  | Resource API | v4.2 | Unified data access interface |
  | REST Interface | v4.2 | RESTful data access |
  | GraphQL | v4.4 | Graph-based querying |
  | SQL | v4.0 | Relational queries |
  | NoSQL | v4.0 | Document operations |
  ```
- [ ] Add "API Evolution" timeline graphic/section
- [ ] Cross-reference between API types with version context

---

#### 4.4 Security Features

**Goal**: Document security enhancements by version.

**Actions**:
- [ ] Create security features timeline:
  ```markdown
  ## Security Feature Timeline

  ### Core Authentication & Authorization (v4.0+)
  - Username/Password authentication
  - Role-based access control (RBAC)
  - JWT token authentication
  - LDAP integration
  - SAML 2.0 support

  ### TLS/SSL Enhancements
  - **v4.0**: Basic TLS/SSL support
  - **v4.4**: Dynamic certificate management
  - **v4.5**: Certificate revocation lists
  - **v4.5**: Certificate verification
  - **v4.7**: mTLS authentication
  - **v4.7**: OCSP support

  ### Password Security
  - **v4.0-v4.4**: SHA256 hashing
  - **v4.5**: Argon2id support (recommended)
  ```
- [ ] Add security best practices with version recommendations
- [ ] Document migration paths for security upgrades

---

### Phase 5: New Subsystem Documentation

#### 5.1 Native Replication (v4.4+)

**Goal**: Comprehensive replication documentation separate from legacy clustering.

**Actions**:
- [ ] Ensure `developers/replication/` directory is complete
- [ ] Add clear distinction from legacy clustering:
  ```markdown
  ## Replication vs. Clustering

  Harper offers two approaches to distributed data:

  ### Native Replication (Plexus) - Introduced v4.4
  - WebSocket-based communication
  - Automatic conflict resolution
  - Sharding support
  - Recommended for new deployments
  - Documentation: `developers/replication/`

  ### Legacy Clustering (NATS-based) - v4.0+
  - NATS message bus communication
  - Manual conflict resolution
  - No sharding
  - Documentation: `reference/clustering/`
  ```
- [ ] Include migration guide from clustering to replication
- [ ] Cross-reference to:
  - `reference/clustering/` (legacy)
  - `developers/operations-api/clustering.md`
  - `developers/operations-api/clustering-nats.md`

---

#### 5.2 Blob Storage (v4.5+)

**Goal**: Complete blob storage documentation.

**Actions**:
- [ ] Ensure `reference/blob.md` covers:
  - What qualifies as blob data
  - Streaming APIs
  - Storage locations
  - Performance characteristics
  - Size limits
  - Version: v4.5+
- [ ] Add examples for:
  - Storing images
  - Storing videos
  - Storing documents
  - Streaming large files
- [ ] Cross-reference to:
  - Storage algorithm documentation
  - Resource API (for blob access)
  - Storage analytics

---

#### 5.3 Vector Indexing (v4.6+)

**Goal**: Comprehensive vector search documentation.

**Actions**:
- [ ] Ensure vector indexing documentation covers:
  - HNSW algorithm explanation
  - Use cases (similarity search, embeddings)
  - Index creation
  - Query syntax
  - Performance tuning
  - Version: v4.6+
- [ ] Add examples for:
  - Semantic search
  - Image similarity
  - Recommendation systems
- [ ] Cross-reference to:
  - Custom indexing (v4.4)
  - Computed properties
  - Resource API query syntax

---

### Phase 6: Cross-Version References

#### 6.1 Version Labels

**Goal**: Consistent version labeling throughout documentation.

**Action**: Add version badges to features:
```markdown
## Auto-Incrementing Primary Keys <Badge>v4.4+</Badge>

Harper supports automatic generation of numeric primary keys.
```

**Standard Badge Types**:
- `<Badge>v4.X+</Badge>` - Feature introduced
- `<Badge type="warning">Deprecated v4.7</Badge>` - Deprecated feature
- `<Badge type="danger">Removed v4.X</Badge>` - Removed feature

---

#### 6.2 Version-Specific Notes

**Goal**: Call out version-specific behavior.

**Standard Format**:
```markdown
:::info Version 4.3+
This feature requires HarperDB v4.3 or later.
:::

:::warning Versions prior to 4.5
Password hashing in versions prior to 4.5 uses SHA256. Upgrade to v4.5+ for Argon2id support.
:::

:::danger Breaking Change in v4.2
The `search_attribute` parameter was deprecated in v4.2. Use `attribute` instead.
:::
```

---

### Phase 7: Navigation & Organization

#### 7.1 Consolidated Sidebar

**Goal**: Create unified sidebar that accommodates all versions.

**Proposed Structure**:
```javascript
{
  "docsSidebar": [
    {
      "type": "doc",
      "id": "index",
      "label": "Introduction"
    },
    {
      "type": "category",
      "label": "Developers",
      "items": [
        {
          "type": "category",
          "label": "Applications",
          "items": [
            "developers/applications/index",
            "developers/applications/define-routes",
            "developers/applications/defining-schemas",
            "developers/applications/defining-roles",
            "developers/applications/caching",
            "developers/applications/debugging",
            "developers/applications/data-loader",
            "developers/applications/example-projects",
            "developers/applications/web-applications"
          ]
        },
        {
          "type": "category",
          "label": "Data Access APIs",
          "items": [
            "developers/resource-api/index",
            "developers/rest-interface",
            "developers/operations-api/index",
            "developers/graphql"
          ]
        },
        {
          "type": "category",
          "label": "Replication",
          "link": {
            "type": "doc",
            "id": "developers/replication/index"
          },
          "items": [
            "developers/replication/configuration",
            "developers/replication/monitoring",
            "developers/replication/troubleshooting"
          ]
        },
        {
          "type": "category",
          "label": "Security",
          "items": [
            "developers/security/index",
            "developers/security/authentication",
            "developers/security/authorization",
            "developers/security/tls-ssl",
            "developers/security/jwt",
            "developers/security/ldap",
            "developers/security/saml",
            "developers/security/certificate-verification",
            "developers/security/mtls-auth"
          ]
        },
        "developers/real-time-messaging",
        "developers/harperdb-applications-in-depth",
        "developers/getting-started"
      ]
    },
    {
      "type": "category",
      "label": "Administration",
      "items": [
        {
          "type": "category",
          "label": "Harper Studio",
          "items": [
            "administration/harper-studio/index",
            "administration/harper-studio/manage-applications",
            "administration/harper-studio/manage-replication",
            // ... other studio files
          ]
        },
        {
          "type": "category",
          "label": "Logging",
          "items": [
            "administration/logging/index",
            "administration/logging/standard-logging",
            "administration/logging/transaction-logging",
            "administration/logging/audit-logging"
          ]
        },
        "administration/configuration",
        "administration/jobs"
      ]
    },
    {
      "type": "category",
      "label": "Deployments",
      "items": [
        {
          "type": "category",
          "label": "Install HarperDB",
          "items": [
            "deployments/install-harperdb/docker",
            "deployments/install-harperdb/linux",
            "deployments/install-harperdb/windows"
          ]
        },
        {
          "type": "category",
          "label": "HarperDB Cloud",
          "items": [
            // cloud files
          ]
        },
        "deployments/configuration",
        "deployments/harperdb-cli"
      ]
    },
    {
      "type": "category",
      "label": "Reference",
      "link": {
        "type": "doc",
        "id": "reference/index"
      },
      "items": [
        {
          "type": "category",
          "label": "Components",
          "items": [
            "reference/components/index",
            "reference/components/applications",
            "reference/components/extensions",
            "reference/components/plugins",
            "reference/components/built-in-extensions",
            "reference/components/configuration"
          ]
        },
        {
          "type": "category",
          "label": "Clustering",
          "items": [
            // all 13 clustering files
          ]
        },
        {
          "type": "category",
          "label": "SQL Guide",
          "items": [
            "reference/sql-guide/index",
            "reference/sql-guide/sql-functions",
            "reference/sql-guide/sql-geospatial-functions",
            "reference/sql-guide/sql-math-functions",
            "reference/sql-guide/sql-string-functions",
            "reference/sql-guide/sql-datetime-functions"
          ]
        },
        {
          "type": "category",
          "label": "Resources",
          "items": [
            "reference/resources/index",
            "reference/resources/instance-binding",
            "reference/resources/migration",
            "reference/resources/query-optimization"
          ]
        },
        "reference/architecture",
        "reference/analytics",
        "reference/blob",
        "reference/content-types",
        "reference/data-types",
        "reference/dynamic-schema",
        "reference/globals",
        "reference/graphql",
        "reference/headers",
        "reference/limits",
        "reference/roles",
        "reference/storage-algorithm",
        "reference/transactions"
      ]
    },
    {
      "type": "category",
      "label": "Legacy Features",
      "items": [
        {
          "type": "category",
          "label": "Custom Functions (Deprecated)",
          "items": [
            "legacy/custom-functions/index",
            "legacy/custom-functions/migration-guide",
            "legacy/custom-functions/create-project",
            "legacy/custom-functions/custom-functions-operations",
            "legacy/custom-functions/debugging-custom-function",
            "legacy/custom-functions/define-helpers",
            "legacy/custom-functions/define-routes",
            "legacy/custom-functions/example-projects",
            "legacy/custom-functions/host-static",
            "legacy/custom-functions/requirements-definitions",
            "legacy/custom-functions/templates",
            "legacy/custom-functions/using-npm-git"
          ]
        }
      ]
    },
    {
      "type": "doc",
      "id": "support",
      "label": "Support"
    }
  ]
}
```

---

#### 7.2 Version Switcher

**Goal**: Allow users to view version-specific documentation.

**Options**:
1. **Unified docs with version labels** (Recommended)
   - Single documentation tree
   - Features labeled with version badges
   - Deprecated features in separate "Legacy" section
   - Pros: Easier to maintain, comprehensive view
   - Cons: More complex individual pages

2. **Version dropdown for major versions**
   - Keep separate docs for v4.1, v4.2, etc.
   - Add consolidated "Latest (v4.7)" version
   - Pros: Version-accurate documentation
   - Cons: Harder to maintain, fragmented

**Recommendation**: Use unified docs with version labels, keep versioned docs archived for reference.

---

### Phase 8: Migration Guides

#### 8.1 Custom Functions to Components

**Create**: `legacy/custom-functions/migration-guide.md`

**Contents**:
- Introduction to Component Architecture
- Feature comparison table
- Step-by-step migration process
- Code examples (before/after)
- Common pitfalls
- FAQ

---

#### 8.2 Legacy Clustering to Native Replication

**Create**: `developers/replication/migration-from-clustering.md`

**Contents**:
- Why migrate to Native Replication
- Feature comparison
- Migration process
- Downtime considerations
- Rollback procedures
- FAQ

---

#### 8.3 NoSQL Parameter Updates

**Create**: `developers/operations-api/nosql-parameter-migration.md`

**Contents**:
- Parameter mappings
- Code examples
- Automated migration scripts
- Backward compatibility notes

---

### Phase 9: Testing & Validation

#### 9.1 Link Validation

**Actions**:
- [ ] Run link checker on all internal links
- [ ] Verify all cross-references point to correct files
- [ ] Test version badge rendering
- [ ] Verify code examples compile/run

---

#### 9.2 Version Accuracy

**Actions**:
- [ ] Review each version label against release notes
- [ ] Verify operation availability by version
- [ ] Test feature examples on appropriate versions
- [ ] Confirm deprecation timelines

---

#### 9.3 Navigation Testing

**Actions**:
- [ ] Test sidebar navigation
- [ ] Verify search functionality finds all relevant results
- [ ] Test breadcrumb navigation
- [ ] Verify "Next/Previous" page links

---

## Summary Statistics

### Documentation Growth

| Metric | v4.1 | v4.2 | v4.3 | v4.4 | v4.5 | v4.6 | v4.7 |
|--------|------|------|------|------|------|------|------|
| **Total Files** | 92 | 101 | 101+ | 101+ | 114+ | 114+ | 114+ |
| **Top-level Dirs** | 11 | 5 | 5 | 5 | 5 | 5 | 5 |
| **Major Features** | Baseline | +7 | +9 | +8 | +6 | +5 | +4 |
| **Deprecations** | 0 | 1 | 0 | 0 | 0 | 0 | 1 |

---

### Feature Categories

| Category | Features Added | Versions |
|----------|---------------|----------|
| **Architecture** | Component Architecture, Plugins | v4.2, v4.6 |
| **Data Model** | Relationships, Computed Props, Vector Index, Blob | v4.3, v4.4, v4.5, v4.6 |
| **APIs** | Resource API, REST, GraphQL | v4.2, v4.4 |
| **Clustering** | Native Replication, Sharding | v4.4 |
| **Security** | Dynamic Certs, Argon2id, OCSP, mTLS | v4.4, v4.5, v4.7 |
| **Real-time** | MQTT, WebSocket, SSE | v4.2 |
| **Developer Tools** | OpenAPI, CLI expansion, Data Loader | v4.3, v4.6 |

---

## Next Steps

1. **Review this mapping** with stakeholders for accuracy
2. **Research missing details**:
   - When was `install_command` added to `deploy_component`?
   - Any other operation option additions?
3. **Prioritize consolidation phases**:
   - Phase 1 (Deprecated features) - High priority
   - Phase 4 (Version-specific features) - High priority
   - Phase 2-3 (Renames/reorganization) - Medium priority
   - Phase 5-9 (New systems, navigation) - Lower priority
4. **Begin implementation** starting with deprecated features and version labeling

---

## Document Maintenance

**Last Updated**: 2026-02-05
**Next Review**: After consolidation implementation
**Owner**: Documentation Team

**Change Log**:
- 2026-02-05: Initial comprehensive analysis created
