---
title: Custom Domains
---


# Custom Domains


## What are Custom Domains?


Custom domains allow you to serve your Harper Fabric cluster from your own domain (e.g., `api.yourcompany.com`) instead of the default `<cluster name>.<org subdomain>.harperfabric.com` URL. Harper Fabric handles domain verification, DNS validation, and TLS certificate provisioning — all from within the Fabric Studio UI.


## Prerequisites


Before adding a custom domain, make sure you have:


- An existing Harper Fabric cluster (see [Cluster Creation & Management](/fabric/cluster-creation-management) if you need to create one)
- A domain or subdomain that you own (e.g., `api.example.com`, `data.mycompany.io`)
- Access to your DNS registrar or DNS management provider (e.g., Cloudflare, Route 53, GoDaddy, Namecheap)


## Adding a Custom Domain


1. Navigate to your cluster’s page within your organization.
2. Select **Config** from the top navigation menu.
3. Select **Domains** from the left sidebar.
4. Enter your domain in the **New Domain Name** field — for example, `api.example.com` or `example.com`.
5. Click the **+ Add** button.


Harper Fabric will register the domain and display the DNS records you need to configure. A confirmation notification will appear: *“Domain added! Please add the TXT record above to your domain registrar.”*


## Configuring DNS Records


After adding your domain, Fabric displays two DNS records in the **Next Steps** column of the domains table. You will need to add both of these records at your DNS registrar.


### TXT Record (Domain Verification)


This record proves that you own the domain. Add the following to your DNS registrar:


- **Type**: `TXT`
- **Name**: `_fabric.<your domain>` (e.g., `_fabric.api.example.com`)
- **TTL**: Auto
- **Content**: The unique verification string displayed in the Fabric UI


(Note: Use the copy buttons next to each value in the Fabric UI to avoid typos.)


### CNAME Record (Traffic Routing)


This record points your domain to your Harper Fabric cluster. Add the following to your DNS registrar:


- **Type**: `CNAME`
- **Name**: Your subdomain prefix (e.g., `api` for `api.example.com`)
- **TTL**: Auto
- **Target**: Your cluster’s Fabric hostname (e.g., `my-cluster.my-org.harperfabric.com`)


(Note: If you’re using a root/apex domain like `example.com`, some DNS providers don’t support CNAME records at the root. Check with your provider for ALIAS or CNAME flattening support.)


## Validating Your Domain


After adding both DNS records at your registrar, you’ll need to wait for DNS propagation. This typically takes a few minutes to an hour, depending on your TTL settings.


Once your DNS records have propagated:


1. Return to **Config** → **Domains** in your cluster.
2. Click the **Validate** button at the top of the page.


Fabric will verify that the required TXT record exists and confirm domain ownership. If validation fails, double-check that the TXT record **Name** and **Content** values match exactly what Fabric provided, then wait a few more minutes and try again.


You can verify DNS propagation yourself using tools like [dnschecker.org](https://dnschecker.org) or the command line:


```bash
dig _fabric.api.example.com TXT
```


## Binding the Domain


After successful validation, use the **Bind** column in the domains table to bind the domain to your cluster. Once bound, traffic to your custom domain will be routed to your Harper Fabric cluster and TLS certificates will be provisioned automatically.


## Managing Domains


From the **Config** → **Domains** page, you can manage all custom domains associated with your cluster:


- **Add additional domains**: Repeat the process above for each domain you want to connect.
- **Remove a domain**: Click **Remove Domain** next to the domain entry in the table. (Note: Don’t forget to also clean up the corresponding DNS records at your registrar.)
- **Refresh status**: Click the **Refresh** button to update the validation status of all domains.


Each domain entry also displays a unique **Domain ID** (e.g., `dom-xxxxxxxxxxxx`) for reference.


## Additional Information


- TLS certificates are managed automatically by Harper Fabric once a domain is validated and bound. You can also manage custom certificates under the **Certificates** section in Config.
- You can add multiple custom domains to the same cluster.
- Your cluster’s default Fabric hostname can be found on the **Config** → **Overview** page under **Application URL**.
- DNS propagation can take up to 24–48 hours in rare cases, though it typically completes within minutes.

