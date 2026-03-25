---
title: Operations API Overview
---

<!-- Source: versioned_docs/version-4.7/developers/operations-api/index.md (primary) -->

# Operations API

The Operations API provides a comprehensive set of capabilities for configuring, deploying, administering, and controlling Harper. It is the primary programmatic interface for all administrative and operational tasks that are not handled through the REST interface.

## Endpoint

All Operations API requests are sent as HTTP POST requests to the Operations API endpoint. By default, this listens on port `9925` on the root path:

```
POST http://<host>:9925/
```

See [TODO:reference_versioned_docs/version-v4/configuration/overview.md 'Configuration overview'] for how to change the port and other network settings (`operationsApi.network.port`, `operationsApi.network.securePort`).

## Request Format

Each request body must be a JSON object with an `operation` field that identifies the operation to perform:

```http
POST https://my-harper-server:9925/
Authorization: Basic YourBase64EncodedUser:Pass
Content-Type: application/json

{
    "operation": "create_table",
    "table": "my-table"
}
```

## Authentication

Operations API requests must be authenticated. Harper supports two authentication methods:

- **Basic Auth**: Base64-encoded `username:password` in the `Authorization` header. See [Basic Authentication](TODO:reference_versioned_docs/version-v4/security/basic-authentication.md 'Basic authentication reference').
- **JWT**: A Bearer token in the `Authorization` header, obtained via `create_authentication_tokens`. See [JWT Authentication](TODO:reference_versioned_docs/version-v4/security/jwt-authentication.md 'JWT authentication reference').

The `create_authentication_tokens` operation itself does not require prior authentication — it accepts a username and password and returns an operation token and refresh token.

## Example with curl

```bash
curl --location --request POST 'https://my-harper-server:9925/' \
  --header 'Authorization: Basic YourBase64EncodedUser:Pass' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "operation": "create_table",
    "table": "my-table"
  }'
```

## Authorization

Most operations are restricted to `super_user` roles. This is noted in the documentation for each operation. Some operations (such as `user_info`, `get_job`, and `create_authentication_tokens`) are available to all authenticated users.

## Operations Reference

Operations are grouped by topic. See [Operations](./operations.md) for the complete reference list.

**Topic categories:**

| Category | Description |
|---|---|
| [Databases & Tables](./operations.md#databases--tables) | Create and manage databases, tables, and attributes |
| [NoSQL Operations](./operations.md#nosql-operations) | Insert, update, upsert, delete, and query records |
| [Bulk Operations](./operations.md#bulk-operations) | CSV/S3 import and export, batch delete |
| [SQL Operations](./operations.md#sql-operations) | Execute SQL statements (use for investigation, not production) |
| [Users & Roles](./operations.md#users--roles) | Manage users and role-based access control |
| [Token Authentication](./operations.md#token-authentication) | Create and refresh JWT tokens |
| [Components](./operations.md#components) | Deploy and manage Harper components |
| [Replication & Clustering](./operations.md#replication--clustering) | Configure cluster topology and replication |
| [Configuration](./operations.md#configuration) | Read and update Harper configuration |
| [System](./operations.md#system) | Restart, system information, status management |
| [Jobs](./operations.md#jobs) | Query background job status |
| [Logs](./operations.md#logs) | Read standard, transaction, and audit logs |
| [Certificate Management](./operations.md#certificate-management) | Manage TLS certificates |
| [Analytics](./operations.md#analytics) | Query analytics metrics |
| [Registration & Licensing](./operations.md#registration--licensing) | License management |

## Past Release API Documentation

For API documentation prior to v4.0, see [olddocs.harperdb.io](https://olddocs.harperdb.io).
