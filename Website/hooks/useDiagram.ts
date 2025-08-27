import { useRef, useState, useCallback, useEffect } from 'react';
import { dia, routers, shapes } from '@joint/core';
import { GroupType, EntityType, AttributeType } from '@/lib/Types';
import { SquareElement } from '@/components/diagramview/elements/SquareElement';
import { SquareElementView } from '@/components/diagramview/elements/SquareElementView';
import { TextElement } from '@/components/diagramview/elements/TextElement';
import { AvoidRouter } from '@/components/diagramview/avoid-router/avoidrouter';
import { DiagramRenderer } from '@/components/diagramview/DiagramRenderer';
import { PRESET_COLORS } from '@/components/diagramview/shared/DiagramConstants';
import { entityStyleManager } from '@/lib/entity-styling';

export type DiagramType = 'simple' | 'detailed';

export interface DiagramState {
  zoom: number;
  isPanning: boolean;
  selectedElements: string[];
  paper: dia.Paper | null;
  graph: dia.Graph | null;
  selectedGroup: GroupType | null;
  currentEntities: EntityType[];
  mousePosition: { x: number; y: number } | null;
  panPosition: { x: number; y: number };
  diagramType: DiagramType;
}

export interface DiagramActions {
  // Zoom
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitToScreen: () => void;
  setZoom: (zoom: number) => void;

  // Pan
  setIsPanning: (isPanning: boolean) => void;

  // Select
  selectElement: (elementId: string) => void;
  selectMultipleElements: (elementIds: string[]) => void;
  toggleElementSelection: (elementId: string) => void;
  clearSelection: () => void;

