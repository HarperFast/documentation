---
title: Local Studio
---

<!-- Source: versioned_docs/version-4.7/deployments/configuration.md (localStudio configuration) -->
<!-- Source: release-notes/v4-tucker/4.3.0.md (local studio upgrade in v4.3) -->

- Added in: v4.1.0
- Changed in: v4.3.0 (Upgrade to match Cloud client)
- Changed in: v4.7.0 (Upgraded to match Fabric client)

Harper Local Studio is a web-based GUI that enables you to administer, navigate, and monitor your Harper instance through a simple, user-friendly interface without requiring knowledge of the underlying Harper APIs.

It is automatically bundled with all Harper instances and is enabled by default on the Operations API port.

If you're looking for the platform as a service interface, go to [Harper Fabric](https://fabric.harper.fast) instead. 

## Configuration

To enable the local Studio, set `localStudio.enabled` to `true` in your [configuration file](TODO:reference_versioned_docs/version-v4/configuration/options.md#localstudio "Configuration options"):

```yaml
localStudio:
  enabled: true
```

The local studio is provided by the [Operations API](TODO:reference_versioned_docs/version-v4/operations/configuration.md) and is available on the configured `operationsApi.port` or `operationsApi.securePort` values. This is `9925` by default.

## Accessing Local Studio

The local Studio can be accessed through your browser at:

```
http://localhost:9925
```

All database interactions from the local Studio are made directly from your browser to your Harper instance. Credentials are stored in your browser cache and are not transmitted to external servers.

## Legacy Cloud Studio Documentation

For users on Harper Cloud, the old usage documentation is still available at [Legacy / Cloud Studio](../legacy/cloud-studio/overview.md); however, we strongly recommend you upgrade to Harper Fabric.
