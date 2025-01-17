# Settings to run locally
## Managed Identity
We use DefaultCredential to authenticate to Azure. So set the right profile in Visual Studio.

## Generator
Add `Generator/appsettings.local.json` as a file and paste your environment and solutions. Remember that the solutions must have the same publisher prefix.

```
{
  "DataverseUrl": "https://xxx.crm4.dynamics.com",
  "SolutionNames": "solutionuniquename,othersolution"
}
```

Remember to set the file to Copy If Newer
 
## Website
You can add a .env file to run this locally.

```
{
    CODE=YourPassword
    SESSION_SECRET="ASdjjOIjoij1389dj9aJSd908a+9dj98j91aj90djs0="
}
```

`Code` is the login code for the site.
`SESSION_SECRET` is a key used to encrypt the session cookie. Generate one with openssl, found in Git Bash or as a download on the web.
```
openssl rand -base64 32
```

# Setting in pipeline
The pipeline expects a variable group called `DataModel`. It must have the following variables

* AZURE_CLIENT_ID: Client id for an Azure App Registration with access to the Dataverse Environment.
* AZURE_CLIENT_SECRET: Client Secret for the above.
* AZURE_TENANT_ID: Azure Tenant ID (where your App Regustration is placed and resource group will be placed).
* azureSubscription: Name of the service connection created from ADO to Azure.
* location: Location for the resource group in Azure.
* resourceGroupName: Name of the Resource Group in Azure. If this matches an existing group in the location above that will be used for the DMV resources, if not a new resource group will be created.
* DataverseUrl: URL for the Dataverse environment which the data model will be based on.
* SolutionName: Comma-seperated list of solutions to based DMV on.
* Code: Password used by DMV users to login to the generated site.
* SESSION_SECRET: Key to encrypt the session token with (used by the code, you can set it to whatever you like).
