# Diagram Panes

This folder contains reusable pane components used in the diagram view. These components are extracted from the main DiagramView component to improve code organization and reusability.

## Components

### AddEntityPane
- **Purpose**: Provides a sheet interface for adding entities to the diagram from the available entity groups
- **Features**: 
  - Search functionality for filtering entities and groups
  - Shows entity information (name, schema, description)
  - Filters out already added entities with visual indicators
  - Group-based organization of entities

### EntityActionsPane
- **Purpose**: Provides a sheet interface for performing actions on selected entities, including adding attributes
- **Features**:
  - Entity information display (name, schema, description)
  - Delete/remove entity action
  - Entity statistics (attributes count, relationships count, etc.)
  - **Add Attribute functionality**: Collapsible section to add existing attributes to the entity
  - Search functionality for filtering available attributes
  - Attribute type icons and descriptions
  - Tooltip support for attribute descriptions

## Usage

Import the components from the panes index:

```tsx
import { AddEntityPane, EntityActionsPane } from '@/components/diagram/panes';
```

### EntityActionsPane with Attribute Support

The EntityActionsPane now includes optional attribute management:

```tsx
<EntityActionsPane
    isOpen={isOpen}
    onOpenChange={setIsOpen}
    selectedEntity={selectedEntity}
    onDeleteEntity={handleDelete}
    onAddAttribute={handleAddAttribute}  // Optional
    availableAttributes={attributes}      // Optional
    visibleAttributes={visibleAttrs}      // Optional
/>
```

Each pane component is designed to be controlled by parent components through props for open/close state and callback functions.
