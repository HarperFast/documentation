---
title: Clone Node
---

# Clone Node

Clone node is a configurable node script that when pointed to another instance of Harper will create a clone of that
instance's config, databases and setup full replication. If it is run in a location where there is no existing Harper install,
it will, along with cloning, install Harper. If it is run in a location where there is another Harper instance, it will
only clone config, databases and replication that do not already exist.

Clone node is triggered when Harper is installed or started with certain environment or command line (CLI) variables set (see below).

**Leader node** - the instance of Harper you are cloning.\
**Clone node** - the new node which will be a clone of the leader node.

To start clone run `harperdb` in the CLI with either of the following variables set:

#### Environment variables

- `HDB_LEADER_URL` - The URL of the leader node's operation API (usually port 9925).
- `HDB_LEADER_USERNAME` - The leader node admin username.
- `HDB_LEADER_PASSWORD` - The leader node admin password.
- `REPLICATION_HOSTNAME` - _(optional)_ The clones replication hostname. This value will be added to `replication.hostname` on the clone node. If this value is not set, replication will not be set up between the leader and clone.

For example:

```
HDB_LEADER_URL=https://node-1.my-domain.com:9925 REPLICATION_HOSTNAME=node-2.my-domain.com HDB_LEADER_USERNAME=... HDB_LEADER_PASSWORD=... harperdb
```

#### Command line variables

- `--HDB_LEADER_URL` - The URL of the leader node's operation API (usually port 9925).
- `--HDB_LEADER_USERNAME` - The leader node admin username.
- `--HDB_LEADER_PASSWORD` - The leader node admin password.
- `--REPLICATION_HOSTNAME` - _(optional)_ The clones clustering host. This value will be added to `replication.hostname` on the clone node. If this value is not set, replication will not be set up between the leader and clone.

For example:

```
harperdb --HDB_LEADER_URL https://node-1.my-domain.com:9925 --REPLICATION_HOSTNAME node-2.my-domain.com --HDB_LEADER_USERNAME ... --HDB_LEADER_PASSWORD ...
```

Each time clone is run it will set a value `cloned: true` in `harperdb-config.yaml`. This value will prevent clone from
running again. If you want to run clone again set this value to `false`. If Harper is started with the clone variables
still present and `cloned` is true, Harper will just start as normal.

Clone node does not require any additional configuration apart from the variables referenced above.
However, if you wish to set any configuration during clone this can be done by passing the config as environment/CLI
variables or cloning overtop of an existing `harperdb-config.yaml` file.

More can be found in the Harper config documentation [here](../deployments/configuration).

### Excluding database and components

To set any specific (optional) clone config, including the exclusion of any database and/or replication, there is a file
called `clone-node-config.yaml` that can be used.

The file must be located in the `ROOTPATH` directory of your clone (the `hdb` directory where you clone will be installed.
If the directory does not exist, create one and add the file to it).

The config available in `clone-node-config.yaml` is:

```yaml
databaseConfig:
  excludeDatabases:
    - database: null
  excludeTables:
    - database: null
      table: null
componentConfig:
  exclude:
    - name: null
```

_Note: only include the configuration that you are using. If no clone config file is provided nothing will be excluded,
unless it already exists on the clone._

`databaseConfig` - Set any databases or tables that you wish to exclude from cloning.

`componentConfig` - Set any components that you do not want cloned. Clone node will not clone the component code,
it will only clone the component reference that exists in the leader harperdb-config file.

### Cloning configuration

Clone node will not clone any configuration that is classed as unique to the leader node. This includes `replication.hostname`, `replication.url`,`clustering.nodeName`,
`rootPath` and any other path related values, for example `storage.path`, `logging.root`, `componentsRoot`,
any authentication certificate/key paths.

### Cloning system database

Harper uses a database called `system` to store operational information. Clone node will only clone the user and role
tables from this database. It will also set up replication on this table, which means that any existing and future user and roles
that are added will be replicated throughout the cluster.

Cloning the user and role tables means that once clone node is complete, the clone will share the same login credentials with
the leader.

### Replication

If clone is run with the `REPLICATION_HOSTNAME` variable set, a fully replicating clone will be created.

If any databases are excluded from the clone, replication will not be set up on these databases.

### JWT Keys

If cloning with replication, the leader's JWT private and public keys will be cloned. To disable this, include `CLONE_KEYS=false` in your clone variables.

### Cloning overtop of an existing Harper instance

Clone node will not overwrite any existing config, database or replication. It will write/clone any config database or replication
that does not exist on the node it is running on.

An example of how this can be useful is if you want to set Harper config before the clone is created. To do this you
would create a harperdb-config.yaml file in your local `hdb` root directory with the config you wish to set. Then
when clone is run it will append the missing config to the file and install Harper with the desired config.

Another useful example could be retroactively adding another database to an existing instance. Running clone on
an existing instance could create a full clone of another database and set up replication between the database on the
leader and the clone.

### Cloning steps

Clone node will execute the following steps when ran:

1. Look for an existing Harper install. It does this by using the default (or user provided) `ROOTPATH`.
1. If an existing instance is found it will check for a `harperdb-config.yaml` file and search for the `cloned` value. If the value exists and is `true` clone will skip the clone logic and start Harper.
1. Clone harperdb-config.yaml values that don't already exist (excluding values unique to the leader node).
1. Fully clone any databases that don't already exist.
1. If classed as a "fresh clone", install Harper. An instance is classed as a fresh clone if there is no system database.
1. If `REPLICATION_HOSTNAME` is set, set up replication between the leader and clone.
1. Clone is complete, start Harper.

### Cloning with Docker

To run clone inside a container add the environment variables to your run command.

For example:

```
docker run -d \
  -v <host directory>:/home/harperdb/hdb \
  -e HDB_LEADER_PASSWORD=password \
  -e HDB_LEADER_USERNAME=admin \
  -e HDB_LEADER_URL=https://1.123.45.6:9925 \
  -e REPLICATION_HOSTNAME=1.123.45.7 \
  -p 9925:9925 \
  -p 9926:9926 \
  harperdb/harperdb
```

Clone will only run once, when you first start the container. If the container restarts the environment variables will be ignored.
