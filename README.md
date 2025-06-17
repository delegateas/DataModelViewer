# Data Model Viewer
![image](https://github.com/user-attachments/assets/9d91e37c-7e46-4654-b31d-5bc3e5d632ea)
Allows you to expose your Dataverse data model as a website.
## Grouping
Add a # xxx to your entity description in order to group that entity in group xxx.

# Settings to run locally
## Generator
Add `Generator/appsettings.local.json` as a file and paste your environment and solutions. Remember that the solutions must have the same publisher prefix.

```
{
  "DataverseUrl": "https://xxx.crm4.dynamics.com",
  "DataverseSolutionNames": "solutionuniquename,othersolution"
}
```

Remember to set the file to Copy If Newer

Authentication is handled using `DefaultAzureCredential`. If you are using Visual Studio you can select a user that is used for all of these credentials. Go to Tools -> Options -> Search for Azure -> Account Selection. Login and select a user that has access to that Dataverse Environment.
 
## Website
Add `Website/.env` file to run this locally.

```
{
    WebsitePassword=YourPassword
    WebsiteSessionSecret=YourSecret
}
```

`WebsitePassword` is the login password for the site. Set it to what you want end users to input.

`WebsiteSessionSecret` is a key used to encrypt the session cookie. Generate one with openssl, found in Git Bash or as a download on the web.

```
openssl rand -base64 32
```

## Running it
Generate data by running the Generator project from Visual Studio. 
Afterwards go into the "Website"-folder from VS Code and open the terminal (of the "Command Prompt" type). If this the first time running it, type `npm install` (you need to have installed node.js first: https://nodejs.org/en/download/). Start the website on localhost by running `npm run dev`. Click the link in the terminal to view the website.

# Settings in pipeline
The pipeline expects a variable group called `DataModel`. It must have the following variables. The app user only requires the `Environment Maker` security role.

* AzureClientId: Client id for an Azure App Registration with access to the Dataverse Environment.
* AzureClientSecret: Client Secret for the above. Remember to set its variable type to "Secret"! 
* AzureTenantId: Azure Tenant ID (where your App Regustration is placed and resource group will be placed).
* AzureServiceConnectionName: Name of the Azure Resource Manager service connection created from ADO to Azure.
* AzureLocation: Name of the location for the resource group in Azure (e.g. "westeurope" - not the display name which is "West Europe").
* AzureResourceGroupName: Name of the Resource Group in Azure. If this matches an existing group in the location above that will be used for the DMV resources, if not a new resource group will be created.
* DataverseUrl: URL for the Dataverse environment which the data model will be based on (e.g. "https://mySystem-dev.crm4.dynamics.com/".
* DataverseSolutionNames: Comma-seperated list of solutions to based DMV on.
* WebsiteName: Used for the url of the web app presenting the data model to the user. The full URL will be in the format "https://wa-{WebsiteName}.azurewebsites.net/" and must be globally unique. 
* WebsitePassword: Password used by DMV users to login to the generated site.
* WebsiteSessionSecret: Key to encrypt the session token with (You can set it to whatever you like, but recommended 32 random characters).

## After deployment
* Go to portal.azure.com 
* Find the App Service under your specified resource group and open it
* Go to "Settings" -> "Configuration" and set the Startup Command to ``node server.js``
![image](https://github.com/user-attachments/assets/0d7a3511-ffa2-4013-b403-7da10b49e817)
* Go back to Overview and click Browse

# Using the Azure DevOps External Pipeline Template

The `azure-pipelines-external.yml` file is a reusable Azure DevOps pipeline template designed to simplify building and deploying DataModelViewer from other Azure DevOps projects. This allows you to integrate DataModelViewer deployment into your own pipelines with minimal setup.

## How to Use

1. **Copy Required Files**  
   Copy the following files from this repository into your Azure DevOps project repository:
   - `azure-pipelines-build-jobs.yml`
   - `azure-pipelines-deploy-jobs.yml`
   - `azure-pipelines-external.yml`

2. **Set Up Variables and Service Connection**  
   - Create a variable group (e.g., `DataModel`) in your Azure DevOps project with all required variables (see the "Setting in pipeline" section above for details).
   - Ensure you have an Azure Resource Manager service connection configured (the name should match the one set in the earlier configured variable `AzureServiceConnectionName`).

3. **Configure the Pipeline**  
   - Add a new pipeline in Azure DevOps using the `azure-pipelines-external.yml` file as the pipeline definition.
   - Adjust the parameters in the YAML file as needed for your environment (e.g., variable group name, resource group, location).

4. **Pipeline Execution**  
   - The first time the pipeline is run you will see a "This pipeline needs permission to access a resource..." click "View" and give it permission to access the variable group you have created.
   - The pipeline will clone the public DataModelViewer repository, build the application, and deploy it using the shared templates.
   - The pipeline is scheduled to run daily at 03:00 AM by default. You can adjust or remove the schedule as needed.

## Notes

- The used Azure subscription must have "Microsoft.Web" registered as a "Resource provider" (namespace) otherwise the deploy will fail.
- The external pipeline expects the same variable group and variables as described in the "Setting in pipeline" section.
- You can further customize the pipeline by editing the YAML files as needed for your organization's requirements.
- For more details, see the comments at the top of `azure-pipelines-external.yml`.
