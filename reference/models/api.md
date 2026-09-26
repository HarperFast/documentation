---
id: api
title: API
---

<!-- Source: harper resources/models/Models.ts, resources/models/types.ts (v5.1) -->

<VersionBadge version="v5.1.0" />

The `models` object exposes four methods. All of them accept an optional `model` option naming the configured logical model to use; when omitted, the logical name `default` is used. Calling a logical name with no configured backend, or asking a backend for a capability it does not support (for example, embeddings from a generation-only backend), throws an error — capability checks run up front, before any request is made.

## embed()

```typescript
models.embed(input: string | string[], options?: EmbedOpts): Promise<Float32Array[]>
```

Converts one or more strings into embedding vectors. The result is always an array of `Float32Array`, one per input string, in input order — including when a single string is passed.

```javascript
import { models } from 'harper';

const [single] = await models.embed('What is Harper?', { inputType: 'query' });
const batch = await models.embed(['first document', 'second document']);
```

| Option      | Type                      | Default     | Description                                                                                                                         |
| ----------- | ------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `model`     | `string`                  | `'default'` | Logical name of a configured embedding model                                                                                        |
| `requires`  | `Capability[]`            | —           | Capabilities the chosen backend must satisfy; used by [routing](./routing#capability-routing) to select a candidate in the group    |
| `inputType` | `'document'` \| `'query'` | —           | Hint for models that distinguish document embeddings from query embeddings (e.g. `nomic-embed-text`); ignored by models that do not |
| `signal`    | `AbortSignal`             | —           | Cancels the call; composed with the backend's configured `requestTimeoutMs`                                                         |

## generate()

```typescript
models.generate(input: GenerateInput, options?: GenerateOpts): Promise<GenerateResult>
```

Generates a completion. The input may be:

- a `string` — shorthand for a single user message,
- an array of messages: `{ role: 'system' | 'user' | 'assistant' | 'tool', content: string }`,
- an object `{ messages, tools?, system? }` — the form required to declare [tools](./tool-calling) or pass a system prompt alongside the messages.

```javascript
const result = await models.generate(
	[
		{ role: 'system', content: 'You are a terse assistant.' },
		{ role: 'user', content: 'What is an HNSW index?' },
	],
	{ temperature: 0.2, maxTokens: 300 }
);
console.log(result.content);
```

| Option           | Type                                         | Default     | Description                                                                                                                                    |
| ---------------- | -------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`          | `string`                                     | `'default'` | Logical name of a configured generative model                                                                                                  |
| `requires`       | `Capability[]`                               | —           | Capabilities the backend must satisfy (e.g. `tools`); used by [routing](./routing#capability-routing). Tools in the input auto-require `tools` |
| `temperature`    | `number`                                     | backend     | Sampling temperature, passed through to the backend                                                                                            |
| `maxTokens`      | `number`                                     | backend     | Completion token limit, passed through to the backend                                                                                          |
| `responseFormat` | `'text'` \| `'json'` \| `{ schema: object }` | `'text'`    | Structured output. `{ schema }` requests output conforming to a JSON Schema; support varies by backend                                         |
| `toolMode`       | `'return'` \| `'auto'`                       | `'return'`  | How tool calls are handled — see [Tool Calling](./tool-calling)                                                                                |
| `signal`         | `AbortSignal`                                | —           | Cancels the call; composed with the backend's configured `requestTimeoutMs`                                                                    |

Additional options apply only when `toolMode: 'auto'`; they are documented in [Tool Calling](./tool-calling).

### GenerateResult

| Field          | Type                                                           | Description                                                                                                                                  |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`      | `string`                                                       | The generated text                                                                                                                           |
| `finishReason` | `'stop'` \| `'length'` \| `'tool_calls'` \| `'content_filter'` | Why generation stopped, normalized across backends                                                                                           |
| `toolCalls`    | `ToolCall[]`                                                   | Tool calls the model requested, when `finishReason` is `'tool_calls'` (each `{ id, name, arguments }`, with `arguments` parsed to an object) |
| `usage`        | `TokenUsage`                                                   | Token usage reported by the backend (`promptTokens`, `completionTokens`, …), when available                                                  |
| `trace`        | `ToolTraceEntry[]`                                             | Per-tool-invocation trace; only populated by the `toolMode: 'auto'` loop — see [Tool Calling](./tool-calling)                                |

## generateStream()

```typescript
models.generateStream(input: GenerateInput, options?: GenerateOpts): AsyncIterable<GenerateChunk>
```

Identical to `generate()` but yields the completion incrementally:

```javascript
let text = '';
for await (const chunk of models.generateStream('Write a haiku about databases.')) {
	if (chunk.deltaContent) text += chunk.deltaContent;
}
```

Each chunk may carry:

| Field            | Type                            | Description                                                                                          |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `deltaContent`   | `string`                        | Text appended since the previous chunk                                                               |
| `deltaToolCalls` | `Partial<ToolCall>[]`           | Tool-call deltas; a backend may deliver the same tool call across several chunks with partial fields |
| `finishReason`   | same values as `GenerateResult` | Set on the final chunk only                                                                          |

Errors detected before the call starts (unknown model name, missing capability) throw synchronously; errors during generation propagate through the iterable.

## decide()

<VersionBadge version="v5.3.0" />

```typescript
models.decide<T>(state: DecideInput, schema: DecisionSchema, options?: DecideOpts): Promise<Decision<T>>
```

Chooses from a closed set of allowed values and returns the chosen value together with a probability distribution over the whole set. Where `generate()` returns open-ended text, `decide()` answers a classification, routing, scoring, moderation, or guardrail question with numbers an application can threshold on. It is served by [decision backends](./backends#decision-backends): a classifier or hosted decision model registered as a custom backend, or the built-in [generative adapter](./backends#generative-decision-adapter), which scores the allowed values from any configured generative model's log-probabilities where the model exposes them and votes over structured completions otherwise.

```javascript
const decision = await models.decide(ticket.body, {
	enum: ['billing', 'refund', 'bug', 'other'],
	description: 'Which queue should handle this support ticket?',
});
// decision.value → 'refund'
// decision.probability → 0.8
// decision.distribution → [{ value: 'refund', probability: 0.8 }, { value: 'billing', probability: 0.2 }, …]
if (decision.probability < 0.7) await sendToHuman(ticket, decision);
```

`state` is the input to decide about: a string, or any JSON-serializable object (program state, a record, a message). `schema` defines the closed set; it is a required argument rather than an option because the schema is what makes the call a decision instead of a generation.

### Decision schemas

A schema is one **leaf**, or a one-level **object** of named leaves. Every leaf is a small closed set, so that every backend family — classifiers, cross-encoders, hosted decision models, and language models — can score it:

| Kind            | Shape                                                            | Allowed values                                                                                          |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Enum            | `{ enum: [...], description? }`                                  | 2 to 255 distinct values of one type (all strings, all numbers, or all booleans), in the declared order |
| Boolean         | `{ type: 'boolean', description? }`                              | `false`, `true`                                                                                         |
| Bounded integer | `{ type: 'integer', minimum, maximum, description? }`            | Every integer from `minimum` to `maximum`, at most 255 values                                           |
| Object          | `{ type: 'object', properties: { [name]: leaf }, description? }` | One decision per property; at most 32 properties and 500 allowed values across all of them              |

Deeper nesting, arrays, and free-text extraction are deliberately unsupported: they would split backends into those that can and those that cannot. Object properties are leaves only, and an empty property name or one of `__proto__`, `constructor` and `prototype` is rejected. Descriptions are passed to the backend as task framing; `options.instructions` adds framing beyond the schema itself.

The set is closed: the distribution is normalized over the allowed values, so an input that matches none of them still produces a confident-looking answer. When "none of these" is a real outcome, make it an explicit value (`'other'`, `'unknown'`) and threshold on `probability`.

| Option         | Type           | Default     | Description                                                                                                                         |
| -------------- | -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `model`        | `string`       | `'default'` | Logical name of a configured [decision model](./overview#configuration)                                                             |
| `requires`     | `Capability[]` | —           | Capabilities the backend must satisfy, e.g. `['calibrated']`; used by [routing](./routing#capability-routing) to select a candidate |
| `instructions` | `string`       | —           | Task framing beyond the schema's descriptions, passed to the backend                                                                |
| `signal`       | `AbortSignal`  | —           | Cancels the call; composed with the backend's configured `requestTimeoutMs`                                                         |

### Decision

| Field          | Type                                                   | Description                                                                                                                                                                                             |
| -------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string`                                               | Cluster-unique id of the decision's durable record in [`hdb_model_decisions`](./analytics#durable-decisions), committed before the decision is returned; pass it to [`recordOutcome()`](#recordoutcome) |
| `value`        | `T`                                                    | The chosen value: the most probable outcome for a leaf schema; for an object schema, a map of each property's most probable outcome                                                                     |
| `probability`  | `number`                                               | Probability of `value` (leaf schemas only)                                                                                                                                                              |
| `distribution` | `{ value, probability }[]`                             | One entry per allowed value, sorted by descending probability; ties keep the schema's order unless the backend chose one of the tied values, which then leads (leaf schemas only)                       |
| `fields`       | `Record<string, { value, probability, distribution }>` | Per-property marginals (object schemas only). `value` is assembled from these marginals and may be a combination no single sample produced                                                              |
| `calibrated`   | `boolean`                                              | Whether the backend reports its probabilities as calibrated. The generative adapter's are not (`false`), whether scored from log-probabilities or counted from votes                                    |
| `usage`        | `TokenUsage`                                           | Usage reported by the backend, when available. The generative adapter reports none, because each of its scoring calls or vote samples is recorded as its own `scoreChoices` or `generate` call          |

Harper validates every backend's output against the schema before returning it: `value` and every distribution entry must be allowed values, the distribution must be complete and sum to one, and `value` must be a most-probable outcome. A backend that violates this is treated like a failed backend — the attempt is recorded and the next candidate in the [fallback group](./routing#fallback-groups) is tried.

A malformed schema, or a `state` that is not a string or a JSON-serializable object, rejects with a `400` error before any backend is chosen, and writes no analytics row.

## getDecision()

<VersionBadge version="v5.3.0" />

```typescript
models.getDecision<T>(id: string): Promise<DecisionRecord<T> | undefined>
```

Reads the durable record of a decision: the schema it was asked over (the input `state` and `instructions` are not stored), what was answered, who answered, and whatever has been recorded about it since. Every `decide()` call commits its record to [`hdb_model_decisions`](./analytics#durable-decisions) before it returns, so a `Decision.id` can be looked up right away on the node that made it, after a restart, and on other nodes once replication has delivered it. Returns `undefined` for an id that does not exist, has expired, or has not reached this node yet.

| Field                                                             | Description                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `at`, `expiresAt`                                           | The decision's id, when it was made, and when its record and facts expire (365 days after `at`; a recorded outcome never extends it)                                                                                                                                                                                                                            |
| `callId`                                                          | The [`hdb_model_calls`](./analytics#per-call-log-hdb_model_calls) row of the call that produced it, for correlation                                                                                                                                                                                                                                             |
| `tenant`, `app`                                                   | The tenant and calling resource, when the call carried them                                                                                                                                                                                                                                                                                                     |
| `backend`, `model`, `signature`, `configHash`, `instructionsHash` | Who answered and under what: the backend, the logical model name, the backend's scoring configuration when it reports one, the identity of the `models` configuration installed when the call began (a hot reload that lands while a call is in flight is not reflected in that call's record), and the hash of the per-call `instructions` when any were given |
| `schema`, `schemaHash`                                            | The allowed values the decision was made over (descriptions removed), and the hash of the full schema including descriptions                                                                                                                                                                                                                                    |
| `value`, `probability`, `distribution`, `fields`, `calibrated`    | The [`Decision`](#decision) as it was returned                                                                                                                                                                                                                                                                                                                  |
| `outcome`                                                         | What has been recorded since: `{ truth?, action?, truthAt?, actionAt? }` for a leaf schema, or `{ fields: { <name>: { … } } }` for an object schema                                                                                                                                                                                                             |

`getDecision()` and `recordOutcome()` are administrative, in-process methods with one built-in guard: when the calling request carries a tenant and the record carries a different one, both behave as if the record did not exist. Beyond that they perform no permission check, like every other `models` method. An application that exposes them to its users must authorize the caller first.

## recordOutcome()

<VersionBadge version="v5.3.0" />

```typescript
models.recordOutcome<T>(id: string, outcome: OutcomeReport): Promise<DecisionRecord<T>>
```

Records what actually happened for a decision, so later calibration can score predictions against observed truth. A report carries one or two facts, each a tagged state rather than a bare value, so a label that happens to be called `'unknown'` is never mistaken for missing information:

| Fact     | States                                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `truth`  | `{ kind: 'value', value }` (an allowed value of the schema), `{ kind: 'noMatch' }` (the input matched none of them), `{ kind: 'unknown' }`                              |
| `action` | `{ kind: 'value', value }` (the value acted on), `{ kind: 'noMatch' }` (routed as no match), `{ kind: 'abstained' }` (sent to a human by policy), `{ kind: 'unknown' }` |

```javascript
const decision = await models.decide(ticket.body, { enum: ['billing', 'refund', 'bug', 'other'] });
if (decision.probability >= 0.7) {
	await route(ticket, decision.value);
	await models.recordOutcome(decision.id, { action: { kind: 'value', value: decision.value } });
} else {
	await sendToHuman(ticket);
	await models.recordOutcome(decision.id, { action: { kind: 'abstained' } });
}
// Later, when the human's answer is known:
await models.recordOutcome(decision.id, { truth: { kind: 'value', value: 'refund' } });
```

For an object schema, report per field: `{ fields: { queue: { truth: { kind: 'value', value: 'refund' } }, urgent: { action: { kind: 'abstained' } } } }`. Each field's facts are recorded and read independently.

Each fact is stored on its own, so recording the truth never touches a previously recorded action, and reports that set different facts never overwrite each other; concurrent reports of the same fact from two nodes converge to one of them. Repeating a report whose state equals what is stored writes nothing. Reporting a different state for the same fact replaces it, so a correction is one more call; `{ kind: 'unknown' }` retracts a fact. Reports are validated against the stored schema: a `value` must be one of its allowed values, an object schema takes `{ fields }` naming its properties and a leaf schema takes `{ truth, action }`, and a report with no fact is rejected. All of these reject with a `400`.

The id must be visible on the node handling the report: an id that does not exist, has expired, or has not replicated to this node yet rejects with a `404`. Replication is asynchronous, so an outcome sent to another node immediately after the decision can see that error; record through the node that decided, or retry. Recording an outcome is not a model call: it writes no analytics row and emits no metric. On a read-only node `recordOutcome()` rejects with a `503` because it is a write, and `decide()` rejects with a `503` before any model call, because a decision that cannot be recorded would return an id that could never be scored.

## registerBackend()

<VersionBadge version="v5.1.15" /> <VersionBadge type="changed" version="v5.3.0" />

```typescript
models.registerBackend(kind: 'embedding' | 'generative' | 'decision', id: string, backend: ModelBackend): void
```

Registers a custom backend under a logical name, selectable by the `model` option on later calls. This is the programmatic path for in-process or third-party backends; pair it with `models.defineBackend()` to build the backend from a few methods. Both are methods on `models` — reachable as `models.registerBackend(...)` / `scope.models.registerBackend(...)` (and likewise for `defineBackend`), not standalone `harper` exports. See [Custom backends](./backends#custom-backends) for the full guide.

## Errors and timeouts

- An unconfigured logical model name throws a not-found error. The error names the missing logical name only — it does not enumerate configured names.
- A capability mismatch (embedding call to a generation-only backend, tool declarations against a backend without tool support, `requires: ['calibrated']` against an uncalibrated decision backend) throws before any request is made. A decision backend that reports a single call as uncalibrated when `calibrated` was required fails that attempt after the request, and the next candidate is tried.
- A malformed decision schema or state rejects with a `400` error before any request is made, and is not recorded.
- On a read-only node, `recordOutcome()` rejects with a `503` because it is a write, and `decide()` rejects with a `503` before any request is made, because a decision that cannot be recorded would return an id that could never be scored. A `decide()` whose record cannot be committed after the backend answered rejects with a `500` without trying another candidate.
- `recordOutcome()` rejects with a `404` for an id that does not exist, has expired, or has not replicated to this node yet, and with a `400` for a report that does not fit the stored schema.
- Each backend supports a `requestTimeoutMs` configuration field; when set, it is composed with any caller-provided `signal` so whichever fires first cancels the request.
- Backend/network failures throw backend-specific errors with sanitized messages.

Every call — successful or failed — is recorded in the [model-call analytics](./analytics).
