---
title: Harper Studio
---

<!-- Source: versioned_docs/version-4.7/deployments/configuration.md (localStudio configuration) -->
<!-- Source: release-notes/v4-tucker/4.3.0.md (local studio upgrade in v4.3) -->

# Harper Studio

Changed in: v4.3.0 (local studio upgraded to match online version)

Changed in: v4.7.0 (studio client updated)

Harper Studio is a web-based GUI for Harper that enables you to administer, navigate, and monitor your Harper instances through a simple, user-friendly interface without requiring knowledge of the underlying Harper API.

## Local Studio

Harper v4 includes a local Studio that is packaged with all Harper installations and served directly from your instance.

### Configuration

To enable the local Studio, set `localStudio.enabled` to `true` in your [configuration file](TODO:reference_versioned_docs/version-v4/configuration/options.md#localstudio "Configuration options"):

```yaml
localStudio:
  enabled: true
```

By default, local Studio is disabled (`enabled: false`).

### Accessing Local Studio

Once enabled, the local Studio can be accessed through your browser at:

```
http://localhost:9926
```

Or replace `localhost` with your instance's hostname/IP address if accessing remotely.

All database interactions from the local Studio are made directly from your browser to your Harper instance. Credentials are stored in your browser cache and are not transmitted to external servers.

## Hosted Studio

A hosted version of Harper Studio with additional features for licensing and provisioning is available at [studio.harperdb.io](https://studio.harperdb.io). The hosted Studio allows you to manage both Harper Cloud instances and privately hosted instances from a single interface.

## Legacy Documentation

For users on Harper v4.6 or earlier, detailed Studio feature documentation is available in the [Old Studio Documentation](../legacy/old-studio/overview.md) section.
