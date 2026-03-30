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

To connect nodes to each other, provide hostnames or URLs in the `replication` section of `harperdb-config.yaml`. Each node specifies its own hostname and the routes (other nodes) it should connect to:

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

You can also manage nodes dynamically through the [Operations API](./clustering.md#operations-api) without editing the config file.

### Gossip Discovery

Harper automatically replicates node information to other nodes in the cluster using [gossip-style discovery](https://highscalability.com/gossip-protocol-explained/). This means you only need to connect to one existing node in a cluster, and Harper will automatically detect and connect to all other nodes bidirectionally.

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
2. Specify certificate paths directly in `harperdb-config.yaml`:

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

Added in: v4.5.0

Certificates used in replication can be revoked using the certificate serial number. Use either the `revoked_certificates` attribute in the `hdb_nodes` system table or route config:

Via the operations API:

```json
{
	"operation": "update_node",
	"hostname": "server-two",
	"revoked_certificates": ["1769F7D6A"]
}
```

Via `harperdb-config.yaml`:

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
    - host: node-two
      replicates:
        sends: false
        receives: true
    - host: node-three
      replicates:
        sends: true
        receives: false
```

In this example, the local node only receives from `node-two` (one-way inbound) and only sends to `node-three` (one-way outbound).

> **Note**: When using controlled flow replication, avoid replicating the `system` database. The `system` database contains node configurations, so replicating it would cause all nodes to have identical (and incorrect) route configurations.

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

Added in: v4.5.0 (cluster status timing statistics)

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

Users and roles are not replicated across the cluster.

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
