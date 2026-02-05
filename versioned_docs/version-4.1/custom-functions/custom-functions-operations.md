---
title: Custom Functions Operations
---

# Custom Functions Operations

One way to manage Custom Functions is through [HarperDB Studio](../harperdb-studio/). It performs all the necessary operations automatically. To get started, navigate to your instance in HarperDB Studio and click the subnav link for "functions". If you have not yet enabled Custom Functions, it will walk you through the process. Once configuration is complete, you can manage and deploy Custom Functions in minutes.

HarperDB Studio manages your Custom Functions using nine HarperDB operations. You may view these operations within our [API Docs](https://api.harperdb.io/). A brief overview of each of the operations is below:

- **custom_functions_status**

  Returns the state of the Custom Functions server. This includes whether it is enabled, upon which port it is listening, and where its root project directory is located on the host machine.

- **get_custom_functions**

  Returns an array of projects within the Custom Functions root project directory. Each project has details including each of the files in the **routes** and **helpers** directories, and the total file count in the **static** folder.

- **get_custom_function**

  Returns the content of the specified file as text. HarperDB Studio uses this call to render the file content in its built-in code editor.

- **set_custom_function**

  Updates the content of the specified file. HarperDB Studio uses this call to save any changes made through its built-in code editor.

- **drop_custom_function**

  Deletes the specified file.

- **add_custom_function_project**

  Creates a new project folder in the Custom Functions root project directory. It also inserts into the new directory the contents of our Custom Functions Project template, which is available publicly, here: [https://github.com/HarperDB/harperdb-custom-functions-template](https://github.com/HarperDB/harperdb-custom-functions-template).

- **drop_custom_function_project**

  Deletes the specified project folder and all of its contents.

- **package_custom_function_project**

  Creates a .tar file of the specified project folder, then reads it into a base64-encoded string and returns that string the user.

- **deploy_custom_function_project**

  Takes the output of package_custom_function_project, decrypts the base64-encoded string, reconstitutes the .tar file of your project folder, and extracts it to the Custom Functions root project directory.
