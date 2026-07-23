---
id: operations
title: Operations and Rule Schema
---

# WAF Operations and Rule Schema

<VersionBadge version="v5.2.0" />

WAF rules are managed through dedicated Operations API operations. Generic CRUD operations cannot write the `system.hdb_waf_rules` system table.

All operations on this page are restricted to `super_user` roles. Rule writes are attributed to the authenticated user in Harper's audit records.

## Operations

| Operation        | Description                                         |
| ---------------- | --------------------------------------------------- |
| `add_waf_rule`   | Validates and creates a rule.                       |
| `alter_waf_rule` | Patches and revalidates an existing rule.           |
| `drop_waf_rule`  | Deletes a rule.                                     |
| `list_waf_rules` | Returns all rules.                                  |
| `set_waf_mode`   | Changes the replicated mode and/or score threshold. |

Rule and control changes propagate through the replicated rule table and trigger a live matcher recompile. A Harper restart is not required.

## `add_waf_rule`

Validates and inserts the supplied `rule`. The `id` must not already exist.

When `provenance` is omitted, Harper records the rule as human-authored and sets `provenance.approver` to the authenticated username.

### Request

```json
{
	"operation": "add_waf_rule",
	"rule": {
		"id": "block-admin-from-scanner-network",
		"enabled": true,
		"priority": 100,
		"phase": "request",
		"description": "Block a known scanner network from the admin application",
		"match": {
			"path": {
				"prefix": "/admin/"
			},
			"ip": ["203.0.113.0/24"]
		},
		"action": "block",
		"blockStatus": 403
	}
}
```

### Response

```json
{
	"message": "Added WAF rule block-admin-from-scanner-network"
}
```

If the ID already exists, Harper returns `409`. Use `alter_waf_rule` to modify it.

## `alter_waf_rule`

Patches an existing rule. Supply `id` plus any fields to replace. Harper combines the patch with the stored rule and validates the complete result before writing it. The rule ID cannot be changed.

### Request

```json
{
	"operation": "alter_waf_rule",
	"id": "block-admin-from-scanner-network",
	"shadow": true,
	"description": "Preview this block before enforcing it"
}
```

### Response

```json
{
	"message": "Updated WAF rule block-admin-from-scanner-network"
}
```

Nested objects are replaced, not deeply patched. To change one property inside `match`, `activation`, `scope`, `provenance`, or `rateLimit`, send the complete replacement object.

## `drop_waf_rule`

Deletes an existing rule.

### Request

```json
{
	"operation": "drop_waf_rule",
	"id": "block-admin-from-scanner-network"
}
```

### Response

```json
{
	"message": "Dropped WAF rule block-admin-from-scanner-network"
}
```

## `list_waf_rules`

Returns all stored WAF rules. The internal global-control record is not included.

### Request

```json
{
	"operation": "list_waf_rules"
}
```

### Response

```json
[
	{
		"id": "log-suspicious-agent",
		"enabled": true,
		"priority": 200,
		"phase": "request",
		"match": {
			"headers": [
				{
					"name": "user-agent",
					"op": "contains",
					"value": "ExampleScanner"
				}
			]
		},
		"action": "log",
		"provenance": {
			"origin": "human",
			"approver": "admin"
		}
	}
]
```

## `set_waf_mode`

Sets the cluster-wide enforcement `mode`, `scoreThreshold`, or both. At least one must be supplied. When only one field is supplied, Harper preserves the existing value of the other field.

The control record is stored with the WAF rules and replicates to the other nodes. It overrides node-local `waf.mode` and `waf.scoreThreshold` configuration.

### Parameters

| Parameter        | Required | Type   | Description                                      |
| ---------------- | -------- | ------ | ------------------------------------------------ |
| `operation`      | Yes      | string | Must be `"set_waf_mode"`.                        |
| `mode`           | No       | string | `enforce`, `monitor`, or `off`.                  |
| `scoreThreshold` | No       | number | Finite positive score total that causes a block. |

### Start a monitored rollout

```json
{
	"operation": "set_waf_mode",
	"mode": "monitor",
	"scoreThreshold": 20
}
```

```json
{
	"message": "WAF mode set to monitor, scoreThreshold set to 20"
}
```

### Enable enforcement

```json
{
	"operation": "set_waf_mode",
	"mode": "enforce"
}
```

### Disable evaluation

```json
{
	"operation": "set_waf_mode",
	"mode": "off"
}
```

`off` is a pass-through kill switch. It does not delete or disable the stored rules.

## Rule schema

### Top-level fields

