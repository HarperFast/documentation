---
id: configuration
title: Configuration
---

# WAF Configuration

<VersionBadge version="v5.2.0" />

The WAF is configured through the top-level `waf` section of `harper-config.yaml`. Harper Pro includes an empty `waf: {}` block by default, which enables the component with its default settings.

```yaml
waf:
  enabled: true
  mode: enforce
  scoreThreshold: 10
  debounceMs: 100
  logRateLimit: 100
  logRateIntervalMs: 60000
  region: us-west
  nodeTags:
    - edge
    - canary
```

Changes to `harper-config.yaml` require a restart. Rule changes and global mode changes made through the [WAF Operations](./operations.md) do not.

## Options

### `waf.enabled`

Type: `boolean`

Default: `true`

Enables the WAF component. Set this to `false` to disable WAF middleware and WAF management operations on this node.

### `waf.mode`

Type: `string`

Default: `enforce`

Fallback enforcement mode when no replicated WAF control value has been set:

- `enforce` - Apply `block` and `score` actions.
- `monitor` - Evaluate rules, but downgrade all `block` and `score` matches to would-block logs.
- `off` - Do not evaluate rules.

A mode set through [`set_waf_mode`](./operations.md#set_waf_mode) is stored in the replicated WAF control row and takes precedence over this node-local setting.

### `waf.scoreThreshold`

Type: `number`

Default: `10`

Fallback total at which matched `score` rules block a request. Set this to a finite number greater than zero.

A threshold set through [`set_waf_mode`](./operations.md#set_waf_mode) is replicated and takes precedence. Use the operation for a cluster so every node makes the same scoring decision.

### `waf.debounceMs`

Type: `number` (milliseconds)

Default: `100`

How long a worker waits after a rule-table change before recompiling its matcher. Additional changes during the interval are combined into the same recompile.

### `waf.logRateLimit`

Type: `number`

Default: `100`

Maximum WAF match log lines emitted per rule during each `logRateIntervalMs` window. Harper suppresses additional lines and emits a summary when the next window begins.

This limit affects logging only. It does not change matching or enforcement.

### `waf.logRateIntervalMs`

Type: `number` (milliseconds)

Default: `60000`

Window used by the per-rule WAF log rate limiter.

### `waf.region`

Type: `string`

Default: None

This node's region for rule [`activation.regions`](./operations.md#activation) matching.

### `waf.nodeTags`

Type: `string[]`

Default: `[]`

This node's tags for rule [`activation.tags`](./operations.md#activation) matching. A tag selector matches when at least one rule tag appears in this array.

## Runtime control precedence

For `mode` and `scoreThreshold`, Harper uses the first available value:

1. Replicated control value set by `set_waf_mode`
2. Local `waf` configuration
3. Built-in default

The remaining options are node-local configuration.

## Related

- [WAF Overview](./overview.md)
- [WAF Operations and Rule Schema](./operations.md)
- [Configuration Overview](../configuration/overview.md)
