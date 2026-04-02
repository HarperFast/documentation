---
title: Grafana Integration
---

# Setup Grafana Integration with Harper

Grafana is an observability platform for monitoring and visualizing metrics, logs, and traces. Harper provides a plugin to integrate with Grafana for enhanced analytics and visualization capabilities.

To install the Harper Grafana integration:

1. Navigate to Harper's plug-in inside the [Grafana marketplace](https://grafana.com/grafana/plugins/harperfast-harper-datasource/).
2. Sign-in to your Grafana account. If you do not have an account, you will need to create one.
3. Click the "Get plugin" button.

## Installing on a Local/Self-Hosted Grafana Instance

4. Follow the steps under "[Installing on a local Grafana](https://grafana.com/grafana/plugins/harperfast-harper-datasource/?tab=installation)"

## Connect to Harper

4.  Navigate to your Grafana instance URL specified under `Installing Harper on Grafana Cloud`.
5.  On the left sidebar, click the `Connections` navigation link and select `Add new connection`
6.  In the search bar, type `Harper` to filter the list of available data source plugins.
7.  On the top right corner, click the `Add new data source` button.
8.  You will be directed to the `Settings` page for the new data source. Configure the following settings:
    - **Name**: Provide a name for the data source (e.g., `My Fabric Cluster Analytics`).
    - **Operations API URL**: Enter the URL to your Harper Fabric cluster's operations API
      - Found in Harper Fabric Studio navigating to the cluster:
        - Clicking the three dots and selecting `Copy API Url`.
      - Add `:9925` to the end of the URL if not already present.
    - **Username**: Enter a username with permission to use the analytics ops in the Operations API.
    - **Password**: Enter the password for the specified username.
9.  Click the `Save & Test` button to save the data source configuration and test the connection. You should see a message indicating that the data source is working.

## Building Dashboards

Once the Harper data source is configured, you can start building dashboards in Grafana.

## Explore

1. Click on the `Explore` navigation link in the left sidebar.
2. You can now create queries using the Harper data source to visualize your Harper Fabric cluster metrics and logs.
   Reference the [Harper Analytics Operations](/reference/v4/analytics/overview) for more details on available metrics and query options.
