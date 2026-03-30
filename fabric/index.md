---
title: Fabric Studio
---

# Fabric Studio

Fabric Studio is the web-based GUI for Harper. Studio enables you to administer, navigate, and monitor all of your Harper clusters in a simple, user-friendly interface without any knowledge of the underlying Harper API. It’s free to sign up, get started today!

[Sign up for free!](https://fabric.harper.fast/#/sign-up)

Harper includes a simplified local Studio that is packaged with all Harper installations and served directly from the cluster. It can be enabled in the [configuration file](/reference/v4/configuration/options#localstudio). This section is dedicated to the hosted Studio accessed at [studio.harperdb.io](https://fabric.harper.fast/).

---

## How does Studio Work?

While Fabric Studio is web based and hosted by us, all database interactions are performed on the Harper cluster the studio is connected to. The Harper Studio loads in your browser, at which point you login to your Harper clusters. Credentials are stored in your browser cache and are not transmitted back to Harper. All database interactions are made via the Harper Operations API directly from your browser to your cluster.

## What can I manage?

Fabric Studio enables users to manage both Harper Cloud clusters and privately hosted clusters all from a single UI. All Harper clusters feature identical behavior whether they are hosted by us or by you.