  // Other
  initializePaper: (container: HTMLElement, options?: any) => void;
  destroyPaper: () => void;
  selectGroup: (group: GroupType) => void;
  updateMousePosition: (position: { x: number; y: number } | null) => void;
  updatePanPosition: (position: { x: number; y: number }) => void;
  addAttributeToEntity: (entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => void;
  removeAttributeFromEntity: (entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => void;
  updateDiagramType: (type: DiagramType) => void;
  addEntityToDiagram: (entity: EntityType, selectedAttributes?: string[]) => void;
  addGroupToDiagram: (group: GroupType, selectedAttributes?: { [entitySchemaName: string]: string[] }) => void;
  removeEntityFromDiagram: (entitySchemaName: string) => void;
  addSquareToDiagram: () => void;
  addTextToDiagram: () => void;
  saveDiagram: () => void;
  loadDiagram: (file: File) => Promise<void>;
  clearDiagram: () => void;
}

export const useDiagram = (): DiagramState & DiagramActions => {
  const paperRef = useRef<dia.Paper | null>(null);
  const graphRef = useRef<dia.Graph | null>(null);
  const zoomRef = useRef(1);
  const isPanningRef = useRef(false);
  const selectedElementsRef = useRef<string[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isAddingAttributeRef = useRef(false);

  const [zoom, setZoomState] = useState(1);
  const [isPanning, setIsPanningState] = useState(false);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [currentEntities, setCurrentEntities] = useState<EntityType[]>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [diagramType, setDiagramType] = useState<DiagramType>('simple');
  
  // State variables to track initialization status for React dependencies
  const [paperInitialized, setPaperInitialized] = useState(false);
  const [graphInitialized, setGraphInitialized] = useState(false);

  // Update state when refs change (for UI updates)
  const updateZoomDisplay = useCallback((newZoom: number) => {
    zoomRef.current = newZoom;
    setZoomState(newZoom);
  }, []);

  const updatePanningDisplay = useCallback((newPanning: boolean) => {
    isPanningRef.current = newPanning;
    setIsPanningState(newPanning);
  }, []);

  const zoomIn = useCallback(() => {
    if (paperRef.current) {
      const currentScale = paperRef.current.scale();
      const newScale = Math.min(currentScale.sx * 1.2, 3);
      paperRef.current.scale(newScale, newScale);
      updateZoomDisplay(newScale);
    }
  }, [updateZoomDisplay]);

  const zoomOut = useCallback(() => {
    if (paperRef.current) {
      const currentScale = paperRef.current.scale();
      const newScale = Math.max(currentScale.sx / 1.2, 0.1);
      paperRef.current.scale(newScale, newScale);
      updateZoomDisplay(newScale);
    }
  }, [updateZoomDisplay]);

  const resetView = useCallback(() => {
    if (paperRef.current) {
      paperRef.current.scale(1, 1);
      paperRef.current.translate(0, 0);
      updateZoomDisplay(1);
      setPanPosition({ x: 0, y: 0 });
      clearSelection();
    }
  }, [updateZoomDisplay]);

  const fitToScreen = useCallback(() => {
    if (paperRef.current && graphRef.current) {
      const elements = graphRef.current.getElements();
      if (elements.length > 0) {
        const bbox = graphRef.current.getBBox();
        if (bbox) {
          const paperSize = paperRef.current.getComputedSize();
          const scaleX = (paperSize.width - 100) / bbox.width;
          const scaleY = (paperSize.height - 100) / bbox.height;
          const scale = Math.min(scaleX, scaleY, 2);
          paperRef.current.scale(scale, scale);
          
          // Center the content manually
          const centerX = (paperSize.width - bbox.width * scale) / 2 - bbox.x * scale;
          const centerY = (paperSize.height - bbox.height * scale) / 2 - bbox.y * scale;
          paperRef.current.translate(centerX, centerY);
          
          updateZoomDisplay(scale);
          setPanPosition({ x: centerX, y: centerY });
        }
      }
    }
  }, [updateZoomDisplay]);

  const setZoom = useCallback((newZoom: number) => {
    if (paperRef.current) {
      paperRef.current.scale(newZoom, newZoom);
      updateZoomDisplay(newZoom);
    }
  }, [updateZoomDisplay]);

  const setIsPanning = useCallback((newPanning: boolean) => {
    updatePanningDisplay(newPanning);
  }, [updatePanningDisplay]);

  const selectElement = useCallback((elementId: string) => {
    const newSelection = [elementId];
    selectedElementsRef.current = newSelection;
    setSelectedElements(newSelection);
  }, []);

  const selectMultipleElements = useCallback((elementIds: string[]) => {
    selectedElementsRef.current = elementIds;
    setSelectedElements(elementIds);
  }, []);

  const toggleElementSelection = useCallback((elementId: string) => {
    setSelectedElements(prev => {
      const newSelection = prev.includes(elementId) 
        ? prev.filter(id => id !== elementId) 
        : [...prev, elementId];
      selectedElementsRef.current = newSelection;
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    selectedElementsRef.current = [];
    setSelectedElements([]);
  }, []);

  const selectGroup = useCallback((group: GroupType) => {
    setSelectedGroup(group);
    
    // Initialize entities with default visible attributes
    const entitiesWithVisibleAttributes = group.Entities.map(entity => {
      // Get primary key
      const primaryKey = entity.Attributes.find(attr => attr.IsPrimaryId);
      
      // Get custom lookup attributes (initially visible)
      const customLookupAttributes = entity.Attributes.filter(attr =>
        attr.AttributeType === "LookupAttribute" && attr.IsCustomAttribute
      );
      
      // Create initial visible attributes list
      const initialVisibleAttributes = [
        ...(primaryKey ? [primaryKey.SchemaName] : []),
        ...customLookupAttributes.map(attr => attr.SchemaName)
      ];
      
      return {
        ...entity,
        visibleAttributeSchemaNames: initialVisibleAttributes
      };
    });
    
    setCurrentEntities(entitiesWithVisibleAttributes);
    clearSelection();
  }, [clearSelection]);

  const updateMousePosition = useCallback((position: { x: number; y: number } | null) => {
    setMousePosition(position);
  }, []);

  const updatePanPosition = useCallback((position: { x: number; y: number }) => {
    setPanPosition(position);
  }, []);

  const addAttributeToEntity = useCallback((entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => {
    // Prevent double additions
    if (isAddingAttributeRef.current) {
      return;
    }
    
    isAddingAttributeRef.current = true;
    
    if (!graphRef.current) {
      isAddingAttributeRef.current = false;
      return;
    }

    // Update the currentEntities state first
    setCurrentEntities(prev => {
      const updated = prev.map(entity => {
        if (entity.SchemaName === entitySchemaName) {
          // Check if attribute already exists in the entity
          const attributeExists = entity.Attributes.some((attr: AttributeType) => 
            attr.SchemaName === attribute.SchemaName
          );
          
          // Get current visible attributes list
          const currentVisibleAttributes = (entity.visibleAttributeSchemaNames || []);
          
          if (attributeExists) {
            // Attribute already exists, just add it to visible list if not already there
            return {
              ...entity,
              visibleAttributeSchemaNames: currentVisibleAttributes.includes(attribute.SchemaName) 
                ? currentVisibleAttributes 
                : [...currentVisibleAttributes, attribute.SchemaName]
            };
          } else {
            // Attribute doesn't exist, add it to entity and make it visible
            return {
              ...entity,
              Attributes: [...entity.Attributes, attribute],
              visibleAttributeSchemaNames: [...currentVisibleAttributes, attribute.SchemaName]
            };
          }
        }
        return entity;
      });
      
      // Update the diagram using the renderer's unified method
      if (renderer) {
        const updatedEntity = updated.find(e => e.SchemaName === entitySchemaName);
        if (updatedEntity) {
          renderer.updateEntity(entitySchemaName, updatedEntity);
        }
      }
      
      return updated;
    });
    
    // Reset the flag
    isAddingAttributeRef.current = false;
  }, []);

  const removeAttributeFromEntity = useCallback((entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => {
    if (!graphRef.current) {
      return;
    }

    // Update the currentEntities state first
    setCurrentEntities(prev => {
      const updated = prev.map(entity => {
        if (entity.SchemaName === entitySchemaName) {
          // Remove from visible attributes list
          const updatedVisibleAttributes = (entity.visibleAttributeSchemaNames || [])
            .filter((attrName: string) => attrName !== attribute.SchemaName);
          
          return {
            ...entity,
            visibleAttributeSchemaNames: updatedVisibleAttributes
          };
        }
        return entity;
      });
      
      // Update the diagram using the renderer's unified method
      if (renderer) {
        const updatedEntity = updated.find(e => e.SchemaName === entitySchemaName);
        if (updatedEntity) {
          renderer.updateEntity(entitySchemaName, updatedEntity);
        }
      }
      
      return updated;
    });
  }, []);

  const updateDiagramType = useCallback((type: DiagramType) => {
    setDiagramType(type);
  }, []);

  const addEntityToDiagram = useCallback((entity: EntityType, selectedAttributes?: string[]) => {
    if (!graphRef.current || !paperRef.current) {
      return;
    }

    // Check if entity already exists in the diagram
    const existingEntity = currentEntities.find(e => e.SchemaName === entity.SchemaName);
    if (existingEntity) {
      return; // Entity already in diagram
    }

    let initialVisibleAttributes: string[];
    
    if (selectedAttributes) {
      // Use provided selected attributes
      initialVisibleAttributes = selectedAttributes;
    } else {
      // Initialize entity with default visible attributes
      const primaryKey = entity.Attributes.find(attr => attr.IsPrimaryId);
      const customLookupAttributes = entity.Attributes.filter(attr =>
        attr.AttributeType === "LookupAttribute" && attr.IsCustomAttribute
      );
      
      initialVisibleAttributes = [
        ...(primaryKey ? [primaryKey.SchemaName] : []),
        ...customLookupAttributes.map(attr => attr.SchemaName)
      ];
    }
    
    const entityWithVisibleAttributes = {
      ...entity,
      visibleAttributeSchemaNames: initialVisibleAttributes
    };

    // Update current entities
    const updatedEntities = [...currentEntities, entityWithVisibleAttributes];
    setCurrentEntities(updatedEntities);
  }, [currentEntities, diagramType, fitToScreen]);

  const addGroupToDiagram = useCallback((group: GroupType, selectedAttributes?: { [entitySchemaName: string]: string[] }) => {
    if (!graphRef.current || !paperRef.current) {
      return;
    }

    // Filter out entities that are already in the diagram
    const newEntities = group.Entities.filter(entity => 
      !currentEntities.some(e => e.SchemaName === entity.SchemaName)
    );

    if (newEntities.length === 0) {
      return; // All entities from this group are already in diagram
    }

    // Initialize new entities with provided or default visible attributes
    const entitiesWithVisibleAttributes = newEntities.map(entity => {
      let initialVisibleAttributes: string[];
      
      if (selectedAttributes && selectedAttributes[entity.SchemaName]) {
        // Use the provided selected attributes
        initialVisibleAttributes = selectedAttributes[entity.SchemaName];
      } else {
        // Fall back to default (primary key + custom lookup attributes)
        const primaryKey = entity.Attributes.find(attr => attr.IsPrimaryId);
        const customLookupAttributes = entity.Attributes.filter(attr =>
          attr.AttributeType === "LookupAttribute" && attr.IsCustomAttribute
        );
        
        initialVisibleAttributes = [
          ...(primaryKey ? [primaryKey.SchemaName] : []),
          ...customLookupAttributes.map(attr => attr.SchemaName)
        ];
      }
      
      return {
        ...entity,
        visibleAttributeSchemaNames: initialVisibleAttributes
      };
    });

    // Update current entities with new entities from the group
    const updatedEntities = [...currentEntities, ...entitiesWithVisibleAttributes];
    setCurrentEntities(updatedEntities);
  }, [currentEntities]);

  const removeEntityFromDiagram = useCallback((entitySchemaName: string) => {
    if (!graphRef.current) {
      return;
    }

    // Remove the entity from currentEntities state
    const updatedEntities = currentEntities.filter(entity => entity.SchemaName !== entitySchemaName);
    setCurrentEntities(updatedEntities);

    // Find and remove the entity element from the graph
    const entityElement = graphRef.current.getElements().find(el => 
      el.get('type') === 'delegate.entity' && 
      el.get('data')?.entity?.SchemaName === entitySchemaName
    );

    if (entityElement) {
      // Remove all links connected to this entity
      const connectedLinks = graphRef.current.getConnectedLinks(entityElement);
      connectedLinks.forEach(link => link.remove());
      
      // Remove the entity element
      entityElement.remove();
    }
  }, [currentEntities, fitToScreen]);

  const addSquareToDiagram = useCallback(() => {
    if (!graphRef.current || !paperRef.current) {
      return;
    }

    // Get all existing elements to find the lowest Y position (bottom-most)
    const allElements = graphRef.current.getElements();
    let lowestY = 50; // Default starting position
    
    if (allElements.length > 0) {
      // Find the bottom-most element and add margin
      allElements.forEach(element => {
        const bbox = element.getBBox();
        const elementBottom = bbox.y + bbox.height;
        if (elementBottom > lowestY) {
          lowestY = elementBottom + 30; // Add 30px margin
        }
      });
    }

    // Create a new square element
    const squareElement = new SquareElement({
      position: { 
        x: 100, // Fixed X position 
        y: lowestY 
      },
      data: {
        id: `square-${Date.now()}`, // Unique ID
        borderColor: PRESET_COLORS.borders[0].value,
        fillColor: PRESET_COLORS.fills[0].value,
        borderWidth: 2,
        borderType: 'dashed',
        opacity: 0.7
      }
    });

    // Add the square to the graph
    squareElement.addTo(graphRef.current);
    
    // Send square to the back so it renders behind entities
    squareElement.toBack();

    return squareElement;
  }, []);

  const addTextToDiagram = useCallback(() => {
    if (!graphRef.current || !paperRef.current) {
      return;
    }

    // Get all existing elements to find the lowest Y position (bottom-most)
    const allElements = graphRef.current.getElements();
    let lowestY = 50; // Default starting position
    
    if (allElements.length > 0) {
      // Find the bottom-most element and add margin
      allElements.forEach(element => {
        const bbox = element.getBBox();
        const elementBottom = bbox.y + bbox.height;
        if (elementBottom > lowestY) {
          lowestY = elementBottom + 30; // Add 30px margin
        }
      });
    }

    // Create a new text element
    const textElement = new TextElement({
      position: { 
        x: 100, // Fixed X position 
        y: lowestY 
      },
      size: { width: 120, height: 25 },
      attrs: {
        body: {
          fill: 'transparent',
          stroke: 'none'
        },
        label: {
          text: 'Sample Text',
          fill: 'black',
          fontSize: 14,
          fontFamily: 'Inter',
          textAnchor: 'start',
          textVerticalAnchor: 'top',
          x: 2,
          y: 2
        }
      }
    });

    // Don't call updateTextElement in constructor to avoid positioning conflicts
    textElement.set('data', {
      text: 'Text Element',
      fontSize: 14,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: 'black',
      backgroundColor: 'transparent',
      padding: 8,
      borderRadius: 4,
      textAlign: 'left'
    });

    // Add the text to the graph
    textElement.addTo(graphRef.current);

    return textElement;
  }, []);

  const saveDiagram = useCallback(() => {
    if (!graphRef.current) {
      console.warn('No graph available to save');
      return;
    }

    // Use JointJS built-in JSON export
    const graphJSON = graphRef.current.toJSON();
    
    // Create diagram data structure with additional metadata
    const diagramData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      diagramType,
      currentEntities,
      graph: graphJSON,
      viewState: {
        panPosition,
        zoom
      }
    };

    // Create blob and download
    const jsonString = JSON.stringify(diagramData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [graphRef, diagramType, currentEntities, panPosition, zoom]);

  const loadDiagram = useCallback(async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const diagramData = JSON.parse(text);
      
      if (!graphRef.current || !paperRef.current) {
        console.warn('Graph or paper not available for loading');
        return;
      }

      // Clear current diagram
      graphRef.current.clear();
      
      // Use JointJS built-in JSON import
      if (diagramData.graph) {
        // Manual recreation approach since cellNamespace isn't working
        const cells = diagramData.graph.cells || [];
        
        cells.forEach((cellData: any) => {
          let cell;
          
          if (cellData.type === 'delegate.square') {
            cell = new SquareElement({
              id: cellData.id,
              position: cellData.position,
              size: cellData.size,
              attrs: cellData.attrs,
              data: cellData.data
            });
          } else if (cellData.type === 'delegate.text') {
            cell = new TextElement({
              id: cellData.id,
              position: cellData.position,
              size: cellData.size,
              attrs: cellData.attrs,
              data: cellData.data
            });
          } else {
            try {
              // Create a temporary graph to deserialize the cell
              const tempGraph = new dia.Graph();
              tempGraph.fromJSON({ cells: [cellData] });
              cell = tempGraph.getCells()[0];
            } catch (error) {
              console.warn('Failed to create cell:', cellData.type, error);
              return;
            }
          }
          
          if (cell) {
            graphRef.current!.addCell(cell);
          }
        });
        
      } else {
        console.warn('No graph data found in diagram file');
      }
      
      // Restore diagram type
      if (diagramData.diagramType) {
        setDiagramType(diagramData.diagramType);
      }
      
      // Restore entities
      if (diagramData.currentEntities) {
        setCurrentEntities(diagramData.currentEntities);
      }
      
      // Restore view settings
      if (diagramData.viewState) {
        const { panPosition: savedPanPosition, zoom: savedZoom } = diagramData.viewState;
        
        if (savedZoom && paperRef.current) {
          paperRef.current.scale(savedZoom, savedZoom);
          updateZoomDisplay(savedZoom);
        }
        
        if (savedPanPosition && paperRef.current) {
          paperRef.current.translate(savedPanPosition.x, savedPanPosition.y);
          setPanPosition(savedPanPosition);
        }
      }
    } catch (error) {
      console.error('Failed to load diagram:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error('Failed to load diagram file. Please check the file format.');
    }
  }, [graphRef, paperRef, updateZoomDisplay]);

  const clearDiagram = useCallback(() => {
    if (!graphRef.current) {
      console.warn('Graph not available for clearing');
      return;
    }

    // Clear the entire diagram
    graphRef.current.clear();
    
    // Reset currentEntities state
    setCurrentEntities([]);
    
    // Clear selection
    clearSelection();
    
  }, [graphRef, clearSelection, setCurrentEntities]);

  const initializePaper = useCallback(async (container: HTMLElement, options: any = {}) => {
    // Create graph if it doesn't exist
    if (!graphRef.current) {
      graphRef.current = new dia.Graph();
      setGraphInitialized(true);
    }

    try {
      await AvoidRouter.load();
    } catch (error) {
      console.error('❌ Failed to initialize AvoidRouter:', error);
      // Continue without avoid router if it fails
    }
    
    let avoidRouter;
    try {
      avoidRouter = new AvoidRouter(graphRef.current, {
          shapeBufferDistance: 10,
          idealNudgingDistance: 15,
      });
      avoidRouter.routeAll();
      avoidRouter.addGraphListeners();
      (routers as any).avoid = function(vertices: any, options: any, linkView: any) {
          const graph = linkView.model.graph as dia.Graph;
          const avoidRouterInstance = (graph as any).__avoidRouter__ as AvoidRouter;

          if (!avoidRouterInstance) {
              console.warn('AvoidRouter not initialized on graph.');
              return null;
          }

          const link = linkView.model as dia.Link;

          // This will update link using libavoid if possible
          avoidRouterInstance.updateConnector(link);
          const connRef = avoidRouterInstance.edgeRefs[link.id];
          if (!connRef) return null;

          const route = connRef.displayRoute();
          return avoidRouterInstance.getVerticesFromAvoidRoute(route);
      };
      (graphRef.current as any).__avoidRouter__ = avoidRouter;
    } catch (error) {
      console.error('Failed to initialize AvoidRouter instance:', error);
      // Continue without avoid router functionality
    }

    // Create paper with light amber background
    const paper = new dia.Paper({
      el: container,
      model: graphRef.current,
      width: '100%',
      height: '100%',
      gridSize: 8,
      background: { 
        color: '#fef3c7', // Light amber background
        ...options.background
      },
      // Configure custom views
      cellViewNamespace: {
        'delegate': {
          'square': SquareElementView
        }
      },
      // Disable interactive for squares when resize handles are visible
      interactive: function(cellView: any) {
        const element = cellView.model;
        if (element.get('type') === 'delegate.square') {
          const data = element.get('data') || {};
          // Disable dragging if resize handles are visible
          if (data.isSelected) {
            return false;
          }
        }
        return true; // Enable dragging for other elements or unselected squares
      },
      ...options
    });

    paperRef.current = paper;
    setPaperInitialized(true);
    
    // Update entity style manager when selected elements change
    const updateEntityStyleManager = () => {
      entityStyleManager.handleSelectionChange(
        selectedElementsRef.current,
        graphRef.current!,
        paper
      );
    };
    
    // Area selection state tracking
    let isSelecting = false;
    let selectionStartX = 0;
    let selectionStartY = 0;
    let selectionElement: SVGRectElement | null = null;
    let currentAreaSelection: string[] = []; // Track current area selection

    // Create selection overlay element
    const createSelectionOverlay = (x: number, y: number, width: number, height: number) => {
      const paperSvg = paper.el.querySelector('svg');
      if (!paperSvg) return null;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', width.toString());
      rect.setAttribute('height', height.toString());
      rect.setAttribute('fill', 'rgba(59, 130, 246, 0.1)');
      rect.setAttribute('stroke', '#3b82f6');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('stroke-dasharray', '5,5');
      rect.setAttribute('pointer-events', 'none');
      rect.style.zIndex = '1000';
      
      paperSvg.appendChild(rect);
      return rect;
    };

    // Setup event listeners
    paper.on('blank:pointerdown', (evt: any) => {
      const isCtrlPressed = evt.originalEvent?.ctrlKey || evt.originalEvent?.metaKey;
      
      if (isCtrlPressed) {
        // Ctrl + drag = pan
        updatePanningDisplay(true);
        const paperEl = paper.el as HTMLElement;
        paperEl.style.cursor = 'grabbing';
      } else {
        // Regular drag = area selection
        const currentTranslate = paper.translate();
        const currentScale = paper.scale();
        const rect = (paper.el as HTMLElement).getBoundingClientRect();
        
        // Calculate start position in diagram coordinates
        selectionStartX = (evt.originalEvent.clientX - rect.left - currentTranslate.tx) / currentScale.sx;
        selectionStartY = (evt.originalEvent.clientY - rect.top - currentTranslate.ty) / currentScale.sy;
        
        isSelecting = true;
        const paperEl = paper.el as HTMLElement;
        paperEl.style.cursor = 'crosshair';
      }
    });

    paper.on('blank:pointerup', () => {
      if (isPanningRef.current) {
        updatePanningDisplay(false);
      }
      
      if (isSelecting) {
        // Finalize selection and apply permanent visual feedback
        updateEntityStyleManager();
        
        isSelecting = false;
        currentAreaSelection = []; // Clear the area selection tracking
        // Remove selection overlay
        if (selectionElement) {
          selectionElement.remove();
          selectionElement = null;
        }
      }
      
      const paperEl = paper.el as HTMLElement;
      paperEl.style.cursor = 'default';
    });

    paper.on('blank:pointermove', (evt: any) => {
      if (isPanningRef.current) {
        // Handle panning
        const currentTranslate = paper.translate();
        const deltaX = evt.originalEvent.movementX || 0;
        const deltaY = evt.originalEvent.movementY || 0;
        const newTranslateX = currentTranslate.tx + deltaX;
        const newTranslateY = currentTranslate.ty + deltaY;
        paper.translate(newTranslateX, newTranslateY);
        updatePanPosition({ x: newTranslateX, y: newTranslateY });
      } else if (isSelecting) {
        // Handle area selection
        const currentTranslate = paper.translate();
        const currentScale = paper.scale();
        const rect = (paper.el as HTMLElement).getBoundingClientRect();
        
        // Calculate current mouse position in diagram coordinates
        const currentX = (evt.originalEvent.clientX - rect.left - currentTranslate.tx) / currentScale.sx;
        const currentY = (evt.originalEvent.clientY - rect.top - currentTranslate.ty) / currentScale.sy;
        
        // Calculate selection rectangle bounds
        const x = Math.min(selectionStartX, currentX);
        const y = Math.min(selectionStartY, currentY);
        const width = Math.abs(currentX - selectionStartX);
        const height = Math.abs(currentY - selectionStartY);
        
        // Convert to screen coordinates for overlay
        const screenX = x * currentScale.sx + currentTranslate.tx;
        const screenY = y * currentScale.sy + currentTranslate.ty;
        const screenWidth = width * currentScale.sx;
        const screenHeight = height * currentScale.sy;
        
        // Update or create selection overlay
        if (selectionElement) {
          selectionElement.setAttribute('x', screenX.toString());
          selectionElement.setAttribute('y', screenY.toString());
          selectionElement.setAttribute('width', screenWidth.toString());
          selectionElement.setAttribute('height', screenHeight.toString());
        } else {
          selectionElement = createSelectionOverlay(screenX, screenY, screenWidth, screenHeight);
        }
        
        // Select elements within the area and provide visual feedback
        if (graphRef.current && width > 10 && height > 10) { // Minimum selection size
          const elementsInArea = graphRef.current.getElements().filter(element => {
            const bbox = element.getBBox();
            const elementType = element.get('type');
            
            // Check if element center is within selection bounds
            const elementCenterX = bbox.x + bbox.width / 2;
            const elementCenterY = bbox.y + bbox.height / 2;
            
            return elementCenterX >= x && elementCenterX <= x + width && 
                   elementCenterY >= y && elementCenterY <= y + height;
          });
          
          // Update selected elements in real-time during drag
          const selectedIds = elementsInArea.map(el => el.id.toString());
          currentAreaSelection = selectedIds; // Store for use in pointerup
          selectedElementsRef.current = selectedIds;
          setSelectedElements(selectedIds);
          
          // Apply visual feedback using entity style manager
          entityStyleManager.handleSelectionChange(selectedIds, graphRef.current, paper);
        }
      }
    });

    // Group dragging state
    let isGroupDragging = false;
    let groupDragStartPositions: { [id: string]: { x: number; y: number } } = {};
    let dragStartMousePos = { x: 0, y: 0 };

    // Element interaction handlers
    paper.on('element:pointerdown', (elementView: dia.ElementView, evt: any) => {
      const element = elementView.model;
      const elementType = element.get('type');
      
      const elementId = element.id.toString();
      const isCtrlPressed = evt.originalEvent?.ctrlKey || evt.originalEvent?.metaKey;
      const currentSelection = selectedElementsRef.current;
      
      if (isCtrlPressed) {
        // Ctrl+click: toggle selection
        toggleElementSelection(elementId);
        evt.preventDefault();
        evt.stopPropagation();
        
        // Update visual feedback after a short delay to let state update
        setTimeout(() => {
          updateEntityStyleManager();
        }, 0);
      } else if (currentSelection.includes(elementId) && currentSelection.length > 1) {
        // Start group dragging if clicking on already selected element (and there are multiple selected)
        isGroupDragging = true;
        groupDragStartPositions = {};
        
        // Store initial positions for all selected elements
        currentSelection.forEach(id => {
          const elem = graphRef.current?.getCell(id);
          if (elem) {
            const pos = elem.position();
            groupDragStartPositions[id] = { x: pos.x, y: pos.y };
          }
        });
        
        // Store initial mouse position
        const rect = (paper.el as HTMLElement).getBoundingClientRect();
        const currentTranslate = paper.translate();
        const currentScale = paper.scale();
        dragStartMousePos = {
          x: (evt.originalEvent.clientX - rect.left - currentTranslate.tx) / currentScale.sx,
          y: (evt.originalEvent.clientY - rect.top - currentTranslate.ty) / currentScale.sy
        };
        
        evt.preventDefault();
        evt.stopPropagation();
      } else if (currentSelection.includes(elementId) && currentSelection.length === 1) {
        // Single selected element - allow normal JointJS dragging behavior
        // Don't prevent default, let JointJS handle the dragging
        return;
      } else {
        // Regular click: clear selection and select only this element
        clearSelection();
        selectElement(elementId);
        
        // Update visual feedback
        updateEntityStyleManager();
      }
    });

    paper.on('element:pointermove', (elementView: dia.ElementView, evt: any) => {
      if (isGroupDragging && Object.keys(groupDragStartPositions).length > 0) {
        const rect = (paper.el as HTMLElement).getBoundingClientRect();
        const currentTranslate = paper.translate();
        const currentScale = paper.scale();
        
        const currentMouseX = (evt.originalEvent.clientX - rect.left - currentTranslate.tx) / currentScale.sx;
        const currentMouseY = (evt.originalEvent.clientY - rect.top - currentTranslate.ty) / currentScale.sy;
        
        const deltaX = currentMouseX - dragStartMousePos.x;
        const deltaY = currentMouseY - dragStartMousePos.y;
        
        // Move all selected elements
        Object.keys(groupDragStartPositions).forEach(id => {
          const elem = graphRef.current?.getCell(id);
          if (elem) {
            const startPos = groupDragStartPositions[id];
            elem.set('position', { x: startPos.x + deltaX, y: startPos.y + deltaY });
          }
        });
        
        evt.preventDefault();
        evt.stopPropagation();
      }
    });

    paper.on('element:pointerup', () => {
      isGroupDragging = false;
      groupDragStartPositions = {};
    });

    // Clear selection when clicking on blank area (unless Ctrl+dragging)
    paper.on('blank:pointerdown', (evt: any) => {
      const isCtrlPressed = evt.originalEvent?.ctrlKey || evt.originalEvent?.metaKey;
      
      if (isCtrlPressed) {
        // Ctrl + drag = pan
        updatePanningDisplay(true);
        const paperEl = paper.el as HTMLElement;
        paperEl.style.cursor = 'grabbing';
      } else {
        // Clear selection before starting area selection
        if (!isSelecting) {
          clearSelection();
          // Clear visual feedback
          updateEntityStyleManager();
        }
        
        // Regular drag = area selection
        const currentTranslate = paper.translate();
        const currentScale = paper.scale();
        const rect = (paper.el as HTMLElement).getBoundingClientRect();
        
        // Calculate start position in diagram coordinates
        selectionStartX = (evt.originalEvent.clientX - rect.left - currentTranslate.tx) / currentScale.sx;
        selectionStartY = (evt.originalEvent.clientY - rect.top - currentTranslate.ty) / currentScale.sy;
        
        isSelecting = true;
        const paperEl = paper.el as HTMLElement;
        paperEl.style.cursor = 'crosshair';
      }
    });

    // Add mouse move listener for coordinate tracking
    const paperEl = paper.el as HTMLElement;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = paperEl.getBoundingClientRect();
      const currentTranslate = paper.translate();
      const currentScale = paper.scale();
      
      // Calculate mouse position relative to diagram coordinates
      const mouseX = (e.clientX - rect.left - currentTranslate.tx) / currentScale.sx;
      const mouseY = (e.clientY - rect.top - currentTranslate.ty) / currentScale.sy;
      
      updateMousePosition({ x: Math.round(mouseX), y: Math.round(mouseY) });
    };

    const handleMouseLeave = () => {
      updateMousePosition(null);
    };

    // Add wheel event listener for zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const currentScale = paper.scale();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, currentScale.sx * delta));
      
      // Get mouse position relative to paper
      const rect = paperEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate zoom center
      const currentTranslate = paper.translate();
      const zoomCenterX = (mouseX - currentTranslate.tx) / currentScale.sx;
      const zoomCenterY = (mouseY - currentTranslate.ty) / currentScale.sy;
      
      // Apply zoom
      paper.scale(newScale, newScale);
      
      // Adjust translation to zoom towards mouse position
      const newTranslateX = mouseX - zoomCenterX * newScale;
      const newTranslateY = mouseY - zoomCenterY * newScale;
      paper.translate(newTranslateX, newTranslateY);
      
      updateZoomDisplay(newScale);
      updatePanPosition({ x: newTranslateX, y: newTranslateY });
    };

    paperEl.addEventListener('wheel', handleWheel);
    paperEl.addEventListener('mousemove', handleMouseMove);
    paperEl.addEventListener('mouseleave', handleMouseLeave);

    // Store cleanup function
    cleanupRef.current = () => {
      paperEl.removeEventListener('wheel', handleWheel);
      paperEl.removeEventListener('mousemove', handleMouseMove);
      paperEl.removeEventListener('mouseleave', handleMouseLeave);
      paper.remove();
    };

    return paper;
  }, [updateZoomDisplay, updatePanningDisplay, updateMousePosition, updatePanPosition, setGraphInitialized, setPaperInitialized]);

  const destroyPaper = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    paperRef.current = null;
    graphRef.current = null;
    setPaperInitialized(false);
    setGraphInitialized(false);
  }, [setPaperInitialized, setGraphInitialized]);

  // Update selection styling whenever selectedElements changes
  useEffect(() => {
    if (paperRef.current && graphRef.current) {
      entityStyleManager.handleSelectionChange(selectedElements, graphRef.current, paperRef.current);
    }
  }, [selectedElements]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPaper();
    };
  }, [destroyPaper]);

  return {
    // State
    zoom,
    isPanning,
    selectedElements,
    paper: paperInitialized ? paperRef.current : null,
    graph: graphInitialized ? graphRef.current : null,
    selectedGroup,
    currentEntities,
    mousePosition,
    panPosition,
    diagramType,
    
    // Actions
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
    setZoom,
    setIsPanning,
    selectElement,
    selectMultipleElements,
    toggleElementSelection,
    clearSelection,
    initializePaper,
    destroyPaper,
    selectGroup,
    updateMousePosition,
    updatePanPosition,
    addAttributeToEntity,
    removeAttributeFromEntity,
    updateDiagramType,
    addEntityToDiagram,
    addGroupToDiagram,
    removeEntityFromDiagram,
    addSquareToDiagram,
    addTextToDiagram,
    saveDiagram,
    loadDiagram,
    clearDiagram,
  };
}; 