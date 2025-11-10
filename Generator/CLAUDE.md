# CLAUDE.md - Generator Project

This file provides guidance to Claude Code when working with the Generator project.

## Project Overview

The Generator is a C# .NET 8 console application that extracts metadata from Microsoft Dataverse and generates TypeScript definitions for the Website project. It analyzes entities, attributes, relationships, security roles, plugins, flows, and web resources.

## Technology Stack

- **.NET 8.0** with C# 13
- **Microsoft.PowerPlatform.Dataverse.Client** v1.2.2 - Dataverse SDK
- **Azure.Identity** v1.13.1 - Authentication via DefaultAzureCredential
- **System.Linq.Dynamic.Core** v1.6.7 - Dynamic LINQ queries
- **Microsoft.Extensions.Configuration** - Configuration management
- **Microsoft.Extensions.Logging** - Console logging

## Architecture

### Entry Point: Program.cs

Simple flow:
1. Load configuration from environment variables and `appsettings.local.json`
2. Create DataverseService with logger
3. Call `GetFilteredMetadata()` to extract data
4. Pass to WebsiteBuilder to generate TypeScript output

### Core Services

#### DataverseService.cs
**Responsibility**: Connect to Dataverse and extract all metadata

**Key Methods**:
- `GetFilteredMetadata()` - Main orchestrator, filters by solutions
- `GetEntities()` - Query all EntityMetadata
- `MapEntity()` - Convert Dataverse entity to DTO
- `MapAttribute()` - Convert attributes to polymorphic type-safe DTOs
- `GetRelationships()` - Extract N:1, 1:N, N:N relationships

**Authentication**: Uses `DefaultAzureCredential` which tries in order:
1. Environment variables (for pipelines)
2. Azure CLI credentials (for local dev)
3. Managed Identity (for Azure deployment)

**Filtering**: Only includes entities from specified solutions in `DataverseSolutionNames` config

#### WebsiteBuilder.cs
**Responsibility**: Generate TypeScript file from metadata DTOs

**Output**: `Website/generated/Data.ts` containing:
```typescript
export const EntityGroups: Map<string, EntityType[]>
export const Warnings: SolutionWarningsList[]
export const SolutionComponents: SolutionComponentList[]
export const timestamp: string
export const logo: string | null
```

**Key Methods**:
- `AddData()` - Orchestrates file generation
- Groups entities by category (from entity descriptions or config)
- Converts C# DTOs to TypeScript type syntax

#### MetadataExtensions.cs
**Responsibility**: Detect customizations to standard fields

**Key Logic**:
- `StandardFieldHasChanged()` - Detects if OOB fields were modified
- Compares display names and descriptions against defaults (English, Danish)
- Checks if StatusCode/StateCode options have custom (unmanaged) values
- Returns true if any customization detected

**Use Case**: Website can hide/show standard vs. customized fields

### Directory Structure

```
Generator/
├── DTO/                          # Data Transfer Objects
│   ├── Attributes/              # Attribute type DTOs (polymorphic)
│   ├── Entity.cs                # Entity DTO
│   ├── Relationship.cs          # Relationship DTO
│   ├── SecurityRole.cs          # Security role DTO
│   └── Solution.cs              # Solution component DTOs
│
├── Services/                     # Analyzers for special components
│   ├── PluginAnalyzer.cs       # Extracts plugin steps and dependencies
│   ├── FlowAnalyzer.cs         # Parses Power Automate flows
│   └── WebResourceAnalyzer.cs  # Analyzes JavaScript web resources
│
├── Queries/                      # FetchXML and query helpers
│   └── (Query definition files)
│
├── Program.cs                    # Entry point
├── DataverseService.cs          # Main Dataverse interaction
├── WebsiteBuilder.cs            # TypeScript generator
├── MetadataExtensions.cs        # Customization detection
├── ClientExtensions.cs          # ServiceClient helpers
├── UtilityExtensions.cs         # General utilities
└── Generator.csproj             # Project file
```

## Configuration

### appsettings.local.json (required for local development)

```json
{
  "DataverseUrl": "https://org.crm4.dynamics.com",
  "DataverseSolutionNames": "SolutionUniqueName1,SolutionUniqueName2",
  "OutputFolder": "../Website/generated",
  "Verbosity": "Information"
}
```

