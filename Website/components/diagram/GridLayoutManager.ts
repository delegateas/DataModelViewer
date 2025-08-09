import { EntityType } from '@/lib/Types';
import { EntityElement } from '@/components/diagram/elements/EntityElement';

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

  // Determine how many columns can fit
  const maxColumns = Math.max(1, Math.floor((containerWidth - margin * 2 + padding) / (entityWidth + padding)));
  const columns = Math.min(maxColumns, entities.length);

  // Initialize arrays to track column heights
  const columnHeights: number[] = Array(columns).fill(0);
  const positions: GridPosition[] = [];

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const height = calculateEntityHeight(entity);

    // Assign to the column with the least cumulative height
    const colIndex = columnHeights.indexOf(Math.min(...columnHeights));
    const x = margin + colIndex * (entityWidth + padding);
    const y = margin + columnHeights[colIndex];

    positions.push({ x, y });

    // Add height + padding to the selected column
    columnHeights[colIndex] += height + padding;
  }

  const gridWidth = columns * entityWidth + (columns - 1) * padding;
  const gridHeight = Math.max(...columnHeights) - padding; // remove trailing padding

  return {
    positions,
    gridWidth,
    gridHeight,
    columns,
    rows: Math.ceil(entities.length / columns) // estimated rows
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