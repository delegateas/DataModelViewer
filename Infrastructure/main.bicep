param solutionId string
@secure()
param websitePassword string
@secure()
param sessionSecret string

param adoOrganizationUrl string = ''
param adoProjectName string = ''
param adoRepositoryName string = ''

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
      ]
    }
  }
}

@description('Output the web app name and managed identity info')
output webAppName string = webApp.name
output managedIdentityPrincipalId string = webApp.identity.principalId
output managedIdentityClientId string = webApp.identity.tenantId
