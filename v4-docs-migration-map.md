# Harper v4 Documentation Migration Map

This document maps existing documentation paths from `versioned_docs/version-4.X/` and `reference/` to the new consolidated reference structure defined in [reference-plan-v4.md](./reference-plan-v4.md).

## Legend

- **Primary Source**: The version folder that should be used as the primary content source (usually v4.7)
- **Merge Required**: Content needs to be merged from multiple versions
- **Version Annotations**: Requires version history annotations based on earlier versions
- **Status**: Current migration status
  - `Not Started` - No work done yet
  - `In Progress` - Currently being migrated
  - `Complete` - Migration finished
  - `N/A` - Not applicable (content being removed/deprecated)

---

## CLI Section

### `reference/cli/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/deployments/harper-cli.md`
- **Additional Sources**:
  - `versioned_docs/version-4.1/cli.md` (for baseline features)
  - Current `reference/harper-cli.md` (if exists)
- **Merge Required**: Yes - CLI commands added across versions
- **Version Annotations**: Track command additions from v4.1 → v4.7
- **Status**: In Progress
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - CLI expansion with operations API commands
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Dev mode (`harperdb dev`, `harperdb run`)

### `reference/cli/commands.md`
- **Primary Source**: Extract from `versioned_docs/version-4.7/deployments/harper-cli.md`
- **Additional Sources**: Compare all versions for command evolution
- **Version Annotations**: Each command should note its introduction version
- **Status**: In Progress
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - CLI expansion
  - [4.1.0](release-notes/v4-tucker/4.1.0.md) - Foreground mode changes

### `reference/cli/operations-api-commands.md`
- **Primary Source**: Extract from `versioned_docs/version-4.7/deployments/harper-cli.md`
- **Additional Sources**: `versioned_docs/version-4.3+` (CLI ops api support added in v4.3)
- **Version Annotations**: Note v4.3.0 introduction
- **Status**: In Progress
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - CLI expansion with operations API

### `reference/cli/authentication.md`
- **Primary Source**: New content or extract from CLI docs
- **Status**: In Progress

---

## Configuration Section

### `reference/configuration/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/deployments/configuration.md`
- **Additional Sources**:
  - Current `reference/configuration.md`
  - `versioned_docs/version-4.1/configuration.md` (baseline)
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Major config changes (http section, componentRoot)
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Configuration improvements
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Developer/production mode

### `reference/configuration/options.md`
- **Primary Source**: Current `reference/configuration.md` (very comprehensive)
- **Additional Sources**: Compare all version-X/deployments/configuration.md files
- **Merge Required**: Yes - configuration options added across versions
- **Version Annotations**: Each config option needs version introduced
- **Status**: Not Started
- **Notes**: This will be a large migration task - the current configuration.md is 59KB
- **Release Notes**: Major config changes across many versions - see all major releases

### `reference/configuration/operations.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/operations-api/configuration.md`
- **Additional Sources**: Earlier versions for feature evolution
- **Version Annotations**: Track when ops were added
- **Status**: Not Started

---

## Operations API Section

### `reference/operations-api/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/operations-api/index.md`
- **Additional Sources**:
  - `versioned_docs/version-4.2/developers/operations-api/index.md` (first structured ops api section)
- **Status**: Not Started

### `reference/operations-api/operations.md`
- **Primary Source**: Synthesize from all `versioned_docs/version-4.7/developers/operations-api/*.md` files
- **Merge Required**: Yes - comprehensive list linking to primary references
- **Version Annotations**: Each operation needs version introduced
- **Status**: Not Started
- **Notes**: This should be a simplified reference table/list with links to detailed docs in feature sections

---

## Security Section

### `reference/security/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/security/index.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/developers/security/configuration.md`
- **Status**: Not Started

### `reference/security/basic-authentication.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/security/basic-auth.md`
- **Additional Sources**: `versioned_docs/version-4.1/security/basic-authentication.md`
- **Version Annotations**: Available since v4.1.0
- **Status**: Not Started

### `reference/security/jwt-authentication.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/security/jwt-auth.md`
- **Additional Sources**: `versioned_docs/version-4.1/security/jwt.md`
- **Version Annotations**: Available since v4.1.0
- **Status**: Not Started

