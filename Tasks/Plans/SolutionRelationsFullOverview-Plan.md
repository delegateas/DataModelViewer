# Plan: Extended Solution Insights with Component Type Filtering

## Summary

Extend the Solutions Insights page (`/insights?view=solutions`) to show all Dataverse solution component types with toggleable checkbox filtering. Currently only shows Entity, Attribute, and Relationship - will expand to 40+ component types.

## User Decisions

- **Default Filter State**: Only Entity, Attribute, Relationship enabled on load (backwards compatible)
- **Filter Panel**: Collapsed by default (user expands to see all options)
- **Component Types**: Include ALL types from the reference list

---

## Component Types to Support (Full List)

| Type | Code | Category | Label |
|------|------|----------|-------|
| Entity | 1 | Data Model | Table |
| Attribute | 2 | Data Model | Column |
| OptionSet | 9 | Data Model | Choice |
| Relationship | 10 | Data Model | Relationship |
| EntityKey | 14 | Data Model | Key |
| SecurityRole | 20 | Security | Security Role |
| SavedQuery | 26 | User Interface | View |
| Workflow | 29 | Code | Cloud Flow |
| RibbonCustomization | 50 | User Interface | Ribbon |
| SavedQueryVisualization | 59 | User Interface | Chart |
| SystemForm | 60 | User Interface | Form |
| WebResource | 61 | Code | Web Resource |
| SiteMap | 62 | User Interface | Site Map |
| ConnectionRole | 63 | Configuration | Connection Role |
| HierarchyRule | 65 | Data Model | Hierarchy Rule |
| CustomControl | 66 | User Interface | Custom Control |
| FieldSecurityProfile | 70 | Security | Field Security |
| ModelDrivenApp | 80 | Apps | Model-driven App |
| PluginAssembly | 91 | Code | Plugin Assembly |
| SDKMessageProcessingStep | 92 | Code | Plugin Step |
| CanvasApp | 300 | Apps | Canvas App |
| ConnectionReference | 372 | Configuration | Connection Reference |
| EnvironmentVariableDefinition | 380 | Configuration | Environment Variable |
| EnvironmentVariableValue | 381 | Configuration | Environment Variable Value |
| Dataflow | 418 | Data Model | Dataflow |
| ConnectionRoleObjectTypeCode | 3233 | Configuration | Connection Role Object Type |
| CustomAPI | 10240 | Code | Custom API |
| CustomAPIRequestParameter | 10241 | Code | Custom API Request Parameter |
| CustomAPIResponseProperty | 10242 | Code | Custom API Response Property |
| PluginPackage | 10639 | Code | Plugin Package |
| OrganizationSetting | 10563 | Configuration | Organization Setting |
| AppAction | 10645 | Apps | App Action |
| AppActionRule | 10948 | Apps | App Action Rule |
| FxExpression | 11492 | Code | Fx Expression |
| DVFileSearch | 11723 | Data Model | DV File Search |
| DVFileSearchAttribute | 11724 | Data Model | DV File Search Attribute |
| DVFileSearchEntity | 11725 | Data Model | DV File Search Entity |
| AISkillConfig | 12075 | Configuration | AI Skill Config |

**Note**: High-numbered types (10000+) are environment-specific and may not exist in all Dataverse environments. The Generator will handle missing types gracefully.

---

## Architecture Decision

**New Data Structure**: Create a separate `SolutionComponents` export in Data.ts rather than extending entity-based structure. This allows non-entity components (apps, plugins, flows) to be tracked.

**Data Flow**:
```
Dataverse solutioncomponent table
    → Generator SolutionComponentExtractor (NEW)
    → Data.ts SolutionComponents export (NEW)
    → Website DatamodelDataContext
    → InsightsSolutionView with filter checkboxes
```

### Relationship to Existing SolutionComponentService

The **existing `SolutionComponentService`** serves a different purpose and will NOT be replaced:

