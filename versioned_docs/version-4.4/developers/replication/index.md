---
title: Replication/Clustering
---

# Replication/Clustering

Harper’s replication system is designed to make distributed data replication fast and reliable across multiple nodes. This means you can easily build a distributed database that ensures high availability, disaster recovery, and data localization. The best part? It’s simple to set up, configure, and manage. You can easily add or remove nodes, choose which data to replicate, and monitor the system’s health without jumping through hoops.

### Replication Overview

Harper replication uses a peer-to-peer model where every node in your cluster can send and subscribe to data. Each node connects through WebSockets, allowing data to flow seamlessly in both directions. By default, Harper takes care of managing these connections and subscriptions, so you don’t have to worry about data consistency. The system is designed to maintain secure, reliable connections between nodes, ensuring that your data is always safe.

### Replication Configuration

To connect your nodes, you need to provide hostnames or URLs for the nodes to connect to each other. This can be done via configuration or through operations. To configure replication, you can specify connection information the `replication` section of the [harperdb-config.yaml](../../deployments/configuration). Here, you can specify the host name of the current node, and routes to connect to other nodes, for example:

```yaml
replication:
  hostname: server-one
  routes:
    - server-two
    - server-three
```

In this example, the current node is `server-one`, and it will connect to `server-two` and `server-three`. Routes to other nodes can also be configured with URLs or ports:

```yaml
replication:
  hostname: server-one
  routes:
    - wss://server-two:9925 # URL based route
    - hostname: server-three # define a hostname and port
      port: 9930
```

You can also use the [operations API](./operations-api/clustering) to dynamically add and remove nodes from the cluster. This is useful for adding new nodes to a running cluster or removing nodes that are no longer needed. For example (note this is the basic form, you would also need to provide the necessary credentials for the operation, see the section on securing connections for more details):

```json
{
	"operation": "add_node",
	"hostname": "server-two"
}
```

These operations will also dynamically generating certificates as needed, if there are no existing signed certificates, or if the existing certificates are not valid for the new node.

