import { EntityType } from '@/lib/Types';
import { EntityElement } from '@/components/diagram/entity/entity';

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
 * Calculates the actual height of an entity based on its visible attributes
 */
export const calculateEntityHeight = (entity: EntityType): number => {
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
 */
export const calculateGridLayout = (
  entities: EntityType[],
  options: GridLayoutOptions
): GridLayoutResult => {
  const { containerWidth, containerHeight, entityWidth, entityHeight, padding, margin } = options;
  
  if (entities.length === 0) {
    return {
      positions: [],
      gridWidth: 0,
      gridHeight: 0,
      columns: 0,
      rows: 0
    };
  }

  // Calculate available space
  const availableWidth = containerWidth - (margin * 2);
  const availableHeight = containerHeight - (margin * 2);

  // Calculate aspect ratio of available space
  const aspectRatio = availableWidth / availableHeight;
  
  console.log('Layout calculation:', {
    availableWidth,
    availableHeight,
    aspectRatio,
    entityWidth,
    entityHeight,
    padding,
    entityCount: entities.length
  });
  
  // Determine optimal number of columns based on aspect ratio and entity count
  let columns: number;
  if (aspectRatio > 1.5) {
    // Wide screen - prefer more columns
    columns = Math.ceil(Math.sqrt(entities.length * aspectRatio));
  } else if (aspectRatio < 0.8) {
    // Tall screen - prefer fewer columns
    columns = Math.ceil(Math.sqrt(entities.length / aspectRatio));
  } else {
    // Square-ish screen - balanced approach
    columns = Math.ceil(Math.sqrt(entities.length));
  }
  
  // Ensure we don't exceed available width
  const maxColumnsByWidth = Math.floor(availableWidth / (entityWidth + padding));
  columns = Math.min(columns, maxColumnsByWidth);
  
  // Ensure we have at least 1 column
  columns = Math.max(1, columns);
  
  console.log('Column calculation:', {
    initialColumns: columns,
    maxColumnsByWidth,
    finalColumns: columns
  });
  
  // Calculate rows needed
  const rows = Math.ceil(entities.length / columns);

  // Calculate grid dimensions
  const gridWidth = columns * entityWidth + (columns - 1) * padding;
  const gridHeight = rows * entityHeight + (rows - 1) * padding;

  // Calculate starting position to center the grid
  const startX = margin + (availableWidth - gridWidth) / 2;
  const startY = margin + (availableHeight - gridHeight) / 2;

  // Calculate positions for each entity
  const positions: GridPosition[] = [];
  
  for (let i = 0; i < entities.length; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    const x = startX + col * (entityWidth + padding);
    const y = startY + row * (entityHeight + padding);
    
    positions.push({ x, y });
  }

  return {
    positions,
    gridWidth,
    gridHeight,
    columns,
    rows
  };
};

/**
 * Estimates entity dimensions based on content
 */
export const estimateEntityDimensions = (entity: EntityType): { width: number; height: number } => {
  // Base dimensions
  const baseWidth = 480; // Match the entity width used in EntityElement
  const height = calculateEntityHeight(entity); // Use actual calculated height
  
  return {
    width: baseWidth,
    height: height
  };
};

/**
 * Gets default layout options
 */
export const getDefaultLayoutOptions = (): GridLayoutOptions => ({
  containerWidth: 1920, // Use a wider default container
  containerHeight: 1080, // Use a taller default container
  entityWidth: 480,
  entityHeight: 400, // This will be overridden by actual calculation
  padding: 80, // Reduced padding for better space utilization
  margin: 80
}); 