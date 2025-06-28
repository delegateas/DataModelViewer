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
 * Calculates optimal grid layout for entities
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

  // Calculate how many entities can fit in a row
  const entitiesPerRow = Math.floor(availableWidth / (entityWidth + padding));
  const columns = Math.max(1, entitiesPerRow);
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
  const baseWidth = 200;
  const baseHeight = 120;
  
  // Adjust based on number of attributes
  const attributeCount = entity.Attributes.length;
  const heightAdjustment = Math.min(attributeCount * 8, 80); // Max 80px additional height
  
  // Adjust based on name length
  const nameLength = entity.DisplayName.length;
  const widthAdjustment = Math.min(nameLength * 2, 60); // Max 60px additional width
  
  return {
    width: baseWidth + widthAdjustment,
    height: baseHeight + heightAdjustment
  };
};

/**
 * Gets default layout options
 */
export const getDefaultLayoutOptions = (): GridLayoutOptions => ({
  containerWidth: 1200,
  containerHeight: 800,
  entityWidth: 200,
  entityHeight: 120,
  padding: 50,
  margin: 100
}); 