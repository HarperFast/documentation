---
title: mTLS Authentication
---

# mTLS Authentication

Harper supports mTLS authentication for incoming connections. When enabled in the [HTTP config settings](../../deployments/configuration#http) the client certificate will be checked against the certificate authority specified with `tls.certificateAuthority`. If the certificate can be properly verified, the connection will authenticate users where the user's id/username is specified by the `CN` (common name) from the client certificate's `subject`, by default. The [HTTP config settings](../../deployments/configuration#http) allow you to determine if mTLS is required for all connections or optional.
