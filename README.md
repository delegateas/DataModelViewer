# Data Model Viewer
![image](https://github.com/user-attachments/assets/9d91e37c-7e46-4654-b31d-5bc3e5d632ea)
Allows you to expose your Dataverse data model as a website.
## Grouping
Add a # xxx to your entity description in order to group that entity in group xxx.

# Settings to run locally
## Managed Identity
We use DefaultCredential to authenticate to Azure. So set the right profile in Visual Studio.

## Generator
Add `Generator/appsettings.local.json` as a file and paste your environment and solutions. Remember that the solutions must have the same publisher prefix.

```
{
  "DataverseUrl": "https://xxx.crm4.dynamics.com",
  "DataverseSolutionNames": "solutionuniquename,othersolution"
}
```

Remember to set the file to Copy If Newer
 
## Website
You can add a .env file to run this locally.

```
{
    WebsitePassword=YourPassword
    WebsiteSessionSecret="ASdjjOIjoij1389dj9aJSd908a+9dj98j91aj90djs0="
}
```

`WebsitePassword` is the login password for the site.
`WebsiteSessionSecret` is a key used to encrypt the session cookie. Generate one with openssl, found in Git Bash or as a download on the web.
```
openssl rand -base64 32
```

# Setting in pipeline
The pipeline expects a variable group called `DataModel`. It must have the following variables. The app user only requires the `Environment Maker` security role.

* AzureClientId: Client id for an Azure App Registration with access to the Dataverse Environment.
* AzureClientSecret: Client Secret for the above.
* AzureTenantId: Azure Tenant ID (where your App Regustration is placed and resource group will be placed).
* AzureServiceConnectionName: Name of the service connection created from ADO to Azure.
* AzureLocation: Location for the resource group in Azure.
* AzureResourceGroupName: Name of the Resource Group in Azure. If this matches an existing group in the location above that will be used for the DMV resources, if not a new resource group will be created.
* DataverseUrl: URL for the Dataverse environment which the data model will be based on.
* DataverseSolutionNames: Comma-seperated list of solutions to based DMV on.
* WebsitePassword: Password used by DMV users to login to the generated site.
* WebsiteSessionSecret: Key to encrypt the session token with (You can set it to whatever you like, but recommended 32 random characters).