### `reference/security/mtls-authentication.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/security/mtls-auth.md`
- **Additional Sources**: `versioned_docs/version-4.3/developers/security/mtls-auth.md`
- **Version Annotations**: Added in v4.3.0
- **Status**: Not Started
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - mTLS support added

### `reference/security/certificate-management.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/security/certificate-management.md`
- **Additional Sources**:
  - `versioned_docs/version-4.1/security/certificate-management.md`
  - `versioned_docs/version-4.4+` (dynamic cert management added)
- **Merge Required**: Yes - dynamic certificate management added in v4.4
- **Version Annotations**: Dynamic certs added v4.4.0
- **Status**: Not Started
- **Release Notes**:
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Dynamic certificate management
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Certificate revocation

### `reference/security/certificate-verification.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/security/certificate-verification.md`
- **Version Annotations**: Added in v4.7.0 (OCSP support)
- **Status**: Not Started
- **Release Notes**:
  - [4.7.0](release-notes/v4-tucker/4.7.0.md) - OCSP support

### `reference/security/cors.md`
- **Primary Source**: Extract from `versioned_docs/version-4.7/developers/security/configuration.md`
- **Status**: Not Started

### `reference/security/ssl.md`
- **Primary Source**: Extract from security/configuration or certificate management docs
- **Status**: Not Started

### `reference/security/users-and-roles.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/security/users-and-roles.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/developers/operations-api/users-and-roles.md`
  - `versioned_docs/version-4.7/reference/roles.md`
  - Current `reference/defining-roles.md`
- **Merge Required**: Yes - content spread across multiple files
- **Status**: Not Started
- **Release Notes**:
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Password hashing upgrade (sha256, argon2id)
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Cookie-based sessions

---

## Components Section

### `reference/components/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/components/index.md`
- **Additional Sources**:
  - `versioned_docs/version-4.1/custom-functions/*` (for evolution context)
  - `versioned_docs/version-4.2/developers/applications/index.md`
  - Current `reference/components/index.md`
- **Merge Required**: Yes - tell the evolution story (custom functions → components → applications/extensions → plugins)
- **Version Annotations**:
  - Custom Functions: v4.1.0
  - Components concept: v4.2.0
  - Applications/Extensions: v4.3.0+
  - Plugin API: v4.6.0
- **Status**: Not Started
- **Notes**: This is a critical page that explains the evolution
- **Release Notes**:
  - [4.1.0](release-notes/v4-tucker/4.1.0.md) - Custom functions with worker threads
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Component architecture introduced
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - New extension API with dynamic reloading

### `reference/components/applications.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/components/applications.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/developers/applications/*.md`
  - Current `reference/components/applications.md`
- **Merge Required**: Yes - application developer docs scattered across multiple files
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Component architecture, NPM/GitHub deployment

### `reference/components/extension-api.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/components/extensions.md`
- **Additional Sources**: Current `reference/components/extensions.md`
- **Version Annotations**: Extension API formalized around v4.4-4.5
- **Status**: Not Started
- **Release Notes**:
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - New extension API

### `reference/components/plugin-api.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/components/plugins.md`
- **Additional Sources**: Current `reference/components/plugins.md`
- **Version Annotations**: Added in v4.6.0
- **Status**: Not Started
- **Release Notes**:
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - Plugin API introduced
  - [4.7.0](release-notes/v4-tucker/4.7.0.md) - Further plugin API improvements

---

## Database Section

### `reference/database/overview.md`
- **Primary Source**: New content synthesizing how database system works
- **Additional Sources**:
  - `versioned_docs/version-4.7/reference/architecture.md`
  - Current `reference/architecture.md`
- **Status**: Not Started
- **Notes**: Should explain Resources + Schema + Auto-REST relationship
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Database structure changes (single file per database)

### `reference/database/schema.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/applications/defining-schemas.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/reference/data-types.md`
  - `versioned_docs/version-4.7/reference/dynamic-schema.md`
  - Current `reference/defining-schemas.md`
  - Current `reference/data-types.md`
  - Current `reference/dynamic-schema.md`
  - `versioned_docs/version-4.7/reference/blob.md`
  - Current `reference/blob.md`
  - Vector docs (if exists)
