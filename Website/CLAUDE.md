# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Data Model Viewer is a Next.js 15 application for visualizing Dataverse data models. It features an interactive diagram editor built on JointJS with custom routing using libavoid-js, Azure DevOps integration for persistence, and comprehensive metadata visualization.

## Development Commands

### Setup
```bash
npm i
```

Required environment variables in `.env.local`:
- `WebsitePassword` - Basic auth password
- `WebsiteSessionSecret` - Session encryption secret
- `ADO_PROJECT_NAME` - Azure DevOps project name
- `ADO_ORGANIZATION_URL` - Azure DevOps organization URL
- `ADO_REPOSITORY_NAME` - Repository name for diagram storage
- `AZURE_CLI_AUTHENTICATION_ENABLED` - Set to `true` for local dev
- `ADO_PAT` - Personal Access Token for Azure DevOps (generate at DevOps settings)

### Development
```bash
npm run dev              # Start development server
npm run build            # Build production bundle
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prepipeline      # Copy stub files (runs before pipeline build)
```

Note: The build process includes a `postbuild` script that creates required standalone directories for Next.js 15 deployment compatibility.

## Architecture

### Core Technology Stack
- **Next.js 15** with App Router and React 19
- **JointJS (@joint/core)** for diagram rendering and manipulation
- **libavoid-js** for intelligent relationship routing (runs in Web Worker)
- **MUI (Material-UI v7)** for UI components
- **Tailwind CSS 4** for styling
- **Azure DevOps REST API** for diagram persistence

### Context Providers (app/layout.tsx)
Application uses nested context providers in this order:
1. `AuthProvider` - Session management and Azure DevOps authentication
2. `SettingsProvider` - User preferences and UI settings
3. `DatamodelDataProvider` - Dataverse metadata (entities, relationships, attributes)
4. `SidebarProvider` - UI sidebar state
5. `SnackbarProvider` - Toast notifications

### Diagram Architecture

**Key Pattern**: Diagram uses JointJS for rendering with a Web Worker for routing calculations.

#### DiagramViewContext (`contexts/DiagramViewContext.tsx`)
- Central state management for the diagram canvas
- Maintains JointJS `dia.Graph` and `dia.Paper` instances
- Manages zoom, pan, entity selection, and entity lifecycle
- Provides actions: `addEntity`, `removeEntity`, `selectEntity`, `applySmartLayout`, etc.
- Tracks `entitiesInDiagram` Map for quick lookups

#### Custom JointJS Elements
**EntityElement** (`components/diagramview/diagram-elements/EntityElement.ts`):
- Custom JointJS element representing Dataverse entities
- Renders entity name, icon, and connection ports
- Stores `entityData` (EntityType) in attributes
- Uses custom `EntityElementView` for DOM interactions

**RelationshipLink** (`components/diagramview/diagram-elements/RelationshipLink.ts`):
- Custom JointJS link for entity relationships
- Stores `relationshipInformation` in attributes
- Supports both directed and undirected relationships
- Integrates with libavoid router for auto-routing

**Selection** (`components/diagramview/diagram-elements/Selection.ts`):
- Multi-entity selection boundary element
- Handles group transformations (move, scale, rotate)
- Calculates bounding boxes and applies transformations relative to paper matrix

#### Avoid Router (Orthogonal Routing)
**Location**: `components/diagramview/avoid-router/`

The diagram uses libavoid-js (C++ library compiled to WebAssembly) for intelligent orthogonal routing:

- **Web Worker** (`avoid-router/worker-thread/worker.ts`): Runs routing calculations off the main thread
- **AvoidRouter** (`avoid-router/shared/avoidrouter.ts`): Manages router state and communicates with worker
- **Initialization** (`avoid-router/shared/initialization.ts`): Sets up router with diagram graph

**Key Concept**: Main thread sends graph changes to worker, worker calculates routes using libavoid, results sent back to update link vertices.

#### Diagram Event Communication

**DiagramEventBridge** (`lib/diagram/DiagramEventBridge.ts`):
- Singleton pattern for cross-component communication
- Bridges JointJS (non-React) and React components
- Uses browser CustomEvents for type-safe messaging
- Event types: `selectObject`, `entityContextMenu`
- React components use `onSelectionEvent()` and `onContextMenuEvent()` convenience methods

**Pattern**: JointJS event listeners dispatch through DiagramEventBridge → React components listen via useEffect hooks.

### Serialization & Persistence

