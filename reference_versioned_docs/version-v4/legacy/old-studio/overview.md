---
title: Harper Studio
---

<!-- Source: versioned_docs/version-4.7/administration/harper-studio/index.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.3.0.md (local studio upgrade) -->

# Harper Studio

Changed in: v4.3.0 (local studio upgraded to match online version)

Harper Studio is the web-based GUI for Harper. Studio enables you to administer, navigate, and monitor all of your Harper instances in a simple, user-friendly interface without any knowledge of the underlying Harper API. It's free to sign up, get started today!

[Sign up for free!](https://studio.harperdb.io/sign-up)

Harper now includes a simplified local Studio that is packaged with all Harper installations and served directly from the instance. It can be enabled in the [configuration file](TODO:reference_versioned_docs/version-v4/configuration/options.md "Configuration file documentation"). This section is dedicated to the hosted Studio accessed at [studio.harperdb.io](https://studio.harperdb.io).

## How does Studio Work?

While Harper Studio is web based and hosted by us, all database interactions are performed on the Harper instance the studio is connected to. The Harper Studio loads in your browser, at which point you login to your Harper instances. Credentials are stored in your browser cache and are not transmitted back to Harper. All database interactions are made via the Harper Operations API directly from your browser to your instance.

## What type of instances can I manage?

Harper Studio enables users to manage both Harper Cloud instances and privately hosted instances all from a single UI. All Harper instances feature identical behavior whether they are hosted by us or by you.

## Studio Features

For detailed documentation on specific Studio features, see:

- [Create Account](./create-account.md) - Instructions for creating a new Studio account
- [Login & Password Reset](./login-password-reset.md) - Login procedures and password recovery
- [Organizations](./organizations.md) - Managing organizations and their settings
- [Instances](./instances.md) - Managing and connecting to Harper instances
- [Instance Configuration](./instance-configuration.md) - Configuring instance settings
- [Instance Metrics](./instance-metrics.md) - Viewing instance status and performance metrics
- [Manage Instance Users](./manage-instance-users.md) - Creating and managing users
- [Manage Instance Roles](./manage-instance-roles.md) - Setting up and managing roles
- [Manage Databases & Browse Data](./manage-databases-browse-data.md) - Database and data management
- [Query Instance Data](./query-instance-data.md) - Executing SQL queries
- [Manage Applications](./manage-applications.md) - Managing applications and components
- [Manage Replication](./manage-replication.md) - Configuring clustering and replication
- [Enable Mixed Content](./enable-mixed-content.md) - Enabling mixed content in browsers
