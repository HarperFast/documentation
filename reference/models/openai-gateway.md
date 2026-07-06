---
id: openai-gateway
title: OpenAI-Compatible Gateway
---

<!-- Source: harper resources/models/v1/*.ts (v5.1) -->

<VersionBadge version="v5.1.16" />

Harper exposes an OpenAI-compatible REST gateway on the application HTTP server port (default `9926`, alongside the [REST interface](../rest/overview)): `POST /v1/embeddings`, `POST /v1/chat/completions` (including SSE streaming), and `GET /v1/models`. These are thin protocol-translation wrappers over the [`models`](./overview) API — an unmodified OpenAI SDK, LangChain.js, or Vercel AI SDK client can point its `baseURL` at a Harper instance and work without code changes.

| Endpoint                    | Maps to                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `POST /v1/embeddings`       | [`models.embed()`](./api#embed)                                                           |
| `POST /v1/chat/completions` | [`models.generate()`](./api#generate) / [`models.generateStream()`](./api#generatestream) |
| `GET /v1/models`            | Registered backend logical names                                                          |

## Enabling it

The gateway is opt-in. Add `modelsGateway: {}` to `harper-config.yaml` alongside at least one configured model:

```yaml
modelsGateway: {}
models:
  generative:
    default:
      backend: openai
      apiKey: ${OPENAI_API_KEY}
      model: gpt-4o
```

The gateway does not add its own authentication — requests go through Harper's normal REST auth chain like any other resource. Deploy behind a network boundary or configure Harper's [authentication](../security/overview) as appropriate.

## Using it with an OpenAI client

Point the client's `baseURL` at `<harper-host>:9926/v1` and pass a Harper [JWT operation token](../security/jwt-authentication) as `apiKey` — OpenAI SDKs send it as `Authorization: Bearer <apiKey>`, which Harper's auth chain validates the same way it validates that header on any other request:

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
	apiKey: '<harper-operation-token>',
	baseURL: 'http://localhost:9926/v1',
});

const completion = await client.chat.completions.create({
	model: 'default',
	messages: [{ role: 'user', content: 'Say hello in three words' }],
});
console.log(completion.choices[0].message.content);
```

Obtain the token with [`create_authentication_tokens`](../security/jwt-authentication#create-authentication-tokens). For clients that let you override request headers instead (for example LangChain.js's `configuration.baseOptions.headers`), [Basic Authentication](../security/basic-authentication) with a Harper username/password also works, since the endpoints are ordinary REST resources.

## Model selection

The `model` field in a request selects a logical model name from the `models` configuration or a backend registered with [`models.registerBackend()`](./backends#registerbackend) — the same lookup `models.embed()` / `models.generate()` use. `GET /v1/models` lists the currently registered names:

```json
{
	"object": "list",
	"data": [
		{ "id": "default", "object": "model", "created": 1730000000, "owned_by": "harper" },
		{ "id": "fast", "object": "model", "created": 1730000000, "owned_by": "harper" }
	]
}
```

The list includes both embedding and generative backends. An unrecognized `model` value in a request fails the same way an unconfigured logical name fails for `models.embed()` / `models.generate()` — see [Errors and timeouts](./api#errors-and-timeouts).

## POST /v1/embeddings

```json
{ "model": "default", "input": "What is Harper?" }
```

`input` may be a single string or an array of strings (batched in one call). The response follows the OpenAI list shape, with vectors in input order:

```json
{
	"object": "list",
	"data": [{ "object": "embedding", "index": 0, "embedding": [0.0123, -0.0456, ...] }],
	"model": "default",
	"usage": { "prompt_tokens": 4, "total_tokens": 4 }
}
```

## POST /v1/chat/completions

```json
{
	"model": "default",
	"messages": [{ "role": "user", "content": "What is an HNSW index?" }]
}
```

Recognized fields: `model`, `messages`, `tools`, `tool_choice`, `temperature`, `max_tokens` / `max_completion_tokens` (the latter takes precedence when both are present), `response_format`, and `stream`. These map to [`GenerateOpts`](./api#generate) — `response_format: { type: 'json_object' }` maps to `responseFormat: 'json'`, and `{ type: 'json_schema', json_schema }` to `responseFormat: { schema }`.

A non-streaming call returns an OpenAI `chat.completion` object:

```json
{
	"id": "chatcmpl-...",
	"object": "chat.completion",
	"created": 1730000000,
	"model": "default",
	"choices": [{ "index": 0, "message": { "role": "assistant", "content": "..." }, "finish_reason": "stop" }],
	"usage": { "prompt_tokens": 12, "completion_tokens": 8, "total_tokens": 20 }
}
```

### Streaming

Set `stream: true` to receive Server-Sent Events instead — the OpenAI `chat.completion.chunk` delta envelope, terminated by the `data: [DONE]` sentinel:

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1730000000,"model":"default","choices":[{"index":0,"delta":{"role":"assistant","content":"An"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1730000000,"model":"default","choices":[{"index":0,"delta":{"content":" HNSW"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1730000000,"model":"default","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

Tool-call deltas from `generateStream()` are assembled by tool-call id and emitted as a single chunk with fully-formed `arguments` (a JSON string), rather than fragment-by-fragment — Harper's upstream backends do not reliably deliver arguments in a form that can be split without corrupting the concatenated JSON. If the client disconnects mid-stream, Harper stops iterating the underlying `generateStream()` call, which lets the backend cancel its in-flight request.

### Tool calls

`tools` and `tool_choice` are supported in return-mode only — the equivalent of [`toolMode: 'return'`](./tool-calling#toolmode-return). The model's requested calls surface on `choices[0].message.tool_calls` (or as `tool_calls` deltas while streaming); the caller is responsible for executing them and sending the results back as a follow-up request with `role: 'tool'` messages. Harper's in-process tool-orchestration loop (`toolMode: 'auto'`) is not exposed through this gateway.

## GET /v1/models

Takes no parameters. Returns every registered embedding and generative backend as a `data[]` entry, keyed by logical name (see [Model selection](#model-selection)).

## Errors

Every error path returns the OpenAI error envelope, including authentication failures, instead of Harper's default [RFC 9457 Problem Details](../rest/overview) response:

```json
{
	"error": {
		"message": "Model 'unknown' is not configured",
		"type": "invalid_request_error",
		"code": "model_not_found",
		"param": null
	}
}
```

`type` is one of `invalid_request_error` (bad request body, unknown model), `authentication_error` (401/403), or `server_error` (backend/unexpected failures); `code` is populated for `model_not_found` and left `null` otherwise.

## Analytics

Gateway requests call `models.embed()` / `generate()` / `generateStream()` directly, so they are recorded like any other model call — see [Analytics](./analytics).
