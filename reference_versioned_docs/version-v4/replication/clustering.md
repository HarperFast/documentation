---
title: Clustering
---

<!-- Source: versioned_docs/version-4.7/developers/operations-api/clustering.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (confirmed cluster status timing statistics in v4.5.0) -->

# Clustering

Operations API for managing Harper's replication system. For an overview of how replication works, see [Replication Overview](./overview.md). For sharding configuration, see [Sharding](./sharding.md).

All clustering operations require `super_user` role.

---

### Add Node

Adds a new Harper instance to the cluster. If `subscriptions` are provided, it creates the specified replication relationships between the nodes. Without `subscriptions`, a fully replicating system is created (all data in all databases).

**Parameters**:

- `operation` _(required)_ — must be `add_node`
- `hostname` or `url` _(required)_ — the hostname or URL of the node to add
- `verify_tls` _(optional)_ — whether to verify the TLS certificate. Set to `false` temporarily on fresh installs with self-signed certificates. Defaults to `true`
- `authorization` _(optional)_ — credentials for the node being added. Either an object with `username` and `password`, or an HTTP `Authorization` style string
- `retain_authorization` _(optional)_ — if `true`, stores credentials and uses them on every reconnect. Generally not recommended; prefer certificate-based authentication. Defaults to `false`
- `revoked_certificates` _(optional)_ — array of revoked certificate serial numbers that will not be accepted for any connections
- `shard` _(optional)_ — shard number for this node. Only needed when using sharding
- `start_time` _(optional)_ — ISO 8601 UTC datetime. If set, only data after this time is downloaded during initial synchronization instead of the entire database
- `subscriptions` _(optional)_ — explicit table-level replication relationships. This is optional (and discouraged). Each subscription is an object with:
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
	"hostname": "server-two"
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

| Field                    | Description                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `lastCommitConfirmed`    | Last time a receipt of confirmation was received for an outgoing commit                                                             |
| `lastReceivedRemoteTime` | Timestamp (from the originating node) of the last received transaction                                                              |
| `lastReceivedLocalTime`  | Local time when the last transaction was received. A gap between this and `lastReceivedRemoteTime` suggests the node is catching up |
| `sendingMessage`         | Timestamp of the transaction actively being sent. Absent when waiting for the next transaction                                      |

---

### Configure Cluster

Bulk creates or resets subscriptions for any number of remote nodes. **Resets and replaces any existing clustering setup.**

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
			}
		},
		{
			"hostname": "server-three",
			"verify_tls": false,
			"authorization": {
				"username": "admin",
				"password": "password3"
			}
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
	"set": ["wss://server-two:9925", { "hostname": "server-three", "port": 9930 }],
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
["wss://server-two:9925", { "hostname": "server-three", "port": 9930 }]
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
