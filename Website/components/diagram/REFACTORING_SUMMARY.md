# Diagram Hook Refactoring Summary

This document explains the refactoring of the `useDiagram` hook to decouple logic into separate, focused classes.

## Architecture Overview

The original `useDiagram` hook has been refactored to use a **Manager Pattern** where different aspects of diagram functionality are handled by dedicated classes:

### Core Classes

#### 1. **DiagramManager** (`DiagramManager.ts`)
- **Purpose**: Main orchestrator that coordinates all other managers
- **Responsibilities**: 
  - Manages lifecycle of all other managers
  - Provides unified API for the React hook
  - Coordinates operations between different managers

#### 2. **DiagramInitializer** (`DiagramInitializer.ts`)
- **Purpose**: Handles paper and graph initialization
- **Responsibilities**:
  - Creates and configures JointJS Paper and Graph instances
  - Sets up AvoidRouter for automatic link routing
  - Configures event handlers (hover, click, etc.)
  - Manages paper destruction and cleanup

#### 3. **DiagramControls** (`DiagramControls.ts`) 
- **Purpose**: Handles viewport controls (existing class, now integrated)
- **Responsibilities**:
  - Zoom in/out functionality
  - Pan/translate operations
  - Fit to screen functionality
  - Reset view operations

#### 4. **DiagramSelection** (`DiagramSelection.ts`)
- **Purpose**: Handles element selection (existing class, now integrated)
- **Responsibilities**:
  - Multi-select functionality
  - Selection rectangles
  - Selection state management

#### 5. **DiagramEntityManager** (`DiagramEntityManager.ts`)
- **Purpose**: Manages diagram entities and their attributes
- **Responsibilities**:
  - Add/remove entities from diagram
  - Manage entity groups
  - Handle visible attributes per entity
  - Track current entities state
  - Diagram type management (simple/detailed)

#### 6. **DiagramElementManager** (`DiagramElementManager.ts`)
- **Purpose**: Manages non-entity diagram elements (shapes, text, etc.)
- **Responsibilities**:
  - Add/remove squares and text elements
  - Element positioning logic
  - Generic element operations

#### 7. **DiagramPersistenceManager** (`DiagramPersistenceManager.ts`)
- **Purpose**: Handles saving and loading diagrams
- **Responsibilities**:
  - Save diagrams to JSON files
  - Load diagrams from JSON files
  - Export diagrams as images (SVG)
  - Clear diagram functionality

## Benefits of This Architecture

### 🎯 **Separation of Concerns**
Each class has a single, well-defined responsibility:
- **Controls**: Pan, zoom, fit
- **Selection**: Multi-select, selection UI
- **Entities**: Entity management, attributes
- **Elements**: Shapes, text elements  
- **Persistence**: Save/load functionality
- **Initialization**: Paper setup, event handling

### 🔧 **Maintainability**
- Easier to locate and fix bugs in specific functionality
- Changes to one feature don't affect others
- Each class can be tested independently
- Clear interfaces between components

### 🚀 **Extensibility**
- Easy to add new features to specific managers
- Can swap out implementations (e.g., different persistence formats)
- New diagram element types can be added to ElementManager
- Additional controls can be added to DiagramControls

### ♻️ **Reusability**
- Managers can be used independently of the React hook
- Other components can directly use specific managers
- Business logic is separate from React state management

## Usage

### Original Hook (Still Available)
```typescript
// The original hook is in useDiagram.ts (unchanged for backward compatibility)
import { useDiagram } from './hooks/useDiagram';
```

### New Refactored Hook
```typescript
// New refactored hook using the manager pattern
import { useDiagram } from './hooks/useDiagramRefactored';

// Usage is identical - same interface
const {
  paper,
  graph,
  currentEntities,
  diagramType,
  initializePaper,
  addEntityToDiagram,
  // ... all other methods
} = useDiagram();
```

### Direct Manager Usage (For Advanced Cases)
```typescript
import { DiagramManager, DiagramEntityManager } from './shared';

// Create manager instances directly if needed
const diagramManager = new DiagramManager();
const entityManager = new DiagramEntityManager(graph, paper);

// Use specific functionality
entityManager.addEntity(myEntity);
diagramManager.fitToScreen();
```

## Migration Path

1. **Phase 1**: Use `useDiagramRefactored.ts` alongside original
2. **Phase 2**: Test and verify functionality matches
3. **Phase 3**: Replace imports to use refactored version
4. **Phase 4**: Remove original `useDiagram.ts` when confident

## File Structure

```
components/diagram/
├── hooks/
│   ├── useDiagram.ts          # Original hook (for backward compatibility)
│   └── useDiagramRefactored.ts # New refactored hook
├── shared/
│   ├── DiagramManager.ts       # Main orchestrator
│   ├── DiagramInitializer.ts   # Paper/graph setup
│   ├── DiagramControls.ts      # Viewport controls (existing)
│   ├── DiagramSelection.ts     # Selection logic (existing)
│   ├── DiagramEntityManager.ts # Entity management
│   ├── DiagramElementManager.ts # Element management
│   ├── DiagramPersistenceManager.ts # Save/load functionality
│   └── index.ts               # Barrel exports
```

## Key Improvements

- ✅ **Decoupled Logic**: Each manager handles one concern
- ✅ **Testable**: Classes can be unit tested independently  
- ✅ **Maintainable**: Easy to find and modify specific functionality
- ✅ **Extensible**: Simple to add new features
- ✅ **Type Safe**: Full TypeScript support with proper interfaces
- ✅ **Backward Compatible**: Original hook still works

This refactoring makes the diagram system much more maintainable and sets it up for future enhancements while preserving the existing API for consumers.
