@description('The name of the web app')
param solutionId string
@description('Website password')
@secure()
param websitePassword string
@description('Session secret')
@secure()
param sessionSecret string
@description('The location for all resources')
var location = resourceGroup().location
@description('Azure DevOps Organization URL')
param adoOrganizationUrl string = ''
@description('Azure DevOps Project Name')
param adoProjectName string = ''
@description('Azure DevOps Repository Name')
param adoRepositoryName string = ''

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
      linuxFxVersion: 'NODE|20-lts'

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
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
      ]
    }
  }
}

@description('Output the web app name')
output webAppName string = webApp.name
@description('Output the managed identity principal ID')
output managedIdentityPrincipalId string = webApp.identity.principalId
output managedIdentityClientId string = webApp.identity.tenantId
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
