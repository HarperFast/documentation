---
title: Custom Domains
---

# Custom Domains

## What are Custom Domains?

Custom domains allow you to serve your Harper Fabric cluster from your own domain (e.g., `api.yourcompany.com`) instead of the default `<cluster name>.<org subdomain>.harperfabric.com` URL. Harper Fabric handles domain verification, DNS validation, and TLS certificate provisioning — all from within the Fabric Studio UI. (A wildcard domain is the exception: it needs a certificate you provide; see [Wildcard Domains](#wildcard-domains).)

## Prerequisites

Before adding a custom domain, make sure you have:

- An existing Harper Fabric cluster (see [Cluster Creation & Management](/fabric/cluster-creation-management) if you need to create one)
- A domain or subdomain that you own (e.g., `api.example.com`, `data.mycompany.io`), or a wildcard covering many subdomains (e.g., `*.preview.example.com`; see [Wildcard Domains](#wildcard-domains))
- Access to your DNS registrar or DNS management provider (e.g., Cloudflare, Route 53, GoDaddy, Namecheap)

## Accessing Domain Configuration

Domain configuration is accessible through two primary paths:

1.  **From the Fabric Dashboard:**
    - Log in to [https://fabric.harper.fast/](https://fabric.harper.fast/).
    - Click on your organization name.
    - Locate the cluster you want to configure and click the context menu (three dots "**...**").
    - Select the **Domains** configuration option.
2.  **From Cluster Configuration:**
    - Navigate to your cluster’s page within your organization.
    - Select **Config** from the top navigation menu.
    - Select **Domains** from the left sidebar.

## Adding a Custom Domain

1. Access domain configuration using one of the paths above.
2. Enter your domain in the **New Domain Name** field — for example, `api.example.com`, `example.com`, or a wildcard such as `*.preview.example.com`.
3. Click the **+ Add** button.

Harper Fabric will register the domain and display the DNS records you need to configure. A confirmation notification will appear: _“Domain added! Please add the TXT record above to your domain registrar.”_

Domain names are not case-sensitive, and Fabric stores them in lowercase. A name must be a valid hostname, optionally starting with `*.` for a wildcard. Once an organization has verified a domain, no other organization can register it.

## Configuring DNS Records

After adding your domain, Fabric displays two DNS records in the **Next Steps** column of the domains table. You will need to add both of these records at your DNS registrar.

### TXT Record (Domain Verification)

This record proves that you own the domain. Add the following to your DNS registrar:

- **Type**: `TXT`
- **Name**: `_fabric.<your domain>` (e.g., `_fabric.api.example.com`). For a wildcard such as `*.preview.example.com`, the record goes on the name after the `*.`: `_fabric.preview.example.com`.
- **TTL**: Auto
- **Content**: The unique verification string displayed in the Fabric UI

(Note: Use the copy buttons next to each value in the Fabric UI to avoid typos.)

### CNAME Record (Traffic Routing)

After ownership is verified, you will be instructed to add a CNAME record to your domain registrar pointing to the Harper Fabric load balancer.

- **Type**: `CNAME`
- **Name**: Your subdomain prefix (e.g., `api` for `api.example.com`, or `*.preview` for `*.preview.example.com`)
- **TTL**: Auto
- **Target**: Your cluster’s Fabric hostname (e.g., `my-cluster.my-org.harperfabric.com`)

:::info Apex Domains
Some registrars do not support CNAME records for apex domains (e.g., `yourdomain.com`). In this case, we recommend:

1.  Registering a subdomain like `www.yourdomain.com`.
2.  Redirecting the apex domain (`@` or `yourdomain.com`) to the `www` subdomain.

Alternatively, check if your provider supports ALIAS or CNAME flattening.
:::

## Validating Your Domain

After adding both DNS records at your registrar, you’ll need to wait for DNS propagation. This typically takes a few minutes to an hour, depending on your TTL settings.

Once your DNS records have propagated (this may take **10 minutes** or more):

1. Return to **Config** → **Domains** in your cluster.
2. Click the **Validate** button at the top of the page.

Fabric will verify that the required TXT record exists and confirm domain ownership. If validation fails, double-check that the TXT record **Name** and **Content** values match exactly what Fabric provided, then wait a few more minutes and try again.

You can verify DNS propagation yourself using tools like [dnschecker.org](https://dnschecker.org) or the command line:

```bash
dig _fabric.api.example.com TXT
```

For a wildcard such as `*.preview.example.com`, check `_fabric.preview.example.com` instead.

## Binding the Domain

After successful validation, use the **Bind** column in the domains table to bind the domain to your cluster.

Once bound, Harper Fabric will automatically begin generating an SSL certificate for your domain:

- This process typically takes **5-10 minutes**.
- The interface will show you the progress as it goes.
- A wildcard domain is the exception: Fabric does not generate its certificate. See [Wildcard Domains](#wildcard-domains) to add your own.

Everything should be working once the SSL certificate is successfully generated! Traffic to your custom domain will then be routed to your Harper Fabric cluster.

## Wildcard Domains

A wildcard domain, such as `*.preview.example.com`, routes every host one level below it to your cluster. You register and verify it once, instead of adding a custom domain for each host. This suits per-pull-request previews, where each preview runs at its own host, such as `pr-42.preview.example.com`.

- **Coverage.** A wildcard covers exactly one label in place of the `*`. `*.preview.example.com` covers `pr-42.preview.example.com`, but neither `preview.example.com` itself nor `a.pr-42.preview.example.com`. The `*` must be the whole leftmost label.
- **Verification.** The TXT record goes on the name after the `*.`: `_fabric.preview.example.com`. A wildcard and that name share the record name, and each registration has its own verification string, so add each one as its own TXT record at that name.
- **DNS.** Point the wildcard at your cluster with a wildcard CNAME record (`*.preview`, targeting your cluster's Fabric hostname).
- **Certificate.** Fabric's automatic certificates use Let's Encrypt's HTTP-01 challenge, and Let's Encrypt [issues wildcard certificates only through the DNS-01 challenge](https://letsencrypt.org/docs/faq/#does-let-s-encrypt-issue-wildcard-certificates). So you provide your own wildcard certificate, for example one you obtain from Let's Encrypt with a DNS-01 challenge at your DNS provider, and you replace it before it expires. Fabric keeps generating certificates for the cluster's other domains.
- **More specific domains win.** If a host under the wildcard also has its own custom domain, in your organization or another, traffic for that host follows that domain rather than the wildcard.

To add your wildcard certificate, send the [`add_certificate`](/reference/v5/operations-api/operations#add_certificate) operation, as a `super_user`, to your cluster's Operations API: in Fabric Studio, click the cluster's three dots, select `Copy API Url`, and add `:9925` if it is not already there. Include the certificate's private key. The operation, private key included, is applied on every node in the cluster, and Fabric serves the certificate for every host the wildcard covers.

```json
{
	"operation": "add_certificate",
	"name": "preview-wildcard",
	"certificate": "-----BEGIN CERTIFICATE-----...",
	"private_key": "-----BEGIN PRIVATE KEY-----...",
	"is_authority": false
}
```

## Managing Domains

From the **Config** → **Domains** page, you can manage all custom domains associated with your cluster:

- **Add additional domains**: Repeat the process above for each domain you want to connect.
- **Remove a domain**: Click **Remove Domain** next to the domain entry in the table. (Note: Don’t forget to also clean up the corresponding DNS records at your registrar.)
- **Refresh status**: Click the **Refresh** button to update the validation status of all domains.

Each domain entry also displays a unique **Domain ID** (e.g., `dom-xxxxxxxxxxxx`) for reference.

## Additional Information

- TLS certificates are managed automatically by Harper Fabric once a domain is validated and bound, except for wildcard domains ([Wildcard Domains](#wildcard-domains)). You can also manage custom certificates under the **Certificates** section in Config.
- You can add multiple custom domains to the same cluster.
- Your cluster’s default Fabric hostname can be found on the **Config** → **Overview** page under **Application URL**.
- DNS propagation can take up to 24–48 hours in rare cases, though it typically completes within minutes.