- **Merge Required**: Yes - comprehensive schema system documentation
- **Version Annotations**:
  - Basic schemas: v4.2.0
  - Relations (@relation): v4.3.0
  - Computed properties: v4.4.0
  - Blob storage: v4.5.0
  - Vector indexing: v4.6.0
- **Status**: Not Started
- **Notes**: Large consolidation - may want to keep blobs/vectors separate
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Configurable schemas with GraphQL syntax
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Relationships and joins, indexing nulls, BigInt support
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Computed properties, custom indexing, auto-incrementing primary keys
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Blob storage
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - Vector indexing (HNSW)

### `reference/database/data-loader.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/applications/data-loader.md`
- **Additional Sources**: Current `reference/data-loader.md`
- **Version Annotations**: Added in v4.5.0
- **Status**: Not Started
- **Release Notes**:
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - Data loader introduced

### `reference/database/storage-algorithm.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/storage-algorithm.md`
- **Additional Sources**: Current `reference/storage-algorithm.md`
- **Status**: Not Started
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Storage performance improvements, compression by default

### `reference/database/jobs.md`
- **Primary Source**: `versioned_docs/version-4.7/administration/jobs.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/developers/operations-api/jobs.md`
  - `versioned_docs/version-4.7/developers/operations-api/bulk-operations.md`
- **Merge Required**: Yes - jobs/bulk operations content scattered
- **Status**: Not Started

### `reference/database/system-tables.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/analytics.md`
- **Additional Sources**: Current `reference/analytics.md`
- **Status**: Not Started
- **Notes**: System tables for analytics and other features

### `reference/database/compaction.md`
- **Primary Source**: `versioned_docs/version-4.7/administration/compact.md`
- **Additional Sources**: Current `reference/compact.md`
- **Version Annotations**: Added in v4.3.0
- **Status**: Not Started
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Compact database functionality

### `reference/database/transaction.md`
- **Primary Source**: `versioned_docs/version-4.7/administration/logging/transaction-logging.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/administration/logging/audit-logging.md`
  - `versioned_docs/version-4.1/transaction-logging.md`
  - `versioned_docs/version-4.1/audit-logging.md`
- **Merge Required**: Yes - combines audit and transaction logging
- **Version Annotations**: Transaction logging available since v4.1.0, audit logging since v4.1.0
- **Status**: Not Started
- **Notes**: Consolidated from separate audit and transaction logging pages
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Balanced audit log cleanup
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Transaction reuse, storage reclamation (audit log eviction)

---

## Resources Section

### `reference/resources/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/resources/index.md`
- **Additional Sources**: Current `reference/resources/` folder
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Resource API introduced

### `reference/resources/resource-api.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/resources/index.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/reference/resources/instance-binding.md`
  - `versioned_docs/version-4.7/reference/resources/migration.md`
  - Current `reference/resources/index.md`
  - Current `reference/resources/instance-binding.md`
- **Merge Required**: Yes - Resource API has two forms (with/without loadAsInstance)
- **Version Annotations**:
  - Basic Resource API: v4.2.0
  - loadAsInstance changes: v4.4.0+
  - Response objects: v4.4.0
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Resource API introduced
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - CRDT support
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Response object support
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Property forwarding
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - Resource API upgrades

### `reference/resources/global-apis.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/globals.md`
- **Additional Sources**:
  - `versioned_docs/version-4.7/reference/transactions.md`
  - Current `reference/globals.md`
  - Current `reference/transactions.md`
- **Merge Required**: Yes - consolidate global APIs (tables, databases, transactions, etc.)
- **Version Annotations**: Various APIs added across versions
- **Status**: Not Started
- **Notes**: Should reference out to http/api.md for `server` global
- **Release Notes**:
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Table.getRecordCount()

### `reference/resources/query-optimization.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/resources/query-optimization.md`
- **Additional Sources**: Current `reference/resources/query-optimization.md`
- **Status**: Not Started
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Query optimizations

---

## Environment Variables Section

### `reference/environment-variables/overview.md`
- **Primary Source**: New content about `loadEnv` plugin
- **Additional Sources**: Built-in extensions docs, configuration docs
- **Version Annotations**: loadEnv added in v4.5.0
- **Status**: Not Started
- **Release Notes**:
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Built-in loadEnv component

