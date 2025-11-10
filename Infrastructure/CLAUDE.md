# CLAUDE.md - Infrastructure Project

This file provides guidance to Claude Code when working with the Infrastructure project.

## Project Overview

The Infrastructure project contains Azure Bicep templates for deploying the Data Model Viewer website to Azure App Service. It provisions all necessary cloud resources and configurations.

## Technology Stack

- **Azure Bicep** - Infrastructure as Code (IaC)
- **Azure App Service** - Web hosting platform
- **Azure App Service Plan** - Compute resources
- **System Assigned Managed Identity** - Authentication for Azure services

## Architecture

### Infrastructure Components

```
Infrastructure/
└── main.bicep    # Main Bicep template
```

### Deployed Azure Resources

1. **App Service Plan** (`asp-{solutionId}`)
   - SKU: F1 (Free tier) by default
   - Platform: Linux
   - Purpose: Compute capacity for web app

2. **Web App** (`wa-{solutionId}`)
   - Runtime: Node.js 24 LTS
   - HTTPS Only: Enabled
   - System Assigned Managed Identity: Enabled
   - Environment Variables: Configured for Website project

3. **Managed Identity**
   - Type: System Assigned
   - Purpose: Authenticate to Dataverse and Azure DevOps without credentials
   - Permissions: Must be configured manually after deployment

## Bicep Template Structure

### Parameters

```bicep
@description('Unique identifier for naming resources')
param solutionId string

@description('Password for website login')
@secure()
param websitePassword string

@description('Secret key for session encryption')
@secure()
param sessionSecret string

@description('Azure DevOps organization URL')
param adoOrganizationUrl string = ''

@description('Azure DevOps project name')
param adoProjectName string = ''

@description('Azure DevOps repository name for diagram storage')
param adoRepositoryName string = ''
```

### Resource Naming Convention

- App Service Plan: `asp-{solutionId}`
- Web App: `wa-{solutionId}`
- Full URL: `https://wa-{solutionId}.azurewebsites.net/`

**Important**: `solutionId` must be globally unique across all Azure customers.

### Environment Variables

The template configures these environment variables for the Website:

| Variable | Source | Purpose |
|----------|--------|---------|
| `WebsitePassword` | Parameter | User login password |
| `WebsiteSessionSecret` | Parameter | JWT encryption key |
| `WEBSITE_NODE_DEFAULT_VERSION` | Template | Node.js version hint |
| `ADO_ORGANIZATION_URL` | Parameter | Azure DevOps org URL |
| `ADO_PROJECT_NAME` | Parameter | ADO project name |
| `ADO_REPOSITORY_NAME` | Parameter | Diagram storage repo |

## Deployment

### Prerequisites

- Azure subscription with appropriate permissions
- Azure CLI or Azure PowerShell
- Resource group (can be created by template)
- Globally unique `solutionId` value

### Manual Deployment

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name rg-datamodelviewer --location westeurope

# Deploy Bicep template
az deployment group create \
  --resource-group rg-datamodelviewer \
  --template-file main.bicep \
  --parameters solutionId=myorg-dmv \
               websitePassword='SecurePassword123!' \
               sessionSecret='<32-byte-random-string>' \
               adoOrganizationUrl='https://dev.azure.com/myorg' \
               adoProjectName='MyProject' \
               adoRepositoryName='DataModelViewer'
```

### Pipeline Deployment

The Azure Pipeline (`azure-pipelines-deploy-jobs.yml`) deploys using:

```yaml
- task: AzureResourceManagerTemplateDeployment@3
  inputs:
    deploymentScope: 'Resource Group'
    azureResourceManagerConnection: $(AzureServiceConnectionName)
    subscriptionId: $(AzureSubscriptionId)
    action: 'Create Or Update Resource Group'
    resourceGroupName: $(AzureResourceGroupName)
    location: $(AzureLocation)
    templateLocation: 'Linked artifact'
    csmFile: 'Infrastructure/main.bicep'
    overrideParameters: |
      -solutionId $(WebsiteName)
      -websitePassword $(WebsitePassword)
      -sessionSecret $(WebsiteSessionSecret)
      -adoOrganizationUrl $(ADO_ORGANIZATION_URL)
      -adoProjectName $(ADO_PROJECT_NAME)
      -adoRepositoryName $(AdoRepositoryName)
