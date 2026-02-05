---
title: Operations API
---

# Operations API

The operations API provides a full set of capabilities for configuring, deploying, administering, and controlling HarperDB. To send operations to the operations API, you send a POST request to the operations API endpoint, which [defaults to port 9925](../../deployments/configuration), on the root path, where the body is the operations object. These requests need to authenticated, which can be done with [basic auth](./security/basic-auth) or [JWT authentication](./security/jwt-auth). For example, a request to create a table would be performed as:

```http
POST https://my-harperdb-server:9925/
Authorization: Basic YourBase64EncodedInstanceUser:Pass
Content-Type: application/json

{
    "operation": "create_table",
    "table": "my-table"
}
```

The operations API reference is available below and categorized by topic:

- [Quick Start Examples](operations-api/quickstart-examples)
- [Databases and Tables](operations-api/databases-and-tables)
- [NoSQL Operations](operations-api/nosql-operations)
- [Bulk Operations](operations-api/bulk-operations)
- [Users and Roles](operations-api/users-and-roles)
- [Clustering](operations-api/clustering)
- [Components](operations-api/components)
- [Registration](operations-api/registration)
- [Jobs](operations-api/jobs)
- [Logs](operations-api/logs)
- [Utilities](operations-api/utilities)
- [Token Authentication](operations-api/token-authentication)
- [SQL Operations](operations-api/sql-operations)
- [Advanced JSON SQL Examples](operations-api/advanced-json-sql-examples)

• [Past Release API Documentation](https://olddocs.harperdb.io)

## More Examples

Here is an example of using `curl` to make an operations API request:

```bash
curl --location --request POST 'https://instance-subdomain.harperdbcloud.com' \
--header 'Authorization: Basic YourBase64EncodedInstanceUser:Pass' \
--header 'Content-Type: application/json' \
--data-raw '{
"operation": "create_schema",
"schema": "dev"
}'
```