### `reference/environment-variables/configuration.md`
- **Primary Source**: Extract from configuration docs or components docs
- **Status**: Not Started

---

## Static Files Section

### `reference/static-files/overview.md`
- **Primary Source**: Extract from built-in plugins/extensions documentation
- **Additional Sources**: Current `reference/components/built-in-extensions.md`
- **Status**: Not Started

### `reference/static-files/configuration.md`
- **Primary Source**: Extract from configuration docs
- **Status**: Not Started

---

## HTTP Section

### `reference/http/overview.md`
- **Primary Source**: New content about HTTP server
- **Additional Sources**: Configuration docs, architecture docs
- **Status**: Not Started
- **Release Notes**:
  - [4.1.0](release-notes/v4-tucker/4.1.0.md) - Worker threads for HTTP requests
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Socket management (SO_REUSEPORT), flexible port configs

### `reference/http/configuration.md`
- **Primary Source**: Extract from `reference/configuration.md` (http section)
- **Version Annotations**:
  - HTTP/2 support: v4.5.0
- **Status**: Not Started
- **Release Notes**:
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - HTTP/2 support

### `reference/http/api.md`
- **Primary Source**: Extract from `versioned_docs/version-4.7/reference/globals.md` (server global)
- **Additional Sources**: Current `reference/globals.md`
- **Version Annotations**:
  - server.authenticateUser: v4.5.0
- **Status**: Not Started
- **Release Notes**:
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - server.authenticateUser API

---

## REST Section

### `reference/rest/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/rest.md`
- **Additional Sources**: Current `reference/rest.md`
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - REST interface introduced

### `reference/rest/querying.md`
- **Primary Source**: Extract from REST docs and NoSQL operations
- **Additional Sources**:
  - `versioned_docs/version-4.7/developers/operations-api/nosql-operations.md`
- **Version Annotations**:
  - Null indexing/querying: v4.3.0
  - URL path improvements: v4.5.0
- **Status**: Not Started
- **Release Notes**:
  - [4.1.0](release-notes/v4-tucker/4.1.0.md) - Iterator-based queries
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Relationships/joins, sorting, nested select, null indexing
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Improved URL path parsing, directURLMapping

### `reference/rest/headers.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/headers.md`
- **Additional Sources**: Current `reference/headers.md`
- **Version Annotations**: Track which headers were added/removed over versions
- **Status**: Not Started

### `reference/rest/content-types.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/content-types.md`
- **Additional Sources**: Current `reference/content-types.md`
- **Status**: Not Started

### `reference/rest/websockets.md`
- **Primary Source**: Extract from `versioned_docs/version-4.7/developers/real-time.md`
- **Additional Sources**: Current `reference/real-time.md`
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - WebSocket support

### `reference/rest/server-sent-events.md`
- **Primary Source**: Extract from real-time or REST docs
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Server-Sent Events support

---

## MQTT Section

### `reference/mqtt/overview.md`
- **Primary Source**: Extract from `versioned_docs/version-4.7/developers/real-time.md`
- **Additional Sources**: Built-in plugins/extensions docs
- **Version Annotations**:
  - MQTT features: v4.2.0+
  - mTLS support: v4.3.0
  - Single-level wildcards: v4.3.0
  - CRDT: v4.3.0
- **Status**: Not Started
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - MQTT support introduced (QoS 0 and 1, durable sessions)
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - mTLS, single-level wildcards, retain handling, CRDT
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Improved message delivery, blob support for MQTT

### `reference/mqtt/configuration.md`
- **Primary Source**: Extract from configuration docs and real-time docs
- **Version Annotations**: Port change v4.5.0 (9925 → 9933)
- **Status**: Not Started
- **Release Notes**:
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Default replication port change

---

## Logging Section

### `reference/logging/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/administration/logging/index.md`
- **Additional Sources**: Current `reference/logging.md` (if exists)
- **Status**: Not Started
- **Release Notes**:
  - [4.1.0](release-notes/v4-tucker/4.1.0.md) - Logging revamped, consolidated into hdb.log
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - Major logging improvements

### `reference/logging/configuration.md`
- **Primary Source**: Extract from configuration docs
- **Version Annotations**:
  - Per-component logging: v4.6.0
  - Granular configuration: v4.6.0
