---
title: Clone Node
---

# Clone Node

Clone node is a configurable node script that can be pointed to another instance of HarperDB and create a full clone.

To start clone node install `harperdb` as you would normally but have the clone node environment or command line (CLI) variables set (see below).

To run clone node either of the following variables must be set:

#### Environment variables

- `HDB_LEADER_URL` - The URL of the leader node's operation API (usually port 9925).
- `HDB_LEADER_USERNAME` - The leader node admin username.
- `HDB_LEADER_PASSWORD` - The leader node admin password.
- `HDB_LEADER_CLUSTERING_HOST` - _(optional)_ The leader clustering host. This value will be added to the clustering routes on the clone node. If this value is not set, replication will not be setup between the leader and clone.

For example:

```
HDB_LEADER_URL=https://node-1.my-domain.com:9925 HDB_LEADER_CLUSTERING_HOST=node-1.my-domain.com HDB_LEADER_USERNAME=... HDB_LEADER_PASSWORD=... harperdb
```

#### Command line variables

- `--HDB_LEADER_URL` - The URL of the leader node's operation API (usually port 9925).
- `--HDB_LEADER_USERNAME` - The leader node admin username.
- `--HDB_LEADER_PASSWORD` - The leader node admin password.
- `--HDB_LEADER_CLUSTERING_HOST` - _(optional)_ The leader clustering host. This value will be added to the clustering routes on the clone node. If this value is not set, replication will not be setup between the leader and clone.

For example:

```
harperdb --HDB_LEADER_URL https://node-1.my-domain.com:9925 --HDB_LEADER_CLUSTERING_HOST node-1.my-domain.com --HDB_LEADER_USERNAME ... --HDB_LEADER_PASSWORD ...
```

If an instance already exists in the location you are cloning to, clone node will not run. It will instead proceed with starting HarperDB.
This is unless you are cloning overtop (see below) of an existing instance.

Clone node does not require any additional configuration apart from the variables referenced above.
However, it can be configured through `clone-node-config.yaml`, which should be located in the `ROOTPATH` directory of your clone.
If no configuration is supplied, default values will be used.

By default:

- The HarperDB Terms and Conditions will be accepted
- The Root path will be `<home-dir>`/hdb
- The Operations API port will be set to 9925
- The admin and clustering username and password will be the same as the leader node
- A unique node name will be generated
- All tables will be cloned and have replication added, the subscriptions will be `publish: true` and `subscribe: true`
- The users and roles system tables will be cloned and have replication added both ways
- All components will be cloned
- All routes will be cloned

**Leader node** - the instance of HarperDB you are cloning.\
**Clone node** - the new node which will be a clone of the leader node.

The following configuration is used exclusively by clone node.

```yaml
databaseConfig:
  excludeDatabases:
    - database: dev
  excludeTables:
    - database: prod
      table: dog
```

Set any databases or tables that you wish to exclude from cloning.

```yaml
componentConfig:
  skipNodeModules: true
  exclude:
    - name: my-cool-component
```

`skipNodeModules` will not include the node_modules directory when clone node is packaging components in `hdb/components`.

`exclude` can be used to set any components that you do not want cloned.

```yaml
clusteringConfig:
  publishToLeaderNode: true
  subscribeToLeaderNode: true
```

`publishToLeaderNode`, `subscribeToLeaderNode` the clustering subscription to set up with the leader node.

```yaml
httpsRejectUnauthorized: false
```

Clone node makes http requests to the leader node, `httpsRejectUnauthorized` is used to set if https requests should be verified.

Any HarperDB configuration can also be used in the `clone-node-config.yaml` file and will be applied to the cloned node, for example:

```yaml
rootPath: null
operationsApi:
  network:
    port: 9925
clustering:
  nodeName: null
  logLevel: info
logging:
  level: error
```

_Note: any required configuration needed to install/run HarperDB will be default values or auto-generated unless it is provided in the config file._

### Fully connected clone

A fully connected topology is when all nodes are replicating (publish and subscribing) with all other nodes. A fully connected clone maintains this topology with addition of the new node. When a clone is created, replication is added between the leader and the clone and any nodes the leader is replicating with. For example, if the leader is replicating with node-a and node-b, the clone will replicate with the leader, node-a and node-b.

To run clone node with the fully connected option simply pass the environment variable `HDB_FULLY_CONNECTED=true` or CLI variable `--HDB_FULLY_CONNECTED true`.

### Cloning overtop of an existing HarperDB instance

_Note: this will completely overwrite any system tables (user, roles, nodes, etc.) and any other databases that are named the same as ones that exist on the leader node. It will also do the same for any components._

To create a clone over an existing install of HarperDB use the environment `HDB_CLONE_OVERTOP=true` or CLI variable `--HDB_CLONE_OVERTOP true`.

## Cloning steps

When run clone node will execute the following steps:

1. Clone any user defined tables and the hdb_role and hdb_user system tables.
1. Install Harperdb overtop of the cloned tables.
1. Clone the configuration, this includes:
   - Copy the clustering routes and clustering user.
   - Copy component references.
   - Using any provided clone config to populate new cloud node harperdb-config.yaml
1. Clone any components in the `hdb/component` directory.
1. Start the cloned HarperDB Instance.
1. Cluster all cloned tables.

## Custom database and table pathing

Currently, clone node will not clone a table if it has custom pathing configured. In this situation the full database that the table is located in will not be cloned.

If a database has custom pathing (no individual table pathing) it will be cloned, however if no custom pathing is provided in the clone config the database will be stored in the default database directory.

To provide custom pathing for a database in the clone config follow this configuration:

```yaml
databases:
  <name-of-db>:
    path: /Users/harper/hdb
```

`<name-of-db>` the name of the database which will be located at the custom path.\
`path` the path where the database will reside.
