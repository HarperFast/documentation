<!-- Source: versioned_docs/version-4.7/developers/security/configuration.md (primary - CORS section) -->

---
id: cors
title: CORS
---

# CORS

Harper supports managing [cross-origin HTTP requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). By default, Harper enables CORS for all origins.

## Configuration

CORS is configured under `operationsApi.network` in `harperdb-config.yaml`.

### Disable CORS

```yaml
operationsApi:
  network:
    cors: false
```

### Enable CORS for All Origins (Default)

```yaml
operationsApi:
  network:
    cors: true
    corsAccessList: '[null]'
```

Setting `corsAccessList` to `[null]` clears any access list and allows all origins.

### Restrict to Specific Origins

```yaml
operationsApi:
  network:
    cors: true
    corsAccessList: 'https://harpersystems.dev,https://products.harpersystems.dev'
```

`corsAccessList` accepts a comma-separated list of allowed origins. It is only applied when `cors` is `true`.

## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `cors` | boolean | `true` | Enable or disable CORS. |
| `corsAccessList` | string | `[null]` (all origins) | Comma-separated list of allowed origins. Only used when `cors` is `true`. Set to `[null]` to allow all origins. |

## Notes

- Changes to CORS settings require a restart. Use `harper restart` or the `restart` operation via the Operations API.
- For HTTP server CORS configuration (custom application endpoints), see [HTTP Configuration](../http/configuration.md).
