---
title: Upgrade a Harper Instance
---

# Upgrade a Harper Instance

This document describes best practices for upgrading self-hosted Harper instances. Harper can be upgraded using a combination of npm and built-in Harper upgrade scripts. Whenever upgrading your Harper installation it is recommended you make a backup of your data first. Note: This document applies to self-hosted Harper instances only. All [Harper Cloud instances](harper-cloud/) will be upgraded by the Harper Cloud team.

## Upgrading

Upgrading Harper is a two-step process. First the latest version of Harper must be downloaded from npm, then the Harper upgrade scripts will be utilized to ensure the newest features are available on the system.

1. Install the latest version of Harper using `npm install -g harperdb`.

   Note `-g` should only be used if you installed Harper globally (which is recommended).

1. Run `harperdb` to initiate the upgrade process.

   Harper will then prompt you for all appropriate inputs and then run the upgrade directives.

## Node Version Manager (nvm)

[Node Version Manager (nvm)](https://nvm.sh/) is an easy way to install, remove, and switch between different versions of Node.js as required by various applications. More information, including directions on installing nvm can be found here: [https://nvm.sh/](https://nvm.sh/).

Harper supports Node.js versions 14.0.0 and higher, however, **please check our** [**NPM page**](https://www.npmjs.com/package/harperdb) **for our recommended Node.js version.** To install a different version of Node.js with nvm, run the command:

```bash
nvm install <the node version>
```

To switch to a version of Node run:

```bash
nvm use <the node version>
```

To see the current running version of Node run:

```bash
node --version
```

With a handful of different versions of Node.js installed, run nvm with the `ls` argument to list out all installed versions:

```bash
nvm ls
```

When upgrading Harper, we recommend also upgrading your Node version. Here we assume you're running on an older version of Node; the execution may look like this:

Switch to the older version of Node that Harper is running on (if it is not the current version):

```bash
nvm use 14.19.0
```

Make sure Harper is not running:

```bash
harperdb stop
```

Uninstall Harper. Note, this step is not required, but will clean up old artifacts of Harper. We recommend removing all other Harper installations to ensure the most recent version is always running.

```bash
npm uninstall -g harperdb
```

Switch to the newer version of Node:

```bash
nvm use <the node version>
```

Install Harper globally

```bash
npm install -g harperdb
```

Run the upgrade script

```bash
harperdb
```

Start Harper

```bash
harperdb start
```

---

## Upgrading Nats to Plexus 4.4

To upgrade from NATS clustering to Plexus replication, follow these manual steps. They are designed for a fully replicating cluster to ensure minimal disruption during the upgrade process.

The core of this upgrade is the _bridge node_. This node will run both NATS and Plexus simultaneously, ensuring that transactions are relayed between the two systems during the transition. The bridge node is crucial in preventing any replication downtime, as it will handle transactions from NATS nodes to Plexus nodes and vice versa.

### Enabling Plexus

To enable Plexus on a node that is already running NATS, you will need to update [two values](configuration) in the `harperdb-config.yaml` file:

```yaml
replication:
  url: wss://my-cluster-node-1:9925
  hostname: node-1
```

`replication.url` – This should be set to the URL of the current Harper instance.

`replication.hostname` – Since we are upgrading from NATS, this value should match the `clustering.nodeName` of the current instance.

### Upgrade Steps

1. Set up the bridge node:
   - Choose one node to be the bridge node.
   - On this node, follow the "Enabling Plexus" steps from the previous section, but **do not disable NATS clustering on this instance.**
   - Stop the instance and perform the upgrade.
   - Start the instance. This node should now be running both Plexus and NATS.
1. Upgrade a node:
   - Choose a node that needs upgrading and enable Plexus by following the "Enable Plexus" steps.
   - Disable NATS by setting `clustering.enabled` to `false`.
   - Stop the instance and upgrade it.
   - Start the instance.
   - Call [`add_node`](../developers/operations-api/clustering#add-node) on the upgraded instance. In this call, omit `subscriptions` so that a fully replicating cluster is built. The target node for this call should be the bridge node. _Note: depending on your setup, you may need to expand this `add_node` call to include_ [_authorization and/or tls information_](../developers/operations-api/clustering#add-node)_._

```json
{
	"operation": "add_node",
	"hostname:": "node-1",
	"url": "wss://my-cluster-node-1:9925"
}
```

1. Repeat Step 2 on all remaining nodes that need to be upgraded.
1. Disable NATS on the bridge node by setting `clustering.enabled` to `false` and restart the instance.

Your cluster upgrade should now be complete, with no NATS processes running on any of the nodes.