**DiagramSerializationService** (`lib/diagram/services/diagram-serialization.ts`):
- Converts JointJS graph to `SerializedDiagram` format
- Stores entity positions, sizes, zoom, pan state

**DiagramDeserializationService** (`lib/diagram/services/diagram-deserialization.ts`):
- Reconstructs JointJS graph from `SerializedDiagram`
- Recreates EntityElements and RelationshipLinks with proper routing

**AzureDevOpsService** (`app/api/services/AzureDevOpsService.ts`):
- Handles all Git operations for diagram storage
- Methods: `createFile`, `loadFile`, `listFiles`, `getVersions`
- Uses managed identity or PAT authentication

### Type System

**Core Types** (`lib/Types.ts`):
- `EntityType`: Dataverse entity metadata (attributes, relationships, security roles, keys)
- `RelationshipType`: N:1, 1:N, N:N relationship definitions
- `AttributeType`: Polymorphic attribute types (String, Lookup, Boolean, etc.)
- `SolutionType`, `SolutionComponentType`: Solution component tracking

**Diagram Types**:
- `SerializedDiagram` (`lib/diagram/models/serialized-diagram.ts`): Persistence format
- `SerializedEntity` (`lib/diagram/models/serialized-entity.ts`): Entity position/size/label
- `RelationshipInformation` (`lib/diagram/models/relationship-information.ts`): Relationship display data

### Component Organization

```
components/
  diagramview/           # Diagram canvas and interactions
    diagram-elements/    # Custom JointJS elements (EntityElement, RelationshipLink, Selection)
    avoid-router/        # libavoid routing with worker thread
    layout/              # SmartLayout for auto-arranging entities
    panes/               # Side panels (entity list, properties)
    modals/              # Dialogs (save, load, version history)
  datamodelview/         # Metadata viewer for entities/attributes
    entity/              # Entity detail components
    attributes/          # Attribute type-specific renderers
  insightsview/          # Analytics and reporting
  shared/                # Reusable UI components (Layout, Sidebar)
```

### API Routes

All API routes are in `app/api/`:

**Authentication**:
- `POST /api/auth/login` - Password authentication
- `GET /api/auth/logout` - Session termination
- `GET /api/auth/session` - Session validation

**Diagram Operations**:
- `GET /api/diagram/list` - List saved diagrams from ADO
- `POST /api/diagram/load` - Load diagram JSON from ADO
- `POST /api/diagram/save` - Persist diagram to ADO Git repo
- `GET /api/diagram/versions` - Get version history for a diagram
- `POST /api/diagram/version` - Load specific version
- `GET /api/diagram/repository-info` - Get ADO repository details

**Other**:
- `POST /api/markdown` - Render markdown content
- `GET /api/version` - Application version info

## Key Development Patterns

### Adding Entities to Diagram
1. Get entity data from `DatamodelDataContext`
2. Call `diagramContext.addEntity(entityData, position)`
3. Context creates `EntityElement` via `createEntity()`
4. Element added to graph → triggers router update in worker
5. DiagramEventBridge dispatches selection event if needed

### Handling Entity Selection
1. User clicks entity → JointJS 'element:pointerclick' event
2. EntityElementView dispatches through DiagramEventBridge
3. React components listening via `diagramEvents.onSelectionEvent()`
4. PropertiesPanel updates to show entity details

### Relationship Routing Flow
1. Entity moved on canvas
2. DiagramViewContext detects change
3. Worker receives RouterRequestEvent.Change message
4. libavoid calculates new route avoiding obstacles
5. Worker returns updated vertices
6. Main thread updates link vertices on graph

### Working with Azure DevOps
Authentication uses either:
- **Local dev**: Azure CLI with PAT token (`AZURE_CLI_AUTHENTICATION_ENABLED=true`)
- **Production**: Managed Identity (`ManagedIdentityAuthService.ts`)

File operations always specify branch (default: 'main') and commit messages.

## Important Notes

- **Path aliases**: `@/*` maps to root directory (see `tsconfig.json`)
- **Next.js config**: Uses standalone output mode for containerized deployment
- **Worker thread**: libavoid runs in Web Worker - avoid blocking main thread with routing logic
- **Selection transformations**: Must be calculated relative to paper transformation matrix (see `Selection.ts:applyTransformation`)
- **Entity deduplication**: Always check `diagramContext.isEntityInDiagram()` before adding
- **JointJS integration**: Custom elements defined with `dia.Element.define()`, custom views with `dia.ElementView.extend()`
