---
title: Configuration
---

# Configuration

Harper was set up to require very minimal configuration to work out of the box. There are, however, some best practices we encourage for anyone building an app with Harper.

## CORS

Harper allows for managing [cross-origin HTTP requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). By default, Harper enables CORS for all domains if you need to disable CORS completely or set up an access list of domains you can do the following:

1. Open the harperdb-config.yaml file, which can be found in \<ROOTPATH>, the location you specified during install.
1. In harperdb-config.yaml there should be 2 entries under `operationsApi.network`: cors and corsAccessList.
   - `cors`
     1. To turn off, change to: `cors: false`
     1. To turn on, change to: `cors: true`
   - `corsAccessList`
     1. The `corsAccessList` will only be recognized by the system when `cors` is `true`
     1. To create an access list you set `corsAccessList` to a comma-separated list of domains.

        i.e. `corsAccessList` is `https://harpersystems.dev,https://products.harpersystems.dev`

     1. To clear out the access list and allow all domains: `corsAccessList` is `[null]`

## SSL

HarperDprovides the option to use an HTTP or HTTPS and HTTP/2 interface. The default port for the server is 9925.

These default ports can be changed by updating the `operationsApi.network.port` value in `<ROOTPATH>/harperdb-config.yaml`

By default, HTTPS is turned off and HTTP is turned on. It is recommended that you never directly expose Harper's HTTP interface through a publicly available port. HTTP is intended for local or private network use.

You can toggle HTTPS and HTTP in the settings file. By setting `operationsApi.network.https` to true/false. When `https` is set to `false`, the server will use HTTP (version 1.1). Enabling HTTPS will enable both HTTPS/1.1 and HTTPS/2.

Harper automatically generates a certificate (certificate.pem), a certificate authority (ca.pem) and a private key file (privateKey.pem) which live at `<ROOTPATH>/keys/`.

You can replace these with your own certificates and key.

**Changes to these settings require a restart. Use operation `harperdb restart` from Harper Operations API.**
