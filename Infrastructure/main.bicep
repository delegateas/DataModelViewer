var location = resourceGroup().location

@description('Create a static web app')
module swa 'br/public:avm/res/web/static-site:0.3.0' = {
  name: 'client'
  scope: resourceGroup()
  params: {
    name: 'swa-msysdatamodel-dev'
    location: location
    sku: 'Free'
  }
}

@description('Output the default hostname')
output endpoint string = swa.outputs.defaultHostname

@description('Output the static web app name')
output staticWebAppName string = swa.outputs.name
