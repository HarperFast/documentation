---
title: Certificate Management
---

# Certificate Management

This document is information on managing certificates for the Operations API and the Custom Functions API. For information on certificate managment for clustering see [clustering certificate management](../../reference/clustering/certificate-management).

## Development

An out of the box install of HarperDB does not have HTTPS enabled for the Operations API or the Custom Functions API (see [configuration](../configuration) for relevant configuration file settings.) This is great for local development. If you are developing using a remote server and your requests are traversing the Internet, we recommend that you enable HTTPS.

To enable HTTPS, set the `operationsApi.network.https` and `customFunctions.network.https` to `true` and restart HarperDB.

By default HarperDB will generate certificates and place them at `<ROOTPATH>/keys/`. These certificates will not have a valid Common Name (CN) for your HarperDB node, so you will be able to use HTTPS, but your HTTPS client must be configured to accept the invalid certificate.

## Production

For production deployments, in addition to using HTTPS, we recommend using your own certificate authority (CA) or a public CA such as Let's Encrypt, to generate certificates with CNs that match the Fully Qualified Domain Name (FQDN) of your HarperDB node.

We have a few recommended options for enabling HTTPS in a production setting.

### Option: Enable HarperDB HTTPS and Replace Certificates

To enable HTTPS, set the `operationsApi.network.https` and `customFunctions.network.https` to `true` and restart HarperDB.

To replace the certificates, either replace the contents of the existing certificate files at `<ROOTPATH>/keys/`, or update the HarperDB configuration with the path of your new certificate files, and then restart HarperDB.

```yaml
operationsApi:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
```

```yaml
customFunctions:
  tls:
    certificate: ~/hdb/keys/certificate.pem
    certificateAuthority: ~/hdb/keys/ca.pem
    privateKey: ~/hdb/keys/privateKey.pem
```

### Option: Nginx Reverse Proxy

Instead of enabling HTTPS for HarperDB, Nginx can be used as a reverse proxy for HarperDB.

Install Nginx, configure Nginx to use certificates issued from your own CA or a public CA, then configure Nginx to listen for HTTPS requests and forward to HarperDB as HTTP requests.

[Certbot](https://certbot.eff.org/) is a great tool for automatically requesting and renewing Let’s Encrypt certificates used by Nginx.

### Option: External Reverse Proxy

Instead of enabling HTTPS for HarperDB, a number of different external services can be used as a reverse proxy for HarperDB. These services typically have integrated certificate management. Configure the service to listen for HTTPS requests and forward (over a private network) to HarperDB as HTTP requests.

Examples of these types of services include an AWS Application Load Balancer or a GCP external HTTP(S) load balancer.

### Additional Considerations

It is possible to use different certificates for the Operations API and the Custom Functions API. In scenarios where only your Custom Functions endpoints need to be exposed to the Internet and the Operations API is reserved for HarperDB administration, you may want to use a private CA to issue certificates for the Operations API and a public CA for the Custom Functions API certificates.
