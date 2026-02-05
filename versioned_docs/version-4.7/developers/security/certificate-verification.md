---
title: Certificate Verification
---

# Certificate Verification

Certificate verification (also called certificate revocation checking) is a security feature that ensures revoked certificates cannot be used for authentication, even if they are otherwise valid and trusted. This is a critical security control for environments where certificates may need to be revoked before their expiration date due to compromise, employee departure, or other security concerns.

## Overview

When a client presents a certificate for mTLS authentication, Harper performs the following checks:

1. **Certificate Validation** (always performed by Node.js TLS):
   - Certificate signature is valid
   - Certificate is issued by a trusted CA
   - Certificate is within its validity period
   - Certificate chain is properly formed

2. **Certificate Revocation Checking** (optional, must be explicitly enabled):
   - Certificate has not been revoked by the issuing CA
   - Uses CRL (Certificate Revocation List) and/or OCSP (Online Certificate Status Protocol)

## Revocation Checking Methods

Harper supports two industry-standard methods for checking certificate revocation status:

### CRL (Certificate Revocation List)

A CRL is a digitally signed list of revoked certificates published by a Certificate Authority.

**Advantages:**

- Fast verification (cached locally)
- Works offline once downloaded
- Predictable bandwidth usage
- Good for high-volume verification
- No privacy concerns (no per-certificate queries)

**How it works:**

1. Harper downloads the CRL from the distribution point specified in the certificate
2. CRL is cached locally (24 hours by default)
3. Subsequent verifications check the cached CRL (very fast, no network requests)
4. CRL is refreshed in the background before expiration

**Configuration:**

```yaml
http:
  mtls:
    certificateVerification:
      crl:
        timeout: 10000 # 10 seconds to download CRL
        cacheTtl: 86400000 # Cache for 24 hours
        gracePeriod: 86400000 # 24 hour grace period after nextUpdate
        failureMode: fail-closed # Reject on CRL check failure
```

### OCSP (Online Certificate Status Protocol)

OCSP provides real-time certificate status checking by querying the CA's OCSP responder.

**Advantages:**

- Real-time revocation status
- Smaller response size than CRL
- Good for certificates without CRL distribution points
- Works when CRL is unavailable

**How it works:**

1. Harper sends a request to the OCSP responder specified in the certificate
2. OCSP responder returns the current status (good, revoked, or unknown)
3. Response is cached (1 hour by default for success, 5 minutes for errors)

**Configuration:**

```yaml
http:
  mtls:
    certificateVerification:
      ocsp:
        timeout: 5000 # 5 seconds for OCSP response
        cacheTtl: 3600000 # Cache successful responses for 1 hour
        errorCacheTtl: 300000 # Cache errors for 5 minutes
        failureMode: fail-closed # Reject on OCSP check failure
```

## Verification Strategy

Harper uses a **CRL-first strategy with OCSP fallback** for optimal performance and reliability:

1. **Check CRL** if available
   - Fast (uses cached CRL)
   - No network request needed if CRL is cached
   - If CRL check succeeds or fails definitively, return result

2. **Fall back to OCSP** if:
   - Certificate has no CRL distribution point
   - CRL download fails
   - CRL is expired and cannot be refreshed

3. **Apply failure mode** if both methods fail

This strategy provides the best balance of:

- **Performance**: CRL checks are very fast when cached
- **Reliability**: OCSP provides fallback when CRL is unavailable
- **Security**: Always attempts verification before falling back

## Configuration

### Enable with Defaults

The simplest configuration enables certificate verification with sensible defaults:

```yaml
http:
  mtls:
    required: true
    certificateVerification: true
```

This enables:

- CRL checking (enabled, 10s timeout, 24h cache)
- OCSP checking (enabled, 5s timeout, 1h cache)
- Fail-closed mode (rejects connections on verification failure)

### Custom Configuration

For production environments, you may want to customize settings:

```yaml
http:
  mtls:
    required: true
    certificateVerification:
      failureMode: fail-closed # Global setting
      crl:
        timeout: 15000 # 15 seconds for CRL download
        cacheTtl: 43200000 # Cache CRLs for 12 hours
        gracePeriod: 86400000 # 24 hour grace period
        failureMode: fail-closed # CRL-specific setting
      ocsp:
        timeout: 8000 # 8 seconds for OCSP response
        cacheTtl: 7200000 # Cache results for 2 hours
        errorCacheTtl: 600000 # Cache errors for 10 minutes
        failureMode: fail-closed # OCSP-specific setting
```

### CRL Only (No OCSP)

For environments where OCSP is not available or desired:

```yaml
http:
  mtls:
    certificateVerification:
      ocsp: false # Disable OCSP, CRL remains enabled
```

### OCSP Only (No CRL)

For environments preferring real-time checking:

```yaml
http:
  mtls:
    certificateVerification:
      crl: false # Disable CRL, OCSP remains enabled
```

