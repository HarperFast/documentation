---
id: configuration
title: Authentication Configuration
---

<!-- Source: versioned_docs/version-4.7/deployments/configuration.md (authentication section, primary) -->

Harper's authentication system is configured via the top-level `authentication` section of `harperdb-config.yaml`.

```yaml
authentication:
  authorizeLocal: true
  cacheTTL: 30000
  enableSessions: true
  operationTokenTimeout: 1d
  refreshTokenTimeout: 30d
  hashFunction: sha256 # Added in v4.5.0. Options: sha256, argon2id
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

Added in: v4.2.0

Enables cookie-based sessions to maintain an authenticated session across requests. This is the preferred authentication mechanism for web browsers: cookies hold the token securely without exposing it to JavaScript, reducing XSS vulnerability risk.

### `operationTokenTimeout`

_Type: string — Default: `1d`_

How long a JWT operation token remains valid before expiring. Accepts [`ms`-format](https://github.com/vercel/ms) duration strings (e.g., `1d`, `12h`, `60m`). See [JWT Authentication](./jwt-authentication.md).

### `refreshTokenTimeout`

_Type: string — Default: `30d`_

How long a JWT refresh token remains valid before expiring. Accepts [`ms`-format](https://github.com/vercel/ms) duration strings. See [JWT Authentication](./jwt-authentication.md).

### `hashFunction`

_Type: string — Default: `sha256`_

Added in: v4.5.0

Password hashing algorithm used when storing user passwords. Replaced the previous MD5 hashing. Options:

- **`sha256`** — Default. Good security and excellent performance.
- **`argon2id`** — Highest security. More CPU-intensive; recommended for environments that do not require frequent password verifications.

<!-- TODO: verify the exact config key name `hashFunction` against the Harper source — not present in v4.7 config docs, inferred from release notes -->

## Related

- [JWT Authentication](./jwt-authentication.md)
- [Basic Authentication](./basic-authentication.md)
- [Users & Roles / Configuration](../users-and-roles/configuration.md)
