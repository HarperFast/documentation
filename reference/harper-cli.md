---
title: Harper CLI
---

# Harper CLI

## Harper CLI

The Harper command line interface (CLI) is used to administer [self-installed Harper instances](install-harper/).

### Installing Harper

To install Harper with CLI prompts, run the following command:

```bash
harperdb install
```

Alternatively, Harper installations can be automated with environment variables or command line arguments; [see a full list of configuration parameters here](configuration#using-the-configuration-file-and-naming-conventions). Note, when used in conjunction, command line arguments will override environment variables.

**Environment Variables**

```bash
#minimum required parameters for no additional CLI prompts
export TC_AGREEMENT=yes
export HDB_ADMIN_USERNAME=HDB_ADMIN
export HDB_ADMIN_PASSWORD=password
export ROOTPATH=/tmp/hdb/
export OPERATIONSAPI_NETWORK_PORT=9925
harperdb install
```

**Command Line Arguments**

```bash
#minimum required parameters for no additional CLI prompts
harperdb install --TC_AGREEMENT yes --HDB_ADMIN_USERNAME HDB_ADMIN --HDB_ADMIN_PASSWORD password --ROOTPATH /tmp/hdb/ --OPERATIONSAPI_NETWORK_PORT 9925
```

---

### Starting Harper

To start Harper after it is installed, run the following command:

```bash
harperdb start
```

---

### Stopping Harper

To stop Harper once it is running, run the following command:

```bash
harperdb stop
```

---

### Restarting Harper

To restart Harper once it is running, run the following command:

```bash
harperdb restart
```

---

### Getting the Harper Version

To check the version of Harper that is installed run the following command:

```bash
harperdb version
```

---

### Renew self-signed certificates

To renew the Harper generated self-signed certificates, run:

```bash
harperdb renew-certs
```

---

### Copy a database with compaction

To copy a Harper database with compaction (to eliminate free-space and fragmentation), use

```bash
harperdb copy-db <source-database> <target-database-path>
```

For example, to copy the default database:

```bash
harperdb copy-db data /home/user/hdb/database/copy.mdb
```

---

### Get all available CLI commands

To display all available Harper CLI commands along with a brief description run:

```bash
harperdb help
```

---

### Get the status of Harper and clustering

To display the status of the Harper process, the clustering hub and leaf processes, the clustering network and replication statuses, run:

```bash
harperdb status
```

---

### Backups

Harper uses a transactional commit process that ensures that data on disk is always transactionally consistent with storage. This means that Harper maintains database integrity in the event of a crash. It also means that you can use any standard volume snapshot tool to make a backup of a Harper database. Database files are stored in the hdb/database directory. As long as the snapshot is an atomic snapshot of these database files, the data can be copied/moved back into the database directory to restore a previous backup (with Harper shut down) , and database integrity will be preserved. Note that simply copying an in-use database file (using `cp`, for example) is _not_ a snapshot, and this would progressively read data from the database at different points in time, which yields unreliable copy that likely will not be usable. Standard copying is only reliable for a database file that is not in use.

---

## Operations API through the CLI

Some of the API operations are available through the CLI, this includes most operations that do not require nested parameters. To call the operation use the following convention: `<api-operation> <parameter>=<value>`. By default, the result will be formatted as YAML, if you would like the result in JSON pass: `json=true`.

Some examples are:

```bash
$ harperdb describe_table database=dev table=dog

schema: dev
name: dog
hash_attribute: id
audit: true
schema_defined: false
attributes:
  - attribute: id
    is_primary_key: true
  - attribute: name
    indexed: true
clustering_stream_name: 3307bb542e0081253klnfd3f1cf551b
record_count: 10
last_updated_record: 1724483231970.9949
```

`harperdb set_configuration logging_level=error`

`harperdb deploy_component project=my-cool-app package=https://github.com/HarperDB/application-template`

`harperdb get_components`

`harperdb search_by_id database=dev table=dog ids='["1"]' get_attributes='["*"]' json=true`

`harperdb search_by_value table=dog search_attribute=name search_value=harper get_attributes='["id", "name"]'`

`harperdb sql sql='select * from dev.dog where id="1"'`

### Remote Operations

The CLI can also be used to run operations on remote Harper instances. To do this, pass the `target` parameter with the HTTP address of the remote instance. You generally will also need to provide credentials and specify the `username` and `password` parameters, or you can set environment variables `CLI_TARGET_USERNAME` and `CLI_TARGET_PASSWORD`, for example:

```bash
export CLI_TARGET_USERNAME=HDB_ADMIN
export CLI_TARGET_PASSWORD=password
harperdb describe_database database=dev target=https://server.com:9925
```

The same set of operations API are available for remote operations as well.

#### Remote Component Deployment

When using remote operations, you can deploy a local component to the remote instance. If you omit the `package` parameter, you can deploy the current directory. This will package the current directory and send it to the target server (also `deploy` is allowed as an alias to `deploy_component`):

```bash
harperdb deploy target=https://server.com:9925
```

If you are interacting with a cluster, you may wish to include the `replicated=true` parameter to ensure that the deployment operation is replicated to all nodes in the cluster. You will also need to restart afterwards to apply the changes (here seen with the replicated parameter):

```bash
harperdb restart target=https://server.com:9925 replicated=true
```
