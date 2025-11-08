# Diagram Layout Algorithms

This directory contains layout algorithms for automatically positioning entities in the diagram view.

## GridHierarchicalLayout (Recommended for ER Diagrams)

**File:** [GridHierarchicalLayout.ts](GridHierarchicalLayout.ts)

A strict grid-based hierarchical layout algorithm specifically optimized for ER diagrams:

1. ✅ **Perfect grid alignment** - All entities snap to a strict grid
2. ✅ **Hierarchical layers** - Groups entities by relationship direction
3. ✅ **Minimal edge crossings** - Uses barycentric heuristic to order entities
4. ✅ **Readable spacing** - Consistent horizontal and vertical spacing
5. ✅ **libavoid compatible** - Uses batch mode for clean orthogonal routing

### How It Works

The algorithm uses a **layered approach** based on Sugiyama's algorithm with weighted node placement:

#### 1. Layer Assignment (Longest-Path Algorithm)
- Analyzes relationship direction (1:N, N:1, N:N)
- Uses **longest path from source nodes** to assign layers
- Distributes entities more evenly than simple topological sort
- Source entities (no incoming relationships) start at layer 0
- Each downstream entity is placed at max(predecessor layers) + 1
- Fallback: For cyclic graphs, distributes by connectivity

#### 2. Edge Crossing Minimization (Weighted Barycentric)
- Uses **weighted barycentric heuristic** to order entities within layers
- Weights connections by:
  - Number of relationships between entities
  - Importance of connected nodes (totalDegree)
- Performs multiple forward/backward passes to reduce crossings
- Converges to locally optimal ordering
- High-connectivity nodes influence ordering more

#### 3. Weighted Coordinate Assignment
- Allocates horizontal space proportional to entity connectivity
- High-connectivity entities get MORE space (not just padding)
- Formula: `allocatedWidth = minSpacing + (extraSpace × weight/totalWeight)`
- Minimum 200px per entity to prevent overlap
- Extra space distributed by connectivity weight
- Entities centered within their allocated space
- Snaps all positions to grid cells for clean alignment

### Configuration Options

```typescript
interface GridHierarchicalLayoutOptions {
    gridCellSize?: number;                        // Default: 200px
    horizontalSpacing?: number;                   // Default: 250px (used for layer width calc)
    verticalSpacing?: number;                     // Default: 300px
    columnsPerRow?: number;                       // Default: 5 (not used in current impl)
    topPadding?: number;                          // Default: 100px
    leftPadding?: number;                         // Default: 150px
    highConnectivitySpacingMultiplier?: number;   // Default: 1.5 (legacy, not used)
    highConnectivityThreshold?: number;           // Default: 3 (for debug logging)
}
```

### Usage Example

```typescript
const gridLayout = new GridHierarchicalLayout(
    paper,
    graph,
    entityElements,
    {
        gridCellSize: 200,
        horizontalSpacing: 200,
        verticalSpacing: 250,
        columnsPerRow: 4,
        topPadding: 100,
        leftPadding: 100
    }
);

await gridLayout.applyLayout();
```

### When to Use

**Perfect for:**
- ER diagrams with clear parent-child relationships
- Diagrams where grid alignment is critical
- Presentations and documentation (clean, professional look)
- Diagrams with 1:N or N:1 relationships

**Not ideal for:**
- Highly interconnected graphs (many N:N relationships)
- Circular dependencies
- Very large graphs (50+ entities) - may create tall diagrams

---

## ForceDirectedLayout (Alternative)

**File:** [ForceDirectedLayout.ts](ForceDirectedLayout.ts)

A sophisticated force-directed graph layout algorithm optimized for:
1. ✅ **Grid alignment** - Entities snap to a configurable grid for clean diagrams
2. ✅ **Readable spacing** - Maintains minimum spacing between entities to prevent overlap
3. ✅ **Edge crossing minimization** - Uses physics simulation to reduce relationship crossings
4. ✅ **Orthogonal routing optimization** - Biases towards horizontal/vertical alignment for libavoid

