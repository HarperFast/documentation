---
title: JWT Authentication
---

# JWT Authentication

HarperDB uses token based authentication with JSON Web Tokens, JWTs.

This consists of two primary operations `create_authentication_tokens` and `refresh_operation_token`. These generate two types of tokens, as follows:

- The `operation_token` which is used to authenticate all HarperDB operations in the Bearer Token Authorization Header. The default expiry is one day.
- The `refresh_token` which is used to generate a new `operation_token` upon expiry. This token is used in the Bearer Token Authorization Header for the `refresh_operation_token` operation only. The default expiry is thirty days.

The `create_authentication_tokens` operation can be used at any time to refresh both tokens in the event that both have expired or been lost.

## Create Authentication Tokens

Users must initially create tokens using their HarperDB credentials. The following POST body is sent to HarperDB. No headers are required for this POST operation.

```json
{
	"operation": "create_authentication_tokens",
	"username": "username",
	"password": "password"
}
```

A full cURL example can be seen here:

```bash
curl --location --request POST 'http://localhost:9925' \
--header 'Content-Type: application/json' \
--data-raw '{
    "operation": "create_authentication_tokens",
    "username": "username",
    "password": "password"
}'
```

An example expected return object is:

```json
{
	"operation_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiaWF0IjoxNjA0OTc4MjAwLCJleHAiOjE2MDUwNjQ2MDAsInN1YiI6Im9wZXJhdGlvbiJ9.MpQA-9CMjA-mn-7mHyUXSuSC_-kqMqJXp_NDiKLFtbtMRbodCuY3DzH401rvy_4vb0yCELf0B5EapLVY1545sv80nxSl6FoZFxQaDWYXycoia6zHpiveR8hKlmA6_XTWHJbY2FM1HAFrdtt3yUTiF-ylkdNbPG7u7fRjTmHfsZ78gd2MNWIDkHoqWuFxIyqk8XydQpsjULf2Uacirt9FmHfkMZ-Jr_rRpcIEW0FZyLInbm6uxLfseFt87wA0TbZ0ofImjAuaW_3mYs-3H48CxP152UJ0jByPb0kHsk1QKP7YHWx1-Wce9NgNADfG5rfgMHANL85zvkv8sJmIGZIoSpMuU3CIqD2rgYnMY-L5dQN1fgfROrPMuAtlYCRK7r-IpjvMDQtRmCiNG45nGsM4DTzsa5GyDrkGssd5OBhl9gr9z9Bb5HQVYhSKIOiy72dK5dQNBklD4eGLMmo-u322zBITmE0lKaBcwYGJw2mmkYcrjDOmsDseU6Bf_zVUd9WF3FqwNkhg4D7nrfNSC_flalkxPHckU5EC_79cqoUIX2ogufBW5XgYbU4WfLloKcIpb51YTZlZfwBHlHPSyaq_guaXFaeCUXKq39_i1n0HRF_mRaxNru0cNDFT9Fm3eD7V8axFijSVAMDyQs_JR7SY483YDKUfN4l-vw-EVynImr4",
	"refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiaWF0IjoxNjA0OTc4MjAwLCJleHAiOjE2MDc1NzAyMDAsInN1YiI6InJlZnJlc2gifQ.acaCsk-CJWIMLGDZdGnsthyZsJfQ8ihXLyE8mTji8PgGkpbwhs7e1O0uitMgP_pGjHq2tey1BHSwoeCL49b18WyMIB10hK-q2BXGKQkykltjTrQbg7VsdFi0h57mGfO0IqAwYd55_hzHZNnyJMh4b0iPQFDwU7iTD7x9doHhZAvzElpkWbc_NKVw5_Mw3znjntSzbuPN105zlp4Niurin-_5BnukwvoJWLEJ-ZlF6hE4wKhaMB1pWTJjMvJQJE8khTTvlUN8tGxmzoaDYoe1aCGNxmDEQnx8Y5gKzVd89sylhqi54d2nQrJ2-ElfEDsMoXpR01Ps6fNDFtLTuPTp7ixj8LvgL2nCjAg996Ga3PtdvXJAZPDYCqqvaBkZZcsiqOgqLV0vGo3VVlfrcgJXQImMYRr_Inu0FCe47A93IAWuQTs-KplM1KdGJsHSnNBV6oe6QEkROJT5qZME-8xhvBYvOXqp9Znwg39bmiBCMxk26Ce66_vw06MNgoa3D5AlXPWemfdVKPZDnj_aLVjZSs0gAfFElcVn7l9yjWJOaT2Muk26U8bJl-2BEq_DSclqKHODuYM5kkPKIdE4NFrsqsDYuGxcA25rlNETFyl0q-UXj1aoz_joy5Hdnr4mFELmjnoo4jYQuakufP9xeGPsj1skaodKl0mmoGcCD6v1F60"
}
```