```

## Post-Deployment Configuration

### 1. Configure Startup Command

**Important**: Azure App Service requires explicit startup command for Next.js standalone mode.

1. Navigate to Azure Portal → App Service → Configuration → General settings
2. Set **Startup Command** to: `node server.js`
3. Save and restart app service

Without this, the app will not start correctly.

### 2. Configure Managed Identity Permissions

The deployed Managed Identity needs two sets of permissions:

#### Dataverse Access (for data generation)
1. Navigate to Power Platform Admin Center
2. Select your Dataverse environment
3. Go to Settings → Users + permissions → Users
4. Add the Managed Identity (`wa-{solutionId}`) as a user
5. Assign **Environment Maker** security role (or custom role with read access)

#### Azure DevOps Access (for diagram storage)
1. Navigate to Azure DevOps → Organization Settings → Users
2. Click "Add users"
3. Search for `wa-{solutionId}` (the managed identity)
4. Select the service principal from results
5. Grant **Basic** access level
6. Add to appropriate project
7. **Uncheck** "Send email invites"
8. Navigate to Project Settings → Repositories → DataModelViewer repo → Security
9. Add Managed Identity with **Contributor** permissions (or least-privilege custom role with read/write)

**Note**: Contributor grants more permissions than strictly necessary. Consider creating a custom role with only:
- Read repository
- Create branch
- Commit changes
- Create pull request (if using PR workflow)

### 3. Verify Deployment

```bash
# Get web app URL
az webapp show --name wa-{solutionId} --resource-group rg-datamodelviewer --query "defaultHostName" -o tsv

# Check deployment logs
az webapp log tail --name wa-{solutionId} --resource-group rg-datamodelviewer

# Verify managed identity
az webapp identity show --name wa-{solutionId} --resource-group rg-datamodelviewer
```

## Common Modifications

### Change App Service SKU

**Default**: F1 (Free tier) - limited compute, no custom domains, no scaling

**Upgrade for production**:

```bicep
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: 'asp-${solutionId}'
  location: location
  sku: {
    name: 'B1'      // Basic tier
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}
```

**SKU Options**:
- `F1` - Free (shared compute, 60 min/day)
- `B1` - Basic (dedicated, 1 core, 1.75GB RAM)
- `S1` - Standard (auto-scale, custom domains, SSL)
- `P1V2` - Premium (better performance, more features)

### Add Custom Domain

1. Update Bicep to use S1 or higher SKU
2. Add custom hostname binding:

```bicep
resource hostname 'Microsoft.Web/sites/hostNameBindings@2021-02-01' = {
  parent: webApp
  name: 'dmv.mycompany.com'
  properties: {
    siteName: webApp.name
    hostNameType: 'Verified'
  }
}
```

3. Configure DNS CNAME record
4. Add SSL certificate

### Add Application Insights

```bicep
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'ai-${solutionId}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'Node.JS'
  }
}

// Add to web app properties
{
  name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
  value: appInsights.properties.ConnectionString
}
```

### Add Key Vault for Secrets

```bicep
resource keyVault 'Microsoft.KeyVault/vaults@2021-06-01-preview' = {
  name: 'kv-${solutionId}'
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: webApp.identity.principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
  }
}