**Configuration Keys**:
- `DataverseUrl` - Full URL to Dataverse environment (required)
- `DataverseSolutionNames` - Comma-separated list of solution unique names (required)
- `OutputFolder` - Path to output directory (default: `../Website/generated`)
- `Verbosity` - Logging level: `Trace`, `Debug`, `Information`, `Warning`, `Error` (default: `Information`)
- `TableGroups` - Optional semi-colon separated group definitions (format: `Group Name: table1, table2; Other Group: table3`)

### Environment Variables (for pipelines)

- `DataverseUrl` - Same as config
- `DataverseSolutionNames` - Same as config
- `OutputFolder` - Same as config
- `AZURE_CLIENT_ID` - Azure App Registration Client ID
- `AZURE_CLIENT_SECRET` - Azure App Registration Secret
- `AZURE_TENANT_ID` - Azure Tenant ID

## Development Commands

### Setup
```bash
cd Generator
dotnet restore
```

### Build
```bash
dotnet build
dotnet build --configuration Release
```

### Run (Generate Metadata)
```bash
# Default output to ../Website/generated
dotnet run

# Custom output folder
dotnet run --OutputFolder /path/to/output

# With specific configuration
dotnet run --DataverseUrl https://org.crm4.dynamics.com --OutputFolder ../Website/generated
```

### Format Code
```bash
dotnet format
dotnet format --verify-no-changes  # Check only, no modifications
```

### Clean Build
```bash
dotnet clean
dotnet build
```

## Authentication Setup (Local Development)

The Generator uses `DefaultAzureCredential` which requires Azure CLI authentication locally:

```bash
# Login with Azure CLI
az login

# Select correct subscription if needed
az account list
az account set --subscription "Subscription Name or ID"

# Verify access
az account show
```

**Required Permissions**: The authenticated user must have at least `Basic` read access to the Dataverse environment.

## DTO Type System

### Entity DTO (`DTO/Entity.cs`)

```csharp
public class Entity
{
    public string DisplayName { get; set; }
    public string SchemaName { get; set; }
    public string? Group { get; set; }
    public string Ownership { get; set; }
    public bool IsActivity { get; set; }
    public bool IsCustom { get; set; }
    public List<Attribute> Attributes { get; set; }
    public List<Relationship> Relationships { get; set; }
    public List<SecurityRole> SecurityRoles { get; set; }
    public List<Key> Keys { get; set; }
}
```

### Polymorphic Attribute Types (`DTO/Attributes/`)

**Base**: `Attribute` (abstract)

**Concrete Types**:
- `ChoiceAttribute` - Picklist with options
- `LookupAttribute` - Foreign key (Targets list)
- `StringAttribute` - Text (MaxLength, Format)
- `DateTimeAttribute` - Date/Time (Behavior, Format)
- `IntegerAttribute` - Whole number
- `DecimalAttribute` - Decimal/Money
- `BooleanAttribute` - Two-option (TrueLabel, FalseLabel)
- `StatusAttribute` - Status with linked State
- `FileAttribute` - File/Image (MaxSize)
- `GenericAttribute` - Fallback for unsupported types

**Pattern**: Each attribute type has properties specific to its Dataverse counterpart.

### Relationship DTO (`DTO/Relationship.cs`)

```csharp
public class Relationship
{
    public string Name { get; set; }
    public string RelationshipSchema { get; set; }
    public string TableSchema { get; set; }
    public bool IsManyToMany { get; set; }
    public CascadeConfiguration CascadeConfiguration { get; set; }
}
```

## Common Tasks

### Add Support for New Attribute Type

1. **Create DTO**: Add new class in `DTO/Attributes/` inheriting from `Attribute`
   ```csharp
   public class NewAttribute : Attribute
   {
       public string SpecialProperty { get; set; }
   }
   ```

2. **Update Mapper**: Add case in `DataverseService.cs:MapAttribute()`
   ```csharp
   case NewAttributeMetadata newAttr:
       return new NewAttribute
       {
           // Map properties
           SpecialProperty = newAttr.SpecialProperty
       };
   ```

3. **Update Website**: Add corresponding TypeScript type in `Website/lib/Types.ts`

### Add New Analyzer