### Environment Variables

All settings can be configured via environment variables:

```bash
# Enable certificate verification
HTTP_MTLS_CERTIFICATEVERIFICATION=true

# Global failure mode
HTTP_MTLS_CERTIFICATEVERIFICATION_FAILUREMODE=fail-closed

# CRL settings
HTTP_MTLS_CERTIFICATEVERIFICATION_CRL=true
HTTP_MTLS_CERTIFICATEVERIFICATION_CRL_TIMEOUT=15000
HTTP_MTLS_CERTIFICATEVERIFICATION_CRL_CACHETTL=43200000
HTTP_MTLS_CERTIFICATEVERIFICATION_CRL_GRACEPERIOD=86400000
HTTP_MTLS_CERTIFICATEVERIFICATION_CRL_FAILUREMODE=fail-closed

# OCSP settings
HTTP_MTLS_CERTIFICATEVERIFICATION_OCSP=true
HTTP_MTLS_CERTIFICATEVERIFICATION_OCSP_TIMEOUT=8000
HTTP_MTLS_CERTIFICATEVERIFICATION_OCSP_CACHETTL=7200000
HTTP_MTLS_CERTIFICATEVERIFICATION_OCSP_ERRORCACHETTL=600000
HTTP_MTLS_CERTIFICATEVERIFICATION_OCSP_FAILUREMODE=fail-closed
```

For replication servers, use the `REPLICATION_` prefix instead of `HTTP_`.

## Failure Modes

Certificate verification supports two failure modes that control behavior when verification cannot be completed:

### fail-closed (Recommended)

**Default behavior.** Rejects connections when verification fails due to network errors, timeouts, or other operational issues.

**Use when:**

- Security is paramount
- You can tolerate false positives (rejecting valid certificates)
- Your CA infrastructure is highly available
- You're in a zero-trust environment

**Example:**

```yaml
certificateVerification:
  failureMode: fail-closed
```

### fail-open

Allows connections when verification fails, but logs a warning. The connection is still rejected if the certificate is explicitly found to be revoked.

**Use when:**

- Availability is more important than perfect security
- Your CA infrastructure may be intermittently unavailable
- You have other compensating controls
- You're gradually rolling out certificate verification

**Example:**

```yaml
certificateVerification:
  failureMode: fail-open
```

**Important:** Invalid signatures on CRLs always result in rejection regardless of failure mode, as this indicates potential tampering.

## Performance Considerations

### CRL Performance

- **First verification**: Downloads CRL (10s timeout by default)
- **Subsequent verifications**: Instant (reads from cache)
- **Background refresh**: CRL is refreshed before expiration without blocking requests
- **Memory usage**: ~10-100KB per CRL depending on size
- **Network usage**: One download per CRL per cacheTtl period

### OCSP Performance

- **First verification**: OCSP query (5s timeout by default)
- **Subsequent verifications**: Reads from cache (1 hour default)
- **Memory usage**: Minimal (~1KB per cached response)
- **Network usage**: One query per unique certificate per cacheTtl period

### Optimization Tips

1. **Increase CRL cache TTL** for stable environments:

   ```yaml
   crl:
     cacheTtl: 172800000 # 48 hours
   ```

2. **Increase OCSP cache TTL** for long-lived connections:

   ```yaml
   ocsp:
     cacheTtl: 7200000 # 2 hours
   ```

3. **Use CRL only** if you control the CA and **all certificates have CRL distribution points**:

   ```yaml
   ocsp: false # Only disable if all certs have CRL URLs
   ```

4. **Reduce grace period** if you need tighter revocation enforcement:
   ```yaml
   crl:
     gracePeriod: 0 # No grace period
   ```

## Production Best Practices

### High-Security Environments

```yaml
http:
  mtls:
    required: true
    certificateVerification:
      failureMode: fail-closed # Always reject on failure
      crl:
        timeout: 15000 # Longer timeout for reliability
        cacheTtl: 43200000 # 12 hours (balance security and performance)
        gracePeriod: 0 # No grace period for strict enforcement
      ocsp:
        timeout: 8000
        cacheTtl: 3600000 # 1 hour
```

### High-Availability Environments

```yaml
http:
  mtls:
    required: true
    certificateVerification:
      failureMode: fail-open # Prioritize availability
      crl:
        timeout: 5000 # Shorter timeout to fail faster
        cacheTtl: 86400000 # 24 hours
        gracePeriod: 86400000 # 24 hour grace period
      ocsp:
        timeout: 3000
        cacheTtl: 7200000 # 2 hours for fewer queries
```

### Performance-Critical Environments

For maximum performance, increase cache durations to minimize network requests:

```yaml
http:
  mtls:
    required: true
    certificateVerification:
      crl:
        cacheTtl: 172800000 # 48 hours (minimize CRL downloads)
        gracePeriod: 86400000 # 24 hour grace period
      ocsp:
        cacheTtl: 7200000 # 2 hours (minimize OCSP queries)
        errorCacheTtl: 600000 # Cache errors for 10 minutes
```

