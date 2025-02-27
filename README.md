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
Generate data by running the Generator project from Visual Studio. Afterwards go into the Website folder from VS Code and open the terminal. If this the first time running it, type `npm install`. Start the website on localhost by running `npm run dev`. Click the link in the terminal to view the website.

# Setting in pipeline
The pipeline expects a variable group called `DataModel`. It must have the following variables. The app user only requires the `Environment Maker` security role.

* AzureClientId: Client id for an Azure App Registration with access to the Dataverse Environment.
* AzureClientSecret: Client Secret for the above.
* AzureTenantId: Azure Tenant ID (where your App Regustration is placed and resource group will be placed).
* AzureServiceConnectionName: Name of the service connection created from ADO to Azure.
* AzureLocation: Location for the resource group in Azure (e.g. westeurope).
* AzureResourceGroupName: Name of the Resource Group in Azure. If this matches an existing group in the location above that will be used for the DMV resources, if not a new resource group will be created.
* DataverseUrl: URL for the Dataverse environment which the data model will be based on.
* DataverseSolutionNames: Comma-seperated list of solutions to based DMV on.
* SolutionId: Used for the url of the web app
* WebsitePassword: Password used by DMV users to login to the generated site.
* WebsiteSessionSecret: Key to encrypt the session token with (You can set it to whatever you like, but recommended 32 random characters).
