---
title: Fabric Studio
---

# Fabric Studio

Fabric Studio is the web-based GUI for Harper. Studio enables you to administer, navigate, and monitor all of your Harper clusters in a simple, user-friendly interface without any knowledge of the underlying Harper API. It’s free to sign up, get started today!

[Sign up for free!](https://fabric.harper.fast/#/sign-up)

Harper also bundles a simplified [Local Studio](/reference/v5/studio/overview) with every installation, served directly from the instance. This section is dedicated to the hosted Studio accessed at [fabric.harper.fast](https://fabric.harper.fast/).

## Where to Start

These pages follow the path from a new account to a monitored app in production. Read them in order the first time, or jump to the step you're on.

### Get Started

1. [Create an account](./create-account.md) in Fabric Studio.
2. [Create an organization](./create-organization.md) to hold your clusters, team, and billing.
3. [Create a cluster](./cluster-creation-management.md), the environment your applications run in.
4. [Invite your team](./organization-management.md) and give each person a role.
5. [Use search](./search.md) to jump to any of your organizations or clusters, and to the pages of the cluster you're signed in to.

### Build

- [Deploy applications](./managing-applications.md) to your cluster.
- [Manage data](./database-management.md): create tables, import CSV files, and edit records.
- [Explore your APIs](./cluster-api-explorer.md) and send test requests to them.

### Go Live

These pages cover clusters Harper hosts. For a self-hosted cluster, you manage its domains and load balancing yourself.

- [Serve your cluster on your own domain](./custom-domains.md).
- [Control which nodes receive traffic](./load-balancing.md), and take a node out of rotation for maintenance.

### Monitor

- [Read and filter your cluster's logs](./logging.md).
- [Connect Grafana](./grafana-integration.md) to chart your cluster in your own dashboards.

### Administer

- [Manage users and roles](./organization-management.md): add people to your organization, and create roles that set what each person can do.

### Automate

- [Use the Fabric API](./api-reference.md) to script cluster and domain changes you would otherwise make in Studio.

## How does Studio Work?

While Fabric Studio is web based and hosted by us, all database interactions are performed on the Harper cluster the studio is connected to. The Harper Studio loads in your browser, at which point you login to your Harper clusters. Credentials are stored in your browser cache and are not transmitted back to Harper. All database interactions are made via the Harper Operations API directly from your browser to your cluster.

<a id="what-can-i-manage"></a>

Fabric Studio manages both clusters Harper hosts for you and clusters you host yourself, from a single UI. Harper itself behaves the same on both. Custom domains and Fabric's load balancing apply only to clusters Harper hosts.
