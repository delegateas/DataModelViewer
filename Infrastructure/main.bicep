param solutionId string
@secure()
param websitePassword string
@secure()
param sessionSecret string

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
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
      ]
    }
  }
}

@description('Output the web app name')
output webAppName string = webApp.name
