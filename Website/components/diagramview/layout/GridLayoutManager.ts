import { EntityType } from '@/lib/Types';

export interface GridLayoutOptions {
  containerWidth: number;
  containerHeight: number;
  entityWidth: number;
  entityHeight: number;
  padding: number;
  margin: number;
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
export const calculateEntityHeight = (): number => { return 80; };

/**
 * Calculates optimal grid layout for entities based on screen aspect ratio
 * Optionally avoids existing entity positions
 */
export const calculateGridLayout = (
  entities: EntityType[],
  options: GridLayoutOptions,
  existingPositions?: { x: number; y: number; width: number; height: number }[]
): GridLayoutResult => {
  const { containerWidth, padding, margin } = options;

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
    
    // Get sample entity dimensions for spacing calculations
    const sampleDimensions = estimateEntityDimensions();
    
    // Start new entities to the right of existing ones, or on the next row
    startColumn = Math.floor((maxX + padding - margin) / (sampleDimensions.width + padding));
    if (startColumn * (sampleDimensions.width + padding) + margin + sampleDimensions.width > containerWidth) {
      // Move to next row if we can't fit horizontally
      startColumn = 0;
      startRow = Math.floor((maxY + padding - margin) / (sampleDimensions.height + padding));
    }
  }

  // Determine how many columns can fit based on actual entity dimensions
  const sampleEntityDimensions = estimateEntityDimensions();
  const actualEntityWidth = sampleEntityDimensions.width;
  const maxColumns = Math.max(1, Math.floor((containerWidth - margin * 2 + padding) / (actualEntityWidth + padding)));
  
  // For collision avoidance, we'll place entities sequentially from the calculated starting position
  const positions: GridPosition[] = [];
  let currentColumn = startColumn;
  let currentRow = startRow;

  for (let i = 0; i < entities.length; i++) {
    const entityDimensions = estimateEntityDimensions();
    const height = entityDimensions.height;
    const width = entityDimensions.width;
    
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
      
      const x = margin + currentColumn * (width + padding);
      const y = margin + currentRow * (height + padding);
      
      // Check if this position is occupied by existing entities
      const isOccupied = existingPositions && existingPositions.length > 0 ? existingPositions.some(pos => {
        const entityRight = x + width;
        const entityBottom = y + height;
        const existingRight = pos.x + pos.width;
        const existingBottom = pos.y + pos.height;
        
        // Check for overlap with padding buffer
        const buffer = padding / 4;
        return !(entityRight + buffer < pos.x || 
                x > existingRight + buffer || 
                entityBottom + buffer < pos.y || 
                y > existingBottom + buffer);
      }) : false;
      
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
      const x = margin + currentColumn * (width + padding);
      const y = margin + currentRow * (height + padding);
      positions.push({ x, y });
      currentColumn++;
    }
  }

  const sampleDimensions = estimateEntityDimensions();
  const gridWidth = Math.min(entities.length, maxColumns) * sampleDimensions.width + (Math.min(entities.length, maxColumns) - 1) * padding;
  const gridHeight = (currentRow + 1) * (sampleDimensions.height + padding) - padding;

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
export const estimateEntityDimensions = (): { width: number; height: number } => {
    return {
      width: 200,
      height: 80
    };
};

/**
 * Gets default layout options based on diagram type
 */
export const getDefaultLayoutOptions = (): GridLayoutOptions => {
    return {
      containerWidth: 1920,
      containerHeight: 1080,
      entityWidth: 200, // Smaller width for simple entities
      entityHeight: 80, // Smaller height for simple entities
      padding: 40, // Less padding for simple diagrams
      margin: 40, // Less margin for simple diagrams
    };
}; 