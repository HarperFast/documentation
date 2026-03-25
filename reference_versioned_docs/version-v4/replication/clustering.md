---
title: Clustering
---

<!-- Source: versioned_docs/version-4.7/developers/operations-api/clustering.md (primary — native replication operations) -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/index.md (legacy NATS overview) -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/requirements-and-definitions.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/enabling-clustering.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/establishing-routes.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/naming-a-node.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/creating-a-cluster-user.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/managing-subscriptions.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/subscription-overview.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/certificate-management.md -->
<!-- Source: versioned_docs/version-4.7/reference/clustering/things-worth-knowing.md -->
<!-- Source: release-notes/v4-tucker/4.4.0.md (confirmed native replication in v4.4.0) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (confirmed cluster status improvements in v4.5.0) -->

# Clustering

This page documents the Operations API for managing Harper's native replication system (available since v4.4.0). For an overview of how replication works, see [Replication Overview](./overview.md). For sharding configuration, see [Sharding](./sharding.md).

> **Legacy NATS Clustering**: The NATS-based clustering used in v4.0–4.3 is described in the [Legacy NATS Clustering](#legacy-nats-clustering) section below. The operations described here apply to the native replication system in v4.4.0+.

## Operations API

All clustering operations require `super_user` role.

---

### Add Node

Adds a new Harper instance to the cluster. If `subscriptions` are provided, it creates the specified replication relationships between the nodes. Without `subscriptions`, a fully replicating system is created (all data in all databases).

Added in: v4.4.0

**Parameters**:

- `operation` _(required)_ — must be `add_node`
- `hostname` or `url` _(required)_ — the hostname or URL of the node to add
- `verify_tls` _(optional)_ — whether to verify the TLS certificate. Set to `false` temporarily on fresh installs with self-signed certificates. Defaults to `true`
- `authorization` _(optional)_ — credentials for the node being added. Either an object with `username` and `password`, or an HTTP `Authorization` style string
- `retain_authorization` _(optional)_ — if `true`, stores credentials and uses them on every reconnect. Generally not recommended; prefer certificate-based authentication. Defaults to `false`
- `revoked_certificates` _(optional)_ — array of revoked certificate serial numbers that will not be accepted for any connections
- `shard` _(optional)_ — shard number for this node. Only needed when using sharding
- `start_time` _(optional)_ — ISO 8601 UTC datetime. If set, only data after this time is downloaded during initial synchronization instead of the entire database
- `subscriptions` _(optional)_ — explicit table-level replication relationships. Each subscription is an object with:
  - `database` — database name
  - `table` — table name
  - `subscribe` — if `true`, transactions on the remote table are replicated locally
  - `publish` — if `true`, transactions on the local table are replicated to the remote node

**Request**:

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

**Response**:

```json
{
	"message": "Successfully added 'server-two' to cluster"
}
```

> **Note**: `set_node` is an alias for `add_node`.

---

### Update Node

Modifies an existing Harper instance in the cluster. Will attempt to add the node if it does not exist.

Added in: v4.4.0

**Parameters**:

- `operation` _(required)_ — must be `update_node`
- `hostname` _(required)_ — hostname of the remote node to update
- `revoked_certificates` _(optional)_ — array of revoked certificate serial numbers
- `shard` _(optional)_ — shard number to assign to this node
- `subscriptions` _(required)_ — array of subscription objects (same structure as `add_node`)

**Request**:

```json
{
	"operation": "update_node",
	"hostname": "server-two",
	"subscriptions": [
		{
			"database": "dev",
			"table": "my-table",
			"subscribe": true,
			"publish": true
		}
	]
}
```

**Response**:

```json
{
	"message": "Successfully updated 'server-two'"
}
```

---

### Remove Node

Removes a Harper node from the cluster and stops all replication to and from that node.

Added in: v4.4.0

**Parameters**:

- `operation` _(required)_ — must be `remove_node`
- `hostname` _(required)_ — hostname of the node to remove

**Request**:

```json
{
	"operation": "remove_node",
	"hostname": "server-two"
}
```

**Response**:

```json
{
	"message": "Successfully removed 'server-two' from cluster"
}
```

---

### Cluster Status

Returns an array of status objects from the cluster, including active WebSocket connections and replication timing statistics.

Added in: v4.4.0; timing statistics added in v4.5.0

**Parameters**:

- `operation` _(required)_ — must be `cluster_status`

**Request**:

```json
{
	"operation": "cluster_status"
}
```

**Response**:

```json
{
	"type": "cluster-status",
	"connections": [
		{
			"replicateByDefault": true,
			"replicates": true,
			"url": "wss://server-2.domain.com:9933",
			"name": "server-2.domain.com",
			"subscriptions": null,
			"database_sockets": [
				{
					"database": "data",
					"connected": true,
					"latency": 0.7,
					"thread_id": 1,
					"nodes": ["server-2.domain.com"],
					"lastCommitConfirmed": "Wed, 12 Feb 2025 19:09:34 GMT",
					"lastReceivedRemoteTime": "Wed, 12 Feb 2025 16:49:29 GMT",
					"lastReceivedLocalTime": "Wed, 12 Feb 2025 16:50:59 GMT",
					"lastSendTime": "Wed, 12 Feb 2025 16:50:59 GMT"
				}
			]
		}
	],
	"node_name": "server-1.domain.com",
	"is_enabled": true
}
```

`database_sockets` shows the actual WebSocket connections between nodes — one socket per database per node. Timing fields:

| Field | Description |
|---|---|
| `lastCommitConfirmed` | Last time a receipt of confirmation was received for an outgoing commit |
| `lastReceivedRemoteTime` | Timestamp (from the originating node) of the last received transaction |
| `lastReceivedLocalTime` | Local time when the last transaction was received. A gap between this and `lastReceivedRemoteTime` suggests the node is catching up |
| `sendingMessage` | Timestamp of the transaction actively being sent. Absent when waiting for the next transaction |

---

### Configure Cluster

Bulk creates or resets subscriptions for any number of remote nodes. **Resets and replaces any existing clustering setup.**

Added in: v4.4.0

**Parameters**:

- `operation` _(required)_ — must be `configure_cluster`
- `connections` _(required)_ — array of node objects following the `add_node` schema

**Request**:

```json
{
	"operation": "configure_cluster",
	"connections": [
		{
			"hostname": "server-two",
			"verify_tls": false,
			"authorization": {
				"username": "admin",
				"password": "password2"
			},
			"subscriptions": [
				{
					"database": "dev",
					"table": "my-table",
					"subscribe": true,
					"publish": false
				}
			]
		},
		{
			"hostname": "server-three",
			"verify_tls": false,
			"authorization": {
				"username": "admin",
				"password": "password3"
			},
			"subscriptions": [
				{
					"database": "dev",
					"table": "dog",
					"subscribe": true,
					"publish": true
				}
			]
		}
	]
}
```

**Response**:

```json
{
	"message": "Cluster successfully configured."
}
```

---

### Cluster Set Routes

Adds routes to the `replication.routes` configuration. Behaves as a PATCH/upsert — adds new routes while leaving existing routes untouched.

Added in: v4.4.0

**Parameters**:

- `operation` _(required)_ — must be `cluster_set_routes`
- `routes` _(required)_ — array of route strings (`wss://host:port`) or objects with `hostname` and `port` properties

**Request**:

```json
{
	"operation": "cluster_set_routes",
	"routes": [
		"wss://server-two:9925",
		{
			"hostname": "server-three",
			"port": 9930
		}
	]
}
```

**Response**:

```json
{
	"message": "cluster routes successfully set",
	"set": [
		"wss://server-two:9925",
		{ "hostname": "server-three", "port": 9930 }
	],
	"skipped": []
}
```

---

### Cluster Get Routes

Returns the replication routes from the Harper config file.

**Parameters**:

- `operation` _(required)_ — must be `cluster_get_routes`

**Request**:

```json
{
	"operation": "cluster_get_routes"
}
```

**Response**:

```json
[
	"wss://server-two:9925",
	{ "hostname": "server-three", "port": 9930 }
]
```

---

### Cluster Delete Routes

Removes routes from the Harper config file.

**Parameters**:

- `operation` _(required)_ — must be `cluster_delete_routes`
- `routes` _(required)_ — array of route objects to remove

**Request**:

```json
{
	"operation": "cluster_delete_routes",
	"routes": [
		{
			"hostname": "server-three",
			"port": 9930
		}
	]
}
```

**Response**:

```json
{
	"message": "cluster routes successfully deleted",
	"deleted": [{ "hostname": "server-three", "port": 9930 }],
	"skipped": []
}
```

---

## Legacy NATS Clustering

> **Applies to v4.0–4.3 only.** Harper v4.4.0 replaced NATS clustering with the native replication system. The operations and configuration below are documented for legacy reference.

Harper 4.0–4.3 used a clustering system based on NATS. NATS clustering used a bi-directional pub/sub model on a per-table basis with eventual consistency. Individual transactions were sent in the order they were transacted, and once received by the destination instance, processed in an ACID-compliant manner. Conflict resolution used last-writer-wins based on recorded transaction time.

### Requirements

A cluster requires two or more Harper nodes (instances). A node is a single installation of Harper and can operate independently with clustering enabled or disabled.

### Enabling NATS Clustering

Clustering must be explicitly enabled. Set `clustering.enabled` to `true` in `harperdb-config.yaml`:

```yaml
clustering:
  enabled: true
```

Or via the operations API (requires restart):

```json
{
	"operation": "set_configuration",
	"clustering_enabled": true
}
```

Or via CLI / environment variable:

```bash
harperdb --CLUSTERING_ENABLED true
# or
CLUSTERING_ENABLED=true
```

### Naming a Node

Each node must have a unique name in the cluster. The name cannot contain `.`, `,`, `*`, `>`, or whitespace.

```yaml
clustering:
  nodeName: Node1
```

Or via the operations API:

```json
{
	"operation": "set_configuration",
	"clustering_nodeName": "Node1"
}
```

### Creating a Cluster User

Inter-node authentication in NATS clustering used a special `cluster_user` role. All clustered nodes must share the same cluster user credentials.

Create the user via the operations API:

```json
{
	"operation": "add_user",
	"role": "cluster_user",
	"username": "cluster_account",
	"password": "letsCluster123!",
	"active": true
}
```

Then configure the cluster user in `harperdb-config.yaml`:

```yaml
clustering:
  user: cluster_account
```

Or set both at install time:

```bash
harperdb install \
  --CLUSTERING_ENABLED true \
  --CLUSTERING_NODENAME Node1 \
  --CLUSTERING_USER cluster_account \
  --CLUSTERING_PASSWORD letsCluster123!
```

### Routes

A route is a connection between two nodes. Routes create a mesh network — you do not need to cross-connect all nodes. One route from any node to the cluster is sufficient for all nodes to reach each other.

Route configuration used the `clustering.hubServer.cluster.network.routes` key:

```yaml
clustering:
  hubServer:
    cluster:
      network:
        routes:
          - host: 3.62.184.22
            port: 9932
          - host: 3.735.184.8
            port: 9932
```

Routes could also be set via `cluster_set_routes`, `cluster_get_routes`, and `cluster_delete_routes` operations (same API as the native system, but with NATS-specific parameters).

### Subscriptions

In NATS clustering, subscriptions were the mechanism for controlling which tables replicated and in which direction. A subscription consisted of:

- `database` — the database the table belongs to
- `table` — the table name
- `publish` — if `true`, local transactions are replicated to the remote table
- `subscribe` — if `true`, remote transactions are replicated to the local table

Subscriptions were managed with the `set_node_replication` operation:

```json
{
	"operation": "set_node_replication",
	"node_name": "Node2",
	"subscriptions": [
		{
			"database": "data",
			"table": "dog",
			"publish": true,
			"subscribe": true
		}
	]
}
```

### Certificate Management (NATS)

Harper generated self-signed certificates for NATS cluster connections by default, stored in `<ROOTPATH>/keys/`. For development:

```yaml
clustering:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
    insecure: true
    verify: true
```

For production, use certificates from your own CA or a public CA with matching CNs. Certificates must have `Extended Key Usage` including both `TLS Web Server Authentication` and `TLS Web Client Authentication`.

### What Replicated

The same data operations that replicate in the native system also replicated in NATS: insert, update, upsert, delete, and bulk loads. Destructive operations (`drop_database`, `drop_table`, `drop_attribute`) and users/roles did not replicate.

NATS clustering had built-in resiliency for network interruptions — when reconnected, a catchup routine replayed missed transactions.