- **Status**: Not Started
- **Release Notes**:
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - Per-component logging, dynamic reloading, HTTP logging

### `reference/logging/api.md`
- **Primary Source**: Extract from `versioned_docs/version-4.7/reference/globals.md` (logger global)
- **Status**: Not Started
- **Release Notes**:
  - [4.6.0](release-notes/v4-tucker/4.6.0.md) - Logger based on Node.js Console API

### `reference/logging/operations.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/operations-api/logs.md`
- **Status**: Not Started
- **Notes**: Operations for managing standard logs (not transaction/audit logs, which moved to database section)

---

## Analytics Section

### `reference/analytics/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/analytics.md`
- **Additional Sources**: Current `reference/analytics.md`
- **Version Annotations**:
  - Resource analytics: v4.5.0
  - Storage analytics: v4.5.0
- **Status**: Not Started
- **Release Notes**:
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Resource and storage analytics
  - [4.7.0](release-notes/v4-tucker/4.7.0.md) - New analytics and licensing functionality

### `reference/analytics/operations.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/operations-api/analytics.md`
- **Status**: Not Started

---

## Replication Section

### `reference/replication/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/replication/index.md`
- **Additional Sources**: Current `reference/replication/` (if exists)
- **Version Annotations**:
  - Native Replication (Plexus): v4.4.0
- **Status**: Not Started
- **Release Notes**:
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Native replication system (Plexus), replicated operations
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Cluster status information, improved replication timestamps

### `reference/replication/clustering.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/clustering/index.md`
- **Additional Sources**:
  - All `versioned_docs/version-4.7/reference/clustering/*.md` files
  - `versioned_docs/version-4.7/developers/operations-api/clustering.md`
  - Current `reference/clustering/` folder
- **Merge Required**: Yes - extensive clustering documentation needs consolidation
- **Status**: Not Started
- **Notes**: Large section with many sub-pages
- **Release Notes**:
  - [4.2.0](release-notes/v4-tucker/4.2.0.md) - Clone node functionality
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Native replication with PKI/mTLS
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Cluster status information

### `reference/replication/sharding.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/replication/sharding.md`
- **Version Annotations**:
  - Sharding: v4.4.0
  - Expanded functionality: v4.5.0
- **Status**: Not Started
- **Release Notes**:
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Sharding introduced
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - Expanded sharding functionality

---

## GraphQL Querying Section

### `reference/graphql-querying/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/reference/graphql.md`
- **Additional Sources**: Current `reference/graphql.md`
- **Version Annotations**:
  - Added: v4.4.0 (experimental)
  - Disabled by default: v4.5.0
- **Status**: Not Started
- **Notes**: Mark as experimental/incomplete
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - OpenAPI specification endpoint
  - [4.4.0](release-notes/v4-tucker/4.4.0.md) - Native GraphQL support (provisional)
  - [4.5.0](release-notes/v4-tucker/4.5.0.md) - GraphQL configuration, disabled by default

---

## Studio Section