1. **Create Service**: Add new analyzer in `Services/` directory
2. **Extract Data**: Query relevant Dataverse records
3. **Add to Output**: Update `WebsiteBuilder.cs` to include new data
4. **Update Website**: Create UI to display the new data

### Modify Query Logic

1. **Find Query**: Locate in `Queries/` or in `DataverseService.cs` methods
2. **Update FetchXML/QueryExpression**: Modify query structure
3. **Test Locally**: Run generator and verify output
4. **Validate Output**: Check `Website/generated/Data.ts` is valid TypeScript

### Debug Connection Issues

**Problem**: Cannot connect to Dataverse

**Solutions**:
1. Verify `DataverseUrl` is correct in config
2. Check Azure CLI is logged in: `az account show`
3. Verify user has Dataverse access
4. Check network connectivity
5. Try different authentication methods (environment variables vs. CLI)

**Enable Detailed Logging**:
```json
{
  "Verbosity": "Trace"
}
```

### Handle Missing Entities

**Problem**: Expected entities not in output

**Check**:
1. Verify entity exists in specified solutions
2. Check `DataverseSolutionNames` includes correct solutions
3. Review console warnings for excluded entities
4. Verify solution publisher prefix matches

## Output Format

The generated `Data.ts` file structure:

```typescript
// Entity groups mapped by category
export const EntityGroups = new Map<string, EntityType[]>([
  ["Core", [/* entities */]],
  ["Custom", [/* entities */]],
  // ...
]);

// Validation warnings for solutions
export const Warnings: SolutionWarningsList[] = [
  {
    SolutionName: "MySolution",
    Warnings: [/* warning objects */]
  }
];

// Solution component breakdown
export const SolutionComponents: SolutionComponentList[] = [
  {
    SolutionName: "MySolution",
    Components: [/* component objects */]
  }
];

// Generation timestamp
export const timestamp = "2025-11-10T15:30:00Z";

// Optional base64 encoded logo
export const logo = "data:image/png;base64,...";
```

## Integration with Website

**Critical**: Website depends on this output file. Always regenerate after Generator changes.

**Workflow**:
1. Modify Generator code or configuration
2. Run `dotnet run` to regenerate `Data.ts`
3. Restart Website dev server to pick up changes
4. Test Website functionality

**Type Safety**: Keep C# DTOs in sync with TypeScript types in `Website/lib/Types.ts`

## Performance Considerations

**Large Environments**:
- Fetching 500+ entities can take 2-5 minutes
- Relationship queries are expensive
- Plugin/Flow analysis adds overhead

**Optimization**:
- Filter by specific solutions only
- Reduce verbosity for production runs
- Consider caching metadata for incremental updates

## Testing Strategy

### Manual Testing
1. Run against test environment
2. Check console output for errors/warnings
3. Verify generated TypeScript file:
   - Valid syntax (no compile errors)
   - Expected entities present
   - Attributes have correct types
   - Relationships are bidirectional

### Validation Checklist
- [ ] Generator runs without exceptions
- [ ] Output file created at correct location
- [ ] No TypeScript compilation errors in output
- [ ] Entity count matches expectation
- [ ] Custom entities identified correctly
- [ ] Relationships include both directions
- [ ] Security roles populated
- [ ] Warning list shows known issues

## Troubleshooting

### "Unable to authenticate" Error
- Run `az login` and authenticate
- Verify subscription has Dataverse access
- Check if using correct Azure tenant

### "Invalid solution name" Warning
- Verify solution unique names (not display names)
- Check solutions exist in target environment
- Ensure solutions have same publisher prefix

### Large Output File
- Filter by more specific solutions
- Consider splitting into multiple generation runs
- Website may have performance issues with 1000+ entities

### Missing Attributes/Relationships
- Check if filtered by solution components
- Verify attribute is not system-only
- Ensure relationship is managed or in solutions

## Important Reminders

- Always run Generator before starting Website development session
- Keep `appsettings.local.json` out of source control (already in .gitignore)
- DefaultAzureCredential requires Azure CLI for local dev
- Output folder must exist before running (Generator will not create it)
- TypeScript output must be valid - Generator will not validate syntax
- Generator runs synchronously - expect 2-5 minute execution time for large environments