| Aspect | SolutionComponentService (KEEP) | SolutionComponentExtractor (NEW) |
|--------|--------------------------------|----------------------------------|
| **Purpose** | Determines which entities/attributes/relationships to include in extraction | Provides component list for insights visualization |
| **Used By** | DataverseService for filtering metadata extraction | WebsiteBuilder for Data.ts export |
| **Output** | ComponentInfo with solution mapping for entity metadata | SolutionComponentCollection for insights page |
| **Scope** | Only types 1, 2, 10, 20, 62 (entity-centric) | All 38+ component types |

The two services are complementary:
- `SolutionComponentService` → "Which entities should we extract metadata for?"
- `SolutionComponentExtractor` → "What components exist in each solution for visualization?"

---

## Implementation Steps

### Phase 1: Generator Changes

#### 1.1 Create/Update DTOs
**File:** `Generator/DTO/SolutionComponent.cs`

- Extend `SolutionComponentType` enum with all 38+ types
- Add `SolutionComponentData` record (Name, SchemaName, ComponentType, ObjectId, IsExplicit)
- Add `SolutionComponentCollection` record (SolutionId, SolutionName, Components[])

#### 1.2 Create SolutionComponentExtractor Service
**File:** `Generator/Services/SolutionComponentExtractor.cs` (NEW)

- Query solutioncomponent table for all supported component types
- Group results by solution
- Resolve display names by querying respective tables

#### 1.3 Update WebsiteBuilder
**File:** `Generator/WebsiteBuilder.cs`

- Accept `SolutionComponentCollection[]` parameter
- Add new export: `export let SolutionComponents: SolutionComponentCollectionType[] = [...]`

#### 1.4 Update DataverseService
**File:** `Generator/DataverseService.cs`

- Inject and call SolutionComponentExtractor
- Pass results to WebsiteBuilder

---

### Phase 2: Website Changes

#### 2.1 Update Types
**File:** `Website/lib/Types.ts`

- Extend `SolutionComponentTypeEnum` with all types (matching Dataverse codes)
- Add `SolutionComponentDataType` and `SolutionComponentCollectionType`
- Add `ComponentTypeCategories` constant (groups types by category for UI)
- Add `ComponentTypeLabels` constant (human-readable names)

#### 2.2 Update Data Loading
**Files:**
- `Website/components/datamodelview/dataLoaderWorker.ts`
- `Website/contexts/DatamodelDataContext.tsx`

- Import and expose `SolutionComponents` from Data.ts
- Add to context state and dispatch

#### 2.3 Update InsightsSolutionView
**File:** `Website/components/insightsview/solutions/InsightsSolutionView.tsx`

- Add `enabledComponentTypes` state (Set of enabled types)
- Add collapsible filter panel with checkboxes grouped by category
- Add "Select All" / "Select None" buttons
- Update `solutions` useMemo to filter by enabled types
- Update summary panel to group components by type (TREE VIEW - see follow-up task)

---

## Files to Modify

| File | Change Type |
|------|-------------|
| `Generator/DTO/SolutionComponent.cs` | Extend |
| `Generator/Services/SolutionComponentExtractor.cs` | Create |
| `Generator/WebsiteBuilder.cs` | Extend |
| `Generator/DataverseService.cs` | Extend |
| `Generator/Program.cs` | Register new service |
| `Website/lib/Types.ts` | Extend |
| `Website/components/datamodelview/dataLoaderWorker.ts` | Extend |
| `Website/contexts/DatamodelDataContext.tsx` | Extend |
| `Website/components/insightsview/solutions/InsightsSolutionView.tsx` | Major update |

---

## UI Design

### Filter Panel (collapsible, above heatmap)
```
┌─────────────────────────────────────────────────────────────┐
│ Component Type Filters              [Select All] [None] [▼] │
│ 6 component type(s) selected                                │
├─────────────────────────────────────────────────────────────┤
│ Data Model        User Interface      Apps                  │
│ ☑ Table           ☐ Form              ☐ Model-driven App   │
│ ☑ Column          ☐ View              ☐ Canvas App         │
│ ☑ Relationship    ☐ Site Map                               │
│ ☐ Choice          ☐ Custom Control    Code                 │
│ ☐ Key                                 ☐ Cloud Flow         │
│                   Security            ☐ Plugin Assembly    │
│ Configuration     ☐ Security Role     ☐ Plugin Step        │
│ ☐ Env Variable    ☐ Field Security    ☐ Web Resource       │
│ ☐ Connection Ref                                           │
└─────────────────────────────────────────────────────────────┘
```

