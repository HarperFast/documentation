---
title: mTLS Authentication
---

# mTLS Authentication

Harper supports mTLS authentication for incoming connections. When enabled in the [HTTP config settings](../../deployments/configuration#http) the client certificate will be checked against the certificate authority specified with `tls.certificateAuthority`. If the certificate can be properly verified, the connection will authenticate users where the user's id/username is specified by the `CN` (common name) from the client certificate's `subject`, by default. The [HTTP config settings](../../deployments/configuration#http) allow you to determine if mTLS is required for all connections or optional.

## Certificate Revocation Checking

When using mTLS authentication, you can optionally enable certificate revocation checking to ensure that revoked certificates cannot be used, even if they are otherwise valid and trusted. This adds an important security layer by checking whether certificates have been explicitly revoked by the issuing Certificate Authority.

Harper supports both CRL (Certificate Revocation List) and OCSP (Online Certificate Status Protocol) for checking certificate revocation status, using a CRL-first strategy with OCSP fallback for optimal performance and reliability.

**To enable certificate verification:**

```yaml
http:
  mtls:
    required: true
    certificateVerification: true # Enable revocation checking
```

Certificate revocation checking is **disabled by default** and must be explicitly enabled. For detailed information about certificate revocation checking, including configuration options, performance considerations, and best practices, see [Certificate Management - Certificate Revocation Checking](./certificate-management#certificate-revocation-checking).