## Using JWT Authentication Tokens

The `operation_token` value is used to authenticate all operations in place of our standard Basic auth. In order to pass the token you will need to create an Bearer Token Authorization Header like the following request:

```bash
curl --location --request POST 'http://localhost:9925' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiaWF0IjoxNjA0OTc4MjAwLCJleHAiOjE2MDUwNjQ2MDAsInN1YiI6Im9wZXJhdGlvbiJ9.MpQA-9CMjA-mn-7mHyUXSuSC_-kqMqJXp_NDiKLFtbtMRbodCuY3DzH401rvy_4vb0yCELf0B5EapLVY1545sv80nxSl6FoZFxQaDWYXycoia6zHpiveR8hKlmA6_XTWHJbY2FM1HAFrdtt3yUTiF-ylkdNbPG7u7fRjTmHfsZ78gd2MNWIDkHoqWuFxIyqk8XydQpsjULf2Uacirt9FmHfkMZ-Jr_rRpcIEW0FZyLInbm6uxLfseFt87wA0TbZ0ofImjAuaW_3mYs-3H48CxP152UJ0jByPb0kHsk1QKP7YHWx1-Wce9NgNADfG5rfgMHANL85zvkv8sJmIGZIoSpMuU3CIqD2rgYnMY-L5dQN1fgfROrPMuAtlYCRK7r-IpjvMDQtRmCiNG45nGsM4DTzsa5GyDrkGssd5OBhl9gr9z9Bb5HQVYhSKIOiy72dK5dQNBklD4eGLMmo-u322zBITmE0lKaBcwYGJw2mmkYcrjDOmsDseU6Bf_zVUd9WF3FqwNkhg4D7nrfNSC_flalkxPHckU5EC_79cqoUIX2ogufBW5XgYbU4WfLloKcIpb51YTZlZfwBHlHPSyaq_guaXFaeCUXKq39_i1n0HRF_mRaxNru0cNDFT9Fm3eD7V8axFijSVAMDyQs_JR7SY483YDKUfN4l-vw-EVynImr4' \
--data-raw '{
    "operation":"search_by_hash",
    "schema":"dev",
    "table":"dog",
    "hash_values":[1],
    "get_attributes": ["*"]
}'
```

## Token Expiration

`operation_token` expires at a set interval. Once it expires it will no longer be accepted by HarperDB. This duration defaults to one day, and is configurable in [harperdb-config.yaml](../../deployments/configuration). To generate a new `operation_token`, the `refresh_operation_token` operation is used, passing the `refresh_token` in the Bearer Token Authorization Header. A full cURL example can be seen here:

