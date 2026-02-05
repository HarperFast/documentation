---
title: Manage Functions
---

# Manage Functions

HarperDB Custom Functions are enabled by default and can be configured further through the HarperDB Studio. It is recommended to read through the Custom Functions documentation first to gain a strong understanding of HarperDB Custom Functions behavior.

All Custom Functions configuration is handled through the **functions** page of the HarperDB Studio, accessed with the following instructions:

1. Navigate to the HarperDB Studio Organizations page.

2. Click the appropriate organization that the instance belongs to.

3. Select your desired instance.

4. Click **functions** in the instance control bar.

_Note, the **functions** page will only be available to super users._

## Manage Projects

On the **functions** page of the HarperDB Studio you are presented with a functions management screen with the following properties:

- **projects**

  Displays a list of Custom Functions projects residing on this instance.

- **/project_name/routes**

  Only displayed if there is an existing project. Displays the routes files contained within the selected project.

- **/project_name/helpers**

  Only displayed if there is an existing project. Displays the helper files contained within the selected project.

- **/project_name/static**

  Only displayed if there is an existing project. Displays the static file count and a link to the static files contained within the selected project. Note, static files cannot currently be deployed through the Studio and must be deployed via the [HarperDB API](https://api.harperdb.io/) or manually to the server (not applicable with HarperDB Cloud).

- **Root File Directory**

  Displays the root file directory where the Custom Functions projects reside on this instance.

- **Custom Functions Server URL**

  Displays the base URL in which all Custom Functions are accessed for this instance.

## Create a Project

HarperDB Custom Functions Projects can be initialized with the following instructions.

1. If this is your first project, skip this step. Click the plus icon next to the **projects** heading.

2. Enter the project name in the text box located under the **projects** heading.

3. Click the check mark icon next the appropriate instance.

4. The Studio will take a few moments to provision a new project based on the [Custom Functions template](https://github.com/HarperDB/harperdb-custom-functions-template).

5. The Custom Functions project is now created and ready to modify.

## Modify a Project

Custom Functions routes and helper functions can be modified directly through the Studio. From the **functions** page:

1. Select the appropriate **project**.

2. Select the appropriate **route** or **helper**.

3. Modify the code with your desired changes.

4. Click the save icon at the bottom right of the screen.

   _Note, saving modifications will restart the Custom Functions server on your HarperDB instance and may result in up to 60 seconds of downtime for all Custom Functions._

## Create Additional Routes/Helpers

To create an additional **route** to your Custom Functions project. From the **functions** page:

1. Select the appropriate Custom Functions **project**.

2. Click the plus icon to the right of the **routes** header.

3. Enter the name of the new route in the textbox that appears.

4. Click the check icon to create the new route.

   _Note, adding a route will restart the Custom Functions server on your HarperDB instance and may result in up to 60 seconds of downtime for all Custom Functions._

To create an additional **helper** to your Custom Functions project. From the **functions** page:

1. Select the appropriate Custom Functions **project**.

2. Click the plus icon to the right of the **helpers** header.

3. Enter the name of the new helper in the textbox that appears.

4. Click the check icon to create the new helper.

   _Note, adding a helper will restart the Custom Functions server on your HarperDB instance and may result in up to 60 seconds of downtime for all Custom Functions._

## Delete a Project/Route/Helper

To delete a Custom Functions project from the **functions** page:

1. Click the minus icon to the right of the **projects** header.

2. Click the red minus icon to the right of the Custom Functions project you would like to delete.

3. Confirm deletion by clicking the red check icon.

   _Note, deleting a project will restart the Custom Functions server on your HarperDB instance and may result in up to 60 seconds of downtime for all Custom Functions._

To delete a Custom Functions _project route_ from the **functions** page:

1. Select the appropriate Custom Functions **project**.

2. Click the minus icon to the right of the **routes** header.

3. Click the red minus icon to the right of the Custom Functions route you would like to delete.

4. Confirm deletion by clicking the red check icon.

   _Note, deleting a route will restart the Custom Functions server on your HarperDB instance and may result in up to 60 seconds of downtime for all Custom Functions._

To delete a Custom Functions _project helper_ from the **functions** page:

1. Select the appropriate Custom Functions **project**.

2. Click the minus icon to the right of the **helper** header.

3. Click the red minus icon to the right of the Custom Functions header you would like to delete.

4. Confirm deletion by clicking the red check icon.

   _Note, deleting a header will restart the Custom Functions server on your HarperDB instance and may result in up to 60 seconds of downtime for all Custom Functions._

## Deploy Custom Functions Project to Other Instances

The HarperDB Studio provides the ability to deploy Custom Functions projects to additional HarperDB instances within the same Studio Organization. To deploy Custom Functions projects to additional instances, starting from the **functions** page:

1. Select the **project** you would like to deploy.

2. Click the **deploy** button at the top right.

3. A list of instances (excluding the current instance) within the organization will be displayed in tabular with the following information:
   - **Instance Name**: The name used to describe the instance.
   - **Instance URL**: The URL used to access the instance.
   - **CF Capable**: Describes if the instance version supports Custom Functions (yes/no).
   - **CF Enabled**: Describes if Custom Functions are configured and enabled on the instance (yes/no).
   - **Has Project**: Describes if the selected Custom Functions project has been previously deployed to the instance (yes/no).
   - **Deploy**: Button used to deploy the project to the instance.
   - **Remote**: Button used to remove the project from the instance. _Note, this will only be visible if the project has been previously deployed to the instance._

4. In the appropriate instance row, click the **deploy** button.

   _Note, deploying a project will restart the Custom Functions server on the HarperDB instance receiving the deployment and may result in up to 60 seconds of downtime for all Custom Functions._
