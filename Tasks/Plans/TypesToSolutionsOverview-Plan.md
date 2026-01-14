# Plan: Types to Solutions Overview

## Summary

Add a new section to the Solution Insights page (`/insights?view=solutions`) that answers the question: **"Which solutions contain each component type, and what specific components are in each?"**

This is the inverse of the existing heatmap view:
- **Heatmap (existing)**: Solution → Solution intersection of components
- **Types Overview (new)**: Component Type → Solutions → Specific Components

Example use case: "Which solutions have plugin assemblies, and which plugins are in each solution?"

---

## User Story

As a Dataverse administrator, I want to see:
1. A list of all component types that exist in my solutions
2. For each component type, which solutions contain that type
3. For each solution, what specific components of that type it contains

**Visual hierarchy**: `Component Type → Solutions → Component Names`

---

## UI Design

### Layout

New section below the existing heatmap and summary panel, occupying full width.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Component Types Overview                                           [▼ / ▲] │
│ See which solutions contain each component type                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ▼ Plugin Assembly (3 solutions, 12 components)                              │
│   ├─ ▼ CRM Core Solution (5)                                                │
│   │     • AccountPlugin                                                     │
│   │     • ContactPlugin                                                     │
│   │     • LeadPlugin                                                        │
│   │     • OpportunityPlugin                                                 │
│   │     • CasePlugin                                                        │
│   │                                                                         │
│   ├─ ▼ Integration Solution (4)                                             │
│   │     • ERPSyncPlugin                                                     │
│   │     • WebhookPlugin                                                     │
│   │     • DataExportPlugin                                                  │
│   │     • ImportPlugin                                                      │
│   │                                                                         │
│   └─ ▶ Marketing Solution (3)  [collapsed]                                  │
│                                                                             │
│ ▶ Cloud Flow (5 solutions, 47 components)  [collapsed]                      │
│                                                                             │
│ ▼ Canvas App (2 solutions, 4 components)                                    │
│   ├─ ▶ Sales Portal (2)  [collapsed]                                        │
│   └─ ▶ Service Desk (2)  [collapsed]                                        │
│                                                                             │
│ ▶ Model-driven App (4 solutions, 8 components)  [collapsed]                 │
│                                                                             │
│ ▶ Custom API (1 solution, 3 components)  [collapsed]                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interaction

1. **Component Type Level**: Click to expand/collapse all solutions for that type
2. **Solution Level**: Click to expand/collapse specific components in that solution
3. **Sorting**: Types sorted by total component count (descending) - most used types first
4. **Empty Types**: Only show types that have at least one component in the data

### Features

- **Section collapsible**: Entire section can be collapsed to reduce visual clutter
- **Expand/Collapse All**: Buttons to expand or collapse all types and solutions
- **Search/Filter** (optional enhancement): Filter by type name or solution name
- **Respects filter panel**: Uses same `enabledComponentTypes` filter as the heatmap

---

## Implementation Steps

### Step 1: Add Collapsed State for Section

Add state to track if the entire "Types Overview" section is expanded/collapsed.

```typescript
const [typesOverviewExpanded, setTypesOverviewExpanded] = useState(true);
```

### Step 2: Create Data Structure

Build a hierarchical data structure from the existing `solutionComponents`:

```typescript
type TypeToSolutionsData = {
    componentType: SolutionComponentTypeEnum;
    typeLabel: string;
    totalCount: number;
    solutions: {
        solutionName: string;
        components: SolutionComponentDataType[];
    }[];
}[];
```

### Step 3: Create `typesToSolutions` useMemo

```typescript
const typesToSolutions = useMemo(() => {
    // 1. Group all components by type
    // 2. For each type, group by solution
    // 3. Filter by enabledComponentTypes
    // 4. Sort by total count descending
}, [solutionComponents, enabledComponentTypes]);
```

### Step 4: Create Collapse State for Types and Solutions

```typescript
// Track which types are collapsed
const [collapsedTypes, setCollapsedTypes] = useState<Set<SolutionComponentTypeEnum>>(new Set());

// Track which solutions within each type are collapsed (key: "type-solutionName")
const [collapsedTypeSolutions, setCollapsedTypeSolutions] = useState<Set<string>>(new Set());
```

### Step 5: Implement Smart Defaults

- If a type has ≤3 solutions, expand all by default
- If a solution has ≤5 components, expand by default
- Otherwise, start collapsed

### Step 6: Render UI

Use MUI components:
- `Paper` for container
- `Collapse` for expand/collapse animation
- `Box` with `onClick` for clickable headers
- `ExpandMore/ExpandLess` icons for visual indicators
- Nested `Box` for indentation

---

## Files to Modify

| File | Change |
|------|--------|
| `InsightsSolutionView.tsx` | Add new section with types overview UI |

No Generator changes needed - uses existing `solutionComponents` data.

---

## Code Structure

### New useMemo Hook