### Summary Panel - Tree View Structure (Follow-up Task #5823)
```
Shared Components: (42)

▼ Table (5)
    Account
    Contact
    Lead
    Opportunity
    Case

▼ Column (30)
    firstname
    lastname
    emailaddress1
    ...

▼ Cloud Flow (7)
    When Contact Created
    Sync to ERP
    ...
```

---

## Notes

- **Breaking Change**: `SolutionComponentTypeEnum.Relationship` changes from 3 to 10 to match Dataverse. Only affects InsightsSolutionView (isolated change).
- **Performance**: Filter updates trigger useMemo recalculation - should remain fast with memoization.
- **Fallback**: If a component type query fails (e.g., Canvas Apps in older environments), skip gracefully with logging.
- **SolutionComponentService**: NOT replaced - serves different purpose (entity filtering vs insights visualization).

---

## Implementation Phases

### Phase 1: Generator (Do First)
1. Extend `SolutionComponentType` enum in `Generator/DTO/SolutionComponent.cs`
2. Create `SolutionComponentExtractor` service in `Generator/Services/`
3. Update `WebsiteBuilder.cs` to export new `SolutionComponents` array
4. Update `DataverseService.cs` to call extractor
5. Register service in `Program.cs`
6. **TEST**: Run Generator against test environment, verify Data.ts output

### Phase 2: Website (Do Second)
1. Update `Website/lib/Types.ts` with new types and labels
2. Update `dataLoaderWorker.ts` to load SolutionComponents
3. Update `DatamodelDataContext.tsx` to expose solutionComponents
4. Update `InsightsSolutionView.tsx` with filter UI and logic
5. **TEST**: Run website, verify heatmap works with filtering

---

## Related Follow-up Tasks

- **Task #5823**: Solution summary → treeview of all component types "enabled"
  - The summary panel will be structured as a tree view grouped by component type
  - This is built into this implementation - summary panel will show components grouped by type

---

## Name Resolution Tables (for Generator)

Each component type needs its display name resolved from different Dataverse tables:

| ComponentType | Query Table | Name Column |
|---------------|-------------|-------------|
| Entity (1) | entity (via metadata API) | LogicalName/DisplayName |
| Attribute (2) | attribute (via metadata API) | LogicalName/DisplayName |
| OptionSet (9) | optionset (via metadata API) | Name |
| Relationship (10) | relationship (via metadata API) | SchemaName |
| EntityKey (14) | entitykey (via metadata API) | LogicalName |
| SecurityRole (20) | role | name |
| SavedQuery (26) | savedquery | name |
| Workflow (29) | workflow | name |
| RibbonCustomization (50) | ribboncustomization | entity |
| SavedQueryVisualization (59) | savedqueryvisualization | name |
| SystemForm (60) | systemform | name |
| WebResource (61) | webresource | name |
| SiteMap (62) | sitemap | sitemapname |
| ConnectionRole (63) | connectionrole | name |
| HierarchyRule (65) | hierarchyrule | name |
| CustomControl (66) | customcontrol | name |
| FieldSecurityProfile (70) | fieldsecurityprofile | name |
| ModelDrivenApp (80) | appmodule | name |
| PluginAssembly (91) | pluginassembly | name |
| SDKMessageProcessingStep (92) | sdkmessageprocessingstep | name |
| CanvasApp (300) | canvasapp | name |
| ConnectionReference (372) | connectionreference | connectionreferencedisplayname |
| EnvironmentVariableDefinition (380) | environmentvariabledefinition | displayname |
| EnvironmentVariableValue (381) | environmentvariablevalue | schemaname |
| Dataflow (418) | workflow (category=6) | name |
| CustomAPI (10240) | customapi | name |
| CustomAPIRequestParameter (10241) | customapirequestparameter | name |
| CustomAPIResponseProperty (10242) | customapiresponseproperty | name |
| PluginPackage (10639) | pluginpackage | name |

**Fallback Strategy**: If name resolution fails for a component, use ObjectId as fallback name.