### How It Works

The algorithm uses **d3-force** physics simulation with the following forces:

#### 1. Link Force (Attraction)
- Pulls connected entities together
- Strength weighted by number of relationships
- Configurable distance (default: 200px)

#### 2. Charge Force (Repulsion)
- Pushes all entities apart to prevent clustering
- Negative charge creates repulsion
- Default: -300 (moderate repulsion)

#### 3. Collision Force (Overlap Prevention)
- Creates an invisible "bubble" around each entity
- Radius based on entity size + spacing
- Ensures entities don't overlap

#### 4. Center Force (Stability)
- Gently pulls the entire graph toward the paper center
- Prevents entities from drifting off-canvas
- Weak force (0.05 strength)

#### 5. Orthogonal Bias Force (libavoid Optimization)
- **Custom force** designed for orthogonal routing
- Gently pushes entities toward grid-aligned positions
- Helps libavoid create cleaner horizontal/vertical routes
- Only active during simulation (doesn't override other forces)

### Algorithm Flow

```
1. Build Force Graph
   ├─ Convert JointJS elements to force nodes
   ├─ Extract relationships as force links
   └─ Calculate link weights (# of relationships)

2. Create Simulation
   ├─ Configure all forces
   ├─ Set force parameters
   └─ Add orthogonal bias

3. Run Simulation
   ├─ Execute N iterations (default: 300)
   ├─ Forces converge to stable positions
   └─ Orthogonal bias guides alignment

4. Apply Positions
   ├─ Snap to grid (default: 40px)
   ├─ Animate transitions (optional)
   └─ Update JointJS elements
```

### Configuration Options

```typescript
interface ForceDirectedLayoutOptions {
    // Grid & Spacing
    gridSize?: number;           // Default: 40px
    entitySpacing?: number;      // Default: 180px

    // Forces
    linkStrength?: number;       // Default: 0.5
    linkDistance?: number;       // Default: 200px
    chargeStrength?: number;     // Default: -300

    // Simulation
    iterations?: number;         // Default: 300

    // libavoid Optimization
    orthogonalBias?: boolean;           // Default: true
    orthogonalBiasStrength?: number;    // Default: 0.3
}
```

**Note:** Animation is disabled because libavoid cannot handle intermediate position states during transitions. The layout uses JointJS batch mode to apply all positions atomically.

### Usage Example

```typescript
const forceLayout = new ForceDirectedLayout(
    paper,
    graph,
    entityElements,
    {
        gridSize: 40,
        entitySpacing: 180,
        linkStrength: 0.5,
        linkDistance: 200,
        chargeStrength: -300,
        iterations: 300,
        orthogonalBias: true,
        orthogonalBiasStrength: 0.3
    }
);

await forceLayout.applyLayout();
```

### Tuning Parameters

#### For Dense Graphs (many relationships)
- Increase `linkDistance` (250-300)
- Increase `entitySpacing` (200-250)
- Decrease `chargeStrength` (-400 to -500)

#### For Sparse Graphs (few relationships)
- Decrease `linkDistance` (150-180)
- Decrease `entitySpacing` (150-180)
- Increase `chargeStrength` (-200 to -250)

#### For Better Orthogonal Routing
- Increase `orthogonalBiasStrength` (0.4-0.5)
- Use larger `gridSize` (60-80)
- Increase `iterations` (400-500)

#### For Faster Layout
- Decrease `iterations` (150-200)
- Disable `animate`
- Disable `orthogonalBias`

### Why libavoid Optimization Matters

**libavoid** (used in this project) creates orthogonal routes between entities. The routing quality improves significantly when entities are:

1. **Grid-aligned** - Routes follow grid lines naturally
2. **Horizontally/vertically aligned** - Creates straight segments
3. **Well-spaced** - Reduces route complexity

The `orthogonalBias` force achieves this by:
- Calculating nearest grid point for each entity
- Applying gentle velocity adjustment toward that point
- Scaling with simulation alpha (stronger initially, weaker as it converges)
- Working in harmony with other forces (doesn't override them)

**Result:** Cleaner diagrams with fewer route bends and crossings.

### Performance Considerations

- **Time Complexity:** O(n²) per iteration for charge force
- **Memory:** O(n + e) where n = nodes, e = edges
- **Typical Performance:**
  - 10 entities: ~50ms
  - 50 entities: ~200ms
  - 100 entities: ~800ms
  - 200+ entities: Consider reducing iterations

The simulation runs synchronously but quickly. For large graphs (200+ entities), consider:
- Reducing iterations
- Using a worker thread (future enhancement)
- Applying layout only to selected subgraphs

### Algorithm Comparison

| Feature | GridHierarchicalLayout | ForceDirectedLayout | SmartLayout (Legacy) |
|---------|----------------------|--------------------|--------------------|
| Grid alignment | ✅ Perfect | ⚠️ Approximate | ✅ Yes |
| Hierarchical structure | ✅ Yes | ❌ No | ❌ No |
| Edge crossing minimization | ✅ Yes (barycentric) | ✅ Yes (physics) | ❌ No |
| Relationship-aware | ✅ Yes (directional) | ✅ Yes (weighted) | ⚠️ Partial (count only) |
| ER diagram optimized | ✅ Yes | ⚠️ Moderate | ❌ No |
| Configurable | ✅ Highly | ✅ Highly | ⚠️ Limited |
| libavoid compatible | ✅ Yes (batch mode) | ✅ Yes (batch mode) | ✅ Yes |
| Speed | ✅ Fast | ⚠️ Moderate | ✅ Fast |
| Best for | ER diagrams, hierarchies | Dense graphs, clusters | Simple grids |

### Future Enhancements

Potential improvements for future versions:

1. **Adaptive Parameters** - Auto-tune based on graph density
2. **Hierarchical Layout** - Detect and respect entity hierarchies
3. **Incremental Layout** - Update only affected entities
4. **Web Worker** - Run simulation off main thread
5. **Layout Templates** - Pre-configured settings for common use cases
6. **Undo/Redo** - Save and restore positions
7. **Manual Refinement** - Lock entities during layout

---

## SmartLayout (Legacy)

**File:** [SmartLayout.ts](SmartLayout.ts)

Original grid-based layout algorithm. Simple and fast, but doesn't consider relationship structure.

### When to Use
- Very large graphs (200+ entities)
- When speed is critical
- When relationship structure is unimportant

### Limitations
- No edge crossing optimization
- Simple grid arrangement
- Doesn't consider actual relationships
- No animation support

---

## Integration

Layouts are integrated via `DiagramViewContext.applySmartLayout()`:

```typescript
// Current implementation uses GridHierarchicalLayout (best for ER diagrams)
const applySmartLayout = async (entities: EntityType[]) => {
    const gridLayout = new GridHierarchicalLayout(
        paperRef.current,
        graphRef.current,
        layoutEntities,
        {
            gridCellSize: 200,
            horizontalSpacing: 200,
            verticalSpacing: 250,
            columnsPerRow: 4
        }
    );

    await gridLayout.applyLayout();
};
```

**Alternative layouts:**

To use ForceDirectedLayout (better for dense, interconnected graphs):
```typescript
const forceLayout = new ForceDirectedLayout(
    paperRef.current,
    graphRef.current,
    layoutEntities,
    {
        gridSize: 40,
        entitySpacing: 180,
        iterations: 300
    }
);
await forceLayout.applyLayout();
```

To use SmartLayout (legacy, fast but basic):
```typescript
const smartLayout = new SmartLayout(paperRef.current, layoutEntities);
smartLayout.applyLayout(); // Synchronous
```
