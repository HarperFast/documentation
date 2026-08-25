---
title: Replication Overview
---

<!-- Source: versioned_docs/version-4.7/developers/replication/index.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (confirmed cluster status improvements, default port change, certificate revocation, expanded sharding) -->

# Replication Overview

Harper's replication system is designed to make distributed data replication fast and reliable across multiple nodes. You can build a distributed database that ensures high availability, disaster recovery, and data localization — all without complex setup. Nodes can be added or removed dynamically, you can choose which data to replicate, and you can monitor cluster health without jumping through hoops.

## Peer-to-Peer Model

Harper replication uses a peer-to-peer model where every node in your cluster can send data to and receive data from other nodes. Nodes communicate over WebSockets, allowing data to flow in both directions. Harper automatically manages these connections and subscriptions, so you don't need to manually track data consistency. Connections between nodes are secured and reliable by default.

## Configuration

### Connecting Nodes

To connect nodes to each other, provide hostnames or URLs in the `replication` section of `harper-config.yaml`. Each node specifies its own hostname and the routes (other nodes) it should connect to:

```yaml
replication:
  hostname: server-one
  routes:
    - server-two
    - server-three
```

Routes can also be specified as URLs or with explicit port numbers:

```yaml
replication:
  hostname: server-one
  routes:
    - wss://server-two:9933
    - hostname: server-three
      port: 9933
```

By default, replication connects on the secure port `9933`.

```yaml
replication:
  securePort: 9933
```

You can also manage nodes dynamically through the [Operations API](./clustering.md) without editing the config file.

### Gossip Discovery

