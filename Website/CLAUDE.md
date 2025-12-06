# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Data Model Viewer is a Next.js 15 application for visualizing Dataverse data models. It features an interactive diagram editor built on JointJS with custom routing using libavoid-js, Azure DevOps integration for persistence, and comprehensive metadata visualization.

## Development Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build production bundle
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prepipeline      # Copy stub files (runs before pipeline build)
```

Note: The build process includes a `postbuild` script that creates required standalone directories for Next.js 15 deployment compatibility.

### MUI MCP Server Setup

**REQUIRED** for working with MUI components:

```bash
claude mcp add mui-mcp -- npx -y @mui/mcp@latest
```

This provides access to MUI v7 documentation and component APIs through the MCP server.

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

**Key Pattern**: Diagram uses JointJS for rendering with a Web Worker for libavoid routing calculations.

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

## Authentication System

The application supports two authentication methods that can be used independently or together:

### Password Authentication (Default)
- Traditional password-based login
- JWT session stored in HTTP-only cookie
- Configured via `WebsitePassword` environment variable
- Session managed by [lib/session.ts](lib/session.ts)

### EntraID Authentication (Optional)
- Microsoft single sign-on (SSO) using Azure Active Directory
- Enabled via App Service Easy Auth
- Optional group-based access control
- User information extracted from `X-MS-CLIENT-PRINCIPAL` header

### Authentication Architecture

**Unified Session Model**: Both auth types use the same session cookie format with `authType` field:

```typescript
type Session = {
  authType: 'password' | 'entraid';
  expiresAt: Date;
  password?: string;              // Password auth
  userPrincipalName?: string;     // EntraID auth
  userId?: string;                // EntraID auth
  name?: string;                  // EntraID auth
  groups?: string[];              // EntraID auth (for access control)
}
```

**Authentication Flow**:
1. [middleware.ts](middleware.ts) checks authentication on every request
2. If EntraID enabled: Parse `X-MS-CLIENT-PRINCIPAL` header → validate groups → create session
3. If password enabled: Validate existing JWT session cookie
4. [AuthContext.tsx](contexts/AuthContext.tsx) provides auth state to React components
5. Login page conditionally shows password form and/or "Sign in with Microsoft" button

### EntraID Configuration

**Environment Variables** ([.env.local](.env.local) for local, App Service settings for production):

```bash
# Enable EntraID authentication
ENABLE_ENTRAID_AUTH=false              # Set to true to enable

# Group-based access control (optional)
ENTRAID_ALLOWED_GROUPS=                # Comma-separated Azure AD group Object IDs
                                       # Empty = all tenant users allowed

# Disable password authentication (optional)
DISABLE_PASSWORD_AUTH=false            # Set to true for EntraID-only mode
```

**Key Files**:
- [lib/auth/entraid.ts](lib/auth/entraid.ts) - EntraID utilities (parse headers, validate groups)
- [middleware.ts](middleware.ts) - Authentication middleware (checks both auth types)
- [lib/session.ts](lib/session.ts) - Session management (unified for both auth types)
- [components/loginview/LoginView.tsx](components/loginview/LoginView.tsx) - Login UI

**Setup Instructions**: See [Infrastructure/CLAUDE.md](../Infrastructure/CLAUDE.md) for complete Azure AD App Registration setup guide.

**Local Development**: EntraID requires deployment to Azure App Service (Easy Auth doesn't work locally). Use password auth for local development.

## Styling Guidelines

**CRITICAL**: This project uses a specific MUI + Tailwind integration pattern.

### MUI Component Usage Rules

1. **Use MUI for interactive components**: Button, TextField, Dialog, Select, etc.
2. **Use Tailwind for ALL visual styling**: No `sx` prop except for theme access
3. **Query MUI MCP server** before implementing unfamiliar components
4. **See the MUI Guidelines Skill**: `.claude/skills/mui-guidelines/SKILL.md`

### Examples

**WRONG** (using `sx` prop):
```tsx
<Button sx={{ padding: '16px', backgroundColor: 'primary.main' }}>
  Click Me
</Button>
```

**CORRECT** (Tailwind classes):
```tsx
<Button className="p-4 bg-blue-600">
  Click Me
</Button>
```

**Exception** (theme access only):
```tsx
<Box sx={{ display: { xs: 'none', md: 'block' } }} className="p-4">
  Responsive with theme breakpoints
</Box>
```

### Workflow for Styling Tasks

1. Identify need (button, form, modal, etc.)
2. Choose appropriate MUI component
3. Query MUI MCP server if unfamiliar: `mcp__mui-mcp__useMuiDocs`
4. Implement with MUI component + Tailwind classes
5. Verify no `sx` props (except theme access)

**Reference**: See `.claude/skills/mui-guidelines/SKILL.md` for comprehensive guidelines.

## Important Notes

- **Path aliases**: `@/*` maps to root directory (see `tsconfig.json`)
- **Next.js config**: Uses standalone output mode for containerized deployment
- **Worker thread**: libavoid runs in Web Worker - avoid blocking main thread with routing logic
- **Selection transformations**: Must be calculated relative to paper transformation matrix (see `Selection.ts:applyTransformation`)
- **Entity deduplication**: Always check `diagramContext.isEntityInDiagram()` before adding
- **JointJS integration**: Custom elements defined with `dia.Element.define()`, custom views with `dia.ElementView.extend()`
- **MUI Styling**: NEVER use `sx` prop for styling (use Tailwind), see MUI Guidelines Skill
