---
title: Fabric API Reference
---

# Fabric API Reference

The Fabric API lets you manage your organization and its clusters over HTTPS, without going through Studio. Use it to script the things you would otherwise click through: creating, updating and deleting clusters, restarting instances, and managing custom domains.

**[Open the Fabric API Reference](https://fabric.harper.fast/docs/reference/rest/)**

The reference lists every endpoint with its inputs, response fields and errors.

## Base URL and authentication

Requests go to `https://fabric.harper.fast`, not to an individual cluster's hostname, and carry an organization API token in the `Authorization` header:

```http
Authorization: Bearer fot_…
```

An organization admin creates the token in Studio, from the organization's settings. The reference's introduction walks through the steps and explains what a token can do.

## Looking for your cluster's own APIs?

The Fabric API manages clusters. The REST endpoints and operations a cluster serves, including the ones your applications define, are documented by the cluster itself. See the [Cluster API Explorer](./cluster-api-explorer.md).
