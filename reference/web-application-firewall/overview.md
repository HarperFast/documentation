---
id: overview
title: Web Application Firewall
---

# Web Application Firewall

<VersionBadge version="v5.2.0" />

The Harper Web Application Firewall (WAF) filters HTTP requests before authentication and application routing. Rules can match client IP addresses, HTTP methods, paths, headers, and query parameters, then block the request, log the match, or contribute to a shared risk score.

WAF rules are stored in the replicated `system.hdb_waf_rules` table and managed through dedicated Operations API operations. Harper compiles the rules into an immutable in-memory matcher on each worker. Rule changes trigger a debounced recompile and an atomic matcher swap, so updates take effect without restarting Harper.

:::info Harper Pro
The WAF is available in Harper Pro.
:::

## Request coverage

The WAF middleware runs before authentication on Harper's worker HTTP surfaces. This includes HTTP applications and REST traffic handled by the worker ports.

The WAF does not filter the main-thread Operations API port. Protect that administrative surface with authentication, role permissions, TLS, and network access controls.

The client IP used for matching is the request's socket peer address. In the standard Symphony-over-Unix-domain-socket topology, Harper recovers the original client IP from the PROXY protocol. The WAF does not trust `X-Forwarded-For`.

## Rule evaluation

A request matches a rule only when all conditions present in its `match` object succeed:

- Values within `match.ip` and `match.method` are alternatives; any value can match.
- Multiple `headers` or `query` entries must all match.
- If `path` contains more than one of `exact`, `prefix`, and `regex`, all specified path conditions must match.
- Header names are case-insensitive. Header values and query parameter names and values are case-sensitive.

The v5.2 rule language supports positive matches only; it does not have a negation operator.

Matched rules are evaluated from lowest `priority` number to highest. The first explicit `block` action or score total that reaches the configured threshold determines the block. Matching `log` rules are still logged even when another rule blocks the request.

### Path normalization

Harper normalizes both request paths and authored `path.exact` and `path.prefix` values before matching. Normalization:

- Percent-decodes the path up to two times
- Resolves `.` and `..` path segments
- Collapses duplicate slashes
- Preserves case and meaningful trailing slashes

This prevents common encoding and traversal variants from bypassing a literal path rule. A `path.regex` expression runs against the normalized request path.

:::tip Prefix boundaries
`path.prefix` performs a string-prefix match. A prefix of `/admin` also matches `/administrator`. Use `/admin/`, an exact rule, or a regex when a path-segment boundary matters.
:::

### String operators

Header and query conditions support these operators:

| Operator   | Behavior                                                         |
| ---------- | ---------------------------------------------------------------- |
| `equals`   | The complete value must equal `value`.                           |
| `contains` | The value must contain `value`.                                  |
| `prefix`   | The value must start with `value`.                               |
| `regex`    | The value must match the RE2-compatible expression in `value`.   |
| `exists`   | The named header or query parameter must be present; no `value`. |

Regexes use RE2 to guarantee linear-time evaluation. Backreferences and lookaround are not supported; Harper rejects rules containing them.

## Actions

| Action  | Behavior                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `block` | Stops request processing and returns the rule's `blockStatus`, or `403` by default. The response does not expose rule IDs. |
| `log`   | Allows the request and writes a rate-limited WAF match entry to the Harper log.                                            |
| `score` | Adds the rule's `score` to the request total. Harper blocks with `403` when the total reaches `scoreThreshold`.            |

The schema also reserves `challenge`, `serve`, and `drop` actions for future versions. In v5.2, a rule using one of these actions is stored but deferred: the entire rule is excluded from the matcher and Harper logs the reason.

## Monitor and shadow modes

Use monitor mode to observe how a rule set would behave before enabling enforcement:

1. Set the global mode to `monitor`.
2. Add or update rules.
3. Review `WAF would block` and `WAF rule match (log)` entries in the Harper log.
4. Set the global mode to `enforce`.

In `monitor` mode, all `block` and `score` rules behave as shadow rules. They emit would-block logs but never reject a request. `log` rules continue to log normally.

Set `shadow: true` on an individual rule for the same behavior while the global mode remains `enforce`.

The global `off` mode is a pass-through kill switch. Rules remain stored but are not evaluated.

See [WAF Operations](./operations.md#set_waf_mode) for changing the global mode without a restart.

## Node activation

The optional `activation` object supports staged or canary deployment:

- `nodes` matches the node name.
- `regions` matches [`waf.region`](./configuration.md#wafregion).
- `tags` matches when the node has at least one listed [`waf.nodeTags`](./configuration.md#wafnodetags) value.

When multiple selector types are present, the node must satisfy all of them. A rule that is not armed on a node is omitted from that node's matcher.

## Failure behavior

The WAF is designed to preserve availability:

- If initial rule compilation fails, the affected worker passes traffic through and retries with exponential backoff.
- If a later recompile fails, the worker keeps its previous matcher.
- If request evaluation throws an internal error, Harper allows the request and writes a rate-limited error log.
- Malformed rules are skipped and logged.
- Valid rules using a reserved but unenforced feature are deferred in full rather than partially enforced.

Use defense in depth for critical exposure: upstream network controls, TLS, authentication, and Harper role permissions remain necessary even when WAF rules are active.

## v5.2 reserved features

The v5.2 rule schema accepts several fields for forward compatibility:

- `match.ja4`, `match.ja4h`, `match.model`, and `match.agent`
- `rateLimit`
- `challenge`, `serve`, and `drop` actions

A rule using any of these fields is deferred in full and does not match or enforce in v5.2.

The `scope` and `provenance` fields are metadata only. They are stored and validated but do not affect matching. In particular, `scope` does not restrict a rule; use `activation` for node-level rollout.

The `requestBody` phase is also reserved. Only `request` phase rules are evaluated in v5.2.

## Related

- [WAF Configuration](./configuration.md)
- [WAF Operations and Rule Schema](./operations.md)
- [Logging](../logging/overview.md)
- [Operations API](../operations-api/overview.md)
