---
title: Registration
---

# Registration

## Registration Info

Returns the registration data of the Harper instance.

- `operation` _(required)_ - must always be `registration_info`

### Body

```json
{
	"operation": "registration_info"
}
```

### Response: 200

```json
{
	"registered": true,
	"version": "4.2.0",
	"ram_allocation": 2048,
	"license_expiration_date": "2022-01-15"
}
```

---

## Install Usage License

Install a Harper license for a block of usage. Multiple usage blocks may be installed, and they will be used up sequentially, with the earliest installed blocks used first. A license is installed
by creating a string that consists of three base64url encoded blocks, separated by dots. The three blocks consist of:

- `header`: This is a JSON object with two properties:
  - `typ`: should be "Harper-License"
  - `alg`: should be "EdDSA"

This JSON object should be converted to base64url (conversion from utf-8 to base64url) and is the first base64url block.

- license payload: This is a JSON object with properties:
  - `id` _(required)_ - A unique id for the license
  - `level` _(required)_ - Usage level number
  - `region` _(required)_ - The region id where this license can be used
  - `reads` _(required)_ - The number of allowed reads
  - `readBytes` _(required)_ - The number of allowed read bytes
  - `writes` _(required)_ - The number of allowed writes
  - `writeBytes` _(required)_ - The number of allowed write bytes
  - `realTimeMessages` _(required)_ - The number of allowed real-time messages
  - `realTimeBytes` _(required)_ - The number of allowed real-time message bytes
  - `cpuTime` _(optional)_ - The allowed amount of CPU time consumed by application code
  - `storage` _(optional)_ - Maximum of storage that may be used
  - `expiration` _(required)_ - The date when this block expires, as an ISO date

This JSON object should be converted to base64url (conversion from utf-8 to base64url) and is the second base64url block.

For example:

```json
{
	"id": "license-717b-4c6c-b69d-b29014054ab7",
	"level": 2,
	"region": "us-nw-2",
	"reads": 2000000000,
	"readBytes": 8000000000000,
	"writes": 500000000,
	"writeBytes": 1000000000000,
	"realTimeMessages": 10000000000,
	"realTimeBytes": 40000000000000,
	"cpuTime": 108000,
	"storage": 400000000000000,
	"expiration": "2025-07-25T21:17:21.248Z"
}
```

- `signature`: This is the cryptographic signature, signed by Harper, of the first two blocks, separated by a dot, `header.payload`. This is also converted to base64url.

The three base64url blocks are combined to form the `license` property value in the operation.

- `operation` _(required)_ - must always be `install_usage_license`
- `license` _(required)_ - This is the combination of the three blocks in the form `header.payload.signature`

### Body

```json
{
	"operation": "install_usage_license",
	"license": "abc...0123.abc...0123.abc...0123"
}
```

### Response: 200

```json
{
	"message": "Successfully installed usage license"
}
```

---

## Get Usage Licenses

This will retrieve and return _all_ usage licenses (including expired, exhausted, and licenses in any other state), with counts of how much of the limits have been consumed.

- `operation` _(required)_ - must always be `get_usage_licenses`
- `region` _(optional)_ - will filter by region when supplied

### Body

```json
{
	"operation": "get_usage_licenses"
}
```

### Response: 200

```json
[
	{
		"id": "license-717b-4c6c-b69d-b29014054ab7",
		"level": 2,
		"region": "us-nw-2",
		"reads": 2000000000,
		"usedReads": 1100000000,
		"readBytes": 8000000000000,
		"usedReadBytes": 3000000000000,
		"writes": 500000000,
		"usedWrites": 300000000,
		"writeBytes": 1000000000000,
		"usedWriteBytes": 4300000000000,
		"realTimeMessages": 10000000000,
		"usedRealTimeMessages": 2000000000,
		"realTimeBytes": 40000000000000,
		"usedRealTimeBytes": 13000000000000,
		"cpuTime": 108000,
		"usedCpuTime": 41000,
		"storage": 400000000000000,
		"expiration": "2025-07-25T21:17:21.248Z"
	},
	{
		"id": "license-4c6c-b69d-b29014054ab7-717b",
		"level": 2,
		"region": "us-nw-2",
		"reads": 2000000000,
		"usedReads": 0,
		"readBytes": 8000000000000,
		"usedReadBytes": 0,
		"writes": 500000000,
		"usedWrites": 0,
		"writeBytes": 1000000000000,
		"usedWriteBytes": 0,
		"realTimeMessages": 10000000000,
		"usedRealTimeMessages": 0,
		"realTimeBytes": 40000000000000,
		"usedRealTimeBytes": 0,
		"cpuTime": 108000,
		"usedCpuTime": 0,
		"storage": 400000000000000,
		"expiration": "2025-09-25T21:17:21.248Z"
	},
	{
		"id": "license-4c6c-b69d-b29014054ab7-717b",
		"level": 2,
		"region": "us-se-2",
		"reads": 2000000000,
		"usedReads": 0,
		"readBytes": 8000000000000,
		"usedReadBytes": 0,
		"writes": 500000000,
		"usedWrites": 0,
		"writeBytes": 1000000000000,
		"usedWriteBytes": 0,
		"realTimeMessages": 10000000000,
		"usedRealTimeMessages": 0,
		"realTimeBytes": 40000000000000,
		"usedRealTimeBytes": 0,
		"cpuTime": 108000,
		"usedCpuTime": 0,
		"storage": 400000000000000,
		"expiration": "2025-11-25T21:17:21.248Z"
	}
]
```

---

## Get Fingerprint

(Deprecated)
Returns the Harper fingerprint, uniquely generated based on the machine, for licensing purposes.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_fingerprint`

### Body

```json
{
	"operation": "get_fingerprint"
}
```

---

## Set License

(Deprecated)
Sets the Harper license as generated by Harper License Management software.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `set_license`
- `key` _(required)_ - your license key
- `company` _(required)_ - the company that was used in the license

### Body

```json
{
	"operation": "set_license",
	"key": "<your-license-key>",
	"company": "<your-company>"
}
```
