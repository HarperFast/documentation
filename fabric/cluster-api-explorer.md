---
title: Cluster API Explorer
---

# Cluster API Explorer

Each Harper cluster generates documentation for its own APIs, shown in Fabric Studio's API explorer. Use it to explore and test the endpoints your cluster serves, including the ones your applications define.

This page covers the APIs inside a cluster. To create and manage organizations and clusters themselves, see the [Fabric API Reference](./api-reference.md).

## Opening the API Explorer

1. Sign in to your Harper Fabric Studio.
2. Select your Organization and Cluster.
3. Sign in to the Cluster and navigate to the `APIs` tab in the sub-menu.

## Sending a Request

To call an endpoint from the API explorer:

1. Select an endpoint from the list. Use the filter above the list to narrow it.
2. Open the "Try it out" tab.
3. Fill in the path, query and header parameters, and the request body if the endpoint takes one.
4. Click the "Send request" button.
5. The response is displayed below, including the HTTP status code and the response body.

## Authorize

Endpoints that require authorization reject requests until you authorize the explorer.

1. Select "Authorize" at the top of the endpoint list.
2. Under "Authorization", open the "Try it out" tab and choose a method. "Log in" is recommended: it exchanges your current Studio session, or a username and password, for a short-lived token. Depending on your cluster, "Basic" and "Bearer token" are also offered.
3. Click "Authorize with your current session", or enter your credentials or token and click the "Authorize" button. The credential is sent with every "Try it out" request that follows.
4. Send a request to verify that the authorization was successful.

"Cookie" is also listed and needs no step: requests carry your browser's session cookie for the cluster. It often does not work for a deployed cluster, so use "Log in" if requests come back unauthorized.