### `reference/studio/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/deployments/configuration.md` (localStudio configuration)
- **Status**: In Progress
- **Notes**: Simple overview page focusing on:
  - How to configure/enable local Studio (localStudio.enabled in config)
  - How to access local Studio (http://localhost:9926)
  - General description of Studio's purpose (UI for Harper instance)
  - Link to hosted Studio at studio.harperdb.io
- **Release Notes**:
  - [4.3.0](release-notes/v4-tucker/4.3.0.md) - Local studio upgraded to match online version
  - [4.7.0](release-notes/v4-tucker/4.7.0.md) - Studio client updated

---

## Fastify Routes Section

### `reference/fastify-routes/overview.md`
- **Primary Source**: `versioned_docs/version-4.7/developers/applications/define-routes.md`
- **Additional Sources**: Current `reference/define-routes.md`
- **Status**: Not Started
- **Notes**: Discouraged in favor of modern routing with components, but still a supported feature.

---

## Legacy Section

### `reference/legacy/cloud-studio/`
- **Primary Source**: `versioned_docs/version-4.7/administration/harper-studio/*`
- - **Additional Sources**: `versioned_docs/version-4.7/deployments/harper-cloud/*`
- **Status**: In Progress
- **Notes**: These docs are for Harper Cloud Studio (the hosted studio for cloud instances), not the local Studio UI. Move to legacy with note that this is for Harper Cloud Studio which is deprecated/replaced by Fabric. Content includes account management, organizations, instance management, etc. Harper Cloud deployment docs (alarms, instance sizes, hardware specs, IOPS, Verizon info, etc.) are not relevant for v4 reference. Harper Cloud has been replaced by Fabric. There is a chance we delete this content entirely prior to merging into main. Waiting on information from customer teams.

### `reference/legacy/custom-functions/`
- **Primary Source**: `versioned_docs/version-4.1/custom-functions/*`
- **Additional Sources**: `versioned_docs/version-4.7/developers/operations-api/custom-functions.md`
- **Status**: N/A
- **Notes**: Move as-is with deprecation notice pointing to Components

### `reference/legacy/sql/`
- **Primary Source**: `versioned_docs/version-4.7/reference/sql-guide/*`
- **Additional Sources**:
  - `versioned_docs/version-4.7/developers/operations-api/sql-operations.md`
  - Current `reference/sql-guide/`
- **Status**: N/A
- **Notes**: Move entire section as-is with deprecation notice

---

## Files Requiring Special Attention

### High Priority Merges
These files require careful merging from multiple sources:

1. **Configuration Options** (`reference/configuration/options.md`)
   - Current `reference/configuration.md` is comprehensive (59KB)
   - Need to track every config option's version introduction
   - Consider automated script to compare config files across versions

2. **Schema System** (`reference/database/schema.md`)
   - Merges: data-types, dynamic-schema, defining-schemas, blobs, vectors
   - Significant evolution across v4.2 → v4.6
   - May want to split into multiple pages

3. **Components Evolution** (`reference/components/overview.md`)
   - Must tell the full story: custom functions → components → apps → plugins
   - Critical for user understanding

4. **Clustering** (`reference/replication/clustering.md`)
   - 10+ files in current clustering/ folder
   - Extensive operations APIs
   - Significant changes between NATS and native replication

5. **Resource API** (`reference/resources/resource-api.md`)
   - Two flavors (instance-binding vs not)
   - Migration path complex
   - Significant API changes in v4.4

### Files Being Removed/Ignored
These exist in current docs but won't exist in new structure:

**To be moved to Learn guides:**
- `versioned_docs/version-4.7/administration/administration.md` - Generic admin intro
- `versioned_docs/version-4.7/administration/cloning.md` - Move to Learn guide
- `versioned_docs/version-4.7/developers/applications/debugging.md` - Move to Learn guide
- `versioned_docs/version-4.7/developers/applications/caching.md` - Move to Learn guide
- `versioned_docs/version-4.7/developers/applications/web-applications.md` - Move to Learn guide
- `versioned_docs/version-4.7/developers/operations-api/quickstart-examples.md` - Move to Learn guide
- `versioned_docs/version-4.7/developers/operations-api/advanced-json-sql-examples.md` - Move to Learn guide
- `versioned_docs/version-4.7/deployments/install-harper/*` - Move to Learn guides
- `versioned_docs/version-4.7/deployments/upgrade-hdb-instance.md` - Move to Learn guide

**To be ignored (obsolete content):**
- `versioned_docs/version-4.7/reference/index.md` - Generic intro page
- `versioned_docs/version-4.7/reference/limits.md` - Fold into database/overview or schema

### Cross-References to Update
Files that heavily reference paths that will change:

- All operations-api/*.md files reference other sections
- Security files cross-reference operations and configuration
- Components files reference configuration and operations
- Clustering files extensively cross-reference

---

## Version Annotation Checklist

For each file migrated, ensure:
- [ ] Features note their introduction version
- [ ] Changed behaviors note the version they changed
- [ ] Deprecated features note deprecation version
- [ ] Configuration options include "Added in:" notes
- [ ] Operations APIs include "Added in:" notes
- [ ] Links to related version-specific content

## Release Notes Reference Guide

The `release-notes/v4-tucker/` directory contains 169 release note files covering the entire v4.0 - v4.7 series. Key minor releases with significant feature additions:

### Minor Releases

- **[4.1.0](release-notes/v4-tucker/4.1.0.md)** (Worker threads, iterator-based queries, logging revamp)
- **[4.2.0](release-notes/v4-tucker/4.2.0.md)** (Resource API, Component Architecture, REST interface, MQTT/WebSockets/SSE, configurable schemas)
- **[4.3.0](release-notes/v4-tucker/4.3.0.md)** (Relationships/joins, null indexing, CLI expansion, mTLS, BigInt, compaction)
- **[4.4.0](release-notes/v4-tucker/4.4.0.md)** (Native replication/Plexus, sharding, computed properties, custom indexing, GraphQL, dynamic certificates)
- **[4.5.0](release-notes/v4-tucker/4.5.0.md)** (Blob storage, password hashing upgrade, HTTP/2, expanded sharding, loadEnv component)
- **[4.6.0](release-notes/v4-tucker/4.6.0.md)** (Vector indexing/HNSW, new extension API, logging improvements, data loader)
- **[4.7.0](release-notes/v4-tucker/4.7.0.md)** (Component status monitoring, OCSP, new analytics/licensing)

### Feature-to-Release Note Mapping

When adding version annotations, refer to these key features and their introduction versions:

**CLI & Configuration**
- CLI expansion with operations API: 4.3.0
- Dev mode (`harperdb dev`): 4.2.0
- Configuration improvements: 4.3.0, 4.4.0

**Security**
- mTLS support: 4.3.0
- Dynamic certificate management: 4.4.0
- OCSP support: 4.7.0
- Password hashing (sha256, argon2id): 4.5.0
- Certificate revocation: 4.5.0

**Components & Extensions**
- Component architecture: 4.2.0
- Custom functions with worker threads: 4.1.0
- New extension API: 4.6.0
- Plugin API: 4.6.0, 4.7.0
- Built-in loadEnv component: 4.5.0

**Database & Schema**
- Configurable schemas (GraphQL syntax): 4.2.0
- Relationships and joins: 4.3.0
- Computed properties: 4.4.0
- Custom indexing: 4.4.0
- Blob storage: 4.5.0
- Vector indexing (HNSW): 4.6.0
- BigInt support: 4.3.0
- Null indexing: 4.3.0
- Auto-incrementing primary keys: 4.4.0

**Data Access**
- Resource API: 4.2.0
- CRDT support: 4.3.0
- Response object support: 4.4.0
- Property forwarding: 4.5.0
- Data loader: 4.6.0
- Iterator-based queries: 4.1.0

**REST & HTTP**
- REST interface: 4.2.0
- HTTP/2 support: 4.5.0
- Improved URL path parsing: 4.5.0
- server.authenticateUser API: 4.5.0
- Worker threads for HTTP: 4.1.0

**Real-Time & MQTT**
- MQTT support: 4.2.0
- WebSocket support: 4.2.0
- Server-Sent Events: 4.2.0
- MQTT mTLS: 4.3.0
- MQTT single-level wildcards: 4.3.0
- MQTT retain handling: 4.3.0
- Improved message delivery: 4.5.0

**Replication & Clustering**
- Native replication (Plexus): 4.4.0
- Sharding: 4.4.0
- Expanded sharding functionality: 4.5.0
- Clone node: 4.2.0
- Replicated operations: 4.4.0

**Logging**
- Logging consolidated to hdb.log: 4.1.0
- Per-component logging: 4.6.0
- Dynamic logging reload: 4.6.0
- HTTP logging: 4.6.0

**GraphQL**
- OpenAPI specification: 4.3.0
- Native GraphQL support (provisional): 4.4.0
- GraphQL disabled by default: 4.5.0

**Storage & Performance**
- Database structure (single file): 4.2.0
- Storage performance improvements: 4.3.0
- Compression by default: 4.3.0
- Compact database: 4.3.0
- Storage reclamation: 4.5.0

**Analytics**
- Resource and storage analytics: 4.5.0
- New analytics/licensing: 4.7.0

**Studio**
- Local studio upgrade: 4.3.0

## Notes

- Many current `reference/` files appear to already be partially reorganized
- The `versioned_docs/` folders contain the historical record
- Compare git history to validate when features were actually introduced
- Use release notes to cross-reference feature versions (see Release Notes Reference Guide above)
- Consider scripting the version annotation process for configuration options
- The release notes directory contains 169 files - use the Feature-to-Release Note Mapping above as a quick reference
