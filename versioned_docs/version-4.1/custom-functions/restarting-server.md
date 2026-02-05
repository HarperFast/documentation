---
title: Restarting the Server
---

# Restarting the Server

One way to manage Custom Functions is through [HarperDB Studio](../harperdb-studio/). It performs all the necessary operations automatically. To get started, navigate to your instance in HarperDB Studio and click the subnav link for "functions". If you have not yet enabled Custom Functions, it will walk you through the process. Once configuration is complete, you can manage and deploy Custom Functions in minutes.

For any changes made to your routes, helpers, or projects, you’ll need to restart the Custom Functions server to see them take effect. HarperDB Studio does this automatically whenever you create or delete a project, or add, edit, or edit a route or helper. If you need to start the Custom Functions server yourself, you can use the following operation to do so:

```json
{
	"operation": "restart_service",
	"service": "custom_functions"
}
```