**Note**: Only disable OCSP (`ocsp: false`) if you're certain all client certificates have CRL distribution points. Otherwise, certificates without CRLs won't be checked for revocation.

## Troubleshooting

### Connection Rejected: Certificate Verification Failed

**Cause:** Certificate was found to be revoked or verification failed in fail-closed mode.

**Solutions:**

1. Check if certificate is actually revoked in the CRL or OCSP responder
2. Verify CA infrastructure is accessible
3. Check timeout settings (may need to increase)
4. Temporarily use fail-open mode while investigating:
   ```yaml
   certificateVerification:
     failureMode: fail-open
   ```

### High Latency on First Connection

**Cause:** CRL is being downloaded for the first time.

**Solutions:**

1. This is normal and only happens once per CRL per cacheTtl period
2. Subsequent connections will be fast (cached CRL)
3. Increase CRL timeout if downloads are slow:
   ```yaml
   crl:
     timeout: 20000 # 20 seconds
   ```

### Frequent CRL Downloads

**Cause:** CRL cacheTtl is too short or CRL nextUpdate period is very short.

**Solutions:**

1. Increase cacheTtl:
   ```yaml
   crl:
     cacheTtl: 172800000 # 48 hours
   ```
2. Increase gracePeriod to allow using slightly expired CRLs:
   ```yaml
   crl:
     gracePeriod: 172800000 # 48 hours
   ```

### OCSP Responder Unavailable

**Cause:** OCSP responder is down or unreachable.

**Solutions:**

1. CRL will be used as fallback automatically
2. Use fail-open mode to allow connections:
   ```yaml
   ocsp:
     failureMode: fail-open
   ```
3. Disable OCSP and rely on CRL only (ensure all certs have CRL URLs):
   ```yaml
   ocsp: false
   ```

### Network/Firewall Blocking Outbound Requests

**Cause:** Secure hosting environments often restrict outbound HTTP/HTTPS traffic to reduce exfiltration risks. This prevents Harper from reaching CRL distribution points and OCSP responders.

**Symptoms:**

- Certificate verification timeouts in fail-closed mode
- Logs show connection failures to CRL/OCSP URLs
- First connection succeeds (no cached CRL), subsequent fail after cache expires

**Solutions:**

1. **Allow outbound traffic to CA infrastructure** (recommended):
   - Whitelist CRL distribution point URLs (from your certificates)
   - Whitelist OCSP responder URLs (from your certificates)
   - Example: If using Let's Encrypt, allow `http://x1.c.lencr.org/` and `http://ocsp.int-x3.letsencrypt.org/`

2. **Use fail-open mode** (allows connections when verification fails):

   ```yaml
   certificateVerification:
     failureMode: fail-open # Don't block on network issues
   ```

3. **Use CRL only with local caching/proxy**:
   - Set up an internal CRL mirror/proxy
   - Configure firewall to allow Harper → internal CRL proxy
   - Increase cache TTL to reduce fetch frequency:
     ```yaml
     certificateVerification:
       crl:
         cacheTtl: 172800000 # 48 hours
       ocsp: false # Disable OCSP
     ```

4. **Disable verification** (if you have alternative security controls):
   ```yaml
   certificateVerification: false
   ```

## Security Considerations

### When Certificate Verification is Critical

Enable certificate verification when:

- Certificates have long validity periods (> 1 day)
- You need immediate revocation capability
- Compliance requires revocation checking (PCI DSS, HIPAA, etc.)
- You're in a zero-trust security model
- Client certificates are used for API authentication

### When You Might Skip It

Consider not using certificate verification when:

- Certificates have very short validity periods (< 24 hours)
- You rotate certificates automatically (e.g., with cert-manager)
- You have alternative revocation mechanisms
- Performance is critical and risk is acceptable
- Your CA doesn't publish CRLs or support OCSP

### Defense in Depth

Certificate verification is one layer of security. Also consider:

- Short certificate validity periods (reduces window of compromise)
- Certificate pinning (prevents CA compromise)
- Network segmentation (limits blast radius)
- Access logging and monitoring
- Regular certificate rotation

## Replication Server

Certificate verification works identically for replication servers. Use the `replication.mtls` configuration:

```yaml
replication:
  hostname: server-one
  routes:
    - server-two
  mtls:
    certificateVerification: true
```

**Important:** mTLS is always required for replication and cannot be disabled. This configuration only controls whether certificate revocation checking is performed.

For complete replication configuration, see [Configuration - Replication](../../deployments/configuration#replication).

## Further Reading

- [Certificate Management](./certificate-management) - Managing certificates and CAs
- [mTLS Authentication](./mtls-auth) - Setting up mTLS
- [Configuration Reference](../../deployments/configuration) - Complete configuration options
