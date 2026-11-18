---
title: Fabric Studio
---

# Fabric Studio

Fabric Studio is the web-based GUI for Harper. Studio enables you to administer, navigate, and monitor all of your Harper clusters in a simple, user-friendly interface without any knowledge of the underlying Harper API. It’s free to sign up, get started today!

[Sign up for free!](https://fabric.harper.fast/#/sign-up)

Harper includes a simplified local Studio that is packaged with all Harper installations and served directly from the cluster. It can be enabled in the [configuration file](/reference/v4/configuration/options#localstudio). This section is dedicated to the hosted Studio accessed at [fabric.harper.fast](https://fabric.harper.fast/).

## Where to Start

These pages follow the path from a new account to a monitored app in production. Read them in order the first time, or jump to the step you're on.

### Get Started

1. [Create an account](./create-account.md) in Fabric Studio.
2. [Create an organization](./create-organization.md) to hold your clusters, team, and billing.
3. [Create a cluster](./cluster-creation-management.md), the environment your applications run in.
4. [Invite your team](./organization-management.md) and give each person a role.
5. [Use search](./search.md) to jump to any organization, cluster, or cluster page.

### Build

- [Deploy applications](./managing-applications.md) to your cluster.
- [Manage data](./database-management.md): create tables, import CSV files, and edit records.
- [Explore your APIs](./cluster-api-explorer.md) and send test requests to them.

### Go Live

- [Serve your cluster on your own domain](./custom-domains.md).
- [Control which nodes receive traffic](./load-balancing.md), and take a node out of rotation for maintenance.

### Monitor

- [Read and filter your cluster's logs](./logging.md).
- [Connect Grafana](./grafana-integration.md) to chart your cluster in your own dashboards.

### Automate

- [Use the Fabric API](./api-reference.md) to script cluster and domain changes you would otherwise make in Studio.

## How does Studio Work?

While Fabric Studio is web based and hosted by us, all database interactions are performed on the Harper cluster the studio is connected to. The Harper Studio loads in your browser, at which point you login to your Harper clusters. Credentials are stored in your browser cache and are not transmitted back to Harper. All database interactions are made via the Harper Operations API directly from your browser to your cluster.

Fabric Studio manages both clusters Harper hosts for you and clusters you host yourself, from a single UI. All Harper clusters behave the same whether they are hosted by us or by you.