Harper will also automatically replicate node information to other nodes in a cluster ([gossip-style discovery](https://highscalability.com/gossip-protocol-explained/)). This means that you only need to connect to one node in an existing cluster, and Harper will automatically detect and connect to other nodes in the cluster (bidirectionally).

By default, Harper will replicate all the data in all the databases. You can configure which databases are replicated, and then override this behavior on a per-table basis. For example, you can indicate which databases should be replicated by default, here indicating you want to replicate the `data` and `system` databases:

```yaml
replication:
  databases:
    - data
    - system
```

By default, all tables within a replicated database will be replicated. Transactions are replicated atomically, which may involve data across multiple tables. However, you can also configure replication for individual tables, and disable and exclude replication for specific tables in a database by setting `replicate` to `false` in the table definition:

```graphql
type LocalTableForNode @table(replicate: false) {
	id: ID!
	name: String!
}
```

You can also control which nodes data is replicated to, and how many nodes data is replicated to. By default, Harper will replicate data to all nodes in the cluster, but you can control where data is replicated to with the [sharding configuration and APIs](replication/sharding).

By default replication will connect on the operations API network interface/port (9925 by default). You can configure the replication port in the `replication` section. For example, to change the replication port to 9930:

```yaml
replication:
  securePort: 9930
```

This will change the replication port to 9930 and the operations API port will be on a separate port, remaining on 9925.

### Securing Connections

Harper supports the highest levels of security through public key infrastructure based security and authorization. Depending on your security configuration, you can configure Harper in several different ways to build a connected cluster.

#### Provide your own certificates

If you want to secure your Harper connections with your own signed certificates, you can easily do so. Whether you have certificates from a public authority (like Let's Encrypt or Digicert) or a corporate certificate authority, you can use them to authenticate nodes securely. You can then allow nodes to authorize each other by checking the certificate against the standard list of root certificate authorities by enabling the `enableRootCAs` option in the config:

```
replication
  enableRootCAs: true
```

And then just make sure the certificate’s common name (CN) matches the node's hostname.

#### Setting Up Custom Certificates

There are two ways to configure Harper with your own certificates:

1. Use the `add_certificate` operation to upload them.
1. Or, specify the certificate paths directly in the `replication` section of the `harperdb-config.yaml` file.

If your certificate is signed by a trusted public authority, just provide the path to the certificate and private key. If you're using self-signed certificates or a private certificate authority, you’ll also need to provide the certificate authority (CA) details to complete the setup.\
\
Example configuration:

```yaml
tls:
  certificate: /path/to/certificate.pem
  certificateAuthority: /path/to/ca.pem
  privateKey: /path/to/privateKey.pem
```

With this in place, Harper will load the provided certificates into the certificate table and use these to secure and authenticate connections between nodes.

You have the option to skip providing a specific certificate authority (CA) and instead verify your certificate against the root certificates included in the bundled Mozilla CA store. This bundled CA store, provided by Node.js, is a snapshot of Mozilla's CA certificates that is fixed at the time of each Node.js release.

To enable the root certificates set `replication.enableRootCAs` to `true` in the `harperdb-config.yaml` file:

```yaml
replication:
  enableRootCAs: true
```

#### Cross-generated certificates

Harper can also generate its own certificates for secure connections. This is useful for setting up secure connections between nodes when no existing certificates are available, and can be used in development, testing, or production environments. Certificates will be automatically requested and signed between nodes to support a form of distributed certificate generation and signing. To establish secure connections between nodes using cross-generated certificates, you simply use the [`add_node` operation](./operations-api/clustering) over SSL, and specify the temporary authentication credentials to use for connecting and authorizing the certificate generation and signing. \
\
Example configuration:

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

When you connect to another node (e.g., `server-two`), Harper uses secure WebSockets and the provided credentials to establish the connection.

If you’re working with a fresh install, you’ll need to set `verify_tls` to `false` temporarily, so the self-signed certificate is accepted. Once the connection is made, Harper will automatically handle the certificate signing process:

- It creates a certificate signing request (CSR), sends it to `server-two`, which then signs it and returns the signed certificate along with the certificate authority (CA).
- The signed certificate is stored for future connections between the nodes, ensuring secure communication.

**Important:** Your credentials are not stored—they are discarded immediately after use.

You can also provide credentials in HTTP Authorization format (Basic auth, Token auth, or JWT). This is helpful for handling authentication with the required permissions to generate and sign certificates.

Additionally, you can use `set_node` as an alias for the `add_node` operation if you prefer.

#### Removing Nodes

Nodes can be removed from the cluster using the [`remove_node` operation](./operations-api/clustering). This will remove the node from the cluster, and stop replication to and from the node. For example:

```json
{
	"operation": "remove_node",
	"hostname": "server-two"
}
```

#### Insecure Connection IP-based Authentication

You can completely disable secure connections and use IP addresses to authenticate nodes with each other. This can be useful for development and testing, or within a secure private network, but should never be used for production with publicly accessible servers. To disable secure connections, simply configure replication within an insecure port, either by [configuring the operations API](../../deployments/configuration) to run on an insecure port or replication to run on an insecure port. And then set up IP-based routes to connect to other nodes:

```yaml
replication:
  port: 9930
  routes:
    - 127.0.0.2
    - 127.0.0.3
```

Note that in this example, we are using loop back addresses, which can be a convenient way to run multiple nodes on a single machine for testing and development.

#### Explicit Subscriptions

#### Managing Node Connections and Subscriptions in Harper

By default, Harper automatically handles connections and subscriptions between nodes, ensuring data consistency across your cluster. It even uses data routing to manage node failures. But if you want more control, you can manage these connections manually by explicitly subscribing to nodes. This is useful for advanced configurations, testing, or debugging.

#### Important Notes on Explicit Subscriptions

If you choose to manage subscriptions manually, Harper will no longer handle data consistency for you. This means there’s no guarantee that all nodes will have consistent data if subscriptions don’t fully replicate in all directions. If a node goes down, it’s possible that some data wasn’t replicated before the failure.

#### How to Subscribe to Nodes

To explicitly subscribe to a node, you can use operations like `add_node` and define the subscriptions. For example, you can configure a node (e.g., `server-two`) to publish transactions on a specific table (e.g., `dev.my-table`) without receiving data from that node.

Example configuration:

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

To update an explicit subscription you can use the [`update_node` operation](./operations-api/clustering).

Here we are updating the subscription to receive transactions on the `dev.my-table` table from the `server-two` node.

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

#### Monitoring Replication

You can monitor the status of replication through the operations API. You can use the [`cluster_status` operation](./operations-api/clustering) to get the status of replication. For example:

```json
{
	"operation": "cluster_status"
}
```

#### Database Initial Synchronization and Resynchronization

When a new node is added to the cluster, if its database has not previously been synced, it will initially download the database from the first node it connects to. This will copy every record from the source database to the new node. Once the initial synchronization is complete, the new node will enter replication mode and receive records from each node as they are created, updated, or deleted. If a node goes down and comes back up, it will also resynchronize with the other nodes in the cluster, to ensure that it has the most up-to-date data.

You may also specify a `start_time` in the `add_node` to specify that when a database connects, that it should not download the entire database, but only data since a given starting time.

**Advanced Configuration**

You can also check the configuration of the replication system, including the current known nodes and certificates, by querying the hdb_nodes and hdb_certificate table:

```json
{
	"operation": "search_by_value",
	"database": "system",
	"table": "hdb_nodes",
	"search_attribute": "name",
	"search_value": "*"
}
```