```bash
curl --location --request POST 'http://localhost:9925' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiaWF0IjoxNjA0OTc4MjAwLCJleHAiOjE2MDc1NzAyMDAsInN1YiI6InJlZnJlc2gifQ.acaCsk-CJWIMLGDZdGnsthyZsJfQ8ihXLyE8mTji8PgGkpbwhs7e1O0uitMgP_pGjHq2tey1BHSwoeCL49b18WyMIB10hK-q2BXGKQkykltjTrQbg7VsdFi0h57mGfO0IqAwYd55_hzHZNnyJMh4b0iPQFDwU7iTD7x9doHhZAvzElpkWbc_NKVw5_Mw3znjntSzbuPN105zlp4Niurin-_5BnukwvoJWLEJ-ZlF6hE4wKhaMB1pWTJjMvJQJE8khTTvlUN8tGxmzoaDYoe1aCGNxmDEQnx8Y5gKzVd89sylhqi54d2nQrJ2-ElfEDsMoXpR01Ps6fNDFtLTuPTp7ixj8LvgL2nCjAg996Ga3PtdvXJAZPDYCqqvaBkZZcsiqOgqLV0vGo3VVlfrcgJXQImMYRr_Inu0FCe47A93IAWuQTs-KplM1KdGJsHSnNBV6oe6QEkROJT5qZME-8xhvBYvOXqp9Znwg39bmiBCMxk26Ce66_vw06MNgoa3D5AlXPWemfdVKPZDnj_aLVjZSs0gAfFElcVn7l9yjWJOaT2Muk26U8bJl-2BEq_DSclqKHODuYM5kkPKIdE4NFrsqsDYuGxcA25rlNETFyl0q-UXj1aoz_joy5Hdnr4mFELmjnoo4jYQuakufP9xeGPsj1skaodKl0mmoGcCD6v1F60' \
--data-raw '{
  "operation":"refresh_operation_token"
}'
```

This will return a new `operation_token`. An example expected return object is:

