---
title: Configuration Options
---

<!-- Source: versioned_docs/version-4.7/deployments/configuration.md (primary — comprehensive options reference) -->
<!-- Source: release_notes/4.2.0.md (major config restructuring: http section, componentRoot) -->
<!-- Source: release_notes/4.3.0.md (configuration improvements) -->
<!-- Source: release_notes/4.4.0.md (developer/production mode) -->
<!-- Source: release_notes/4.5.0.md (HTTP/2 support) -->
<!-- Source: release_notes/4.7.2.md (HARPER_DEFAULT_CONFIG and HARPER_SET_CONFIG) -->

# Configuration Options

Complete reference for all `harperdb-config.yaml` configuration options.

For how to apply configuration (YAML file, environment variables, CLI, Operations API), see [Configuration Overview](./overview.md).

---

## `http`

The `http` section configures the Harper component server (the HTTP server that serves custom application routes, REST API, and WebSocket connections).

`sessionAffinity` — _Type_: string; _Default_: null

Routes multiple requests from the same client to the same worker thread. Improves caching locality and enables in-memory session sharing within a thread.

Set to `ip` to route by client IP address (use only when Harper directly serves clients; not suitable behind a proxy). Or set to a header name (e.g. `Authorization`) to route by that header value.

```yaml
http:
  sessionAffinity: ip
```

`compressionThreshold` — _Type_: number; _Default_: 1200 (bytes)

Responses larger than this threshold are compressed using Brotli encoding for clients that support it. Streaming query responses are also compressed regardless of size.

```yaml
http:
  compressionThreshold: 1200
```

`cors` — _Type_: boolean; _Default_: true

Enable Cross-Origin Resource Sharing.

`corsAccessList` — _Type_: array; _Default_: null

Array of allowed domains for CORS requests.

`corsAccessControlAllowHeaders` — _Type_: string; _Default_: `'Accept, Content-Type, Authorization'`

Comma-separated list of headers for the `Access-Control-Allow-Headers` response header on OPTIONS preflight requests.

`headersTimeout` — _Type_: integer; _Default_: 60000 (1 minute)

Maximum time in milliseconds the parser will wait to receive complete HTTP headers.

`maxHeaderSize` — _Type_: integer; _Default_: 16394

Maximum allowed size of HTTP headers in bytes.

`requestQueueLimit` — _Type_: integer; _Default_: 20000

Maximum estimated request queue time in milliseconds. When the queue exceeds this limit, new requests are rejected with HTTP 503.

`keepAliveTimeout` — _Type_: integer; _Default_: 30000 (30 seconds)

Milliseconds of inactivity after which the server closes a keep-alive connection.

`port` — _Type_: integer; _Default_: 9926

Port for the HTTP component server.

`securePort` — _Type_: integer; _Default_: null

