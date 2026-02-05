---
title: Certificate Management
---

# Certificate Management

This document is information on managing certificates for Harper external facing APIs. For information on certificate management for clustering see [clustering certificate management](../../reference/clustering/certificate-management).

## Development

An out of the box install of Harper does not have HTTPS enabled (see [configuration](../../deployments/configuration#http) for relevant configuration file settings.) This is great for local development. If you are developing using a remote server and your requests are traversing the Internet, we recommend that you enable HTTPS.

To enable HTTPS, set `http.securePort` in `harperdb-config.yaml` to the port you wish to use for HTTPS connections and restart Harper.

By default Harper will generate certificates and place them at `<ROOTPATH>/keys/`. These certificates will not have a valid Common Name (CN) for your Harper node, so you will be able to use HTTPS, but your HTTPS client must be configured to accept the invalid certificate.

## Production

For production deployments, in addition to using HTTPS, we recommend using your own certificate authority (CA) or a public CA such as Let's Encrypt, to generate certificates with CNs that match the Fully Qualified Domain Name (FQDN) of your Harper node.

We have a few recommended options for enabling HTTPS in a production setting.

### Option: Enable Harper HTTPS and Replace Certificates

To enable HTTPS, set `http.securePort` in `harperdb-config.yaml` to the port you wish to use for HTTPS connections and restart Harper.

To replace the certificates, either replace the contents of the existing certificate files at `<ROOTPATH>/keys/`, or update the Harper configuration with the path of your new certificate files, and then restart Harper.

```yaml
tls:
  certificate: ~/hdb/keys/certificate.pem
  privateKey: ~/hdb/keys/privateKey.pem
```

`operationsApi.tls` configuration is optional. If it is not set Harper will default to the values in the `tls` section.

```yaml
operationsApi:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    privateKey: ~/hdb/keys/privateKey.pem
```

### mTLS

Mutual TLS (mTLS) is a security protocol that requires both the client and the server to present certificates to each other. Requiring a client certificate can be useful for authenticating clients and ensuring that only authorized clients can access your Harper instance. This can be enabled by setting the `http.mtls` configuration in `harperdb-config.yaml` to `true` and providing a certificate authority in the TLS section:

```yaml

http:
  mtls: true
  ...
tls:
  certificateAuthority: ~/hdb/keys/ca.pem
  ...
```

### Certificate Revocation Checking

When using mTLS, you may also want to enable certificate revocation checking to ensure that revoked certificates cannot be used for authentication, even if they're still within their validity period. Harper supports two industry-standard methods for checking certificate revocation status:

**CRL (Certificate Revocation List)**

- A digitally signed list of revoked certificates published by the Certificate Authority
- Downloaded and cached locally for fast verification
- Updated periodically (typically daily)
- Best for: High-volume verification, offline scenarios, predictable bandwidth usage

**OCSP (Online Certificate Status Protocol)**

- Real-time query to check individual certificate status
- Provides immediate revocation status
- Requires network connection for each check (with caching)
- Best for: Real-time revocation status, certificates without CRL distribution points

**Harper's Approach: CRL-First with OCSP Fallback**

Harper uses a CRL-first strategy for optimal performance:

1. Checks CRL if available (fast, cached locally for 24 hours by default)
2. Falls back to OCSP if CRL is not available or fails (cached for 1 hour by default)
3. Applies the configured failure mode if both methods fail

This strategy provides the best balance of performance, reliability, and security.

**Enabling Certificate Verification**

Certificate revocation checking is disabled by default and must be explicitly enabled:

```yaml
http:
  mtls:
    required: true
    certificateVerification: true # Enable with defaults
```

For production environments with high-security requirements, you can customize the verification settings:

```yaml
http:
  mtls:
    required: true
    certificateVerification:
      failureMode: fail-closed # Reject connections on verification failure
      crl:
        timeout: 15000 # 15 seconds to download CRL
        cacheTtl: 43200000 # Cache for 12 hours
      ocsp:
        timeout: 8000 # 8 seconds for OCSP response
        cacheTtl: 7200000 # Cache for 2 hours
```

**Performance Considerations**

- **CRL caching**: CRLs are cached locally, so subsequent verifications are very fast (no network requests)
- **OCSP caching**: Successful OCSP responses are cached (1 hour by default), errors cached for 5 minutes
- **Background refresh**: CRLs are refreshed in the background before expiration to avoid blocking requests
- **Graceful degradation**: Network failures don't block connections in fail-open mode

**When to Use Certificate Verification**

Enable certificate revocation checking when:

- You need to immediately revoke access for compromised certificates
- Compliance or security policies require revocation checking
- You're in a zero-trust security environment
- Client certificates have long validity periods

You may skip it if:

- All certificates have very short validity periods (e.g., < 24 hours)
- You have alternative revocation mechanisms in place
- Performance is critical and risk is acceptable

For detailed configuration options, see the [configuration reference](../../deployments/configuration#http).

### Option: Nginx Reverse Proxy

Instead of enabling HTTPS for Harper, Nginx can be used as a reverse proxy for Harper.

Install Nginx, configure Nginx to use certificates issued from your own CA or a public CA, then configure Nginx to listen for HTTPS requests and forward to Harper as HTTP requests.

[Certbot](https://certbot.eff.org/) is a great tool for automatically requesting and renewing Let’s Encrypt certificates used by Nginx.

### Option: External Reverse Proxy

Instead of enabling HTTPS for Harper, a number of different external services can be used as a reverse proxy for Harper. These services typically have integrated certificate management. Configure the service to listen for HTTPS requests and forward (over a private network) to Harper as HTTP requests.

Examples of these types of services include an AWS Application Load Balancer or a GCP external HTTP(S) load balancer.

### Additional Considerations

It is possible to use different certificates for the Operations API and the Custom Functions API. In scenarios where only your Custom Functions endpoints need to be exposed to the Internet and the Operations API is reserved for Harper administration, you may want to use a private CA to issue certificates for the Operations API and a public CA for the Custom Functions API certificates.
