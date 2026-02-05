---
title: Configuration File
---

# Configuration File

Harper is configured through a [YAML](https://yaml.org/) file called `harperdb-config.yaml` located in the Harper root directory (by default this is a directory named `hdb` located in the home directory of the current user).

Some configuration will be populated by default in the config file on install, regardless of whether it is used.

---

## Using the Configuration File and Naming Conventions

The configuration elements in `harperdb-config.yaml` use camelcase, such as `operationsApi`.

To change a configuration value, edit the `harperdb-config.yaml` file and save any changes. **HarperDB must be restarted for changes to take effect.**

Alternatively, all configuration values can also be modified using environment variables, command line arguments, or the operations API via the [`set_configuration` operation](../developers/operations-api/utilities#set-configuration).

For nested configuration elements, use underscores to represent parent-child relationships. When accessed this way, elements are case-insensitive.

For example, to disable logging rotation in the `logging` section:

```yaml
logging:
  rotation:
    enabled: false
```

You could apply this change using:

- Environment variable: `LOGGING_ROTATION_ENABLED=false`
- Command line variable: `--LOGGING_ROTATION_ENABLED false`
- Operations API (`set_configuration`): `logging_rotation_enabled: false`

To change the `port` in the `http` section, use:

- Environment variable: `HTTP_PORT=<port>`
- Command line variable: `--HTTP_PORT <port>`
- Operations API (`set_configuration`): `http_port: <port>`

To set the `operationsApi.network.port` to `9925`, use:

- Environment variable: `OPERATIONSAPI_NETWORK_PORT=9925`
- Command line variable: `--OPERATIONSAPI_NETWORK_PORT 9925`
- Operations API (`set_configuration`): `operationsApi_network_port: 9925`

_Note: Component configuration cannot be added or updated via CLI or ENV variables._

## Importing installation configuration

To use a custom configuration file to set values on install, use the CLI/ENV variable `HDB_CONFIG` and set it to the path of your custom configuration file.

To install Harper overtop of an existing configuration file, set `HDB_CONFIG` to the root path of your install `<ROOTPATH>/harperdb-config.yaml`

---

## Configuration Options

### `http`

`sessionAffinity` - _Type_: string; _Default_: null

Harper is a multi-threaded server designed to scale to utilize many CPU cores with high concurrency. Session affinity can help improve the efficiency and fairness of thread utilization by routing multiple requests from the same client to the same thread. This provides a fairer method of request handling by keeping a single user contained to a single thread, can improve caching locality (multiple requests from a single user are more likely to access the same data), and can provide the ability to share information in-memory in user sessions. Enabling session affinity will cause subsequent requests from the same client to be routed to the same thread.

To enable `sessionAffinity`, you need to specify how clients will be identified from the incoming requests. If you are using Harper to directly serve HTTP requests from users from different remote addresses, you can use a setting of `ip`. However, if you are using Harper behind a proxy server or application server, all the remote ip addresses will be the same and Harper will effectively only run on a single thread. Alternately, you can specify a header to use for identification. If you are using basic authentication, you could use the "Authorization" header to route requests to threads by the user's credentials. If you have another header that uniquely identifies users/clients, you can use that as the value of sessionAffinity. But be careful to ensure that the value does provide sufficient uniqueness and that requests are effectively distributed to all the threads and fully utilizing all your CPU cores.

```yaml
http:
  sessionAffinity: ip
```

`compressionThreshold` - _Type_: number; _Default_: 1200 (bytes)

For HTTP clients that support (Brotli) compression encoding, responses that are larger than this threshold will be compressed (also note that for clients that accept compression, any streaming responses from queries are compressed as well, since the size is not known beforehand).

```yaml
http:
  compressionThreshold: 1200
```

`cors` - _Type_: boolean; _Default_: true

Enable Cross Origin Resource Sharing, which allows requests across a domain.

`corsAccessList` - _Type_: array; _Default_: null

An array of allowable domains with CORS

`corsAccessControlAllowHeaders` - _Type_: string; _Default_: 'Accept, Content-Type, Authorization'

A string representation of a comma separated list of header keys for the [Access-Control-Allow-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers) header for OPTIONS requests.

`headersTimeout` - _Type_: integer; _Default_: 60,000 milliseconds (1 minute)

Limit the amount of time the parser will wait to receive the complete HTTP headers with.

`maxHeaderSize` - _Type_: integer; _Default_: 16394

The maximum allowed size of HTTP headers in bytes.

`requestQueueLimit` - _Type_: integer; _Default_: 20000

The maximum estimated request queue time, in milliseconds. When the queue is above this limit, requests will be rejected with a 503.

`keepAliveTimeout` - _Type_: integer; _Default_: 30,000 milliseconds (30 seconds)

Sets the number of milliseconds of inactivity the server needs to wait for additional incoming data after it has finished processing the last response.

`port` - _Type_: integer; _Default_: 9926

The port used to access the component server.

`securePort` - _Type_: integer; _Default_: null

The port the Harper component server uses for HTTPS connections. This requires a valid certificate and key.

`http2` - _Type_: boolean; _Default_: false

Enables HTTP/2 for the HTTP server.

`timeout` - _Type_: integer; _Default_: Defaults to 120,000 milliseconds (2 minutes)

The length of time in milliseconds after which a request will timeout.

```yaml
http:
  cors: true
  corsAccessList:
    - null
  headersTimeout: 60000
  maxHeaderSize: 8192
  https: false
  keepAliveTimeout: 30000
  port: 9926
  securePort: null
  timeout: 120000
```

`mlts` - _Type_: boolean | object; _Default_: false

This can be configured to enable mTLS based authentication for incoming connections. If enabled with default options (by setting to `true`), the client certificate will be checked against the certificate authority specified with `tls.certificateAuthority`. And if the certificate can be properly verified, the connection will authenticate users where the user's id/username is specified by the `CN` (common name) from the client certificate's `subject`, by default.

You can also define specific mTLS options by specifying an object for mtls with the following (optional) properties which may be included:

`user` - _Type_: string; _Default_: Common Name

This configures a specific username to authenticate as for mTLS connections. If a `user` is defined, any authorized mTLS connection (that authorizes against the certificate authority) will be authenticated as this user. This can also be set to `null`, which indicates that no authentication is performed based on the mTLS authorization. When combined with `required: true`, this can be used to enforce that users must have authorized mTLS _and_ provide credential-based authentication.

`required` - _Type_: boolean; _Default_: false

This can be enabled to require client certificates (mTLS) for all incoming MQTT connections. If enabled, any connection that doesn't provide an authorized certificate will be rejected/closed. By default, this is disabled, and authentication can take place with mTLS _or_ standard credential authentication.

```yaml
http:
  mtls: true
```

or

```yaml
http:
  mtls:
    required: true
    user: user-name
```

---

### `threads`

The `threads` provides control over how many threads, how much heap memory they may use, and debugging of the threads:

`count` - _Type_: number; _Default_: One less than the number of logical cores/processors

The `threads.count` option specifies the number of threads that will be used to service the HTTP requests for the operations API and custom functions. Generally, this should be close to the number of CPU logical cores/processors to ensure the CPU is fully utilized (a little less because Harper does have other threads at work), assuming Harper is the main service on a server.

```yaml
threads:
  count: 11
```

`debug` - _Type_: boolean | object; _Default_: false

This enables debugging. If simply set to true, this will enable debugging on the main thread on port 9229 with the 127.0.0.1 host interface. This can also be an object for more debugging control.

`debug.port` - The port to use for debugging the main thread `debug.startingPort` - This will set up a separate port for debugging each thread. This is necessary for debugging individual threads with devtools. `debug.host` - Specify the host interface to listen on `debug.waitForDebugger` - Wait for debugger before starting

```yaml
threads:
  debug:
    port: 9249
```

`maxHeapMemory` - _Type_: number;

```yaml
threads:
  maxHeapMemory: 300
```

This specifies the heap memory limit for each thread, in megabytes. The default heap limit is a heuristic based on available memory and thread count.

---

### `replication`

The `replication` section configures [Harper replication](../developers/replication/), which is used to create Harper clusters and replicate data between the instances.

```yaml
replication:
  hostname: server-one
  url: wss://server-one:9925
  databases: '*'
  routes:
    - wss://server-two:9925
  port: null
  securePort: 9933,
  enableRootCAs: true
```

`hostname` - _Type_: string;

The hostname of the current Harper instance.

`url` - _Type_: string;

The URL of the current Harper instance.

`databases` - _Type_: string/array; _Default_: "\*" (all databases)

Configure which databases to replicate. This can be a string for all database or an array for specific databases. The list can be a simple array of database names:

```yaml
replication:
  databases:
    - system
    - data
    - mydb
```

The database list can also specify databases that are purely "sharded" databases. For databases that are marked as sharded, replication will _only_ create database subscription connections to nodes in the same shard. Sharding can still function without this setting, since the residency location for sharding can be determined for each table or each record. However, using this setting will reduce the overhead of connections in situations where all data is uniformly sharded, creating a simpler and more efficient replication topology. To mark databases as sharded, you can specify a list of databases with a `name` and `sharded` flag:

```yaml
replication:
  databases:
    - name: system
    - name: data
      sharded: true
```

`routes` - _Type_: array;

An array of routes to connect to other nodes. Each element in the array can be either a string or an object with `hostname`, `port` and optionally `startTime` properties.

`startTime` - _Type_: string; ISO formatted UTC date string.

Replication will attempt to catch up on all remote data upon setup. To start replication from a specific date, set this property.

`revokedCertificates` - _Type_: array;

An array of serial numbers of revoked certificates. If a connection is attempted with a certificate that is in this list, the connection will be rejected.

```yaml
replication:
  hostname: server-one
  routes:
    - wss://server-two:9925 # URL based route
    - hostname: server-three # define a hostname and port
      port: 9930
      startTime: 2024-02-06T15:30:00Z
      revokedCertificates:
        - 1769F7D6A
        - QA69C7E2S
```

`port` - _Type_: integer;

The port to use for replication connections.

`securePort` - _Type_: integer; _Default_: 9933

The port to use for secure replication connections.

`enableRootCAs` - _Type_: boolean; _Default_: true

When true, Harper will verify certificates against the Node.js bundled CA store. The bundled CA store is a snapshot of the Mozilla CA store that is fixed at release time.

`blobTimeout` - _Type_: number; _Default_: 120000

Amount of time to wait for a blob to be transferred before timing out, measured in milliseconds.

`failOver` - _Type_: boolean; _Default_: true

When true, Harper will attempt to fail-over to subscribing to a different node if the current node is unreachable, to reach consistency.

`shard` - _Type_: integer;

This defines the shard id of this instance and is used in conjunction with the [Table Resource functions](../developers/replication/sharding#custom-sharding) `setResidency` & `setResidencyById` to programmatically route traffic to the proper shard.

---

### `clustering` using NATS

The `clustering` section configures the NATS clustering engine, this is used to replicate data between instances of Harper.

_Note: There exist two ways to create clusters and replicate data in Harper. One option is to use native Harper replication over Websockets. The other option is to use_ [_NATS_](https://nats.io/about/) _to facilitate the cluster._

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

Clustering’s `hubServer` facilitates the Harper mesh network and discovery service.

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

`port` - _Type_: integer, _Default_: 9932

The port the hub server uses to accept cluster connections

`routes` - _Type_: array, _Default_: null

An object array that represent the host and port this server will cluster to. Each object must have two properties `port` and `host`. Multiple entries can be added to create network resiliency in the event one server is unavailable. Routes can be added, updated and removed either by directly editing the `harperdb-config.yaml` file or by using the `cluster_set_routes` or `cluster_delete_routes` API endpoints.

`host` - _Type_: string

The host of the remote instance you are creating the connection with.

`port` - _Type_: integer

The port of the remote instance you are creating the connection with. This is likely going to be the `clustering.hubServer.cluster.network.port` on the remote instance.

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

`host` - _Type_: string

The host of the remote instance you are creating the connection with.

`port` - _Type_: integer

The port of the remote instance you are creating the connection with. This is likely going to be the `clustering.hubServer.cluster.network.port` on the remote instance.

`clustering.leafServer.streams`

`maxAge` - _Type_: integer; _Default_: null

The maximum age of any messages in the stream, expressed in seconds.

`maxBytes` - _Type_: integer; _Default_: null

The maximum size of the stream in bytes. Oldest messages are removed if the stream exceeds this size.

`maxMsgs` - _Type_: integer; _Default_: null

How many messages may be in a stream. Oldest messages are removed if the stream exceeds this number.

`path` - _Type_: string; _Default_: \<ROOTPATH>/clustering/leaf

The directory where all the streams are kept.

```yaml
clustering:
  leafServer:
    streams:
      maxConsumeMsgs: 100
      maxIngestThreads: 2
```

`maxConsumeMsgs` - _Type_: integer; _Default_: 100

The maximum number of messages a consumer can process in one go.

`maxIngestThreads` - _Type_: integer; _Default_: 2

The number of Harper threads that are delegated to ingesting messages.

---

`logLevel` - _Type_: string; _Default_: error

Control the verbosity of clustering logs.

```yaml
clustering:
  logLevel: error
```

There exists a log level hierarchy in order as `trace`, `debug`, `info`, `warn`, and `error`. When the level is set to `trace` logs will be created for all possible levels. Whereas if the level is set to `warn`, the only entries logged will be `warn` and `error`. The default value is `error`.

`nodeName` - _Type_: string; _Default_: null

The name of this node in your Harper cluster topology. This must be a value unique from the rest of the cluster node names.

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

`certificate` - _Type_: string; _Default_: \<ROOTPATH>/keys/certificate.pem

Path to the certificate file.

`certificateAuthority` - _Type_: string; _Default_: \<ROOTPATH>/keys/ca.pem

Path to the certificate authority file.

`privateKey` - _Type_: string; _Default_: \<ROOTPATH>/keys/privateKey.pem

Path to the private key file.

`insecure` - _Type_: boolean; _Default_: true

When true, will skip certificate verification. For use only with self-signed certs.

`republishMessages` - _Type_: boolean; _Default_: false

When true, all transactions that are received from other nodes are republished to this node's stream. When subscriptions are not fully connected between all nodes, this ensures that messages are routed to all nodes through intermediate nodes. This also ensures that all writes, whether local or remote, are written to the NATS transaction log. However, there is additional overhead with republishing, and setting this is to false can provide better data replication performance. When false, you need to ensure all subscriptions are fully connected between every node to every other node, and be aware that the NATS transaction log will only consist of local writes.

`verify` - _Type_: boolean; _Default_: true

When true, hub server will verify client certificate using the CA certificate.

---

`user` - _Type_: string; _Default_: null

The username given to the `cluster_user`. All instances in a cluster must use the same clustering user credentials (matching username and password).

Inter-node authentication takes place via a special Harper user role type called `cluster_user`.

The user can be created either through the API using an `add_user` request with the role set to `cluster_user`, or on install using environment variables `CLUSTERING_USER=cluster_person` `CLUSTERING_PASSWORD=pass123!` or CLI variables `harperdb --CLUSTERING_USER cluster_person` `--CLUSTERING_PASSWORD` `pass123!`

```yaml
clustering:
  user: cluster_person
```

---

### `localStudio`

The `localStudio` section configures the local Harper Studio, a GUI for Harper hosted on the server. A hosted version of the Harper Studio with licensing and provisioning options is available at [https://studio.harperdb.io](https://studio.harperdb.io). Note, all database traffic from either `localStudio` or Harper Studio is made directly from your browser to the instance.

`enabled` - _Type_: boolean; _Default_: false

Enabled the local studio or not.

```yaml
localStudio:
  enabled: false
```

---

### `logging`

The `logging` section configures Harper logging across all Harper functionality. This includes standard text logging of application and database events as well as structured data logs of record changes. Logging of application/database events are logged in text format to the `~/hdb/log/hdb.log` file (or location specified by `logging.root`).

In addition, structured logging of data changes are also available:

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

Defines whether to log to a file.

```yaml
logging:
  file: true
```

`auditRetention` - _Type_: string|number; _Default_: 3d

This specifies how long audit logs should be retained.

`level` - _Type_: string; _Default_: warn

Control the verbosity of text event logs.

```yaml
logging:
  level: warn
```

There exists a log level hierarchy in order as `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `notify`. When the level is set to `trace` logs will be created for all possible levels. Whereas if the level is set to `fatal`, the only entries logged will be `fatal` and `notify`. The default value is `error`.

`console` - _Type_: boolean; _Default_: true

Controls whether console.log and other console.\* calls (as well as another JS components that writes to `process.stdout` and `process.stderr`) are logged to the log file. By default, these are logged to the log file, but this can be disabled.

```yaml
logging:
  console: true
```

`root` - _Type_: string; _Default_: \<ROOTPATH>/log

The path where the log files will be written.

```yaml
logging:
  root: ~/hdb/log
```

`rotation`

Rotation provides the ability for a user to systematically rotate and archive the `hdb.log` file. To enable `interval` and/or `maxSize` must be set.

_**Note:**_ `interval` and `maxSize` are approximates only. It is possible that the log file will exceed these values slightly before it is rotated.

```yaml
logging:
  rotation:
    enabled: true
    compress: false
    interval: 1D
    maxSize: 100K
    path: /user/hdb/log
```

`enabled` - _Type_: boolean; _Default_: true

Enables logging rotation.

`compress` - _Type_: boolean; _Default_: false

Enables compression via gzip when logs are rotated.

`interval` - _Type_: string; _Default_: null

The time that should elapse between rotations. Acceptable units are D(ays), H(ours) or M(inutes).

`maxSize` - _Type_: string; _Default_: null

The maximum size the log file can reach before it is rotated. Must use units M(egabyte), G(igabyte), or K(ilobyte).

`path` - _Type_: string; _Default_: \<ROOTPATH>/log

Where to store the rotated log file. File naming convention is `HDB-YYYY-MM-DDT-HH-MM-SSSZ.log`.

`stdStreams` - _Type_: boolean; _Default_: false

Log Harper logs to the standard output and error streams.

```yaml
logging:
  stdStreams: false
```

`auditAuthEvents`

`logFailed` - _Type_: boolean; _Default_: false

Log all failed authentication events.

_Example:_ `[error] [auth-event]: {"username":"admin","status":"failure","type":"authentication","originating_ip":"127.0.0.1","request_method":"POST","path":"/","auth_strategy":"Basic"}`

`logSuccessful` - _Type_: boolean; _Default_: false

Log all successful authentication events.

_Example:_ `[notify] [auth-event]: {"username":"admin","status":"success","type":"authentication","originating_ip":"127.0.0.1","request_method":"POST","path":"/","auth_strategy":"Basic"}`

```yaml
logging:
  auditAuthEvents:
    logFailed: false
    logSuccessful: false
```

---

### `authentication`

The authentication section defines the configuration for the default authentication mechanism in Harper.

```yaml
authentication:
  authorizeLocal: true
  cacheTTL: 30000
  enableSessions: true
  operationTokenTimeout: 1d
  refreshTokenTimeout: 30d
```

`authorizeLocal` - _Type_: boolean; _Default_: true

This will automatically authorize any requests from the loopback IP address as the superuser. This should be disabled for any Harper servers that may be accessed by untrusted users from the same instance. For example, this should be disabled if you are using a local proxy, or for general server hardening.

`cacheTTL` - _Type_: number; _Default_: 30000

This defines the length of time (in milliseconds) that an authentication (a particular Authorization header or token) can be cached.

`enableSessions` - _Type_: boolean; _Default_: true

This will enable cookie-based sessions to maintain an authenticated session. This is generally the preferred mechanism for maintaining authentication in web browsers as it allows cookies to hold an authentication token securely without giving JavaScript code access to token/credentials that may open up XSS vulnerabilities.

`operationTokenTimeout` - _Type_: string; _Default_: 1d

Defines the length of time an operation token will be valid until it expires. Example values: [https://github.com/vercel/ms](https://github.com/vercel/ms).

`refreshTokenTimeout` - _Type_: string; _Default_: 1d

Defines the length of time a refresh token will be valid until it expires. Example values: [https://github.com/vercel/ms](https://github.com/vercel/ms).

### `operationsApi`

The `operationsApi` section configures the Harper Operations API.\
All the `operationsApi` configuration is optional. Any configuration that is not provided under this section will default to the `http` configuration section.

`network`

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

`cors` - _Type_: boolean; _Default_: true

Enable Cross Origin Resource Sharing, which allows requests across a domain.

`corsAccessList` - _Type_: array; _Default_: null

An array of allowable domains with CORS

`domainSocket` - _Type_: string; _Default_: \<ROOTPATH>/hdb/operations-server

The path to the Unix domain socket used to provide the Operations API through the CLI

`headersTimeout` - _Type_: integer; _Default_: 60,000 milliseconds (1 minute)

Limit the amount of time the parser will wait to receive the complete HTTP headers with.

`keepAliveTimeout` - _Type_: integer; _Default_: 5,000 milliseconds (5 seconds)

Sets the number of milliseconds of inactivity the server needs to wait for additional incoming data after it has finished processing the last response.

`port` - _Type_: integer; _Default_: 9925

The port the Harper operations API interface will listen on.

`securePort` - _Type_: integer; _Default_: null

The port the Harper operations API uses for HTTPS connections. This requires a valid certificate and key.

`timeout` - _Type_: integer; _Default_: Defaults to 120,000 milliseconds (2 minutes)

The length of time in milliseconds after which a request will timeout.

`tls`

This configures the Transport Layer Security for HTTPS support.

```yaml
operationsApi:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
```

`certificate` - _Type_: string; _Default_: \<ROOTPATH>/keys/certificate.pem

Path to the certificate file.

`certificateAuthority` - _Type_: string; _Default_: \<ROOTPATH>/keys/ca.pem

Path to the certificate authority file.

`privateKey` - _Type_: string; _Default_: \<ROOTPATH>/keys/privateKey.pem

Path to the private key file.

---

### `componentsRoot`

`componentsRoot` - _Type_: string; _Default_: \<ROOTPATH>/components

The path to the folder containing the local component files.

```yaml
componentsRoot: ~/hdb/components
```

---

### `rootPath`

`rootPath` - _Type_: string; _Default_: home directory of the current user

The Harper database and applications/API/interface are decoupled from each other. The `rootPath` directory specifies where the Harper application persists data, config, logs, and Custom Functions.

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

`compression` - _Type_: boolean; _Default_: true

The `compression` option enables compression of records in the database. This can be helpful for very large records in reducing storage requirements and potentially allowing more data to be cached. This uses the very fast LZ4 compression algorithm, but this still incurs extra costs for compressing and decompressing.

```yaml
storage:
  compression: false
```

`compression.dictionary` _Type_: number; _Default_: null

Path to a compression dictionary file

`compression.threshold` _Type_: number; _Default_: Either `4036` or if `storage.pageSize` provided `storage.pageSize - 60`

Only entries that are larger than this value (in bytes) will be compressed.

```yaml
storage:
  compression:
    dictionary: /users/harperdb/dict.txt
    threshold: 1000
```

`compactOnStart` - _Type_: boolean; _Default_: false

When `true` all non-system databases will be compacted when starting Harper, read more [here](../administration/compact).

`compactOnStartKeepBackup` - _Type_: boolean; _Default_: false

Keep the backups made by compactOnStart.

```yaml
storage:
  compactOnStart: true
  compactOnStartKeepBackup: false
```

`maxTransactionQueueTime` - _Type_: time; _Default_: 45s

The `maxTransactionQueueTime` specifies how long the write queue can get before write requests are rejected (with a 503).

```yaml
storage:
  maxTransactionQueueTime: 2m
```

`noReadAhead` - _Type_: boolean; _Default_: false

The `noReadAhead` option advises the operating system to not read ahead when reading from the database. This provides better memory utilization for databases with small records (less than one page), but can degrade performance in situations where large records are used or frequent range queries are used.

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

`path` - _Type_: string; _Default_: `<rootPath>/database`

The `path` configuration sets where all database files should reside.

```yaml
storage:
  path: /users/harperdb/storage
```

_**Note:**_ This configuration applies to all database files, which includes system tables that are used internally by Harper. For this reason if you wish to use a non default `path` value you must move any existing schemas into your `path` location. Existing schemas is likely to include the system schema which can be found at `<rootPath>/schema/system`.

`blobPaths` - _Type_: string; _Default_: `<rootPath>/blobs`

The `blobPaths` configuration sets where all the blob files should reside. This can be an array of paths, and if there are multiple, the blobs will be distributed across the paths.

```yaml
storage:
  blobPaths:
    - /users/harperdb/big-storage
```

`pageSize` - _Type_: number; _Default_: Defaults to the default page size of the OS

Defines the page size of the database.

```yaml
storage:
  pageSize: 4096
```

`reclamation`

The reclamation section provides configuration for the reclamation process, which is responsible for reclaiming space when free space is low. For example:

```yaml
storage:
  reclamation:
    threshold: 0.4 # Start storage reclamation efforts when free space has reached 40% of the volume space (default)
    interval: 1h # Reclamation will run every hour (default)
    evictionFactor: 100000 # A factor used to determine how much aggressively to evict cached entries (default)
```

---

### `tls`

The section defines the certificates, keys, and settings for Transport Layer Security (TLS) for HTTPS and TLS socket support. This is used for both the HTTP and MQTT protocols. The `tls` section can be a single object with the settings below, or it can be an array of objects, where each object is a separate TLS configuration. By using an array, the TLS configuration can be used to define multiple certificates for different domains/hosts (negotiated through SNI).

```yaml
tls:
  certificate: ~/hdb/keys/certificate.pem
  certificateAuthority: ~/hdb/keys/ca.pem
  privateKey: ~/hdb/keys/privateKey.pem
```

`certificate` - _Type_: string; _Default_: \<ROOTPATH>/keys/certificate.pem

Path to the certificate file.

`certificateAuthority` - _Type_: string; _Default_: \<ROOTPATH>/keys/ca.pem

Path to the certificate authority file.

`privateKey` - _Type_: string; _Default_: \<ROOTPATH>/keys/privateKey.pem

Path to the private key file.

`ciphers` - _Type_: string;

Allows specific ciphers to be set.

If you want to define multiple certificates that are applied based on the domain/host requested via SNI, you can define an array of TLS configurations. Each configuration can have the same properties as the root TLS configuration, but can (optionally) also have an additional `host` property to specify the domain/host that the certificate should be used for:

```yaml
tls:
  - certificate: ~/hdb/keys/certificate1.pem
    certificateAuthority: ~/hdb/keys/ca1.pem
    privateKey: ~/hdb/keys/privateKey1.pem
    host: example.com # the host is optional, and if not provided, this certificate's common name will be used as the host name.
  - certificate: ~/hdb/keys/certificate2.pem
    certificateAuthority: ~/hdb/keys/ca2.pem
    privateKey: ~/hdb/keys/privateKey2.pem
```

Note that a `tls` section can also be defined in the `operationsApi` section, which will override the root `tls` section for the operations API.

---

### `mqtt`

The MQTT protocol can be configured in this section.

```yaml
mqtt:
  network:
    port: 1883
    securePort: 8883
    mtls: false
  webSocket: true
  requireAuthentication: true
```

`port` - _Type_: number; _Default_: 1883

This is the port to use for listening for insecure MQTT connections.

`securePort` - _Type_: number; _Default_: 8883

This is the port to use for listening for secure MQTT connections. This will use the `tls` configuration for certificates.

`webSocket` - _Type_: boolean; _Default_: true

This enables access to MQTT through WebSockets. This will handle WebSocket connections on the http port (defaults to 9926), that have specified a (sub) protocol of `mqtt`.

`requireAuthentication` - _Type_: boolean; _Default_: true

This indicates if authentication should be required for establishing an MQTT connection (whether through MQTT connection credentials or mTLS). Disabling this allows unauthenticated connections, which are then subject to authorization for publishing and subscribing (and by default tables/resources do not authorize such access, but that can be enabled at the resource level).

`mlts` - _Type_: boolean | object; _Default_: false

This can be configured to enable mTLS based authentication for incoming connections. If enabled with default options (by setting to `true`), the client certificate will be checked against the certificate authority specified in the `tls` section. And if the certificate can be properly verified, the connection will authenticate users where the user's id/username is specified by the `CN` (common name) from the client certificate's `subject`, by default.

You can also define specific mTLS options by specifying an object for mtls with the following (optional) properties which may be included:

`user` - _Type_: string; _Default_: Common Name

This configures a specific username to authenticate as for mTLS connections. If a `user` is defined, any authorized mTLS connection (that authorizes against the certificate authority) will be authenticated as this user. This can also be set to `null`, which indicates that no authentication is performed based on the mTLS authorization. When combined with `required: true`, this can be used to enforce that users must have authorized mTLS _and_ provide credential-based authentication.

`required` - _Type_: boolean; _Default_: false

This can be enabled to require client certificates (mTLS) for all incoming MQTT connections. If enabled, any connection that doesn't provide an authorized certificate will be rejected/closed. By default, this is disabled, and authentication can take place with mTLS _or_ standard credential authentication.

`certificateAuthority` - _Type_: string; _Default_: Path from `tls.certificateAuthority`

This can define a specific path to use for the certificate authority. By default, certificate authorization checks against the CA specified at `tls.certificateAuthority`, but if you need a specific/distinct CA for MQTT, you can set this.

For example, you could specify that mTLS is required and will authenticate as "user-name":

```yaml
mqtt:
  network:
    mtls:
      user: user-name
      required: true
```

---

### `databases`

The `databases` section is an optional configuration that can be used to define where database files should reside down to the table level. This configuration should be set before the database and table have been created. The configuration will not create the directories in the path, that must be done by the user.

To define where a database and all its tables should reside use the name of your database and the `path` parameter.

```yaml
databases:
  nameOfDatabase:
    path: /path/to/database
```

To define where specific tables within a database should reside use the name of your database, the `tables` parameter, the name of your table and the `path` parameter.

```yaml
databases:
  nameOfDatabase:
    tables:
      nameOfTable:
        path: /path/to/table
```

This same pattern can be used to define where the audit log database files should reside. To do this use the `auditPath` parameter.

```yaml
databases:
  nameOfDatabase:
    auditPath: /path/to/database
```

**Setting the database section through the command line, environment variables or API**

When using command line variables,environment variables or the API to configure the databases section a slightly different convention from the regular one should be used. To add one or more configurations use a JSON object array.

Using command line variables:

```bash
--DATABASES [{\"nameOfSchema\":{\"tables\":{\"nameOfTable\":{\"path\":\"\/path\/to\/table\"}}}}]
```

Using environment variables:

```bash
DATABASES=[{"nameOfSchema":{"tables":{"nameOfTable":{"path":"/path/to/table"}}}}]
```

Using the API:

```json
{
	"operation": "set_configuration",
	"databases": [
		{
			"nameOfDatabase": {
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

---

### Components

`<name-of-component>` - _Type_: string

The name of the component. This will be used to name the folder where the component is installed and must be unique.

`package` - _Type_: string

A reference to your [component](../developers/components/managing#adding-components-to-root) package. This could be a remote git repo, a local folder/file or an NPM package. Harper will add this package to a package.json file and call `npm install` on it, so any reference that works with that paradigm will work here.

Read more about npm install [here](https://docs.npmjs.com/cli/v8/commands/npm-install)

`port` - _Type_: number _Default_: whatever is set in `http.port`

The port that your component should listen on. If no port is provided it will default to `http.port`

```yaml
<name-of-component>:
  package: 'HarperDB-Add-Ons/package-name'
  port: 4321
```
