---
id: configuration
title: Authentication Configuration
---

<!-- Source: versioned_docs/version-4.7/deployments/configuration.md (authentication section, primary) -->

Harper's authentication system is configured via the top-level `authentication` section of `harper-config.yaml`.

```yaml
authentication:
  authorizeLocal: true
  cacheTTL: 30000
  enableSessions: true
  operationTokenTimeout: 1d
  refreshTokenTimeout: 30d
  hashFunction: sha256
```

## Options

### `authorizeLocal`

_Type: boolean — Default: `true`_

Automatically authorizes requests from the loopback IP address (`127.0.0.1`) as the superuser, without requiring credentials. Disable this for any Harper server that may be accessed by untrusted users from the same instance — for example, when using a local proxy or for general server hardening.

### `cacheTTL`

_Type: number — Default: `30000`_

How long (in milliseconds) an authentication result — a particular `Authorization` header or token — can be cached. Increasing this improves performance at the cost of slower revocation.

### `enableSessions`

_Type: boolean — Default: `true`_

<VersionBadge version="v4.2.0" />

Enables cookie-based sessions to maintain an authenticated session across requests. This is the preferred authentication mechanism for web browsers: cookies hold the token securely without exposing it to JavaScript, reducing XSS vulnerability risk.

### `operationTokenTimeout`

_Type: string — Default: `1d`_

How long a JWT operation token remains valid before expiring. Accepts [`jsonwebtoken`-compatible](https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim) duration strings (e.g., `1d`, `12h`, `60m`). See [JWT Authentication](./jwt-authentication.md).

### `refreshTokenTimeout`

_Type: string — Default: `30d`_

How long a JWT refresh token remains valid before expiring. Accepts [`jsonwebtoken`-compatible](https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim) duration strings. See [JWT Authentication](./jwt-authentication.md).

### `hashFunction`

_Type: string — Default: `sha256`_

<VersionBadge version="v4.5.0" />

Password hashing algorithm used when storing user passwords. Replaced the previous MD5 hashing. Options:

- **`sha256`** — Default. Good security and excellent performance.
- **`argon2id`** — Highest security. More CPU-intensive; recommended for environments that do not require frequent password verifications.

## HTTP Response Header Hardening

Harper is an origin/API server. By default it does not emit browser security-hardening response headers — `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, or the `Cross-Origin-*` family (COOP, COEP, CORP). For browser-facing deployments these should be set at your reverse proxy, CDN, or edge layer, not at the origin.

The highest-value, lowest-effort header to add is:

```http
X-Content-Type-Options: nosniff
```

This prevents browsers from MIME-sniffing response bodies away from the declared `Content-Type`, which closes an entire class of content-injection attacks with essentially zero deployment cost.

A typical Nginx snippet for the full hardening set:

```nginx
add_header X-Content-Type-Options    "nosniff"           always;
add_header X-Frame-Options           "SAMEORIGIN"        always;
add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
add_header Permissions-Policy        "geolocation=(), camera=()" always;
# Cross-Origin isolation — only enable if your app explicitly needs it:
# add_header Cross-Origin-Opener-Policy   "same-origin" always;
# add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

CSP values are application-specific and intentionally omitted here — set them based on the origins your application legitimately loads scripts, styles, and media from.

> These defaults may tighten in future Harper releases. Frame the edge configuration as a deployment baseline, not a permanent substitute for origin-level headers.

### Caching of authenticated responses

Harper does not emit `Cache-Control` headers on its responses. If you place Harper behind a shared cache or CDN, the cache must not store responses that depend on caller identity — authenticated reads, `allowRead`-gated rows, or any route that varies by `Authorization` header.

Ensure the cache either:

- **Excludes authenticated routes entirely** — pass `Cache-Control: no-store` at the edge for any path that requires an `Authorization` header, or
- **Keys the cache appropriately** — vary on `Authorization` (or on a session cookie) so each user's responses are stored and served separately.

Failing to do this can cause one user's private data to be returned to another. This is a deployment configuration concern, not something Harper enforces at the origin today.

## Related

- [JWT Authentication](./jwt-authentication.md)
- [Basic Authentication](./basic-authentication.md)
- [Users & Roles / Configuration](../users-and-roles/configuration.md)
