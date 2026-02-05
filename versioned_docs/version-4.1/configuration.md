---
title: Configuration File
---

# Configuration File

HarperDB is configured through a [YAML](https://yaml.org/) file called `harperdb-config.yaml` located in the operations API root directory (by default this is a directory named `hdb` located in the home directory of the current user).

All available configuration will be populated by default in the config file on install, regardless of whether it is used.

---

## Using the Configuration File and Naming Conventions

The configuration elements in `harperdb-config.yaml` use camelcase: `operationsApi`.

To change a configuration value edit the `harperdb-config.yaml` file and save any changes. HarperDB must be restarted for changes to take effect.

Alternately, configuration can be changed via environment and/or command line variables or via the API. To access lower level elements, use underscores to append parent/child elements (when used this way elements are case insensitive):

    - Environment variables: `OPERATIONSAPI_NETWORK_PORT=9925`
    - Command line variables: `--OPERATIONSAPI_NETWORK_PORT 9925`
    - Calling `set_configuration` through the API: `operationsApi_network_port: 9925`

---

## Configuration Options

### `clustering`

The `clustering` section configures the clustering engine, this is used to replicate data between instances of HarperDB.

Clustering offers a lot of different configurations, however in a majority of cases the only options you will need to pay attention to are:

- `clustering.enabled` Enable the clustering processes.
- `clustering.hubServer.cluster.network.port` The port other nodes will connect to. This port must be accessible from other cluster nodes.
- `clustering.hubServer.cluster.network.routes`The connections to other instances.
- `clustering.nodeName` The name of your node, must be unique within the cluster.
- `clustering.user` The name of the user credentials used for Inter-node authentication.

`enabled` - _Type_: boolean; _Default_: false

Enable clustering.

_Note: If you enabled clustering but do not create and add a cluster user you will get a validation error. See `user` description below on how to add a cluster user._

```yaml
clustering:
  enabled: true
```

`clustering.hubServer.cluster`

Clustering’s `hubServer` facilitates the HarperDB mesh network and discovery service.

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
          - host: 3.735.184.8
            port: 9932
```

`name` - _Type_: string, _Default_: harperdb

The name of your cluster. This name needs to be consistent for all other nodes intended to be meshed in the same network.

<div style={{paddingLeft: '30px'}}>

`port` - _Type_: integer, _Default_: 9932

The port the hub server uses to accept cluster connections

`routes` - _Type_: array, _Default_: null

An object array that represent the host and port this server will cluster to. Each object must have two properties `port` and `host`. Multiple entries can be added to create network resiliency in the event one server is unavailable. Routes can be added, updated and removed either by directly editing the `harperdb-config.yaml` file or by using the `cluster_set_routes` or `cluster_delete_routes` API endpoints.

</div>

<div style={{paddingLeft: '60px'}}>

`host` - _Type_: string

The host of the remote instance you are creating the connection with.

`port` - _Type_: integer

The port of the remote instance you are creating the connection with. This is likely going to be the `clustering.hubServer.cluster.network.port` on the remote instance.

</div>

`clustering.hubServer.leafNodes`

```yaml
clustering:
  hubServer:
    leafNodes:
      network:
        port: 9931
```

`port` - _Type_: integer; _Default_: 9931

The port the hub server uses to accept leaf server connections.

`clustering.hubServer.network`

```yaml
clustering:
  hubServer:
    network:
      port: 9930
```

`port` - _Type_: integer; _Default_: 9930

Use this port to connect a client to the hub server, for example using the NATs SDK to interact with the server.

`clustering.leafServer`

Manages streams, streams are ‘message stores’ that store table transactions.

```yaml
clustering:
  leafServer:
    network:
      port: 9940
      routes:
        - host: 3.62.184.22
          port: 9931
        - host: node3.example.com
          port: 9931
    streams:
      maxAge: 3600
      maxBytes: 10000000
      maxMsgs: 500
      path: /user/hdb/clustering/leaf
```

`port` - _Type_: integer; _Default_: 9940

Use this port to connect a client to the leaf server, for example using the NATs SDK to interact with the server.

`routes` - _Type_: array; _Default_: null

An object array that represent the host and port the leaf node will directly connect with. Each object must have two properties `port` and `host`. Unlike the hub server, the leaf server will establish connections to all listed hosts. Routes can be added, updated and removed either by directly editing the `harperdb-config.yaml` file or by using the `cluster_set_routes` or `cluster_delete_routes` API endpoints.

<div style={{paddingLeft: '30px'}}>

`host` - _Type_: string

The host of the remote instance you are creating the connection with.

`port` - _Type_: integer

The port of the remote instance you are creating the connection with. This is likely going to be the `clustering.hubServer.cluster.network.port` on the remote instance.

</div>

<br/>

`clustering.leafServer.streams`

`maxAge` - _Type_: integer; _Default_: null

The maximum age of any messages in the stream, expressed in seconds.

`maxBytes` - _Type_: integer; _Default_: null

The maximum size of the stream in bytes. Oldest messages are removed if the stream exceeds this size.

`maxMsgs` - _Type_: integer; _Default_: null

How many messages may be in a stream. Oldest messages are removed if the stream exceeds this number.

`path` - _Type_: string; _Default_: &lt;ROOTPATH>/clustering/leaf

The directory where all the streams are kept.

---

`logLevel` - _Type_: string; _Default_: error

Control the verbosity of clustering logs.

```yaml
clustering:
  logLevel: error
```

There exists a log level hierarchy in order as `trace`, `debug`, `info`, `warn`, and `error`. When the level is set to `trace` logs will be created for all possible levels. Whereas if the level is set to `warn`, the only entries logged will be `warn` and `error`. The default value is `error`.

`nodeName` - _Type_: string; _Default_: null

The name of this node in your HarperDB cluster topology. This must be a value unique from the rest of the cluster node names.

_Note: If you want to change the node name make sure there are no subscriptions in place before doing so. After the name has been changed a full restart is required._

```yaml
clustering:
  nodeName: great_node
```

`tls`

Transport Layer Security default values are automatically generated on install.

```yaml
clustering:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
    insecure: true
    verify: true
```

`certificate` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/certificate.pem

Path to the certificate file.

`certificateAuthority` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/ca.pem

Path to the certificate authority file.

`privateKey` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/privateKey.pem

Path to the private key file.

`insecure` - _Type_: boolean; _Default_: true

When true, will skip certificate verification. For use only with self-signed certs.

`republishMessages` - _Type_: boolean; _Default_: true

When true, all transactions that are received from other nodes are republished to this node's stream. When subscriptions are not fully connected between all nodes, this ensures that messages are routed to all nodes through intermediate nodes. This also ensures that all writes, whether local or remote, are written to the NATS transaction log. However, there is additional overhead with republishing, and setting this is to false can provide better data replication performance. When false, you need to ensure all subscriptions are fully connected between every node to every other node, and be aware that the NATS transaction log will only consist of local writes.

`verify` - _Type_: boolean; _Default_: true

When true, hub server will verify client certificate using the CA certificate.

---

`user` - _Type_: string; _Default_: null

The username given to the `cluster_user`. All instances in a cluster must use the same clustering user credentials (matching username and password).

Inter-node authentication takes place via a special HarperDB user role type called `cluster_user`.

The user can be created either through the API using an `add_user` request with the role set to `cluster_user`, or on install using environment variables `CLUSTERING_USER=cluster_person` `CLUSTERING_PASSWORD=pass123!` or CLI variables `harperdb --CLUSTERING_USER cluster_person` `--CLUSTERING_PASSWORD` `pass123!`

```yaml
clustering:
  user: cluster_person
```

---

### `customFunctions`

The `customFunctions` section configures HarperDB Custom Functions.

`enabled` - _Type_: boolean; _Default_: true

Enable the Custom Function server or not.

```yaml
customFunctions:
  enabled: true
```

`customFunctions.network`

```yaml
customFunctions:
  network:
    cors: true
    corsAccessList:
      - null
    headersTimeout: 60000
    https: false
    keepAliveTimeout: 5000
    port: 9926
    timeout: 120000
```

<div style={{paddingLeft: '30px'}}>

`cors` - _Type_: boolean; _Default_: true

Enable Cross Origin Resource Sharing, which allows requests across a domain.

`corsAccessList` - _Type_: array; _Default_: null

An array of allowable domains with CORS

`headersTimeout` - _Type_: integer; _Default_: 60,000 milliseconds (1 minute)

Limit the amount of time the parser will wait to receive the complete HTTP headers with.

`https` - _Type_: boolean; _Default_: false

Enables HTTPS on the Custom Functions API. This requires a valid certificate and key. If `false`, Custom Functions will run using standard HTTP.

`keepAliveTimeout` - _Type_: integer; _Default_: 5,000 milliseconds (5 seconds)

Sets the number of milliseconds of inactivity the server needs to wait for additional incoming data after it has finished processing the last response.

`port` - _Type_: integer; _Default_: 9926

The port used to access the Custom Functions server.

`timeout` - _Type_: integer; _Default_: Defaults to 120,000 milliseconds (2 minutes)

The length of time in milliseconds after which a request will timeout.

</div>

`nodeEnv` - _Type_: string; _Default_: production

Allows you to specify the node environment in which application will run.

```yaml
customFunctions:
  nodeEnv: production
```

- `production` native node logging is kept to a minimum; more caching to optimize performance. This is the default value.
- `development` more native node logging; less caching.

`root` - _Type_: string; _Default_: &lt;ROOTPATH>/custom_functions

The path to the folder containing Custom Function files.

```yaml
customFunctions:
  root: ~/hdb/custom_functions
```

`tls`
Transport Layer Security

```yaml
customFunctions:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
```

`certificate` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/certificate.pem

Path to the certificate file.

`certificateAuthority` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/ca.pem

Path to the certificate authority file.

`privateKey` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/privateKey.pem

Path to the private key file.

---

### `ipc`

The `ipc` section configures the HarperDB Inter-Process Communication interface.

```yaml
ipc:
  network:
    port: 9383
```

`port` - _Type_: integer; _Default_: 9383

The port the IPC server runs on. The default is `9383`.

---

### `localStudio`

The `localStudio` section configures the local HarperDB Studio, a simplified GUI for HarperDB hosted on the server. A more comprehensive GUI is hosted by HarperDB at [https://studio.harperdb.io](https://studio.harperdb.io). Note, all database traffic from either `localStudio` or HarperDB Studio is made directly from your browser to the instance.

`enabled` - _Type_: boolean; _Default_: false

Enabled the local studio or not.

```yaml
localStudio:
  enabled: false
```

---

### `logging`

The `logging` section configures HarperDB logging across all HarperDB functionality. HarperDB leverages pm2 for logging. Each process group gets their own log file which is located in `logging.root`.

`auditLog` - _Type_: boolean; _Default_: false

Enabled table transaction logging.

```yaml
logging:
  auditLog: false
```

To access the audit logs, use the API operation `read_audit_log`. It will provide a history of the data, including original records and changes made, in a specified table.

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog"
}
```

`file` - _Type_: boolean; _Default_: true

Defines whether or not to log to a file.

```yaml
logging:
  file: true
```

`level` - _Type_: string; _Default_: error

Control the verbosity of logs.

```yaml
logging:
  level: error
```

There exists a log level hierarchy in order as `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `notify`. When the level is set to `trace` logs will be created for all possible levels. Whereas if the level is set to `fatal`, the only entries logged will be `fatal` and `notify`. The default value is `error`.

`root` - _Type_: string; _Default_: &lt;ROOTPATH>/log

The path where the log files will be written.

```yaml
logging:
  root: ~/hdb/log
```

`rotation`

Rotation provides the ability for a user to systematically rotate and archive the `hdb.log` file. To enable `interval` and/or `maxSize` must be set.

**_Note:_** `interval` and `maxSize` are approximates only. It is possible that the log file will exceed these values slightly before it is rotated.

```yaml
logging:
  rotation:
    enabled: true
    compress: false
    interval: 1D
    maxSize: 100K
    path: /user/hdb/log
```

<div style={{paddingLeft: '30px'}}>

`enabled` - _Type_: boolean; _Default_: false

Enables logging rotation.

`compress` - _Type_: boolean; _Default_: false

Enables compression via gzip when logs are rotated.

`interval` - _Type_: string; _Default_: null

The time that should elapse between rotations. Acceptable units are D(ays), H(ours) or M(inutes).

`maxSize` - _Type_: string; _Default_: null

The maximum size the log file can reach before it is rotated. Must use units M(egabyte), G(igabyte), or K(ilobyte).

`path` - _Type_: string; _Default_: &lt;ROOTPATH>/log

Where to store the rotated log file. File naming convention is `HDB-YYYY-MM-DDT-HH-MM-SSSZ.log`.

</div>

`stdStreams` - _Type_: boolean; _Default_: false

Log HarperDB logs to the standard output and error streams. The `operationsApi.foreground` flag must be enabled in order to receive the stream.

```yaml
logging:
  stdStreams: false
```

---

### `operationsApi`

The `operationsApi` section configures the HarperDB Operations API.

`authentication`

```yaml
operationsApi:
  authentication:
    operationTokenTimeout: 1d
    refreshTokenTimeout: 30d
```

<div style={{paddingLeft: '30px'}}>

`operationTokenTimeout` - _Type_: string; _Default_: 1d

Defines the length of time an operation token will be valid until it expires. Example values: [https://github.com/vercel/ms](https://github.com/vercel/ms).

`refreshTokenTimeout` - _Type_: string; _Default_: 1d

Defines the length of time a refresh token will be valid until it expires. Example values: [https://github.com/vercel/ms](https://github.com/vercel/ms).

</div>

`foreground` - _Type_: boolean; _Default_: false

Determines whether or not HarperDB runs in the foreground.

```yaml
operationsApi:
  foreground: false
```

`network`

```yaml
operationsApi:
  network:
    cors: true
    corsAccessList:
      - null
    headersTimeout: 60000
    https: false
    keepAliveTimeout: 5000
    port: 9925
    timeout: 120000
```

<div style={{paddingLeft: '30px'}}>

`cors` - _Type_: boolean; _Default_: true

Enable Cross Origin Resource Sharing, which allows requests across a domain.

`corsAccessList` - _Type_: array; _Default_: null

An array of allowable domains with CORS

`headersTimeout` - _Type_: integer; _Default_: 60,000 milliseconds (1 minute)

Limit the amount of time the parser will wait to receive the complete HTTP headers with.

`https` - _Type_: boolean; _Default_: false

Enable HTTPS on the HarperDB operations endpoint. This requires a valid certificate and key. If `false`, HarperDB will run using standard HTTP.

`keepAliveTimeout` - _Type_: integer; _Default_: 5,000 milliseconds (5 seconds)

Sets the number of milliseconds of inactivity the server needs to wait for additional incoming data after it has finished processing the last response.

`port` - _Type_: integer; _Default_: 9925

The port the HarperDB operations API interface will listen on.

`timeout` - _Type_: integer; _Default_: Defaults to 120,000 milliseconds (2 minutes)

The length of time in milliseconds after which a request will timeout.

</div>

`nodeEnv` - _Type_: string; _Default_: production

Allows you to specify the node environment in which application will run.

```yaml
operationsApi:
  nodeEnv: production
```

- `production` native node logging is kept to a minimum; more caching to optimize performance. This is the default value.
- `development` more native node logging; less caching.

`tls`

This configures the Transport Layer Security for HTTPS support.

```yaml
operationsApi:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
```

`certificate` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/certificate.pem

Path to the certificate file.

`certificateAuthority` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/ca.pem

Path to the certificate authority file.

`privateKey` - _Type_: string; _Default_: &lt;ROOTPATH>/keys/privateKey.pem

Path to the private key file.

---

### `http`

`threads` - _Type_: number; _Default_: One less than the number of logical cores/ processors

The `threads` option specifies the number of threads that will be used to service the HTTP requests for the operations API and custom functions. Generally, this should be close to the number of CPU logical cores/processors to ensure the CPU is fully utilized (a little less because HarperDB does have other threads at work), assuming HarperDB is the main service on a server.

```yaml
http:
  threads: 11
```

#### Session Affinity

`sessionAffinity` - _Type_: string; _Default_: null

HarperDB is a multi-threaded server designed to scale to utilize many CPU cores with high concurrency. Session affinity can help improve the efficiency and fairness of thread utilization by routing multiple requests from the same client to the same thread. This provides a fairer method of request handling by keeping a single user contained to a single thread, can improve caching locality (multiple requests from a single user are more likely to access the same data), and can provide the ability to share information in-memory in user sessions. Enabling session affinity will cause subsequent requests from the same client to be routed to the same thread.

To enable `sessionAffinity`, you need to specify how clients will be identified from the incoming requests. If you are using HarperDB to directly serve HTTP requests from users from different remote addresses, you can use a setting of `ip`. However, if you are using HarperDB behind a proxy server or application server, all the remote ip addresses will be the same and HarperDB will effectively only run on a single thread. Alternately, you can specify a header to use for identification. If you are using basic authentication, you could use the "Authorization" header to route requests to threads by the user's credentials. If you have another header that uniquely identifies users/clients, you can use that as the value of sessionAffinity. But be careful to ensure that the value does provide sufficient uniqueness and that requests are effectively distributed to all the threads and fully utilizing all your CPU cores.

```yaml
http:
  sessionAffinity: ip
```

---

### `rootPath`

`rootPath` - _Type_: string; _Default_: home directory of the current user

The HarperDB database and applications/API/interface are decoupled from each other. The `rootPath` directory specifies where the HarperDB application persists data, config, logs, and Custom Functions.

```yaml
rootPath: /Users/jonsnow/hdb
```

---

### `storage`

`writeAsync` - _Type_: boolean; _Default_: false

The `writeAsync` option turns off disk flushing/syncing, allowing for faster write operation throughput. However, this does not provide storage integrity guarantees, and if a server crashes, it is possible that there may be data loss requiring restore from another backup/another node.

```yaml
storage:
  writeAsync: false
```

`caching` - _Type_: boolean; _Default_: true

The `caching` option enables in-memory caching of records, providing faster access to frequently accessed objects. This can incur some extra overhead for situations where reads are extremely random and don't benefit from caching.

```yaml
storage:
  caching: true
```

`compression` - _Type_: boolean; _Default_: false

The `compression` option enables compression of records in the database. This can be helpful for very large databases in reducing storage requirements and potentially allowing more data to be cached. This uses the very fast LZ4 compression algorithm, but this still incurs extra costs for compressing and decompressing.

```yaml
storage:
  compression: false
```

`noReadAhead` - _Type_: boolean; _Default_: true

The `noReadAhead` option advises the operating system to not read ahead when reading from the database. This provides better memory utilization, except in situations where large records are used or frequent range queries are used.

```yaml
storage:
  noReadAhead: true
```

`prefetchWrites` - _Type_: boolean; _Default_: true

The `prefetchWrites` option loads data prior to write transactions. This should be enabled for databases that are larger than memory (although it can be faster to disable this for smaller databases).

```yaml
storage:
  prefetchWrites: true
```

`path` - _Type_: string; _Default_: `<rootPath>/schema`

The `path` configuration sets where all database files should reside.

```yaml
storage:
  path: /users/harperdb/storage
```

**_Note:_** This configuration applies to all database files, which includes system tables that are used internally by HarperDB. For this reason if you wish to use a non default `path` value you must move any existing schemas into your `path` location. Existing schemas is likely to include the system schema which can be found at `<rootPath>/schema/system`.

---

### `schemas`

The `schemas` section is an optional configuration that can be used to define where database files should reside down to the table level.
<br/><br/>This configuration should be set before the schema and table have been created.
<br/><br/>The configuration will not create the directories in the path, that must be done by the user.
<br/>

To define where a schema and all its tables should reside use the name of your schema and the `path` parameter.

```yaml
schemas:
  nameOfSchema:
    path: /path/to/schema
```

To define where specific tables within a schema should reside use the name of your schema, the `tables` parameter, the name of your table and the `path` parameter.

```yaml
schemas:
  nameOfSchema:
    tables:
      nameOfTable:
        path: /path/to/table
```

This same pattern can be used to define where the audit log database files should reside. To do this use the `auditPath` parameter.

```yaml
schemas:
  nameOfSchema:
    auditPath: /path/to/schema
```

<br/>

**Setting the schemas section through the command line, environment variables or API**

When using command line variables,environment variables or the API to configure the schemas section a slightly different convention from the regular one should be used. To add one or more configurations use a JSON object array.

Using command line variables:

```bash
--SCHEMAS [{\"nameOfSchema\":{\"tables\":{\"nameOfTable\":{\"path\":\"\/path\/to\/table\"}}}}]
```

Using environment variables:

```bash
SCHEMAS=[{"nameOfSchema":{"tables":{"nameOfTable":{"path":"/path/to/table"}}}}]
```

Using the API:

```json
{
	"operation": "set_configuration",
	"schemas": [
		{
			"nameOfSchema": {
				"tables": {
					"nameOfTable": {
						"path": "/path/to/table"
					}
				}
			}
		}
	]
}
```
