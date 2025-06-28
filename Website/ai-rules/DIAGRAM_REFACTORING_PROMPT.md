# Diagram Page Refactoring Prompt

## Overview
Refactor the existing `routes/DiagramView.tsx` to implement a new diagram interface with enhanced functionality including a sidepane for group selection and diagram controls, and a redesigned diagram canvas with improved layout and styling.

## Current State Analysis
The current implementation uses:
- JointJS for diagram rendering
- React Context for state management (`DiagramContext`)
- Custom hooks (`useDiagram`) for diagram operations
- shadcn/ui components for the interface
- Entity data from `generated/Data.ts` with multiple groups

## Required Features

### 1. Sidepane Implementation

#### 1.a Group Selection
- **Location**: Left sidepane
- **Functionality**: 
  - Display all available groups from `Groups` array
  - Allow user to select a group to display its entities
  - Show group name and entity count
  - Highlight currently selected group
  - Default to first group if none selected

#### 1.b Diagram Reset Control
- **Location**: Sidepane controls section
- **Functionality**:
  - Reset button to return diagram to default view
  - Reset zoom to 100%
  - Reset pan position to center
  - Clear any selections

#### 1.c Entity Information Display
- **Location**: Sidepane information section
- **Functionality**:
  - Show high-level statistics for current group
  - Display total entity count
  - Show relationship count
  - Display group description if available
  - Show entity list with basic info (name, type, description)

### 2. Diagram Canvas Redesign

#### 2.a Light Yellow Background with Black Dots
- **Background Color**: Light yellow (`#fef3c7` or similar)
- **Dot Pattern**: Small black dots in a grid pattern
- **Implementation**: Use CSS background pattern or JointJS background configuration

#### 2.b Zoom and Pan Functionality
- **Zoom**: 
  - Mouse wheel zoom (already implemented)
  - Zoom buttons in sidepane
  - Zoom range: 0.1x to 3x
  - Zoom to mouse position
- **Pan**: 
  - Click and drag on empty canvas area
  - Smooth panning with visual feedback
  - Pan limits to prevent elements from going off-screen

#### 2.c Zoom and Coordinate Indicator
- **Location**: Bottom-right corner overlay
- **Display**:
  - Current zoom level (e.g., "100%", "150%")
  - Current mouse coordinates relative to diagram
  - Format: "Zoom: 100% | X: 150, Y: 200"
- **Styling**: Semi-transparent background with readable text

#### 2.d Grid Layout with Padding
- **Layout Algorithm**: 
  - Arrange entities in a grid pattern
  - Calculate optimal grid size based on entity count
  - Maintain consistent spacing between entities
  - Center the grid on the canvas
- **Padding**: 
  - Minimum 50px padding between entities
  - 100px padding from canvas edges
  - Responsive to zoom level

### 3. Preserve Existing Functionality

#### 3.a Current Styling
- **Entity Elements**: Keep existing `EntityElement` styling
- **Links**: Maintain current link styling and routing
- **Colors**: Preserve existing color scheme for entities and relationships
- **Typography**: Keep existing font styles and sizes

#### 3.b Links and Relationships
- **Routing**: Maintain Manhattan routing algorithm
- **Styling**: Keep current link colors (`#6366f1`)
- **Labels**: Preserve relationship labels (`*` and `+`)
- **Arrow Markers**: Keep existing arrow styling
- **Debouncing**: Maintain existing reroute debouncing

## Technical Implementation Requirements

### State Management
```typescript
interface DiagramState {
  selectedGroup: GroupType | null;
  currentEntities: EntityType[];
  zoom: number;
  panPosition: { x: number; y: number };
  mousePosition: { x: number; y: number } | null;
}
```

### New Components to Create
1. **GroupSelector**: Component for group selection in sidepane
2. **EntityInfoPanel**: Component for displaying entity information
3. **DiagramResetButton**: Component for reset functionality
4. **ZoomCoordinateIndicator**: Component for zoom/coordinate display
5. **GridLayoutManager**: Utility for calculating grid positions

### File Structure Changes
```
components/
├── diagram/
│   ├── GroupSelector.tsx (new)
│   ├── EntityInfoPanel.tsx (new)
│   ├── DiagramResetButton.tsx (new)
│   ├── ZoomCoordinateIndicator.tsx (new)
│   └── GridLayoutManager.ts (new)
```

### Context Updates
Extend `DiagramContext` to include:
- Group selection state
- Grid layout calculations
- Mouse position tracking
- Reset functionality

## Implementation Guidelines

### 1. Follow Existing Patterns
- Use the established `DiagramContext` pattern
- Follow the custom hook structure from `useDiagram`
- Maintain TypeScript strict typing
- Use shadcn/ui components consistently

### 2. Performance Considerations
- Use refs for values that don't need re-renders
- Implement proper cleanup for event listeners
- Use debouncing for expensive operations
- Optimize grid layout calculations

### 3. Responsive Design
- Ensure sidepane is collapsible
- Make diagram canvas responsive to window size
- Handle different screen sizes appropriately
- Maintain usability on smaller screens

### 4. Accessibility
- Add proper ARIA labels
- Ensure keyboard navigation works
- Provide screen reader support
- Maintain focus management

## Code Quality Requirements

### 1. TypeScript
- Strict typing for all new components
- Proper interface definitions
- Type guards where necessary
- No `any` types

### 2. Error Handling
- Graceful handling of missing data
- Proper error boundaries
- User-friendly error messages
- Fallback states

### 3. Testing Considerations
- Components should be testable
- Mock JointJS for testing
- Test state changes
- Test user interactions

## Success Criteria

### Functional Requirements
- [ ] Group selection works correctly
- [ ] Diagram reset functionality works
- [ ] Entity information displays properly
- [ ] Grid layout arranges entities correctly
- [ ] Zoom and pan work smoothly
- [ ] Coordinate indicator updates in real-time
- [ ] Background pattern displays correctly

### Performance Requirements
- [ ] No performance degradation from current implementation
- [ ] Smooth zoom and pan operations
- [ ] Responsive UI interactions
- [ ] Efficient grid layout calculations

### User Experience Requirements
- [ ] Intuitive group selection
- [ ] Clear visual feedback for interactions
- [ ] Consistent styling with existing components
- [ ] Smooth transitions and animations

## Migration Strategy

### Phase 1: Sidepane Implementation
1. Create new sidepane components
2. Implement group selection logic
3. Add entity information display
4. Integrate with existing context

### Phase 2: Canvas Redesign
1. Update background styling
2. Implement grid layout algorithm
3. Add zoom/coordinate indicator
4. Enhance zoom and pan functionality

### Phase 3: Integration and Testing
1. Integrate all components
2. Test all functionality
3. Optimize performance
4. Fix any issues

## Notes
- Preserve all existing functionality while adding new features
- Maintain backward compatibility with existing data structure
- Follow the established code patterns and conventions
- Ensure the refactored code is maintainable and extensible
- Document any significant changes or new patterns introduced 