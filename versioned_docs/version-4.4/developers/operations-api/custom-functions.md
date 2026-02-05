---
title: Custom Functions
---

# Custom Functions

## Custom Functions Status

Returns the state of the Custom functions server. This includes whether it is enabled, upon which port it is listening, and where its root project directory is located on the host machine.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `custom_function_status`

### Body

```json
{
	"operation": "custom_functions_status"
}
```

### Response: 200

```json
{
	"is_enabled": true,
	"port": 9926,
	"directory": "/Users/myuser/hdb/custom_functions"
}
```

---

## Get Custom Functions

Returns an array of projects within the Custom Functions root project directory. Each project has details including each of the files in the routes and helpers directories, and the total file count in the static folder.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_custom_functions`

### Body

```json
{
	"operation": "get_custom_functions"
}
```

### Response: 200

```json
{
	"dogs": {
		"routes": ["examples"],
		"helpers": ["example"],
		"static": 3
	}
}
```

---

## Get Custom Function

Returns the content of the specified file as text. HarperDStudio uses this call to render the file content in its built-in code editor.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_custom_function`
- `project` _(required)_ - the name of the project containing the file for which you wish to get content
- `type` _(required)_ - the name of the sub-folder containing the file for which you wish to get content - must be either routes or helpers
- `file` _(required)_ - The name of the file for which you wish to get content - should not include the file extension (which is always .js)

### Body

```json
{
	"operation": "get_custom_function",
	"project": "dogs",
	"type": "helpers",
	"file": "example"
}
```

### Response: 200

```json
{
	"message": "'use strict';\n\nconst https = require('https');\n\nconst authRequest = (options) => {\n  return new Promise((resolve, reject) => {\n    const req = https.request(options, (res) => {\n      res.setEncoding('utf8');\n      let responseBody = '';\n\n      res.on('data', (chunk) => {\n        responseBody += chunk;\n      });\n\n      res.on('end', () => {\n        resolve(JSON.parse(responseBody));\n      });\n    });\n\n    req.on('error', (err) => {\n      reject(err);\n    });\n\n    req.end();\n  });\n};\n\nconst customValidation = async (request,logger) => {\n  const options = {\n    hostname: 'jsonplaceholder.typicode.com',\n    port: 443,\n    path: '/todos/1',\n    method: 'GET',\n    headers: { authorization: request.headers.authorization },\n  };\n\n  const result = await authRequest(options);\n\n  /*\n   *  throw an authentication error based on the response body or statusCode\n   */\n  if (result.error) {\n    const errorString = result.error || 'Sorry, there was an error authenticating your request';\n    logger.error(errorString);\n    throw new Error(errorString);\n  }\n  return request;\n};\n\nmodule.exports = customValidation;\n"
}
```

---

## Set Custom Function

Updates the content of the specified file. Harper Studio uses this call to save any changes made through its built-in code editor.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `set_custom_function`
- `project` _(required)_ - the name of the project containing the file for which you wish to set content
- `type` _(required)_ - the name of the sub-folder containing the file for which you wish to set content - must be either routes or helpers
- `file` _(required)_ - the name of the file for which you wish to set content - should not include the file extension (which is always .js)
- `function_content` _(required)_ - the content you wish to save into the specified file

### Body

```json
{
	"operation": "set_custom_function",
	"project": "dogs",
	"type": "helpers",
	"file": "example",
	"function_content": "'use strict';\n\nconst https = require('https');\n\nconst authRequest = (options) => {\n  return new Promise((resolve, reject) => {\n    const req = https.request(options, (res) => {\n      res.setEncoding('utf8');\n      let responseBody = '';\n\n      res.on('data', (chunk) => {\n        responseBody += chunk;\n      });\n\n      res.on('end', () => {\n        resolve(JSON.parse(responseBody));\n      });\n    });\n\n    req.on('error', (err) => {\n      reject(err);\n    });\n\n    req.end();\n  });\n};\n\nconst customValidation = async (request,logger) => {\n  const options = {\n    hostname: 'jsonplaceholder.typicode.com',\n    port: 443,\n    path: '/todos/1',\n    method: 'GET',\n    headers: { authorization: request.headers.authorization },\n  };\n\n  const result = await authRequest(options);\n\n  /*\n   *  throw an authentication error based on the response body or statusCode\n   */\n  if (result.error) {\n    const errorString = result.error || 'Sorry, there was an error authenticating your request';\n    logger.error(errorString);\n    throw new Error(errorString);\n  }\n  return request;\n};\n\nmodule.exports = customValidation;\n"
}
```

### Response: 200

```json
{
	"message": "Successfully updated custom function: example.js"
}
```

---

## Drop Custom Function

Deletes the specified file.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `drop_custom_function`
- `project` _(required)_ - the name of the project containing the file you wish to delete
- `type` _(required)_ - the name of the sub-folder containing the file you wish to delete. Must be either routes or helpers
- `file` _(required)_ - the name of the file you wish to delete. Should not include the file extension (which is always .js)

### Body

```json
{
	"operation": "drop_custom_function",
	"project": "dogs",
	"type": "helpers",
	"file": "example"
}
```

### Response: 200

```json
{
	"message": "Successfully deleted custom function: example.js"
}
```

---

## Add Custom Function Project

Creates a new project folder in the Custom Functions root project directory. It also inserts into the new directory the contents of our Custom Functions Project template, which is available publicly, here: [https://github.com/HarperDB/harperdb-custom-functions-template](https://github.com/HarperDB/harperdb-custom-functions-template).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_custom_function_project`
- `project` _(required)_ - the name of the project you wish to create

### Body

```json
{
	"operation": "add_custom_function_project",
	"project": "dogs"
}
```

### Response: 200

```json
{
	"message": "Successfully created custom function project: dogs"
}
```

---

## Drop Custom Function Project

Deletes the specified project folder and all of its contents.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `drop_custom_function_project`
- `project` _(required)_ - the name of the project you wish to delete

### Body

```json
{
	"operation": "drop_custom_function_project",
	"project": "dogs"
}
```

### Response: 200

```json
{
	"message": "Successfully deleted project: dogs"
}
```

---

## Package Custom Function Project

Creates a .tar file of the specified project folder, then reads it into a base64-encoded string and returns an object with the string, the payload and the file.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `package_custom_function_project`
- `project` _(required)_ - the name of the project you wish to package up for deployment
- `skip_node_modules` _(optional)_ - if true, creates option for tar module that will exclude the project's node_modules directory. Must be a boolean.

### Body

```json
{
	"operation": "package_custom_function_project",
	"project": "dogs",
	"skip_node_modules": true
}
```

### Response: 200

```json
{
	"project": "dogs",
	"payload": "LgAAAAAAAAAAAAAAAAAAA...AAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
	"file": "/tmp/d27f1154-5d82-43f0-a5fb-a3018f366081.tar"
}
```

---

## Deploy Custom Function Project

Takes the output of package_custom_function_project, decrypts the base64-encoded string, reconstitutes the .tar file of your project folder, and extracts it to the Custom Functions root project directory.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `deploy_custom_function_project`
- `project` _(required)_ - the name of the project you wish to deploy. Must be a string
- `payload` _(required)_ - a base64-encoded string representation of the .tar file. Must be a string

### Body

```json
{
	"operation": "deploy_custom_function_project",
	"project": "dogs",
	"payload": "A very large base64-encoded string represenation of the .tar file"
}
```

### Response: 200

```json
{
	"message": "Successfully deployed project: dogs"
}
```