| Field         | Required    | Type    | Default | Description                                                             |
| ------------- | ----------- | ------- | ------- | ----------------------------------------------------------------------- |
| `id`          | Yes         | string  | -       | Unique rule identifier.                                                 |
| `enabled`     | No          | boolean | `true`  | Set to `false` to keep the rule stored but exclude it from matching.    |
| `priority`    | No          | number  | `0`     | Evaluation order; lower numbers run first. Must be finite.              |
| `phase`       | Yes         | string  | -       | `request` is enforced. `requestBody` is reserved and skipped in v5.2.   |
| `description` | No          | string  | -       | Operator-facing description.                                            |
| `match`       | Yes         | object  | -       | Match conditions. At least one condition is required.                   |
| `action`      | Yes         | string  | -       | `block`, `log`, or `score`. Reserved actions are accepted but deferred. |
| `score`       | Conditional | number  | -       | Required and finite when `action` is `score`.                           |
| `blockStatus` | No          | number  | `403`   | HTTP status for `block`; must be from `400` through `599`.              |
| `shadow`      | No          | boolean | `false` | Logs a would-block result for `block` and `score` without enforcing it. |
| `activation`  | No          | object  | -       | Limits which nodes arm the rule.                                        |
| `scope`       | No          | object  | -       | Reserved metadata only; does not restrict matching in v5.2.             |
| `provenance`  | No          | object  | -       | Authorship metadata.                                                    |
| `rateLimit`   | No          | object  | -       | Reserved; a rule containing it is deferred in full in v5.2.             |

### Match fields

| Field     | Type                 | Description                                                                                                  |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ip`      | `string \| string[]` | IPv4, IPv6, or CIDR values. Array entries are alternatives.                                                  |
| `method`  | `string[]`           | HTTP methods. Matching is case-insensitive. Array entries are alternatives.                                  |
| `path`    | object               | `exact`, `prefix`, and/or RE2-compatible `regex`. Present fields are combined with AND.                      |
| `headers` | object[]             | Header name/value conditions. Header names are case-insensitive; all entries must match.                     |
| `query`   | object[]             | Query parameter conditions. Names and values are percent-decoded and case-sensitive; all entries must match. |
| `ja4`     | `string \| string[]` | Reserved; defers the complete rule in v5.2.                                                                  |
| `ja4h`    | `string \| string[]` | Reserved; defers the complete rule in v5.2.                                                                  |
| `model`   | object               | Reserved; defers the complete rule in v5.2.                                                                  |
| `agent`   | object               | Reserved; defers the complete rule in v5.2.                                                                  |

`ip`, `headers`, and `query` arrays cannot be empty. `method` must be a non-empty array. Multiple top-level match fields are combined with AND.

### Header and query conditions

Each `headers` or `query` entry has this shape:

```json
{
	"name": "content-type",
	"op": "prefix",
	"value": "application/json"
}
```

| Field   | Required    | Type   | Description                                                |
| ------- | ----------- | ------ | ---------------------------------------------------------- |
| `name`  | Yes         | string | Non-empty header or query parameter name.                  |
| `op`    | Yes         | string | `equals`, `contains`, `prefix`, `regex`, or `exists`.      |
| `value` | Conditional | string | Required and non-empty for every operator except `exists`. |

For repeated headers or query parameters, a condition succeeds if any value matches.

### `activation`

```json
{
	"activation": {
		"nodes": ["edge-1", "edge-2"],
		"regions": ["us-west"],
		"tags": ["canary", "public"]
	}
}
```

Each present selector must be a non-empty string array:

- `nodes` - Matches this node's configured name.
- `regions` - Matches [`waf.region`](./configuration.md#wafregion).
- `tags` - Matches if any listed tag appears in [`waf.nodeTags`](./configuration.md#wafnodetags).

All present selector types must succeed. For example, the rule above requires an allowed node name, the `us-west` region, and at least one of the two tags.

### `provenance`

```json
{
	"provenance": {
		"origin": "managed-feed",
		"approver": "security-team",
		"source": "vendor-rule-set-2026-07"
	}
}
```

| Field      | Type   | Description                                   |
| ---------- | ------ | --------------------------------------------- |
| `origin`   | string | `human`, `managed-feed`, or `agent-proposed`. |
| `approver` | string | Person or system that approved the rule.      |
| `source`   | string | Source identifier for the rule.               |

Provenance is metadata and does not affect matching.

### Reserved `scope`

The accepted shape is:

```json
{
	"scope": {
		"clusters": ["production"],
		"applications": ["storefront"],
		"tenants": ["example"]
	}
}
```

These values are metadata only in v5.2. They do not limit rule enforcement and do not defer the rule.

### Reserved `rateLimit`

The accepted shape is:

```json
{
	"rateLimit": {
		"key": ["ip", "session"],
		"limit": 100,
		"windowMs": 60000
	}
}
```

Allowed `key` values are `ip`, `ja4`, `session`, `agent`, and `user`. `limit` and `windowMs` must be positive finite numbers.

The complete rule is deferred in v5.2. No rate limiting is enforced.

## Related

- [WAF Overview](./overview.md)
- [WAF Configuration](./configuration.md)
- [Operations API Overview](../operations-api/overview.md)
