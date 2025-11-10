# CLAUDE.md - Data Model Viewer Monorepo

This file provides guidance to Claude Code when working with the Data Model Viewer monorepo.

## Monorepo Overview

Data Model Viewer is a hybrid C#/.NET and Next.js application for visualizing Microsoft Dataverse metadata. The monorepo contains three main projects:

```
DataModelViewer/
├── Generator/          # C# .NET 8 - Extracts metadata from Dataverse
├── Website/           # Next.js 15 - Interactive web application
└── Infrastructure/    # Azure Bicep - IaC for deployment
```

## Project Relationships

**Data Flow**:
```
Dataverse → Generator → Website/generated/Data.ts → Website Frontend
```

**Development Workflow**:
1. Generator connects to Dataverse and extracts metadata
2. Generator outputs TypeScript file to `Website/generated/Data.ts`
3. Website imports and visualizes the generated data
4. Infrastructure deploys Website to Azure App Service

**Cross-Project Dependencies**:
- Website depends on Generator output (`generated/Data.ts`)
- Both projects share common type structures (entities, attributes, relationships)
- Infrastructure configurations must match Website environment requirements

## When to Work on Each Project

### Work on Generator when:
- Adding support for new Dataverse metadata types
- Changing data extraction logic or queries
- Modifying TypeScript output format
- Adding new analyzers (plugins, flows, web resources)

### Work on Website when:
- Building UI components or pages
- Implementing diagram features
- Adding API endpoints
- Modifying authentication or session management
- Updating styling or user interactions

### Work on Infrastructure when:
- Changing Azure resources or configuration
- Updating deployment parameters
- Modifying App Service settings
- Changing managed identity permissions

### Work on Multiple Projects when:
- Adding new entity/attribute types (Generator DTOs + Website types)
- Changing serialization format (Generator output + Website import)
- Updating environment variables (Generator config + Infrastructure parameters)

## Monorepo Conventions

### Code Style
- **C# (Generator)**: Follow .NET conventions, use `nullable` reference types
- **TypeScript (Website)**: Strict mode enabled, use type-safe patterns
- **All**: Descriptive variable names, avoid abbreviations unless domain-specific

### Commit Messages
Use conventional commits format:
```
feat(generator): add support for virtual attributes
fix(website): resolve diagram zoom reset issue
chore(infra): update bicep API version
docs: update setup instructions in README
```

Scope options: `generator`, `website`, `infra`, `pipeline`, `root`

### Branch Naming
- `features/description` - New features
- `fix/description` - Bug fixes
- `patches/description` - Hot fixes for production

### Pull Requests
- Run tests in both projects before creating PR
- Ensure Generator output is up to date if metadata types changed
- Target `main` branch (see gitStatus for current state)
- Include description of changes and affected projects

## Environment Setup

### Prerequisites
- .NET 8.0 SDK
- Node.js 24 LTS
- Azure CLI (for local Generator authentication)
- Git

## Testing Strategy

### Generator Testing
- Run against test Dataverse environment
- Verify generated TypeScript is valid
- Check console output for warnings

### Website Testing
- Run `npm run lint` to check for errors
- Test in browser at http://localhost:3000
- Verify diagram interactions work correctly manally

### Integration Testing
- Generate data from actual environment
- Load in local Website instance
- Test end-to-end workflows (diagram creation, saving, loading)

## Common Cross-Project Tasks

### Adding a New Attribute Type

1. **Generator**: Create DTO in `Generator/DTO/Attributes/NewAttributeType.cs`
2. **Generator**: Update mapping in `DataverseService.cs:MapAttribute()`
3. **Website**: Add type to `lib/Types.ts` AttributeType union
4. **Website**: Create renderer in `components/datamodelview/attributes/NewAttributeRenderer.tsx`
5. **Test**: Generate data and verify display in Website

### Changing Environment Variables

1. **Generator**: Update `appsettings.local.json` structure if needed
2. **Website**: Add to `.env.local` and document in Website/CLAUDE.md
3. **Infrastructure**: Add parameter to `main.bicep` if required for deployment
4. **Pipeline**: Update `azure-pipelines-deploy-jobs.yml` to pass variable
5. **Documentation**: Update README.md setup instructions

### Updating Dependencies

- **Generator**: `dotnet list package --outdated` then update `.csproj`
- **Website**: `npm outdated` then update `package.json`
- **Test**: Run both projects after updates to ensure compatibility

## Project-Specific Documentation

For detailed architecture, development commands, and project-specific guidance:

- **Generator**: See [Generator/CLAUDE.md](Generator/CLAUDE.md)
- **Website**: See [Website/CLAUDE.md](Website/CLAUDE.md)
- **Infrastructure**: See [Infrastructure/CLAUDE.md](Infrastructure/CLAUDE.md)
- **Architecture Deep Dive**: See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)

## Quick Reference

### Run All Linters
```bash
# Generator (C# format check)
cd Generator && dotnet format --verify-no-changes

# Website
cd Website && npm run lint
```

### Full Build Pipeline
```bash
# From repository root
cd Generator
dotnet build --configuration Release
dotnet run --OutputFolder ../Website/generated
cd ../Website
npm install
npm run prepipeline  # Copy stub files if needed
npm run build
```

## Important Reminders

- Always regenerate `Website/generated/Data.ts` after Generator changes
- Check that Generator has access to Dataverse (use `az login` locally)
- Never commit `.env.local` or `appsettings.local.json` files
- Website depends on generated data - Generator must run first
- Azure deployment requires Managed Identity permissions setup
