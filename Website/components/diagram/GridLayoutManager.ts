import { EntityType } from '@/lib/Types';
import { EntityElement } from '@/components/diagram/elements/EntityElement';

export type DiagramType = 'simple' | 'detailed';

export interface GridLayoutOptions {
  containerWidth: number;
  containerHeight: number;
  entityWidth: number;
  entityHeight: number;
  padding: number;
  margin: number;
  diagramType?: DiagramType;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridLayoutResult {
  positions: GridPosition[];
  gridWidth: number;
  gridHeight: number;
  columns: number;
  rows: number;
}

/**
 * Calculates the actual height of an entity based on its visible attributes and diagram type
 */
export const calculateEntityHeight = (entity: EntityType, diagramType: DiagramType = 'detailed'): number => {
  // For simple diagrams, use fixed small dimensions
  if (diagramType === 'simple') {
    return 80; // Fixed height for simple entities
  }
  
  // For detailed diagrams, calculate based on content
  const { visibleItems } = EntityElement.getVisibleItemsAndPorts(entity);
  const itemHeight = 28;
  const itemYSpacing = 8;
  const addButtonHeight = 32; // Space for add button
  const headerHeight = 80;
  const startY = headerHeight + itemYSpacing * 2;
  
  // Calculate height including the add button
  return startY + visibleItems.length * (itemHeight + itemYSpacing) + addButtonHeight + itemYSpacing;
};

/**
 * Calculates optimal grid layout for entities based on screen aspect ratio
 * Optionally avoids existing entity positions
 */
export const calculateGridLayout = (
  entities: EntityType[],
  options: GridLayoutOptions,
  existingPositions?: { x: number; y: number; width: number; height: number }[]
): GridLayoutResult => {
  const { containerWidth, entityWidth, padding, margin } = options;

  if (entities.length === 0) {
    return {
      positions: [],
      gridWidth: 0,
      gridHeight: 0,
      columns: 0,
      rows: 0
    };
  }

  // If we have existing positions, we need to find the best starting position for new entities
  let startColumn = 0;
  let startRow = 0;
  
  if (existingPositions && existingPositions.length > 0) {
    // Find the rightmost and bottommost positions
    const maxX = Math.max(...existingPositions.map(pos => pos.x + pos.width));
    const maxY = Math.max(...existingPositions.map(pos => pos.y + pos.height));
    
    // Start new entities to the right of existing ones, or on the next row
    startColumn = Math.floor((maxX + padding - margin) / (entityWidth + padding));
    if (startColumn * (entityWidth + padding) + margin + entityWidth > containerWidth) {
      // Move to next row if we can't fit horizontally
      startColumn = 0;
      startRow = Math.floor((maxY + padding - margin) / 200); // Approximate row height
    }
  }

  // Determine how many columns can fit
  const maxColumns = Math.max(1, Math.floor((containerWidth - margin * 2 + padding) / (entityWidth + padding)));
  
  // For collision avoidance, we'll place entities sequentially from the calculated starting position
  const positions: GridPosition[] = [];
  let currentColumn = startColumn;
  let currentRow = startRow;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const height = calculateEntityHeight(entity, options.diagramType);
    
    // Find next available position that doesn't collide
    let foundValidPosition = false;
    let attempts = 0;
    const maxAttempts = maxColumns * 10; // Prevent infinite loop
    
    while (!foundValidPosition && attempts < maxAttempts) {
      // If we exceed the max columns, move to next row
      if (currentColumn >= maxColumns) {
        currentColumn = 0;
        currentRow++;
      }
      
      const x = margin + currentColumn * (entityWidth + padding);
      const y = margin + currentRow * (height + padding);
      
      // Check if this position is occupied by existing entities
      const isOccupied = existingPositions && existingPositions.length > 0 ? existingPositions.some(pos => 
        Math.abs(pos.x - x) < entityWidth + padding/2 && 
        Math.abs(pos.y - y) < height + padding/2
      ) : false;
      
      if (!isOccupied) {
        positions.push({ x, y });
        foundValidPosition = true;
      }
      
      // Move to next position
      currentColumn++;
      attempts++;
    }
    
    if (!foundValidPosition) {
      // Fallback: place at calculated position anyway (should not happen with enough attempts)
      const x = margin + currentColumn * (entityWidth + padding);
      const y = margin + currentRow * (height + padding);
      positions.push({ x, y });
      currentColumn++;
    }
  }

  const gridWidth = Math.min(entities.length, maxColumns) * entityWidth + (Math.min(entities.length, maxColumns) - 1) * padding;
  const gridHeight = (currentRow + 1) * (calculateEntityHeight(entities[0] || { Attributes: [] }, options.diagramType) + padding) - padding;

  return {
    positions,
    gridWidth,
    gridHeight,
    columns: Math.min(entities.length, maxColumns),
    rows: currentRow + 1
  };
};


/**
 * Estimates entity dimensions based on content and diagram type
 */
export const estimateEntityDimensions = (entity: EntityType, diagramType: DiagramType = 'detailed'): { width: number; height: number } => {
  if (diagramType === 'simple') {
    // Fixed dimensions for simple entities
    return {
      width: 200,
      height: 80
    };
  }
  
  // Base dimensions for detailed entities
  const baseWidth = 480; // Match the entity width used in EntityElement
  const height = calculateEntityHeight(entity, diagramType); // Use actual calculated height
  
  return {
    width: baseWidth,
    height: height
  };
};

/**
 * Gets default layout options based on diagram type
 */
export const getDefaultLayoutOptions = (diagramType: DiagramType = 'detailed'): GridLayoutOptions => {
  if (diagramType === 'simple') {
    return {
      containerWidth: 1920,
      containerHeight: 1080,
      entityWidth: 200, // Smaller width for simple entities
      entityHeight: 80, // Smaller height for simple entities
      padding: 40, // Less padding for simple diagrams
      margin: 40, // Less margin for simple diagrams
      diagramType: 'simple'
    };
  }
  
  return {
    containerWidth: 1920, // Use a wider default container
    containerHeight: 1080, // Use a taller default container
    entityWidth: 480,
    entityHeight: 400, // This will be overridden by actual calculation
    padding: 80, // Reduced padding for better space utilization
    margin: 80,
    diagramType: 'detailed'
  };
}; 