---
id: analytics
title: Analytics
---

<!-- Source: harper resources/models/analyticsTable.ts, resources/models/Models.ts (v5.1) -->

<VersionBadge version="v5.1.0" />

Every model call is recorded for observability and usage accounting, at two levels of granularity: a per-call log table for forensics, and aggregate counters in Harper's [general analytics](../analytics/overview) for dashboards and trends.

## Per-call log: `hdb_model_calls`

<VersionBadge type="changed" version="v5.3.0" />

Each `embed()`, `generate()`, `generateStream()`, and `decide()` call writes a row to the `hdb_model_calls` system table for every attempt — on success, on failure, and for each fallback candidate it tries. With `toolMode: 'auto'`, each backend round inside the loop records its own row (the outer loop itself does not add one). With the [generative decision adapter](./backends#generative-decision-adapter), each vote sample is a `generate` row of its own, each scoring call a `scoreChoices` row, and the `decide` row carries the decision's latency but no token counts. A scoring call the backend declined is a failed `scoreChoices` row with `error_code: scoring_unsupported`, carrying the tokens the attempt consumed when it consumed any (a decline before any request carries none), followed by the rows of the next scoring candidate when the generative name has a fallback group, or by the `generate` rows of the vote that replaced it. Sibling scoring calls cut short by that decline are `aborted` rows without tokens. A generative backend that reports no `scoreChoices` capability writes no scoring row at all. A `decide()` call rejected for a malformed schema or state writes no row.

| Field               | Description                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `tenant`            | Tenant identifier, when the call carried one                                                                                           |
| `app`               | Resource path of the calling resource, when called from one                                                                            |
| `model`             | Logical model name the caller used                                                                                                     |
| `backend`           | Backend that served the call (`ollama`, `openai`, …); `unknown` for pre-dispatch failures                                              |
| `method`            | `embed`, `generate`, `generateStream`, `decide`, or `scoreChoices` (the decision adapter's scoring calls)                              |
| `prompt_tokens`     | Prompt token count, when the backend reported usage                                                                                    |
| `completion_tokens` | Completion token count, when the backend reported usage                                                                                |
| `embedding_tokens`  | Embedding token count, when the backend reported usage                                                                                 |
| `latency_ms`        | Wall-clock call duration                                                                                                               |
| `success`           | Whether the call completed                                                                                                             |
| `error_code`        | On failure: `backend_error`, `aborted`, `capability_unsupported`, `scoring_unsupported`, `backend_not_found`, or `pending_unsupported` |

Rows are buffered in memory and flushed every 10 seconds, or immediately once 1,000 rows accumulate; rows older than 90 days are purged. Buffered rows may be lost on abrupt shutdown — treat the table as operational telemetry, not an audit log.

Query it like any table, for example through the operations API:

```json
{
	"operation": "search_by_conditions",
	"database": "system",
	"table": "hdb_model_calls",
	"conditions": [{ "search_attribute": "success", "search_type": "equals", "search_value": false }]
}
```

## Aggregate metrics

<VersionBadge type="changed" version="v5.3.0" />

Each call also increments Harper's aggregate analytics (visible in `hdb_raw_analytics` alongside the other [analytics metrics](../analytics/overview)):

- `model-embed`, `model-generate`, `model-generateStream`, `model-decide`, `model-scoreChoices` — call counts
- `model-embed-tokens`, `model-generate-tokens`, `model-generateStream-tokens`, `model-decide-tokens`, `model-scoreChoices-tokens` — token totals

Metrics are broken down by backend name, so usage can be charted per provider. Call counts count successful calls; token totals also include the tokens a failed attempt reported, such as a scoring call the backend declined after the completion was billed.
