param solutionId string
@secure()
param websitePassword string
@secure()
param sessionSecret string

param adoOrganizationUrl string = ''
param adoProjectName string = ''
param adoRepositoryName string = ''

@description('Enable EntraID authentication via Easy Auth')
param enableEntraIdAuth bool = false

@description('Azure AD App Registration Client ID')
param entraIdClientId string = ''

@description('Azure AD Tenant ID (defaults to subscription tenant)')
param entraIdTenantId string = subscription().tenantId

@description('Comma-separated list of Azure AD Group Object IDs allowed to access (empty = all tenant users)')
param entraIdAllowedGroups string = ''

@description('Disable password authentication (EntraID only)')
param disablePasswordAuth bool = false

var location = resourceGroup().location

@description('Create an App Service Plan')
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: 'asp-${solutionId}'
  location: location
  sku: {
    name: 'F1'
    tier: 'Free'
  }
  properties: {
    reserved: true
  }
}

@description('Create a Web App')
resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  name: 'wa-${solutionId}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|24-lts'

      appSettings: [
        {
          name: 'WebsitePassword'
          value: websitePassword
        }
        {
          name: 'WebsiteSessionSecret'
          value: sessionSecret
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'ADO_ORGANIZATION_URL'
          value: adoOrganizationUrl
        }
        {
          name: 'ADO_PROJECT_NAME'
          value: adoProjectName
        }
        {
          name: 'ADO_REPOSITORY_NAME'
          value: adoRepositoryName
        }
        {
          name: 'ENABLE_ENTRAID_AUTH'
          value: string(enableEntraIdAuth)
        }
        {
          name: 'ENTRAID_ALLOWED_GROUPS'
          value: entraIdAllowedGroups
        }
        {
          name: 'DISABLE_PASSWORD_AUTH'
          value: string(disablePasswordAuth)
        }
      ]
    }
  }
}

@description('Configure Easy Auth for EntraID authentication')
resource authSettings 'Microsoft.Web/sites/config@2022-09-01' = if (enableEntraIdAuth) {
  name: 'authsettingsV2'
  parent: webApp
  properties: {
    globalValidation: {
      requireAuthentication: true
      unauthenticatedClientAction: 'RedirectToLoginPage'
      redirectToProvider: 'azureactivedirectory'
    }
    identityProviders: {
      azureActiveDirectory: {
        enabled: true
        registration: {
          openIdIssuer: 'https://sts.windows.net/${entraIdTenantId}/'
          clientId: entraIdClientId
        }
        validation: {
          allowedAudiences: [
            'api://${entraIdClientId}'
            entraIdClientId
          ]
        }
      }
    }
    login: {
      tokenStore: {
        enabled: true
      }
      allowedExternalRedirectUrls: []
    }
  }
}

@description('Output the web app name and managed identity info')
output webAppName string = webApp.name
output managedIdentityPrincipalId string = webApp.identity.principalId
output managedIdentityClientId string = webApp.identity.tenantId