Harper automatically replicates node information to other nodes in the cluster using [gossip-style discovery](https://highscalability.com/gossip-protocol-explained/). This means you only need to connect to one existing node in a cluster, and Harper will automatically detect and connect to all other nodes bidirectionally.

As of v5.2, this full-mesh, bidirectional auto-connect behavior applies to nodes with no directional routes. A node configured with [directional routes](#controlling-replication-flow) advertises a constrained registry record instead, so a node that discovers it — and has no directional route of its own for it — does not open a replication subscription to it. Containment is a property of the _discovered_ node's advertised record, not of the discovering node's configuration: configuring directional routes on one node does not stop that node from subscribing to a discovered peer that still advertises the legacy full-mesh record. See [Controlling Replication Flow](#controlling-replication-flow).

### Data Selection

By default, Harper replicates all data in all databases. You can narrow replication to specific databases:

```yaml
replication:
  databases:
    - data
    - system
```

All tables within a replicated database are replicated by default. To exclude a specific table from replication, set `replicate: false` in the table definition:

```graphql
type LocalTableForNode @table(replicate: false) {
	id: ID!
	name: String!
}
```

Transactions are replicated atomically, which may span multiple tables. You can also control how many nodes data is replicated to using [sharding configuration](./sharding.md).

## Securing Connections

Harper supports PKI-based security and authorization for replication connections. Two authentication methods are supported:

- **Certificate-based authentication** (recommended for production): Nodes are identified by the certificate's common name (CN) or Subject Alternative Names (SANs).
- **IP-based authentication** (for development/testing): Nodes are identified by IP address when using insecure connections.

Harper can automatically perform CRL (Certificate Revocation List) and OCSP (Online Certificate Status Protocol) verification to ensure revoked certificates cannot be used. OCSP and CRL work automatically with certificates from public CAs when `enableRootCAs` is enabled. For self-signed certificates or private CAs without OCSP/CRL support, use Harper's manual certificate revocation feature. Certificate verification settings follow the same configuration as HTTP mTLS connections (see [Certificate Verification](../security/certificate-verification.md)).

### Providing Your Own Certificates

If you have certificates from a public or corporate CA, enable `enableRootCAs` so nodes validate against the standard root CA list:

```yaml
replication:
  enableRootCAs: true
```

Ensure the certificate's CN matches the node's hostname.

### Setting Up Custom Certificates

There are two ways to configure Harper with your own certificates:

1. Use the `add_certificate` operation to upload them.
2. Specify certificate paths directly in `harper-config.yaml`:

```yaml
tls:
  certificate: /path/to/certificate.pem
  certificateAuthority: /path/to/ca.pem
  privateKey: /path/to/privateKey.pem
```

Harper will load the provided certificates into the certificate table and use them to secure and authenticate connections. If you have a publicly-signed certificate, you can omit the `certificateAuthority` and enable `enableRootCAs` to use the bundled Mozilla CA store instead.

### Cross-Generated Certificates

Harper can generate its own certificates for secure connections — useful when no existing certificates are available. When you run `add_node` over SSL with temporary credentials, Harper automatically handles certificate generation and signing:

```json
{
	"operation": "add_node",
	"hostname": "server-two",
	"verify_tls": false,
	"authorization": {
		"username": "admin",
		"password": "password"
	}
}
```

On a fresh install, set `verify_tls: false` temporarily to accept the self-signed certificate. Harper then:

1. Creates a certificate signing request (CSR) and sends it to `server-two`.
2. `server-two` signs the CSR and returns the signed certificate and CA.
3. The signed certificate is stored for all future connections.

Credentials are not stored — they are discarded immediately after use. You can also provide credentials in HTTP Authorization format (Basic, Token, or JWT).

### Revoking Certificates

<VersionBadge version="v4.5.0" />

Certificates used in replication can be revoked using the certificate serial number. Use either the `revoked_certificates` attribute in the `hdb_nodes` system table or route config:

Via the operations API:

```json
{
	"operation": "update_node",
	"hostname": "server-two",
	"revoked_certificates": ["1769F7D6A"]
}
```

Via `harper-config.yaml`:

```yaml
replication:
  routes:
    - hostname: server-three
      port: 9930
      revokedCertificates:
        - 1769F7D6A
        - QA69C7E2S
```

### Insecure IP-Based Authentication

For development, testing, or secure private networks, you can disable TLS and use IP addresses to authenticate nodes. Configure replication on an insecure port and set up IP-based routes:

```yaml
replication:
  port: 9933
  routes:
    - 127.0.0.2
    - 127.0.0.3
```

> **Warning**: Never use insecure connections for production systems accessible from the public internet.

Loopback addresses (`127.0.0.X`) are a convenient way to run multiple nodes on a single machine for local development.

## Controlling Replication Flow

By default, Harper replicates all data in all databases with symmetric bidirectional flow. To restrict replication to one direction between certain nodes, set `sends` and `receives` on the route configuration:

```yaml
replication:
  databases:
    - data
  routes:
    - hostname: node-two
      replicates:
        sends: false
        receives: true
    - hostname: node-three
      replicates:
        sends: true
        receives: false
```

In this example, the local node only receives from `node-two` (one-way inbound) and only sends to `node-three` (one-way outbound).

### Per-database controlled flow

<VersionBadge version="v5.1.0" />

Routes have accepted per-database `sendsTo` / `receivesFrom` entries since v5.1.0, but a directional route was stored without being enforced on live connections until v5.1.15: before that, the direction gates read only the peer's advertised `hdb_nodes` record, so traffic flowed both ways regardless of what the route declared. The behavior described below is the v5.1.15-and-later behavior.

You can also scope flow per database, so different databases flow in different directions between the same two nodes. Use `sendsTo` / `receivesFrom` entries with a `database`:

```yaml
replication:
  databases:
    - cardata
    - config
    - system
  routes:
    - hostname: node-two
      replicates:
        sendsTo:
          - database: config
          - database: system # push central config (users, roles, schemas) downstream
        receivesFrom:
          - database: cardata # aggregate telemetry upstream
```

If this is `node-one`'s configuration, `node-two` needs the inverse directional route:

```yaml
replication:
  hostname: node-two
  databases:
    - cardata
    - config
    - system
  routes:
    - hostname: node-one
      replicates:
        sendsTo:
          - database: cardata
        receivesFrom:
          - database: config
          - database: system
```

`sendsTo` / `receivesFrom` are declared from the perspective of the node whose `harper-config.yaml` they're in, for its route to that one peer. A route that declares `replicates` with `sends`, `receives`, `sendsTo`, or `receivesFrom` is authoritative on each side; a route without those fields — or no route at all — falls back to the peer's advertised `hdb_nodes` self-record.

The **sending** side needs the matching `sendsTo` entry when it has a directional route for that peer. To aggregate a database upstream instead of pushing it downstream — for example, so a role created on a roadside node reaches a middle-tier node — the **roadside** node's directional route to middle needs `sendsTo: [{ database: system }]`; without it, middle's subscription attempt is rejected as unauthorized. If roadside has no directional route to middle, it instead authorizes the send from middle's advertised `receivesFrom` and may serve `system` without a local `sendsTo` entry.

Likewise, the **receiving** side needs a matching `receivesFrom` only when it has its own directional route for that peer: a middle-tier node with a directional route to roadside is gated by that route, so omitting `receivesFrom` there means it never attempts the subscription. If middle has no route to roadside at all — or only a plain, non-directional one — it falls back to roadside's advertised `hdb_nodes` self-record. That self-record qualifies each `sendsTo` entry with the hostname of the route that produced it: middle subscribes because roadside's route to middle carries `database: system`, while core appears in no such route and matches no entry. On a receiver with no directional route for the peer, omitting `receivesFrom` is therefore not a way to block inbound replication.

### Replicating the `system` database with controlled flow

<VersionBadge type="changed" version="v5.2.0" />

Before v5.2, replicating the `system` database under controlled flow was discouraged: because `hdb_nodes` (the node registry) lives in `system` and each node advertised itself as a full-mesh participant, replicating `system` caused every node to discover and directly connect to every other node — collapsing a constrained topology into a full mesh.

As of v5.2 you can replicate `system` while keeping a constrained topology among nodes that all advertise directional routes. When a node has directional routes, it advertises a **directional** registry record derived from those routes (which neighbors it sends to / receives from) instead of a blanket "connect to everyone." A discovered non-neighbor with a directional registry record therefore is not subscribed to and does not receive a replication connection. This lets central configuration — users, roles, and schemas — propagate transitively across the whole cluster while user-database connections stay on the routes you configured. For example, in a `roadside → middle → core` aggregation tree, a role created on a roadside node reaches the core through the middle tier, yet the core never opens a direct replication subscription to a roadside node.

Notes and current limitations:

- This applies only when a node has **directional** routes (`replicates` with `sends`/`receives` or `sendsTo`/`receivesFrom`). A node with no directional routes keeps the legacy full-mesh advertisement.
- The no-direct-connection guarantee requires every discoverable participant to advertise directional routes. A node that advertises the legacy full-mesh record can still be reached through the advertised-record fallback when a receiver has no directional route for it.
- This constrains replication subscriptions only. On-demand residency/retrieval connections (for example, sharded or invalidated-cache reads) use a separate mechanism governed by data residency, not by this registry record, and can still open a direct socket to a non-neighbor node.
- Central visibility of every node is not guaranteed: an aggregation node may not list every distant leaf in its `hdb_nodes` registry (the registry relay differs from data relay). This does not open a connection either way.
- Route changes to a node's own directionality take effect on restart.
- Replicating `system` upstream (edge → core) propagates `hdb_user`/`hdb_role` along with everything else in the database: a compromised edge node can create a user or role with cluster-wide privileges or alter its advertised directionality in `hdb_nodes`, and those changes reach every node on the upstream path. If edge nodes are outside your trust boundary, enforce downstream-only `system` replication with directional routes on both nodes: include `system` in the central node's `sendsTo` and the edge node's `receivesFrom`, and omit it from the central node's `receivesFrom` and the edge node's `sendsTo`. A plain or absent route on either side falls back to the peer's advertised registry record and does not enforce that direction.
- Downstream-only `system` replication is an integrity control, not a confidentiality boundary. The database includes encrypted `system.hdb_secret` rows, and a joined Harper Pro node holds the cluster custody key that can decrypt them. Treat every node receiving `system` as trusted with the system database's contents; for untrusted nodes, avoid replicating `system` to them or exclude sensitive system tables from the controlled-flow entries.

### Explicit Subscriptions

By default, Harper automatically manages connections and subscriptions between nodes. Explicit subscriptions exist only for testing, debugging, and legacy migration — they should not be used for production replication and will likely be removed in v5.

With explicit subscriptions, Harper no longer guarantees data consistency. If you want unidirectional replication, use [controlled replication flow](#controlling-replication-flow) instead.

To explicitly subscribe, use `add_node` with subscription definitions:

```json
{
	"operation": "add_node",
	"hostname": "server-two",
	"subscriptions": [
		{
			"database": "dev",
			"table": "my-table",
			"publish": true,
			"subscribe": false
		}
	]
}
```

Update a subscription with `update_node`:

```json
{
	"operation": "update_node",
	"hostname": "server-two",
	"subscriptions": [
		{
			"database": "dev",
			"table": "my-table",
			"publish": true,
			"subscribe": true
		}
	]
}
```

## Monitoring Replication

<VersionBadge version="v4.5.0" /> (cluster status timing statistics)

Use `cluster_status` to monitor the state of replication:

```json
{
	"operation": "cluster_status"
}
```

See [Clustering Operations](./clustering.md#cluster-status) for the full response schema and field descriptions.

## Initial Synchronization and Resynchronization

When a new node is added and its database has not been previously synced, Harper downloads the full database from the first node it connects to. After the initial sync completes, the node enters replication mode and receives incremental updates.

If a node goes offline and comes back, it resynchronizes automatically to catch up on missed transactions.

You can also specify a `start_time` in the `add_node` operation to limit the initial download to data since a given point in time:

```json
{
	"operation": "add_node",
	"hostname": "server-two",
	"start_time": "2024-01-01T00:00:00.000Z"
}
```

## Replicated Transactions

The following data operations are replicated across the cluster:

- Insert
- Update
- Upsert
- Delete
- Bulk loads (CSV data load, CSV file load, CSV URL load, import from S3)

**Destructive schema operations are not replicated**: `drop_database`, `drop_table`, and `drop_attribute` must be run on each node independently.

Users and roles are not replicated across the cluster by default. They do propagate when the `system` database (where `hdb_user` and `hdb_role` live) is included in replication; as of v5.2 this no longer forces a full mesh — see [Replicating the `system` database with controlled flow](#replicating-the-system-database-with-controlled-flow).

Certain management operations — including component deployment and rolling restarts — can also be replicated across the cluster.

## Inspecting Cluster Configuration

Query the `hdb_nodes` system table to inspect the current known nodes and their configuration:

```json
{
	"operation": "search_by_value",
	"database": "system",
	"table": "hdb_nodes",
	"attribute": "name",
	"value": "*"
}
```

The `hdb_certificate` table contains the certificates used for replication connections.

## See Also

- [Clustering Operations](./clustering.md) — Operations API for managing cluster nodes and subscriptions
- [Sharding](./sharding.md) — Distributing data across a subset of nodes
- [Certificate Management](../security/certificate-management.md)