```bash
{
  "operation_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6eyJfX2NyZWF0ZWR0aW1lX18iOjE2MDQ5NzgxODkxNTEsIl9fdXBkYXRlZHRpbWVfXyI6MTYwNDk3ODE4OTE1MSwiYWN0aXZlIjp0cnVlLCJyb2xlIjp7Il9fY3JlYXRlZHRpbWVfXyI6MTYwNDk0NDE1MTM0NywiX191cGRhdGVkdGltZV9fIjoxNjA0OTQ0MTUxMzQ3LCJpZCI6IjdiNDNlNzM1LTkzYzctNDQzYi05NGY3LWQwMzY3Njg5NDc4YSIsInBlcm1pc3Npb24iOnsic3VwZXJfdXNlciI6dHJ1ZSwic3lzdGVtIjp7InRhYmxlcyI6eyJoZGJfdGFibGUiOnsicmVhZCI6dHJ1ZSwiaW5zZXJ0IjpmYWxzZSwidXBkYXRlIjpmYWxzZSwiZGVsZXRlIjpmYWxzZSwiYXR0cmlidXRlX3Blcm1pc3Npb25zIjpbXX0sImhkYl9hdHRyaWJ1dGUiOnsicmVhZCI6dHJ1ZSwiaW5zZXJ0IjpmYWxzZSwidXBkYXRlIjpmYWxzZSwiZGVsZXRlIjpmYWxzZSwiYXR0cmlidXRlX3Blcm1pc3Npb25zIjpbXX0sImhkYl9zY2hlbWEiOnsicmVhZCI6dHJ1ZSwiaW5zZXJ0IjpmYWxzZSwidXBkYXRlIjpmYWxzZSwiZGVsZXRlIjpmYWxzZSwiYXR0cmlidXRlX3Blcm1pc3Npb25zIjpbXX0sImhkYl91c2VyIjp7InJlYWQiOnRydWUsImluc2VydCI6ZmFsc2UsInVwZGF0ZSI6ZmFsc2UsImRlbGV0ZSI6ZmFsc2UsImF0dHJpYnV0ZV9wZXJtaXNzaW9ucyI6W119LCJoZGJfcm9sZSI6eyJyZWFkIjp0cnVlLCJpbnNlcnQiOmZhbHNlLCJ1cGRhdGUiOmZhbHNlLCJkZWxldGUiOmZhbHNlLCJhdHRyaWJ1dGVfcGVybWlzc2lvbnMiOltdfSwiaGRiX2pvYiI6eyJyZWFkIjp0cnVlLCJpbnNlcnQiOmZhbHNlLCJ1cGRhdGUiOmZhbHNlLCJkZWxldGUiOmZhbHNlLCJhdHRyaWJ1dGVfcGVybWlzc2lvbnMiOltdfSwiaGRiX2xpY2Vuc2UiOnsicmVhZCI6dHJ1ZSwiaW5zZXJ0IjpmYWxzZSwidXBkYXRlIjpmYWxzZSwiZGVsZXRlIjpmYWxzZSwiYXR0cmlidXRlX3Blcm1pc3Npb25zIjpbXX0sImhkYl9pbmZvIjp7InJlYWQiOnRydWUsImluc2VydCI6ZmFsc2UsInVwZGF0ZSI6ZmFsc2UsImRlbGV0ZSI6ZmFsc2UsImF0dHJpYnV0ZV9wZXJtaXNzaW9ucyI6W119LCJoZGJfbm9kZXMiOnsicmVhZCI6dHJ1ZSwiaW5zZXJ0IjpmYWxzZSwidXBkYXRlIjpmYWxzZSwiZGVsZXRlIjpmYWxzZSwiYXR0cmlidXRlX3Blcm1pc3Npb25zIjpbXX0sImhkYl90ZW1wIjp7InJlYWQiOnRydWUsImluc2VydCI6ZmFsc2UsInVwZGF0ZSI6ZmFsc2UsImRlbGV0ZSI6ZmFsc2UsImF0dHJpYnV0ZV9wZXJtaXNzaW9ucyI6W119fX19LCJyb2xlIjoic3VwZXJfdXNlciJ9LCJ1c2VybmFtZSI6InVzZXJuYW1lIn0sImlhdCI6MTYwNDk3ODcxMywiZXhwIjoxNjA1MDY1MTEzLCJzdWIiOiJvcGVyYXRpb24ifQ.qB4FS7fzryCO5epQlFCQe4mQcUEhzXjfsXRFPgauXrGZwSeSr2o2a1tE1xjiI3qjK0r3f2bdi2xpFlDR1thdY-m0mOpHTICNOae4KdKzp7cyzRaOFurQnVYmkWjuV_Ww4PJgr6P3XDgXs5_B2d7ZVBR-BaAimYhVRIIShfpWk-4iN1XDk96TwloCkYx01BuN87o-VOvAnOG-K_EISA9RuEBpSkfUEuvHx8IU4VgfywdbhNMh6WXM0VP7ZzSpshgsS07MGjysGtZHNTVExEvFh14lyfjfqKjDoIJbo2msQwD2FvrTTb0iaQry1-Wwz9QJjVAUtid7tJuP8aBeNqvKyMIXRVnl5viFUr-Gs-Zl_WtyVvKlYWw0_rUn3ucmurK8tTy6iHyJ6XdUf4pYQebpEkIvi2rd__e_Z60V84MPvIYs6F_8CAy78aaYmUg5pihUEehIvGRj1RUZgdfaXElw90-m-M5hMOTI04LrzzVnBu7DcMYg4UC1W-WDrrj4zUq7y8_LczDA-yBC2-bkvWwLVtHLgV5yIEuIx2zAN74RQ4eCy1ffWDrVxYJBau4yiIyCc68dsatwHHH6bMK0uI9ib6Y9lsxCYjh-7MFcbP-4UBhgoDDXN9xoUToDLRqR9FTHqAHrGHp7BCdF5d6TQTVL5fmmg61MrLucOo-LZBXs1NY"
}
```

The `refresh_token` also expires at a set interval, but a longer interval. Once it expires it will no longer be accepted by HarperDB. This duration defaults to thirty days, and is configurable in [harperdb-config.yaml](../../deployments/configuration). To generate a new `operation_token` and a new `refresh_token` the `create_authentication_tokensoperation` is called.

## Configuration

Token timeouts are configurable in [harperdb-config.yaml](../../deployments/configuration) with the following parameters:

- `operationsApi.authentication.operationTokenTimeout`: Defines the length of time until the operation_token expires (default 1d).
- `operationsApi.authentication.refreshTokenTimeout`: Defines the length of time until the refresh_token expires (default 30d).

A full list of valid values for both parameters can be found [here](https://github.com/vercel/ms).
