---
title: Certificate Management
---

# Certificate Management

## Add Certificate

Adds or updates a certificate in the `hdb_certificate` system table.
If a `private_key` is provided it will **not** be stored in `hdb_certificate`, it will be written to file in `<ROOTPATH>/keys/`.
If a `private_key` is not passed the operation will search for one that matches the certificate. If one is not found an error will be returned.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_certificate`
- `name` _(required)_ - a unique name for the certificate
- `certificate` _(required)_ - a PEM formatted certificate string
- `is_authority` _(required)_ - a boolean indicating if the certificate is a certificate authority
- `hosts` _(optional)_ - an array of hostnames that the certificate is valid for
- `private_key` _(optional)_ - a PEM formatted private key string

### Body

```json
{
	"operation": "add_certificate",
	"name": "my-cert",
	"certificate": "-----BEGIN CERTIFICATE-----ZDFAay... -----END CERTIFICATE-----",
	"is_authority": false,
	"private_key": "-----BEGIN RSA PRIVATE KEY-----Y4dMpw5f... -----END RSA PRIVATE KEY-----"
}
```

### Response: 200

```json
{
	"message": "Successfully added certificate: my-cert"
}
```

---

## Remove Certificate

Removes a certificate from the `hdb_certificate` system table and deletes the corresponding private key file.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `remove_certificate`
- `name` _(required)_ - the name of the certificate

### Body

```json
{
	"operation": "remove_certificate",
	"name": "my-cert"
}
```

### Response: 200

```json
{
	"message": "Successfully removed my-cert"
}
```

---

## List Certificates

Lists all certificates in the `hdb_certificate` system table.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `list_certificates`

### Body

```json
{
	"operation": "list_certificates"
}
```

### Response: 200

```json
[
	{
		"name": "HarperDB-Certificate-Authority-node1",
		"certificate": "-----BEGIN CERTIFICATE-----\r\nTANBgkqhk... S34==\r\n-----END CERTIFICATE-----\r\n",
		"private_key_name": "privateKey.pem",
		"is_authority": true,
		"details": {
			"issuer": "CN=HarperDB-Certificate-Authority-node1 C=USA ST=Colorado L=Denver O=HarperDB\\, Inc.",
			"subject": "CN=HarperDB-Certificate-Authority-node1 C=USA ST=Colorado L=Denver O=HarperDB\\, Inc.",
			"serial_number": "5235345",
			"valid_from": "Aug 27 15:00:00 2024 GMT",
			"valid_to": "Aug 25 15:00:00 2034 GMT"
		},
		"is_self_signed": true,
		"uses": ["https", "wss"]
	},
	{
		"name": "node1",
		"certificate": "-----BEGIN CERTIFICATE-----\r\ngIEcSR1M... 5bv==\r\n-----END CERTIFICATE-----\r\n",
		"private_key_name": "privateKey.pem",
		"is_authority": false,
		"details": {
			"issuer": "CN=HarperDB-Certificate-Authority-node1 C=USA ST=Colorado L=Denver O=HarperDB\\, Inc.",
			"subject": "CN=node.1 C=USA ST=Colorado L=Denver O=HarperDB\\, Inc.",
			"subject_alt_name": "IP Address:127.0.0.1, DNS:localhost, IP Address:0:0:0:0:0:0:0:1, DNS:node.1",
			"serial_number": "5243646",
			"valid_from": "Aug 27 15:00:00 2024 GMT",
			"valid_to": "Aug 25 15:00:00 2034 GMT"
		},
		"is_self_signed": true,
		"uses": ["https", "wss"]
	}
]
```
