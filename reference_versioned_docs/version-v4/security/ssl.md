<!-- Source: versioned_docs/version-4.7/developers/security/configuration.md (primary - SSL section) -->
<!-- Source: versioned_docs/version-4.7/developers/security/certificate-management.md (for configuration details) -->
<!-- Source: http/tls.md (already migrated - for cross-reference) -->

---
id: ssl
title: SSL / HTTPS
---

# SSL / HTTPS

Harper provides the option to use HTTP, HTTPS, or HTTP/2. By default, HTTPS is disabled and HTTP is enabled.

## Default Ports

| Protocol | Default Port | Config Key |
|---|---|---|
| HTTP (Operations API) | 9925 | `operationsApi.network.port` |
| HTTP (HTTP server) | 9926 | `http.port` |
| HTTPS (HTTP server) | — | `http.securePort` |

## Enabling HTTPS

Set `http.securePort` in `harperdb-config.yaml` to the port you wish to use for HTTPS, and restart Harper:

```yaml
http:
  securePort: 9926
```

When HTTPS is enabled, Harper serves both HTTPS/1.1 and HTTP/2 on the secure port.

To enable HTTPS for the Operations API, set `operationsApi.network.https: true`:

```yaml
operationsApi:
  network:
    https: true
    port: 9925
```

When `operationsApi.network.https` is `false`, the Operations API server uses HTTP/1.1. Enabling it activates both HTTPS/1.1 and HTTP/2.

## HTTP/2 Support

Added in: v4.5.0 (confirmed via release notes)

HTTP/2 is automatically enabled alongside HTTPS. No additional configuration is needed beyond enabling HTTPS.

## Certificates

Harper automatically generates self-signed TLS certificates at `<ROOTPATH>/keys/`:

- `certificate.pem`
- `privateKey.pem`
- `ca.pem`

These can be replaced with certificates from your own CA or a public CA. See [Certificate Management](./certificate-management.md) for full details.

To specify custom certificate paths:

```yaml
tls:
  certificate: ~/hdb/keys/certificate.pem
  privateKey: ~/hdb/keys/privateKey.pem
```

## TLS Configuration

For full TLS configuration including SNI (multi-domain certificates) and mTLS, see [HTTP TLS](../http/tls.md).

## Security Recommendations

- **Never** directly expose Harper's HTTP interface through a publicly available port. HTTP is intended for local or private network use only.
- For production, use HTTPS with valid certificates (not self-signed).
- Consider placing Harper behind a reverse proxy (Nginx, load balancer) for TLS termination if preferred. See [Certificate Management](./certificate-management.md) for reverse proxy options.

## Restart Requirement

Changes to SSL/TLS settings require a restart:

```bash
harper restart
```

Or via the Operations API: `{ "operation": "restart" }`.