```typescript
const typesToSolutions = useMemo(() => {
    // Build map: componentType -> solutionName -> components[]
    const typeMap = new Map<SolutionComponentTypeEnum, Map<string, SolutionComponentDataType[]>>();

    solutionComponents.forEach(collection => {
        collection.Components.forEach(comp => {
            // Only include enabled types
            if (!enabledComponentTypes.has(comp.ComponentType)) return;

            if (!typeMap.has(comp.ComponentType)) {
                typeMap.set(comp.ComponentType, new Map());
            }
            const solutionMap = typeMap.get(comp.ComponentType)!;

            if (!solutionMap.has(collection.SolutionName)) {
                solutionMap.set(collection.SolutionName, []);
            }
            solutionMap.get(collection.SolutionName)!.push(comp);
        });
    });

    // Convert to array and sort
    const result = Array.from(typeMap.entries())
        .map(([type, solutions]) => {
            const solutionsArray = Array.from(solutions.entries())
                .map(([name, comps]) => ({
                    solutionName: name,
                    components: comps.sort((a, b) => a.Name.localeCompare(b.Name))
                }))
                .sort((a, b) => b.components.length - a.components.length);

            return {
                componentType: type,
                typeLabel: getComponentTypeLabel(type),
                totalCount: solutionsArray.reduce((sum, s) => sum + s.components.length, 0),
                solutions: solutionsArray
            };
        })
        .sort((a, b) => b.totalCount - a.totalCount);

    return result;
}, [solutionComponents, enabledComponentTypes]);
```

### UI Rendering (Pseudocode)

```tsx
<Grid size={12}>
    <Paper className="p-6 rounded-2xl" elevation={2}>
        {/* Header with expand/collapse */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Component Types Overview</Typography>
            <Box>
                <Button onClick={handleExpandAllTypes}>Expand All</Button>
                <Button onClick={handleCollapseAllTypes}>Collapse All</Button>
                <IconButton onClick={() => setTypesOverviewExpanded(!typesOverviewExpanded)}>
                    {typesOverviewExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
        </Box>

        <Collapse in={typesOverviewExpanded}>
            {typesToSolutions.map(typeData => (
                <Box key={typeData.componentType}>
                    {/* Type header - clickable */}
                    <Box onClick={() => toggleType(typeData.componentType)}>
                        <ExpandIcon /> {typeData.typeLabel}
                        ({typeData.solutions.length} solutions, {typeData.totalCount} components)
                    </Box>

                    <Collapse in={!collapsedTypes.has(typeData.componentType)}>
                        {typeData.solutions.map(solution => (
                            <Box key={solution.solutionName} sx={{ pl: 3 }}>
                                {/* Solution header - clickable */}
                                <Box onClick={() => toggleSolution(typeData.componentType, solution.solutionName)}>
                                    <ExpandIcon /> {solution.solutionName} ({solution.components.length})
                                </Box>

                                <Collapse in={!isCollapsed(typeData.componentType, solution.solutionName)}>
                                    <Box component="ul" sx={{ pl: 4 }}>
                                        {solution.components.map(comp => (
                                            <li key={comp.ObjectId}>{comp.Name}</li>
                                        ))}
                                    </Box>
                                </Collapse>
                            </Box>
                        ))}
                    </Collapse>
                </Box>
            ))}
        </Collapse>
    </Paper>
</Grid>
```

---

## Smart Expand/Collapse Logic

### On Initial Load

```typescript
useEffect(() => {
    // Auto-expand types with few solutions
    const autoExpanded = new Set<SolutionComponentTypeEnum>();
    const autoCollapsedSolutions = new Set<string>();

    typesToSolutions.forEach(typeData => {
        if (typeData.solutions.length > 3) {
            // Collapse types with many solutions
            autoExpanded.add(typeData.componentType);
        }

        typeData.solutions.forEach(solution => {
            if (solution.components.length > 5) {
                // Collapse solutions with many components
                autoCollapsedSolutions.add(`${typeData.componentType}-${solution.solutionName}`);
            }
        });
    });

    setCollapsedTypes(autoExpanded);
    setCollapsedTypeSolutions(autoCollapsedSolutions);
}, [typesToSolutions]);
```

---

## Styling Notes

- Use consistent spacing and indentation with existing UI
- Use `text.secondary` color for counts
- Use `primary.main` color for type and solution names
- Tree-view indentation: 24px per level
- Hover effect on clickable rows

---

## Edge Cases

1. **No data**: Show "No component data available" message
2. **No enabled types**: Show "Select component types in the filter panel above"
3. **Empty after filter**: Show "No components match the selected filters"
4. **Very long lists**: Consider virtualization if performance becomes an issue (future enhancement)

---

## Testing

1. Verify types are correctly grouped
2. Verify solutions are correctly nested under types
3. Verify component names appear under solutions
4. Verify expand/collapse works at all levels
5. Verify filter panel affects the overview
6. Verify sorting (most components first)
7. Verify smart expand logic works correctly

---

## Future Enhancements (Out of Scope)

- Search/filter within the types overview
- Export to CSV/Excel
- Click to navigate to component details
- Highlight shared components (appear in multiple solutions)
