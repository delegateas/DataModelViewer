param solutionId string
@secure()
param websitePassword string
@secure()
param sessionSecret string

@description('Resource naming template with {resourcetype} placeholder. Example: "d365ce-dev-erp-{resourcetype}" creates "d365ce-dev-erp-wa" for web app and "d365ce-dev-erp-asp" for app service plan. If not provided, defaults to "{resourcetype}-{solutionId}".')
param resourceNameTemplate string = ''

param adoOrganizationUrl string = ''
param adoProjectName string = ''
param adoRepositoryName string = ''

@description('Enable EntraID authentication')
param enableEntraIdAuth bool = false

@description('Azure AD App Registration Client ID')
param entraIdClientId string = ''

@description('Azure AD App Registration Client Secret')
@secure()
param entraIdClientSecret string = ''

@description('Azure AD Tenant ID (defaults to subscription tenant)')
param entraIdTenantId string = subscription().tenantId

@description('Comma-separated list of Azure AD Group Object IDs allowed to access (empty = all tenant users)')
param entraIdAllowedGroups string = ''

@description('Disable password authentication')
param disablePasswordAuth bool = false

var location = resourceGroup().location
var resolvedAppServicePlanName = empty(resourceNameTemplate) ? 'asp-${solutionId}' : replace(resourceNameTemplate, '{resourcetype}', 'asp')
var resolvedWebAppName = empty(resourceNameTemplate) ? 'wa-${solutionId}' : replace(resourceNameTemplate, '{resourcetype}', 'wa')

@description('Create an App Service Plan')
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: resolvedAppServicePlanName
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
  name: resolvedWebAppName
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
          name: 'AUTH_SECRET'
          value: sessionSecret
        }
        {
          name: 'NEXTAUTH_URL'
          value: 'https://${resolvedWebAppName}.azurewebsites.net'
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
          name: 'AZURE_AD_CLIENT_ID'
          value: entraIdClientId
        }
        {
          name: 'AZURE_AD_CLIENT_SECRET'
          value: entraIdClientSecret
        }
        {
          name: 'AZURE_AD_TENANT_ID'
          value: entraIdTenantId
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

@description('Output the web app name and managed identity info')
output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output managedIdentityPrincipalId string = webApp.identity.principalId
output managedIdentityClientId string = webApp.identity.tenantId
