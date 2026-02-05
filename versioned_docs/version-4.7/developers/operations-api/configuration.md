---
title: Configuration
---

# Configuration

## Set Configuration

Modifies the Harper configuration file parameters. Must follow with a [restart](./system-operations#restart) or [restart_service](./system-operations#restart-service) operation.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `set_configuration`
- `logging_level` _(optional)_ - one or more configuration keywords to be updated in the Harper configuration file
- `clustering_enabled` _(optional)_ - one or more configuration keywords to be updated in the Harper configuration file

### Body

```json
{
	"operation": "set_configuration",
	"logging_level": "trace",
	"clustering_enabled": true
}
```

### Response: 200

```json
{
	"message": "Configuration successfully set. You must restart HarperDB for new config settings to take effect."
}
```

---

## Get Configuration

Returns the Harper configuration parameters.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_configuration`

### Body

```json
{
	"operation": "get_configuration"
}
```

### Response: 200

```json
{
	"http": {
		"compressionThreshold": 1200,
		"cors": false,
		"corsAccessList": [null],
		"keepAliveTimeout": 30000,
		"port": 9926,
		"securePort": null,
		"timeout": 120000
	},
	"threads": 11,
	"authentication": {
		"cacheTTL": 30000,
		"enableSessions": true,
		"operationTokenTimeout": "1d",
		"refreshTokenTimeout": "30d"
	},
	"analytics": {
		"aggregatePeriod": 60
	},
	"replication": {
		"hostname": "node1",
		"databases": "*",
		"routes": null,
		"url": "wss://127.0.0.1:9925"
	},
	"componentsRoot": "/Users/hdb/components",
	"localStudio": {
		"enabled": false
	},
	"logging": {
		"auditAuthEvents": {
			"logFailed": false,
			"logSuccessful": false
		},
		"auditLog": true,
		"auditRetention": "3d",
		"file": true,
		"level": "error",
		"root": "/Users/hdb/log",
		"rotation": {
			"enabled": false,
			"compress": false,
			"interval": null,
			"maxSize": null,
			"path": "/Users/hdb/log"
		},
		"stdStreams": false
	},
	"mqtt": {
		"network": {
			"port": 1883,
			"securePort": 8883
		},
		"webSocket": true,
		"requireAuthentication": true
	},
	"operationsApi": {
		"network": {
			"cors": true,
			"corsAccessList": ["*"],
			"domainSocket": "/Users/hdb/operations-server",
			"port": 9925,
			"securePort": null
		}
	},
	"rootPath": "/Users/hdb",
	"storage": {
		"writeAsync": false,
		"caching": true,
		"compression": false,
		"noReadAhead": true,
		"path": "/Users/hdb/database",
		"prefetchWrites": true
	},
	"tls": {
		"privateKey": "/Users/hdb/keys/privateKey.pem"
	}
}
```
