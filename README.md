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
The pipeline expects a variable group called `DataModel`. It should have the following variables

* AZURE_CLIENT_ID: Client id for an app reg with access to the Dataverse Environment
* AZURE_CLIENT_SECRET: Client Secret for an app reg with access to the Dataverse Environment
* AZURE_TENANT_ID: Tenant Id for the environment for an app reg with access to the Dataverse Environment
* azureSubscription: Name of a service connection to Azure
* location: Location for the resource group in Azure
* resourceGroupName: Resource Group in Azure
* DataverseUrl: Url for the Dataverse Environment
* SolutionName: Comma-seperated list of solutions to generate the site for
* Code: Password used to login to the generated site
* SESSION_SECRET: key to encrypt the session token with