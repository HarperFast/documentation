---
id: backends
title: Backends
---

<!-- Source: harper components/ollama, components/openai, components/anthropic, components/bedrock (v5.1) -->

<VersionBadge version="v5.1.0" />

Four provider backends ship with Harper, serving `embedding` and `generative` entries. Each model entry in the [`models` configuration](./overview#configuration) selects one with its `backend` field. `decision` entries are served by the built-in [generative decision adapter](#generative-decision-adapter) or by a [custom decision backend](#decision-backends).

| Backend     | Embeddings | Generation | Streaming | Tools           |
| ----------- | ---------- | ---------- | --------- | --------------- |
| `ollama`    | ✓          | ✓          | ✓         | —               |
| `openai`    | ✓          | ✓          | ✓         | ✓               |
| `anthropic` | —          | ✓          | ✓         | ✓               |
| `bedrock`   | ✓          | ✓          | ✓         | varies by model |

All backends support these common fields:

| Field              | Description                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `backend`          | Which backend to use (required)                                                                      |
| `model`            | Provider-side model identifier (e.g. `gpt-4o`) used when a call does not pass its own `model` option |
| `requestTimeoutMs` | Per-request timeout in milliseconds; composed with any caller-provided `AbortSignal`                 |

## Ollama

Calls a local or remote [Ollama](https://ollama.com) server. No credentials.

```yaml
models:
  embedding:
    default:
      backend: ollama
      host: localhost:11434
      model: nomic-embed-text:latest
  generative:
    local:
      backend: ollama
      host: ollama.internal:11434
      model: mistral:7b
```

| Field   | Default           | Description                                                                                                     |
| ------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `host`  | `localhost:11434` | Ollama server origin. A scheme-less value is treated as `http://`; a full origin (`https://…`) is used as given |
| `model` | —                 | Ollama model name, e.g. `nomic-embed-text:latest`, `mistral:7b`                                                 |

When embedding with `nomic-embed-text`, the `inputType` option (`'document'` / `'query'`) is applied using the model's task prefixes; other models ignore it.

The Ollama backend does not advertise tool support — declaring tools against it fails up front.

## OpenAI

Calls the OpenAI API — or any service exposing an OpenAI-compatible API with bearer-token authentication, by pointing `baseUrl` at it. This includes vLLM's OpenAI-compatible server, Google's Gemini OpenAI-compatible endpoint, Azure OpenAI's `/openai/v1` endpoint, and hosted gateways such as OpenRouter or Together AI.

```yaml
models:
  embedding:
    default:
      backend: openai
      apiKey: ${OPENAI_API_KEY}
      model: text-embedding-3-large
  generative:
    default:
      backend: openai
      apiKey: ${OPENAI_API_KEY}
      model: gpt-4o
    vllm:
      backend: openai
      apiKey: ${VLLM_API_KEY}
      baseUrl: http://vllm.internal:8000/v1
      model: meta-llama/Llama-3.1-8B-Instruct
```

| Field          | Default                     | Description                                                                        |
| -------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `apiKey`       | — (required)                | API key, sent as a bearer token. Use `${VAR}` indirection                          |
| `baseUrl`      | `https://api.openai.com/v1` | API root; point at any OpenAI-compatible endpoint                                  |
| `model`        | —                           | Model name, e.g. `gpt-4o`, `text-embedding-3-large`                                |
| `organization` | —                           | Sent as the `OpenAI-Organization` header, for keys spanning multiple organizations |

`responseFormat: 'json'` maps to OpenAI's JSON mode and `responseFormat: { schema }` to strict structured outputs (`json_schema`); OpenAI-compatible servers vary in their support for these.

## Anthropic

Calls the Anthropic Messages API. Generation only — Anthropic does not offer an embeddings API.

```yaml
models:
  generative:
    claude:
      backend: anthropic
      apiKey: ${ANTHROPIC_API_KEY}
      model: claude-sonnet-4-6
```

| Field     | Default                     | Description                             |
| --------- | --------------------------- | --------------------------------------- |
| `apiKey`  | — (required)                | API key, sent as the `x-api-key` header |
| `baseUrl` | `https://api.anthropic.com` | API root                                |
| `model`   | —                           | Model name, e.g. `claude-sonnet-4-6`    |

The Anthropic API requires a completion token limit on every request; when a call does not pass `maxTokens`, Harper sends `4096`.

## Amazon Bedrock

Calls AWS Bedrock. Credentials come from the standard AWS SDK chain (environment variables, shared credentials file, IAM instance/task roles) — there is no `apiKey` field.

The AWS SDK is not bundled with Harper. Install it in your project to use this backend:

```bash
npm install @aws-sdk/client-bedrock-runtime
```

```yaml
models:
  embedding:
    titan:
      backend: bedrock
      region: us-east-1
      model: amazon.titan-embed-text-v2:0
  generative:
    claude:
      backend: bedrock
      region: us-east-1
      model: anthropic.claude-sonnet-4-5-20250929-v1:0
```

| Field    | Default      | Description                                                            |
| -------- | ------------ | ---------------------------------------------------------------------- |
| `region` | — (required) | AWS region hosting the Bedrock models                                  |
| `model`  | —            | Bedrock model identifier; the vendor prefix selects the request format |

The model identifier's vendor prefix (`anthropic.`, `meta.`, `amazon.titan-`, `cohere.`, `mistral.`) determines the request/response format Harper uses; an unrecognized prefix is rejected with an error. Tool support depends on the underlying model family. Bedrock embedding APIs accept one text per request, so batch `embed()` calls are issued sequentially.

## Generative decision adapter

<VersionBadge version="v5.3.0" />

Serves [`models.decide()`](./api#decide) over any configured generative model, so decisions work without a dedicated decision backend. It is selected with `backend: generative` under `models.decision` and is the only built-in for that kind; the four provider backends are rejected under `decision`, and `generative` is rejected under `embedding` or `generative`.

```yaml
models:
  generative:
    default:
      backend: openai
      apiKey: ${OPENAI_API_KEY}
      model: gpt-4o-mini
  decision:
    default:
      backend: generative
      generative: default
      scoring: auto
      samples: 5
```

| Field              | Default     | Description                                                                                                                                                                                   |
| ------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generative`       | `'default'` | Logical name of the generative model to score or sample, resolved at call time — a reload of that entry is picked up without touching the decision entry                                      |
| `scoring`          | `'auto'`    | `auto` scores from the generative backend's log-probabilities when it implements [`scoreChoices`](#scoring-generative-backends) and votes otherwise; `score` never votes; `vote` never scores |
| `samples`          | `5`         | Completions per voted decision, 1 to 25, validated at startup. A voted distribution is the vote frequency, so `samples` sets its granularity                                                  |
| `concurrency`      | `5`         | Completions or scoring calls in flight at once, 1 to 25                                                                                                                                       |
| `temperature`      | backend     | Sampling temperature passed to every vote sample; higher values spread the votes. Not sent when scoring                                                                                       |
| `requestTimeoutMs` | —           | Budget for the whole decision, composed with the caller's `AbortSignal`                                                                                                                       |

With `scoring: auto`, the adapter first asks whether the `generative` logical name routes to a backend that implements `scoreChoices`: [OpenAI](#openai) does, from chat `logprobs`; [Ollama](#ollama), [Anthropic](#anthropic), and [Amazon Bedrock](#amazon-bedrock) do not, and a [custom backend](#scoring-generative-backends) may. If it does, each leaf of the schema — each field of an object schema — is scored in one call: the backend returns a log-likelihood for every allowed value and the adapter normalizes them into the distribution, so the probabilities are finer than vote counts and a decision costs one call per leaf rather than `samples` completions. A backend may decline a call it cannot score — OpenAI does for more than 20 allowed values in a leaf, for a model that refuses `logprobs`, for a completion that carries no log-probabilities, and when none of the alternatives it returns is a label. A decline is not a failure: the scoring call is routed like any other, so a [fallback group](./routing#fallback-groups) on the generative name hands the call to its next scoring candidate, and only when every candidate has declined does the adapter discard any leaf it had already scored and vote the whole decision under the same budget. A decision is never part scored, part voted, and the [analytics](./analytics) rows show which path ran. Any other failure — a provider error, a malformed response — is tried against the next scoring candidate too; when no candidate succeeds and at least one failed, the decision fails with that failure rather than turning into a vote. `scoring: score` fails the decision on a decline too, and `scoring: vote` always votes. `calibrated` is always `false` on either path: scores and vote frequencies are estimates, not calibrated probabilities.

The OpenAI backend lists the allowed values under the labels `A` to `T`, one per line, asks for one token with `top_logprobs: 20`, and scores each label from the alternatives returned for that token, combining spellings of the same letter. A label absent from the alternatives is scored at a capped estimate of what one unlisted token could have had — the smaller of the smallest listed probability and the mass the list leaves over, never below a tiny finite floor so the vector still normalizes — an approximation, not a measurement. A model that refuses `logprobs`, by a 400 or by a completion that carries none, has scoring switched off until the configuration reloads, and the backend then reports `scoreChoices: false` for it, so later decisions vote without an attempt; a reasoning model that rejects log-probabilities does not pay a refused request before every vote.

When voting, the adapter translates the decision schema into a JSON Schema, asks the generative model for `samples` completions with `responseFormat: { schema }`, parses each one, and reports each allowed value's share of the votes as its probability — including zero for values that received none. The state is part of every sample's prompt, so a decision costs `samples` times its tokens. The adapter works best on a backend that enforces `responseFormat: { schema }` ([OpenAI](#openai) and [Ollama](#ollama) do). [Anthropic](#anthropic) and [Amazon Bedrock](#amazon-bedrock) ignore `responseFormat`, so their samples rely on the prompt alone. The adapter tolerates a code fence or brace-free prose around the JSON object, and ignores extra properties. A sample whose required values are missing or outside the allowed set fails the whole decision rather than being dropped from the vote. Any samples still in flight are cancelled first.

Each vote sample flows through `models.generate()` and each scoring call through the same routing as a `generate` call, so each is routed, recorded, and billed as a call of its own — a `generate` or a `scoreChoices` row in [analytics](./analytics); the `decide` row carries the decision's latency but no token counts, so tokens are never counted twice.

## Decision backends

<VersionBadge version="v5.3.0" />

A `decision` backend implements `decide(state, schema, opts)` and returns the distribution over the schema's allowed values. Fine-tuned classifiers, zero-shot NLI models, cross-encoders, and hosted decision models fit this shape without pretending to be a `generative` backend. Register one programmatically with [`defineBackend()`](#definebackend) and [`registerBackend('decision', …)`](#registerbackend), or select it from `models.decision` config as a [config-selectable backend](#config-selectable-backends):

```yaml
models:
  decision:
    default:
      backend: '@acme/harper-decision'
      apiKey: ${ACME_API_KEY}
      fallback: [llm]
    llm:
      backend: generative
```

The backend returns `{ status: 'completed', output, usage? }` where `output` is:

- for a leaf schema, `{ distribution: [{ value, probability }, …], calibrated? }` — one entry for every allowed value, with probabilities that sum to one;
- for an object schema, `{ fields: { [property]: { distribution } } }` — one such distribution per property.

Harper derives `value` and `probability` from the distribution, sorts it, and validates it against the schema before returning a `Decision`; a backend may supply `value` too; it must be a most-probable outcome, and on a tie it leads the distribution. An output that is incomplete, out of set, or does not sum to one is treated as a backend failure, so the next candidate in the [fallback group](./routing#fallback-groups) is tried. `calibrated` on the output overrides the backend's declared `calibrated` capability for that call, for object schemas too. When the caller passed `requires: ['calibrated']` and the output reports `calibrated: false`, that attempt is recorded as a failure after the request and the next candidate is tried.

## Scoring generative backends

<VersionBadge version="v5.3.0" />

A `generative` backend may also implement `scoreChoices(input, choices, opts)`, which the [generative decision adapter](#generative-decision-adapter) uses to score a decision from the model's own likelihoods instead of voting. `input` is the decision prompt in the shape `generate` takes, `choices` is a leaf's allowed values as strings in schema order, and `opts` carries the caller's `signal` and accounting context. It returns `{ status: 'completed', output: { logLikelihoods }, usage? }` with one finite, unnormalized log-likelihood per choice in the same order; Harper normalizes them, and treats a result that is not one finite number per choice as a backend failure. For a call the backend cannot score, throw an error whose `name` is `'ChoiceScoringUnsupportedError'`, with a `usage` property when the attempt consumed tokens: the attempt is recorded as `scoring_unsupported` with those tokens, the next scoring candidate in the [fallback group](./routing#fallback-groups) is tried, and when every candidate declines the adapter votes under `scoring: auto`. Any other error is a failure: the next candidate is tried, and if every candidate fails the failure, not a decline, is what surfaces. A backend built with [`defineBackend()`](#definebackend) derives the `scoreChoices` capability from the method's presence; a hand-written backend declares it in `capabilities()`.

## Custom backends

<VersionBadge version="v5.1.15" />

Beyond the four built-ins, a component or application can register its own backend — including an in-process one that runs inference locally instead of calling an HTTP service. A registered backend is selected by its logical name through the same `model` option as a configured backend.

Custom backends can be added two ways: **registered programmatically** (below), or **selected in config** by pointing the `backend` field at a module — see [Config-selectable backends](#config-selectable-backends).

### defineBackend()

<VersionBadge type="changed" version="v5.3.0" />

```typescript
models.defineBackend(spec: DefineBackendSpec): ModelBackend
```

A method on `models` (reachable as `models.defineBackend(...)` / `scope.models.defineBackend(...)`). Builds a `ModelBackend` from the methods it implements. `capabilities()` is derived from which of `embed` / `generate` / `generateStream` / `decide` / `scoreChoices` are supplied; `tools`, `adapters`, and `calibrated` cannot be inferred from method presence, so declare them explicitly.

| Field            | Type       | Default | Description                                                                                                                                                          |
| ---------------- | ---------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`           | `string`   | —       | Backend name, used in analytics and error messages (required)                                                                                                        |
| `embed`          | `function` | —       | `embed(input, opts)` implementation, if the backend embeds                                                                                                           |
| `generate`       | `function` | —       | `generate(input, opts)` implementation, if the backend generates                                                                                                     |
| `generateStream` | `function` | —       | `generateStream(input, opts)` implementation, if the backend streams                                                                                                 |
| `decide`         | `function` | —       | `decide(state, schema, opts)` implementation, if the backend decides — see [Decision backends](#decision-backends)                                                   |
| `scoreChoices`   | `function` | —       | `scoreChoices(input, choices, opts)` implementation, if the backend scores closed-set alternatives — see [Scoring generative backends](#scoring-generative-backends) |
| `tools`          | `boolean`  | `false` | Whether `generate` supports tool calls                                                                                                                               |
| `adapters`       | `boolean`  | `false` | Whether the backend supports per-call adapter selection                                                                                                              |
| `calibrated`     | `boolean`  | `false` | Whether the probabilities `decide` returns are calibrated; selectable with `requires: ['calibrated']`                                                                |

`embed`, `generate`, and `decide` return the shape the built-in backends return: `{ status: 'completed', output, usage? }`, where `output` is `Float32Array[]` for `embed`, `{ content, finishReason }` for `generate`, and a distribution (or per-field distributions) for `decide`. `generateStream` is an async generator yielding incremental `{ deltaContent?, deltaToolCalls?, finishReason? }` chunks — the same [`generateStream()`](./api#generatestream) shape, not a wrapped result. At least one method must be supplied. A backend that supplies only `generateStream` still satisfies `generate()`: Harper drains the stream into a single result.

### registerBackend()

<VersionBadge type="changed" version="v5.3.0" />

```typescript
models.registerBackend(kind: 'embedding' | 'generative' | 'decision', id: string, backend: ModelBackend): void
```

Registers `backend` under the logical name `id` for the given `kind`; an `embedding` backend must implement `embed`, a `generative` backend `generate` or `generateStream`, and a `decision` backend `decide`. A method on `models` (reachable as `models.registerBackend(...)` / `scope.models.registerBackend(...)`). Register during component initialization (for example, in `handleApplication`) so the backend is in place before requests arrive; the registry is process-wide, so each worker thread that loads the component registers its own instance.

Use a provider-namespaced `id` (e.g. `local:bge-small`) to avoid collisions when more than one component registers backends.

```javascript
import { models } from 'harper';
import { init, embed } from 'some-local-embedding-library';

await init();

models.registerBackend(
	'embedding',
	'local:bge-small',
	models.defineBackend({
		name: 'local:bge-small',
		async embed(input) {
			const texts = Array.isArray(input) ? input : [input];
			const vectors = await embed(texts);
			return { status: 'completed', output: vectors.map((v) => Float32Array.from(v)) };
		},
	})
);

// Selected like any other model:
const [vector] = await models.embed('What is Harper?', { model: 'local:bge-small' });
```

A registered backend takes precedence over a configuration entry with the same logical name, because registration runs after the configuration is loaded. A backend whose `capabilities()` disagrees with the methods it actually implements is registered as-is and fails at call time — `defineBackend()` keeps the two consistent.

### Config-selectable backends

A `backend` value in the [`models` configuration](./overview#configuration) that isn't a built-in name is resolved as a **module specifier** and imported at startup; the module's default export — or a `register` export — is a factory that registers the backend. This lets an operator select a custom backend entirely from config, the same way the built-ins are selected.

```yaml
models:
  embedding:
    default:
      backend: '@acme/embedder' # an installed package
      model: bge-small
```

The `backend` specifier is resolved as:

- a **bare package** (`@acme/embedder`) — resolved from the Harper instance's `node_modules`; install the backend as a dependency. Preferred, since it carries no filesystem path and travels with the deployment.
- an **instance-root-relative path** (`./backends/local.js`) — resolved against the Harper instance root.
- an **absolute path**.

The factory has the signature `({ logicalName, kind, config }) => void | Promise<void>` and registers via [`models.registerBackend`](#registerbackend); it receives the config entry with `${VAR}` placeholders already resolved, and `kind` is `embedding`, `generative`, or `decision` according to the map the entry sits in. A `backend` that is neither a built-in nor an importable module is logged and skipped at startup, leaving other entries unaffected.