// Reference in web app
{
  name: 'WebsitePassword'
  value: '@Microsoft.KeyVault(VaultName=kv-${solutionId};SecretName=WebsitePassword)'
}
```

## Pipeline Integration

### Required Pipeline Variables

Set these in Azure DevOps Variable Group (typically named `DataModel`):

| Variable | Description | Secret |
|----------|-------------|--------|
| `AzureServiceConnectionName` | ARM service connection name | No |
| `AzureLocation` | Azure region (e.g., `westeurope`) | No |
| `AzureResourceGroupName` | Resource group name | No |
| `WebsiteName` | Unique site identifier (solutionId) | No |
| `WebsitePassword` | Login password | Yes |
| `WebsiteSessionSecret` | JWT encryption key (32 chars) | Yes |
| `ADO_ORGANIZATION_URL` | ADO org URL | No |
| `ADO_PROJECT_NAME` | ADO project name | No |
| `AdoRepositoryName` | Diagram storage repo | No |

### Pipeline Flow

1. **Build Stage**: Website built into `.next/standalone` folder
2. **Infrastructure Stage**: Bicep template deploys/updates resources
3. **Deploy Stage**: Website files uploaded to App Service
4. **Post-Deploy**: Manual startup command configuration (first time only)

## Troubleshooting

### Deployment Fails: "Name already exists"

**Problem**: `solutionId` is not globally unique

**Solution**:
- Choose a different `solutionId` value
- Check existing App Services: `az webapp list --query "[].name"`
- Use format like: `{company}-{environment}-dmv` (e.g., `contoso-prod-dmv`)

### Web App Not Starting

**Problem**: Startup command not configured or incorrect

**Solution**:
1. Check Configuration → General settings → Startup Command
2. Should be: `node server.js`
3. Check logs: `az webapp log tail --name wa-{solutionId} --resource-group {rg}`

### Managed Identity Not Working

**Problem**: MI doesn't have proper permissions

**Solution**:
1. Verify MI exists: `az webapp identity show`
2. Check Dataverse role assignments in Power Platform
3. Check ADO permissions in Organization Settings → Users
4. Wait 5-10 minutes for permission propagation

### Environment Variables Not Set

**Problem**: Website can't read configuration

**Solution**:
1. Check App Service → Configuration → Application settings
2. Verify all required variables present
3. Restart web app after adding variables
4. Check for typos in variable names

## Infrastructure Testing

### Validate Bicep Template

```bash
# Check syntax
az bicep build --file main.bicep

# Validate against Azure
az deployment group validate \
  --resource-group rg-datamodelviewer \
  --template-file main.bicep \
  --parameters solutionId=test-dmv websitePassword=Test123! sessionSecret=test123
```

### What-If Deployment

```bash
# See what would change without deploying
az deployment group what-if \
  --resource-group rg-datamodelviewer \
  --template-file main.bicep \
  --parameters solutionId=myorg-dmv websitePassword=Pass123! sessionSecret=secret123
```

### Cost Estimation

- **F1 Free Tier**: $0/month (1 app per subscription)
- **B1 Basic**: ~$13/month
- **S1 Standard**: ~$70/month
- **P1V2 Premium**: ~$150/month

Plus data transfer costs (minimal for typical usage).

## Security Considerations

### Secure Parameters

Always mark sensitive parameters with `@secure()` decorator:

```bicep
@secure()
param websitePassword string
```

This prevents values from appearing in logs or deployment history.

### HTTPS Only

Template enforces HTTPS:

```bicep
properties: {
  httpsOnly: true
}
```

Never disable this in production.

### Managed Identity vs. Connection Strings

**Always prefer** Managed Identity over connection strings/PAT tokens for:
- Azure service authentication
- Azure DevOps API access
- Dataverse connectivity

Managed Identity eliminates secret management and rotation.

### Network Security

For production, consider:
- **Private Endpoints**: Connect App Service to VNet
- **Access Restrictions**: Limit inbound traffic by IP
- **VNet Integration**: Access private Dataverse instances

## Important Reminders

- `solutionId` parameter must be globally unique
- Always set startup command to `node server.js` after first deployment
- Managed Identity requires manual permission configuration
- Free tier (F1) has limitations - upgrade for production
- Template deploys to same region as resource group
- Environment variables are configured in template - no manual portal configuration needed
- Website deployment happens separately from infrastructure deployment
- Test with `what-if` command before production changes
