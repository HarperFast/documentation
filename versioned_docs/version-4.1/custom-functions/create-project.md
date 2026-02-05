---
title: Create a Project
---

# Create a Project

To create a project using our web-based GUI, HarperDB Studio, checkout out how to manage Custom Functions [here](../harperdb-studio/manage-functions).

Otherwise, to create a project, you have the following options:

1. **Use the add_custom_function_project operation**

   This operation creates a new project folder, and populates it with templates for the routes, helpers, and static subfolders.

```json
{
	"operation": "add_custom_function_project",
	"project": "dogs"
}
```

1. **Clone our public gitHub project template**

   _This requires a local installation. Remove the .git directory for a clean slate of git history._

```bash
> git clone https://github.com/HarperDB/harperdb-custom-functions-template.git ~/hdb/custom_functions/dogs
```

1. **Create a project folder in your Custom Functions root directory** and **initialize**

   _This requires a local installation._

```bash
> mkdir ~/hdb/custom_functions/dogs
```

```bash
> npm init
```
