---
title: System Operations
---

# System Operations

## Restart

Restarts the Harper instance.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `restart`

### Body

```json
{
	"operation": "restart"
}
```

### Response: 200

```json
{
	"message": "Restarting HarperDB. This may take up to 60 seconds."
}
```

---

## Restart Service

Restarts servers for the specified Harper service.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `restart_service`
- `service` _(required)_ - must be one of: `http_workers`, `clustering_config` or `clustering`
- `replicated` _(optional)_ - must be a boolean. If set to `true`, Harper will replicate the restart service operation across all nodes in the cluster. The restart will occur as a rolling restart, ensuring that each node is fully restarted before the next node begins restarting.

### Body

```json
{
	"operation": "restart_service",
	"service": "http_workers"
}
```

### Response: 200

```json
{
	"message": "Restarting http_workers"
}
```

---

## System Information

Returns detailed metrics on the host system.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `system_information`
- `attributes` _(optional)_ - string array of top level attributes desired in the response, if no value is supplied all attributes will be returned. Available attributes are: ['system', 'time', 'cpu', 'memory', 'disk', 'network', 'harperdb_processes', 'table_size', 'metrics', 'threads', 'replication']

### Body

```json
{
	"operation": "system_information"
}
```

---

## Set Status

Sets a status value that can be used for application-specific status tracking. Status values are stored in memory and are not persisted across restarts.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `set_status`
- `id` _(required)_ - the key identifier for the status
- `status` _(required)_ - the status value to set (string between 1-512 characters)

### Body

```json
{
	"operation": "set_status",
	"id": "primary",
	"status": "active"
}
```

### Response: 200

```json
{
	"id": "primary",
	"status": "active",
	"__createdtime__": 1621364589543,
	"__updatedtime__": 1621364589543
}
```

### Notes

- The `id` parameter must be one of the allowed status types: 'primary', 'maintenance', or 'availability'
- If no `id` is specified, it defaults to 'primary'
- For 'availability' status, only 'Available' or 'Unavailable' values are accepted
- For other status types, any string value is accepted

---

## Get Status

Retrieves a status value previously set with the set_status operation.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_status`
- `id` _(optional)_ - the key identifier for the status to retrieve (defaults to all statuses if not provided)

### Body

```json
{
	"operation": "get_status",
	"id": "primary"
}
```

### Response: 200

```json
{
	"id": "primary",
	"status": "active",
	"__createdtime__": 1621364589543,
	"__updatedtime__": 1621364589543
}
```

If no id parameter is provided, all status values will be returned:

```json
[
	{
		"id": "primary",
		"status": "active",
		"__createdtime__": 1621364589543,
		"__updatedtime__": 1621364589543
	},
	{
		"id": "maintenance",
		"status": "scheduled",
		"__createdtime__": 1621364600123,
		"__updatedtime__": 1621364600123
	}
]
```

---

## Clear Status

Removes a status entry by its ID.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `clear_status`
- `id` _(required)_ - the key identifier for the status to remove

### Body

```json
{
	"operation": "clear_status",
	"id": "primary"
}
```

### Response: 200

```json
{
	"message": "Status successfully cleared"
}
```