Port for HTTPS connections. Requires a valid TLS certificate and key (see [`tls`](#tls)).

`http2` — _Type_: boolean; _Default_: false

Added in: v4.5.0

Enable HTTP/2 for the HTTP server.

`timeout` — _Type_: integer; _Default_: 120000 (2 minutes)

Maximum time in milliseconds before a request times out.

```yaml
http:
  cors: true
  corsAccessList:
    - null
  headersTimeout: 60000
  maxHeaderSize: 8192
  keepAliveTimeout: 30000
  port: 9926
  securePort: null
  timeout: 120000
```

### `http.mtls`

`mtls` — _Type_: boolean | object; _Default_: false

Enable mTLS (mutual TLS) authentication for incoming HTTP connections. When set to `true`, client certificates are checked against the CA specified in [`tls.certificateAuthority`](#tls), and authenticated users are identified by the `CN` (common name) from the certificate subject.

For detailed mTLS configuration, see [mTLS Authentication](TODO:reference_versioned_docs/version-v4/security/mtls-authentication.md 'mTLS authentication reference page').

**mTLS sub-options** (when `mtls` is an object):

`user` — _Type_: string; _Default_: Common Name

Specific username to authenticate as for all mTLS connections. Set to `null` to perform no authentication from mTLS (useful when combining with credential-based auth via `required: true`).

`required` — _Type_: boolean; _Default_: false

Require client certificates for all incoming HTTP connections. Connections without an authorized certificate are rejected.

> **Note:** MQTT has its own `mqtt.network.mtls` settings. See [`mqtt`](#mqtt).

`certificateVerification` — _Type_: boolean | object; _Default_: false

Added in: v4.7.0 (inferred from version comparison, needs verification)

Enable certificate revocation checking (CRL and/or OCSP) for client certificates. See [Certificate Verification](TODO:reference_versioned_docs/version-v4/security/certificate-verification.md 'Certificate verification reference') for full details.

When set to `true`, uses all defaults (CRL + OCSP, fail-closed):

```yaml
http:
  mtls:
    certificateVerification: true
```

**Certificate verification sub-options:**

- `failureMode` — _Type_: string; _Default_: `'fail-closed'` — `'fail-open'` (allow on failure) or `'fail-closed'` (reject on failure)
- `crl.enabled` — _Type_: boolean; _Default_: true
- `crl.timeout` — _Type_: number; _Default_: 10000 (ms)
- `crl.cacheTtl` — _Type_: number; _Default_: 86400000 (24 hours)
- `crl.gracePeriod` — _Type_: number; _Default_: 86400000 (24 hours)
- `crl.failureMode` — _Type_: string; _Default_: `'fail-closed'`
- `ocsp.enabled` — _Type_: boolean; _Default_: true
- `ocsp.timeout` — _Type_: number; _Default_: 5000 (ms)
- `ocsp.cacheTtl` — _Type_: number; _Default_: 3600000 (1 hour)
- `ocsp.errorCacheTtl` — _Type_: number; _Default_: 300000 (5 minutes)
- `ocsp.failureMode` — _Type_: string; _Default_: `'fail-closed'`

Harper uses CRL-first with OCSP fallback. See [Certificate Verification](TODO:reference_versioned_docs/version-v4/security/certificate-verification.md) for strategy details.

### `http.logging`

Added in: v4.6.0

Defines logging configuration for HTTP requests. Defining this section enables HTTP request logging (disabled by default).

```yaml
http:
  logging:
    level: info
    path: ~/hdb/log/http.log
    timing: true
    headers: false
    id: false
```

- `timing` — Log timing information per request
- `headers` — Log request headers (very verbose)
- `id` — Assign a unique `request.requestId` to each request

Log verbosity by level:
- `info` or more verbose: all requests
- `warn`: requests with status ≥ 400
- `error`: requests with status ≥ 500

---

## `threads`

`count` — _Type_: number; _Default_: one less than the number of logical CPU cores

Number of worker threads for serving HTTP requests. Should approximate your CPU core count for full utilization.

```yaml
threads:
  count: 11
```

`maxHeapMemory` — _Type_: number

Heap memory limit per thread, in megabytes. Defaults to a heuristic based on available memory and thread count.

```yaml
threads:
  maxHeapMemory: 300
```

`heapSnapshotNearLimit` — _Type_: boolean

Take a heap snapshot when heap usage approaches the limit.

```yaml
threads:
  heapSnapshotNearLimit: true
```

`debug` — _Type_: boolean | object; _Default_: false

Enable debugging. When `true`, enables debugging on the main thread on port 9229 (host `127.0.0.1`).

Sub-options:
- `debug.port` — Port for main thread debugging
- `debug.startingPort` — Starting port for per-thread debugging (required for DevTools per-thread debugging)
- `debug.host` — Host interface to listen on
- `debug.waitForDebugger` — Wait for debugger to attach before starting

```yaml
threads:
  debug:
    port: 9249
```

---

## `authentication`

The authentication section configures the default authentication mechanism.

Added in: v4.1.0; `enableSessions` (cookie-based) added in v4.2.0

```yaml
authentication:
  authorizeLocal: true
  cacheTTL: 30000
  enableSessions: true
  operationTokenTimeout: 1d
  refreshTokenTimeout: 30d
```

`authorizeLocal` — _Type_: boolean; _Default_: true

Automatically authorize requests from the loopback IP address (`127.0.0.1`) as superuser. **Disable this** for servers accessible by untrusted local processes (e.g. when using a local proxy or for general hardening).

`cacheTTL` — _Type_: number; _Default_: 30000

Time in milliseconds to cache an authenticated session (Authorization header or token).

`enableSessions` — _Type_: boolean; _Default_: true

Added in: v4.2.0

Enable cookie-based sessions. Preferred for web browsers as it stores authentication tokens in cookies without exposing them to JavaScript (mitigates XSS).

`operationTokenTimeout` — _Type_: string; _Default_: `1d`

Lifetime of an operation (access) token. Accepts [ms](https://github.com/vercel/ms)-style values (e.g. `1d`, `2h`, `30m`).

`refreshTokenTimeout` — _Type_: string; _Default_: `1d`

Lifetime of a refresh token. Accepts [ms](https://github.com/vercel/ms)-style values.

### `authentication.logging`

Added in: v4.6.0

Logging configuration for authentication events. Accepts standard logging sub-options: `path` (or `root`), `level`, `tag`, `stdStreams`.

---

## `operationsApi`

The `operationsApi` section configures the Harper Operations API endpoint. All sub-options are optional; omitted values fall back to their `http` counterparts.

### `operationsApi.network`

```yaml
operationsApi:
  network:
    cors: true
    corsAccessList:
      - null
    domainSocket: /user/hdb/operations-server
    headersTimeout: 60000
    keepAliveTimeout: 5000
    port: 9925
    securePort: null
    timeout: 120000
```

`cors` — _Type_: boolean; _Default_: true

Enable CORS for the Operations API.

`corsAccessList` — _Type_: array; _Default_: null

Allowed domains for CORS requests to the Operations API.

`domainSocket` — _Type_: string; _Default_: `<rootPath>/hdb/operations-server`

Unix domain socket path used by the CLI to communicate with the Operations API.

`headersTimeout` — _Type_: integer; _Default_: 60000 (1 minute)

Maximum time to wait for complete HTTP headers.

`keepAliveTimeout` — _Type_: integer; _Default_: 5000 (5 seconds)

Milliseconds of inactivity before closing a keep-alive connection.

`port` — _Type_: integer; _Default_: 9925

Port for the Operations API.

`securePort` — _Type_: integer; _Default_: null

Port for HTTPS Operations API connections.

`timeout` — _Type_: integer; _Default_: 120000 (2 minutes)

Request timeout in milliseconds.

### `operationsApi.tls`

TLS configuration for the Operations API. Overrides root [`tls`](#tls) for Operations API connections.

```yaml
operationsApi:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
```

`certificate` — _Type_: string; _Default_: `<rootPath>/keys/certificate.pem`

Path to the TLS certificate file.

`certificateAuthority` — _Type_: string; _Default_: `<rootPath>/keys/ca.pem`

Path to the certificate authority file.

`privateKey` — _Type_: string; _Default_: `<rootPath>/keys/privateKey.pem`

Path to the private key file.

---

## `tls`

Global TLS configuration for HTTPS and TLS socket support. Used by both HTTP and MQTT protocols.

Can be a single object or an array of objects (for SNI — multiple certificates per domain/host).

```yaml
tls:
  certificate: ~/hdb/keys/certificate.pem
  certificateAuthority: ~/hdb/keys/ca.pem
  privateKey: ~/hdb/keys/privateKey.pem
```

`certificate` — _Type_: string; _Default_: `<rootPath>/keys/certificate.pem`

Path to the TLS certificate file.

`certificateAuthority` — _Type_: string; _Default_: `<rootPath>/keys/ca.pem`

Path to the certificate authority file.

`privateKey` — _Type_: string; _Default_: `<rootPath>/keys/privateKey.pem`

Path to the private key file.

`ciphers` — _Type_: string

Specify allowed TLS cipher suites.

### Multiple Certificates (SNI)

To serve different certificates per domain via SNI, use an array:

```yaml
tls:
  - certificate: ~/hdb/keys/certificate1.pem
    certificateAuthority: ~/hdb/keys/ca1.pem
    privateKey: ~/hdb/keys/privateKey1.pem
    host: example.com  # optional; defaults to certificate CN
  - certificate: ~/hdb/keys/certificate2.pem
    certificateAuthority: ~/hdb/keys/ca2.pem
    privateKey: ~/hdb/keys/privateKey2.pem
```

> A `tls` section defined under `operationsApi` overrides the root `tls` for the Operations API.

For full TLS/certificate setup, see [TLS](TODO:reference_versioned_docs/version-v4/http/tls.md 'TLS configuration for HTTP') and [Certificate Management](TODO:reference_versioned_docs/version-v4/security/certificate-management.md 'Certificate management reference').

---

## `mqtt`

The MQTT protocol configuration.

Added in: v4.2.0; default secure port changed from 9925 to 9933 in v4.5.0

```yaml
mqtt:
  network:
    port: 1883
    securePort: 8883
    mtls: false
  webSocket: true
  requireAuthentication: true
```

`port` — _Type_: number; _Default_: 1883

Port for insecure MQTT connections.

`securePort` — _Type_: number; _Default_: 8883

Port for secure MQTT connections (uses `tls` configuration).

`webSocket` — _Type_: boolean; _Default_: true

Enable MQTT over WebSocket on the HTTP port (default 9926) for clients using the `mqtt` sub-protocol.

`requireAuthentication` — _Type_: boolean; _Default_: true

Require authentication for MQTT connections (via credentials or mTLS). When disabled, unauthenticated connections are subject to per-resource authorization rules.

### `mqtt.network.mtls`

`mtls` — _Type_: boolean | object; _Default_: false

Enable mTLS for MQTT connections. Same sub-options as [`http.mtls`](#httpmtls):

- `user` — Static username for all mTLS-authenticated connections
- `required` — Require client certificates
- `certificateAuthority` — Override CA path (defaults to `tls.certificateAuthority`)
- `certificateVerification` — _Type_: boolean | object; _Default_: true (OCSP only)
  - `timeout` — OCSP timeout in ms; _Default_: 5000
  - `cacheTtl` — Cache duration in ms; _Default_: 3600000
  - `failureMode` — `'fail-open'` or `'fail-closed'`; _Default_: `'fail-open'`

```yaml
mqtt:
  network:
    mtls:
      user: user-name
      required: true
```

For detailed MQTT configuration see [MQTT Configuration](TODO:reference_versioned_docs/version-v4/mqtt/configuration.md 'MQTT configuration reference').

### `mqtt.logging`

Added in: v4.6.0

Logging configuration for MQTT. Accepts standard logging sub-options: `path` (or `root`), `level`, `tag`, `stdStreams`.

---

## `logging`

The logging section configures Harper application logging.

Added in: v4.1.0 (consolidated to `hdb.log`); per-component logging added in v4.6.0

```yaml
logging:
  level: warn
  file: true
  root: ~/hdb/log
  stdStreams: false
  auditLog: false
  auditRetention: 3d
  rotation:
    enabled: false
    compress: false
    interval: null
    maxSize: null
    path: ~/hdb/log
  auditAuthEvents:
    logFailed: false
    logSuccessful: false
```

`level` — _Type_: string; _Default_: `warn`

Log verbosity. Hierarchy (most to least verbose): `trace` → `debug` → `info` → `warn` → `error` → `fatal` → `notify`.

`file` — _Type_: boolean; _Default_: true

Write logs to a file.

`root` — _Type_: string; _Default_: `<rootPath>/log`

Directory for log files.

`path` — _Type_: string; _Default_: `<rootPath>/log/hdb.log`

Explicit log file path. Overrides `root`.

`stdStreams` — _Type_: boolean; _Default_: false

Write logs to stdout/stderr.

`console` — _Type_: boolean; _Default_: true

Include `console.log` and other `console.*` output in the log file.

`auditLog` — _Type_: boolean; _Default_: false

Enable table transaction (audit) logging. Access via `read_audit_log` operation.

`auditRetention` — _Type_: string | number; _Default_: `3d`

How long to retain audit log entries. Accepts [ms](https://github.com/vercel/ms)-style string or milliseconds as a number.

### `logging.rotation`

Log file rotation. Rotation activates when `interval` and/or `maxSize` is set.

> **Note:** `interval` and `maxSize` are approximate; the log file may slightly exceed these values before rotation.

`enabled` — _Type_: boolean; _Default_: true (when rotation section is present)

`compress` — _Type_: boolean; _Default_: false

Compress rotated files with gzip.

`interval` — _Type_: string; _Default_: null

Time between rotations. Units: `D` (days), `H` (hours), `M` (minutes). Example: `1D`.

`maxSize` — _Type_: string; _Default_: null

Maximum log file size before rotation. Units: `K` (KB), `M` (MB), `G` (GB). Example: `100M`.

`path` — _Type_: string; _Default_: `<rootPath>/log`

Directory for rotated log files. Files are named `HDB-YYYY-MM-DDT-HH-MM-SSSZ.log`.

### `logging.auditAuthEvents`

Log authentication events.

`logFailed` — _Type_: boolean; _Default_: false

Log failed authentication attempts.

`logSuccessful` — _Type_: boolean; _Default_: false

Log successful authentication events.

### Per-Component Logging

Added in: v4.6.0

Individual components can have separate log configurations. Each accepts: `path` (or `root`), `level`, `tag`, `stdStreams`.

`logging.external`

Logging for all external components using the [`logger` API](TODO:reference_versioned_docs/version-v4/logging/api.md 'Logger API reference'):

```yaml
logging:
  external:
    level: warn
    path: ~/hdb/log/apps.log
```

`authentication.logging` — Authentication events (see [`authentication`](#authentication))

`http.logging` — HTTP requests (see [`http`](#http))

`mqtt.logging` — MQTT events (see [`mqtt`](#mqtt))

`replication.logging` — Replication events

`tls.logging` — TLS events

`storage.logging` — Database file events

`analytics.logging` — Analytics events

---

## `replication`

Configures Harper native replication (Plexus) for clustering.

Added in: v4.4.0

For full replication and clustering documentation, see [Replication](TODO:reference_versioned_docs/version-v4/replication/overview.md 'Replication overview') and [Clustering](TODO:reference_versioned_docs/version-v4/replication/clustering.md 'Clustering reference').

```yaml
replication:
  hostname: server-one
  url: wss://server-one:9925
  databases: '*'
  routes:
    - wss://server-two:9925
  port: null
  securePort: 9933
  enableRootCAs: true
```

`hostname` — _Type_: string

Hostname of this Harper instance within the cluster.

`url` — _Type_: string

WebSocket URL of this instance (used by peers to connect).

`databases` — _Type_: string | array; _Default_: `"*"` (all databases)

Which databases to replicate. Use `"*"` for all, or an array of database names. Databases can be marked as `sharded: true` to reduce topology overhead:

```yaml
replication:
  databases:
    - name: system
    - name: data
      sharded: true
```

`routes` — _Type_: array

Peer nodes to connect to. Each entry can be a URL string or an object with `hostname`, `port`, and optionally `startTime` (ISO UTC) and `revokedCertificates`:

```yaml
replication:
  routes:
    - wss://server-two:9925
    - hostname: server-three
      port: 9930
      startTime: 2024-02-06T15:30:00Z
      revokedCertificates:
        - 1769F7D6A
```

`port` — _Type_: integer

Port for replication connections.

`securePort` — _Type_: integer; _Default_: 9933

Port for secure (TLS) replication connections.

Changed in: v4.5.0 — default port changed from 9925 to 9933

`enableRootCAs` — _Type_: boolean; _Default_: true

Verify certificates against the Node.js bundled Mozilla CA store.

`blobTimeout` — _Type_: number; _Default_: 120000

Timeout in milliseconds for blob transfers between nodes.

`failOver` — _Type_: boolean; _Default_: true

Attempt failover to a different node if the current peer is unreachable.

`shard` — _Type_: integer

Shard ID for this instance. Used with `setResidency`/`setResidencyById` for programmatic traffic routing. See [Sharding](TODO:reference_versioned_docs/version-v4/replication/sharding.md 'Sharding reference').

Added in: v4.4.0

### `replication.mtls`

mTLS is always enabled for replication connections. This section controls optional certificate revocation checking.

`certificateVerification` — _Type_: boolean | object; _Default_: false

Same structure as [`http.mtls.certificateVerification`](#httpmtls).

```bash
REPLICATION_MTLS_CERTIFICATEVERIFICATION=true
REPLICATION_MTLS_CERTIFICATEVERIFICATION_FAILUREMODE=fail-closed
REPLICATION_MTLS_CERTIFICATEVERIFICATION_CRL_TIMEOUT=15000
REPLICATION_MTLS_CERTIFICATEVERIFICATION_OCSP=true
```

### `replication.logging`

Logging configuration for replication. Accepts standard logging sub-options.

---

## `clustering` (NATS)

> **Note:** There are two clustering systems in Harper v4. The native WebSocket-based `replication` system (introduced in v4.4.0) is the recommended approach. The `clustering` section configures the legacy NATS-based clustering engine.

Deprecated in: v4.4.0 (NATS clustering superseded by native replication)

`enabled` — _Type_: boolean; _Default_: false

Enable NATS clustering.

> If clustering is enabled, a cluster user must exist or Harper will raise a validation error.

```yaml
clustering:
  enabled: true
```

### `clustering.hubServer`

The hub server facilitates the Harper mesh network and discovery service.

#### `clustering.hubServer.cluster`

```yaml
clustering:
  hubServer:
    cluster:
      name: harperdb
      network:
        port: 9932
        routes:
          - host: 3.62.184.22
            port: 9932
```

`name` — _Type_: string; _Default_: `harperdb`

Cluster name. Must be consistent across all nodes.

`port` — _Type_: integer; _Default_: 9932

Port accepting cluster connections. Must be accessible from other nodes.

`routes` — _Type_: array

Nodes to connect to. Each entry has `host` and `port`.

#### `clustering.hubServer.leafNodes`

```yaml
clustering:
  hubServer:
    leafNodes:
      network:
        port: 9931
```

`port` — _Type_: integer; _Default_: 9931

Port accepting leaf node connections.

#### `clustering.hubServer.network`

`port` — _Type_: integer; _Default_: 9930

Client connection port (for NATS SDK direct access).

### `clustering.leafServer`

Manages NATS streams (message stores for table transactions).

```yaml
clustering:
  leafServer:
    network:
      port: 9940
      routes:
        - host: 3.62.184.22
          port: 9931
    streams:
      maxAge: 3600
      maxBytes: 10000000
      maxMsgs: 500
      path: /user/hdb/clustering/leaf
      maxConsumeMsgs: 100
      maxIngestThreads: 2
```

`port` — _Type_: integer; _Default_: 9940

Client connection port for the leaf server.

`routes` — _Type_: array

Hub servers to connect to. Each entry has `host` and `port`.

#### `clustering.leafServer.streams`

`maxAge` — _Type_: integer; _Default_: null

Maximum message age in seconds.

`maxBytes` — _Type_: integer; _Default_: null

Maximum stream size in bytes (oldest messages removed when exceeded).

`maxMsgs` — _Type_: integer; _Default_: null

Maximum message count (oldest removed when exceeded).

`path` — _Type_: string; _Default_: `<rootPath>/clustering/leaf`

Directory for stream storage.

`maxConsumeMsgs` — _Type_: integer; _Default_: 100

Maximum messages a consumer processes per batch.

`maxIngestThreads` — _Type_: integer; _Default_: 2

Number of Harper threads dedicated to message ingestion.

### `clustering` top-level options

`logLevel` — _Type_: string; _Default_: `error`

NATS clustering log verbosity. Same hierarchy as [`logging.level`](#logging).

`nodeName` — _Type_: string; _Default_: null

Unique node name within the cluster. Changing this requires removing all subscriptions and performing a full restart.

`republishMessages` — _Type_: boolean; _Default_: false

Republish all received transactions to this node's local stream. Useful when subscriptions are not fully connected between all nodes, but adds overhead.

`user` — _Type_: string; _Default_: null

Username for the `cluster_user` role used for inter-node authentication. All cluster nodes must share the same credentials.

Create via API: `add_user` with `role: cluster_user`, or at install:

```bash
harperdb --CLUSTERING_USER cluster_person --CLUSTERING_PASSWORD pass123!
```

### `clustering.tls`

TLS configuration for NATS cluster connections.

```yaml
clustering:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
    insecure: true
    verify: true
```

`certificate` / `certificateAuthority` / `privateKey` — same as root [`tls`](#tls)

`insecure` — _Type_: boolean; _Default_: true

Skip certificate verification (for self-signed certificates).

`verify` — _Type_: boolean; _Default_: true

Verify client certificates using the CA certificate.

---

## `storage`

`writeAsync` — _Type_: boolean; _Default_: false

Disable disk flushing/syncing for higher write throughput. **Disables storage integrity guarantees** — data loss is possible on server crash.

`caching` — _Type_: boolean; _Default_: true

Enable in-memory caching of frequently accessed records. May add overhead for very random access patterns.

`compression` — _Type_: boolean; _Default_: true

Changed in: v4.3.0 (enabled by default)

Enable LZ4 compression for stored records. Reduces storage requirements for large records. Can be configured as an object:

- `compression.dictionary` — Path to a compression dictionary file
- `compression.threshold` — Minimum record size (bytes) to compress; _Default_: `4036` (or `pageSize - 60`)

```yaml
storage:
  compression:
    dictionary: /users/harperdb/dict.txt
    threshold: 1000
```

`compactOnStart` — _Type_: boolean; _Default_: false

Compact all non-system databases on startup. See [Compaction](TODO:reference_versioned_docs/version-v4/database/compaction.md 'Database compaction reference').

Added in: v4.3.0

`compactOnStartKeepBackup` — _Type_: boolean; _Default_: false

Retain backups created by `compactOnStart`.

`maxTransactionQueueTime` — _Type_: time; _Default_: `45s`

Maximum write queue time before rejecting write requests with HTTP 503. Accepts time strings (e.g. `45s`, `2m`).

`noReadAhead` — _Type_: boolean; _Default_: false

Advise the OS not to read ahead from disk. Improves memory utilization for small records; may degrade performance for large records or frequent range queries.

`prefetchWrites` — _Type_: boolean; _Default_: true

Prefetch data before write transactions. Recommended for databases larger than available memory.

`path` — _Type_: string; _Default_: `<rootPath>/database`

Directory for all database files, including system tables.

> **Note:** If changing this value, move existing schemas (including `<rootPath>/schema/system`) to the new path first.

`blobPaths` — _Type_: string | array; _Default_: `<rootPath>/blobs`

Directory (or array of directories) for blob storage. When multiple paths are provided, blobs are distributed across them.

Added in: v4.5.0

```yaml
storage:
  blobPaths:
    - /users/harperdb/big-storage
```

`pageSize` — _Type_: number; _Default_: OS default page size

Database page size in bytes.

### `storage.reclamation`

Added in: v4.5.0 (inferred from version comparison, needs verification)

Configures the background storage reclamation process.

```yaml
storage:
  reclamation:
    threshold: 0.4   # Start reclamation when free space < 40% of volume
    interval: 1h     # Run reclamation every hour
    evictionFactor: 100000
```

`threshold` — _Type_: number; _Default_: 0.4

Fraction of volume space. Reclamation starts when free space drops below this threshold.

`interval` — _Type_: string; _Default_: `1h`

How often to run the reclamation process.

`evictionFactor` — _Type_: number; _Default_: 100000

Controls aggressiveness of cache entry eviction during reclamation.

---

## `databases`

Optional per-database and per-table file path overrides. Must be configured before the database or table is created. Directories must exist.

```yaml
databases:
  myDatabase:
    path: /path/to/database
    auditPath: /path/to/audit-database
    tables:
      myTable:
        path: /path/to/table
```

`path` — Directory for database files.

`auditPath` — Directory for audit log files for this database.

`tables.<tableName>.path` — Directory for a specific table's files.

**Setting via environment variable / CLI / API:**

Use a JSON array:

```bash
DATABASES=[{"myDatabase":{"tables":{"myTable":{"path":"/path/to/table"}}}}]
```

```json
{
  "operation": "set_configuration",
  "databases": [{ "myDatabase": { "tables": { "myTable": { "path": "/path/to/table" } } } }]
}
```

---

## `analytics`

`aggregatePeriod` — _Type_: number; _Default_: 60 (seconds)

Added in: v4.5.0

How often metrics in `system.hdb_raw_analytics` are aggregated into `system.hdb_analytics`. The Operations API analytics exclusively use the aggregated data.

`replicate` — _Type_: boolean; _Default_: false

Whether to replicate aggregated analytics data (`system.hdb_analytics`) across the cluster.

```yaml
analytics:
  aggregatePeriod: 60
  replicate: false
```

---

## `localStudio`

`enabled` — _Type_: boolean; _Default_: false

Enable the local Harper Studio GUI. Accessible at `http://localhost:9926` (or the configured HTTP port).

```yaml
localStudio:
  enabled: false
```

For details see [Studio](TODO:reference_versioned_docs/version-v4/studio/overview.md 'Studio overview').

---

## `componentsRoot`

`componentsRoot` — _Type_: string; _Default_: `<rootPath>/components`

Path to the folder containing local component files.

```yaml
componentsRoot: ~/hdb/components
```

Added in: v4.2.0 (inferred from version comparison, needs verification — previously `customFunctionsRoot`)

---

## `rootPath`

`rootPath` — _Type_: string; _Default_: current user's home directory

Root directory where Harper persists data, config, logs, and components. Harper decouples application from storage — this path defines where all persistent state lives.

```yaml
rootPath: /Users/jonsnow/hdb
```

---

## Components

Individual components installed in Harper can be configured in the root of `harperdb-config.yaml` using the component name as the key.

`<component-name>.package` — _Type_: string

Reference to the component package: NPM package name, GitHub repo (`user/repo`), or local path. Harper adds this to `package.json` and runs `npm install`.

`<component-name>.port` — _Type_: number; _Default_: value of `http.port`

Port for the component to listen on.

```yaml
my-component:
  package: 'HarperDB-Add-Ons/package-name'
  port: 4321
```

For full component configuration, see [Components](TODO:reference_versioned_docs/version-v4/components/overview.md 'Components overview').
