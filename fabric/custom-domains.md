---
title: Custom Domains (BYOD)
---

# Custom Domains (Bring Your Own Domain)

You can configure your own custom domains for Fabric Clusters to provide a branded experience for your users.

## Accessing Domain Configuration

Domain configuration is accessible through two primary paths:

1.  **From the Fabric Dashboard:**
    - Log in to [https://fabric.harper.fast/](https://fabric.harper.fast/).
    - Click on your organization name.
    - Locate the cluster you want to configure and click the context menu (three dots "**...**").
    - Select the **Domains** configuration option.
2.  **From Cluster Configuration:**
    - Connect to your cluster.
    - Navigate to **Config** and then **Domains**.

## Configuration Steps

Follow these steps to set up your custom domain:

### 1. Add Domain

Type in your domain name and click **Add**.

### 2. Verify Ownership

To confirm you own the domain, you must add the TXT records displayed on the screen to your domain registrar.

- Once added, click the **Validate** button.
- **Note:** It may take 10 minutes or more for DNS changes to propagate across your domain registrar.

### 3. Configure CNAME

After ownership is verified, you will be instructed to add a CNAME record to your domain registrar pointing to the Harper Fabric load balancer.

:::info Apex Domains
Some registrars do not support CNAME records for apex domains (e.g., `yourdomain.com`). In this case, we recommend:

1.  Registering a subdomain like `www.yourdomain.com`.
2.  Redirecting the apex domain (`@` or `yourdomain.com`) to the `www` subdomain.
    :::

### 4. Bind Domain

Once the CNAME is set up, you can bind the domain to your cluster.

### 5. SSL Certificate Generation

After binding, SSL certificates will be automatically generated for your domain.

- This process typically takes **5-10 minutes**.
- Please be patient; the interface will show you the progress as it goes.

Everything should be working once the SSL certificate is successfully generated!
