import { dia } from '@joint/core';

export enum EntityStyleState {
  NORMAL = 'normal',
  HOVER = 'hover',
  SELECTED = 'selected',
  SELECTED_HOVER = 'selected-hover'
}

export interface EntityStylingConfig {
  normal: {
    border: string;
    borderRadius: string;
    cursor: string;
    filter: string;
  };
  hover: {
    border: string;
    borderRadius: string;
    cursor: string;
    filter: string;
  };
  selected: {
    border: string;
    borderRadius: string;
    cursor: string;
    filter: string;
  };
  selectedHover: {
    border: string;
    borderRadius: string;
    cursor: string;
    filter: string;
  };
}

// Default styling configuration for entities
const DEFAULT_ENTITY_STYLING: EntityStylingConfig = {
  normal: {
    border: 'none',
    borderRadius: '',
    cursor: 'default',
    filter: 'none'
  },
  hover: {
    border: '1px solid #3b82f6',
    borderRadius: '10px',
    cursor: 'pointer',
    filter: 'none'
  },
  selected: {
    border: '3px solid #3b82f6',
    borderRadius: '12px',
    cursor: 'pointer',
    filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))'
  },
  selectedHover: {
    border: '3px solid #2563eb', // Slightly darker blue for selected + hover
    borderRadius: '12px',
    cursor: 'pointer',
    filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))'
  }
};

/**
 * Centralized entity styling manager
 * Handles all entity visual states including hover, selection, and combined states
 */
export class EntityStyleManager {
  private selectedElements: Set<dia.Cell.ID> = new Set();
  private hoveredElements: Set<dia.Cell.ID> = new Set();
  private config: EntityStylingConfig;

  constructor(config: EntityStylingConfig = DEFAULT_ENTITY_STYLING) {
    this.config = config;
  }

  /**
   * Update the list of selected elements
   */
  setSelectedElements(elementIds: dia.Cell.ID[]): void {
    this.selectedElements.clear();
    elementIds.forEach(id => this.selectedElements.add(id));
  }

  /**
   * Add an element to the selected set
   */
  addSelectedElement(elementId: string): void {
    this.selectedElements.add(elementId);
  }

  /**
   * Remove an element from the selected set
   */
  removeSelectedElement(elementId: string): void {
    this.selectedElements.delete(elementId);
  }

  /**
   * Clear all selected elements
   */
  clearSelectedElements(): void {
    this.selectedElements.clear();
  }

  /**
   * Set hover state for an element
   */
  setElementHover(elementId: string, isHovered: boolean): void {
    if (isHovered) {
      this.hoveredElements.add(elementId);
    } else {
      this.hoveredElements.delete(elementId);
    }
  }

  /**
   * Get the current style state for an element
   */
  getElementState(elementId: string): EntityStyleState {
    const isSelected = this.selectedElements.has(elementId);
    const isHovered = this.hoveredElements.has(elementId);

    if (isSelected && isHovered) {
      return EntityStyleState.SELECTED_HOVER;
    } else if (isSelected) {
      return EntityStyleState.SELECTED;
    } else if (isHovered) {
      return EntityStyleState.HOVER;
    } else {
      return EntityStyleState.NORMAL;
    }
  }

  /**
   * Apply styling to an entity element based on its current state
   */
  applyEntityStyling(element: dia.Element, paper: dia.Paper): void {
    const elementId = element.id.toString();
    const state = this.getElementState(elementId);
    
    console.log('🎨 Applying styling to entity:', elementId, 'State:', state);
    
    // Get the element view and HTML content
    const elementView = element.findView(paper);
    if (!elementView) return;

    const foreignObject = elementView.el.querySelector('foreignObject');
    const htmlContent = foreignObject?.querySelector('[data-entity-schema]') as HTMLElement;
    
    if (!htmlContent) return;

    // Get styling for current state
    const styling = this.getStyleForState(state);
    
    console.log('🎨 Styling to apply:', styling);
    
    // Always apply styling based on current state (selection takes precedence over hover)
    htmlContent.style.border = styling.border;
    htmlContent.style.borderRadius = styling.borderRadius;
    elementView.el.style.cursor = styling.cursor;
    
    // Apply filter to the element's SVG for glow effects
    // For entity elements, we need to apply the filter to the root element
    if (styling.filter === 'none') {
      elementView.el.style.filter = '';
    } else {
      elementView.el.style.filter = styling.filter;
    }
    
    // Manage data-hover-active attribute properly
    const isHovered = this.hoveredElements.has(elementId);
    if (isHovered) {
      htmlContent.setAttribute('data-hover-active', 'true');
    } else {
      htmlContent.removeAttribute('data-hover-active');
    }
  }

  /**
   * Apply styling to all entities in a graph
   */
  applyAllEntityStyling(graph: dia.Graph, paper: dia.Paper): void {
    graph.getElements().forEach((element: dia.Element) => {
      const entityData = element.get('data');
      if (entityData?.entity) {
        this.applyEntityStyling(element, paper);
      }
    });
  }

  /**
   * Get styling configuration for a specific state
   */
  private getStyleForState(state: EntityStyleState) {
    switch (state) {
      case EntityStyleState.NORMAL:
        return this.config.normal;
      case EntityStyleState.HOVER:
        return this.config.hover;
      case EntityStyleState.SELECTED:
        return this.config.selected;
      case EntityStyleState.SELECTED_HOVER:
        return this.config.selectedHover;
      default:
        return this.config.normal;
    }
  }

  /**
   * Handle mouse enter on an entity
   */
  handleEntityMouseEnter(element: dia.Element, paper: dia.Paper): void {
    const elementId = element.id.toString();
    this.setElementHover(elementId, true);
    this.applyEntityStyling(element, paper);
  }

  /**
   * Handle mouse leave on an entity
   */
  handleEntityMouseLeave(element: dia.Element, paper: dia.Paper): void {
    const elementId = element.id.toString();
    console.log('🖱️ Mouse leave entity:', elementId, 'Selected:', this.selectedElements.has(elementId));
    this.setElementHover(elementId, false);
    this.applyEntityStyling(element, paper);
  }

  /**
   * Handle selection change
   */
  handleSelectionChange(selectedElementIds: dia.Cell.ID[], graph: dia.Graph, paper: dia.Paper): void {
    console.log('🔄 Selection change:', selectedElementIds);
    this.setSelectedElements(selectedElementIds);
    this.applyAllEntityStyling(graph, paper);
  }
}

// Export a default instance
export const entityStyleManager = new EntityStyleManager();
