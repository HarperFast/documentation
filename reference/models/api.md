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

Chooses from a closed set of allowed values and returns the chosen value together with a probability distribution over the whole set. Where `generate()` returns open-ended text, `decide()` answers a classification, routing, scoring, moderation, or guardrail question with numbers an application can threshold on. It is served by [decision backends](./backends#decision-backends): a classifier or hosted decision model registered as a custom backend, or the built-in [generative adapter](./backends#generative-decision-adapter), which votes over structured completions from any configured generative model.

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

| Leaf            | Shape                                                            | Allowed values                                                                                          |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Enum            | `{ enum: [...], description? }`                                  | 2 to 255 distinct values of one type (all strings, all numbers, or all booleans), in the declared order |
| Boolean         | `{ type: 'boolean', description? }`                              | `false`, `true`                                                                                         |
| Bounded integer | `{ type: 'integer', minimum, maximum, description? }`            | Every integer from `minimum` to `maximum`, at most 255 values                                           |
| Object          | `{ type: 'object', properties: { [name]: leaf }, description? }` | One decision per property; at most 32 properties and 500 allowed values across all of them              |

Deeper nesting, arrays, and free-text extraction are deliberately unsupported: they would split backends into those that can and those that cannot. Descriptions are passed to the backend as task framing; `options.instructions` adds framing beyond the schema itself.

The set is closed: the distribution is normalized over the allowed values, so an input that matches none of them still produces a confident-looking answer. When "none of these" is a real outcome, make it an explicit value (`'other'`, `'unknown'`) and threshold on `probability`.

| Option         | Type           | Default     | Description                                                                                                                         |
| -------------- | -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `model`        | `string`       | `'default'` | Logical name of a configured [decision model](./overview#configuration)                                                             |
| `requires`     | `Capability[]` | —           | Capabilities the backend must satisfy, e.g. `['calibrated']`; used by [routing](./routing#capability-routing) to select a candidate |
| `instructions` | `string`       | —           | Task framing beyond the schema's descriptions, passed to the backend                                                                |
| `signal`       | `AbortSignal`  | —           | Cancels the call; composed with the backend's configured `requestTimeoutMs`                                                         |

### Decision

| Field          | Type                                                   | Description                                                                                                                                                                 |
| -------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | `string`                                               | Id of this call's row in [`hdb_model_calls`](./analytics). Rows are buffered before they are written, so treat it as a best-effort correlation key, not a durable reference |
| `value`        | `T`                                                    | The chosen value: the most probable outcome for a leaf schema; for an object schema, a map of each property's most probable outcome                                         |
| `probability`  | `number`                                               | Probability of `value` (leaf schemas only)                                                                                                                                  |
| `distribution` | `{ value, probability }[]`                             | One entry per allowed value, sorted by descending probability; ties keep the schema's order (leaf schemas only)                                                             |
| `fields`       | `Record<string, { value, probability, distribution }>` | Per-property marginals (object schemas only). `value` is assembled from these marginals and may be a combination no single sample produced                                  |
| `calibrated`   | `boolean`                                              | Whether the backend reports its probabilities as calibrated. Vote frequencies from the generative adapter are not (`false`)                                                 |
| `usage`        | `TokenUsage`                                           | Usage reported by the backend, when available. The generative adapter reports none, because each of its samples is recorded as its own `generate()` call                    |

Harper validates every backend's output against the schema before returning it: `value` and every distribution entry must be allowed values, the distribution must be complete and sum to one, and `value` must be a most-probable outcome. A backend that violates this is treated like a failed backend — the attempt is recorded and the next candidate in the [fallback group](./routing#fallback-groups) is tried.

A malformed schema, or a `state` that is not a string or a JSON-serializable object, rejects with a `400` error before any backend is chosen, and writes no analytics row.

## registerBackend()

<VersionBadge version="v5.1.15" />

```typescript
models.registerBackend(kind: 'embedding' | 'generative' | 'decision', id: string, backend: ModelBackend): void
```

Registers a custom backend under a logical name, selectable by the `model` option on later calls. This is the programmatic path for in-process or third-party backends; pair it with `models.defineBackend()` to build the backend from a few methods. Both are methods on `models` — reachable as `models.registerBackend(...)` / `scope.models.registerBackend(...)` (and likewise for `defineBackend`), not standalone `harper` exports. See [Custom backends](./backends#custom-backends) for the full guide.

## Errors and timeouts

- An unconfigured logical model name throws a not-found error. The error names the missing logical name only — it does not enumerate configured names.
- A capability mismatch (embedding call to a generation-only backend, tool declarations against a backend without tool support, `requires: ['calibrated']` against an uncalibrated decision backend) throws before any request is made.
- A malformed decision schema or state rejects with a `400` error before any request is made, and is not recorded.
- Each backend supports a `requestTimeoutMs` configuration field; when set, it is composed with any caller-provided `signal` so whichever fires first cancels the request.
- Backend/network failures throw backend-specific errors with sanitized messages.

Every call — successful or failed — is recorded in the [model-call analytics](./analytics).
