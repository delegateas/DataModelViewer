import { useRef, useState, useCallback, useEffect } from 'react';
import { dia, routers } from '@joint/core';
import { GroupType, EntityType, AttributeType } from '@/lib/Types';
import { EntityElement } from '@/components/diagram/entity/entity';
import { AvoidRouter } from '@/components/diagram/avoid-router/avoidrouter';
import { DiagramRenderer } from '@/components/diagram/DiagramRenderer';
import { SimpleDiagramRenderer } from '@/components/diagram/renderers/SimpleDiagramRender';

export type DiagramType = 'detailed' | 'simple';

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
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitToScreen: () => void;
  setZoom: (zoom: number) => void;
  setIsPanning: (isPanning: boolean) => void;
  selectElement: (elementId: string) => void;
  clearSelection: () => void;
  initializePaper: (container: HTMLElement, options?: any) => void;
  destroyPaper: () => void;
  selectGroup: (group: GroupType) => void;
  updateMousePosition: (position: { x: number; y: number } | null) => void;
  updatePanPosition: (position: { x: number; y: number }) => void;
  addAttributeToEntity: (entitySchemaName: string, attribute: AttributeType) => void;
  updateDiagramType: (type: DiagramType) => void;
}

export const useDiagram = (): DiagramState & DiagramActions => {
  const paperRef = useRef<dia.Paper | null>(null);
  const graphRef = useRef<dia.Graph | null>(null);
  const zoomRef = useRef(1);
  const isPanningRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isAddingAttributeRef = useRef(false);
  
  const [zoom, setZoomState] = useState(1);
  const [isPanning, setIsPanningState] = useState(false);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [currentEntities, setCurrentEntities] = useState<EntityType[]>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [diagramType, setDiagramType] = useState<DiagramType>('detailed');

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
    setSelectedElements(prev => 
      prev.includes(elementId) ? prev : [...prev, elementId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElements([]);
  }, []);

  const selectGroup = useCallback((group: GroupType) => {
    setSelectedGroup(group);
    setCurrentEntities(group.Entities);
    clearSelection();
  }, [clearSelection]);

  const updateMousePosition = useCallback((position: { x: number; y: number } | null) => {
    setMousePosition(position);
  }, []);

  const updatePanPosition = useCallback((position: { x: number; y: number }) => {
    setPanPosition(position);
  }, []);

  const addAttributeToEntity = useCallback((entitySchemaName: string, attribute: AttributeType) => {
    // Prevent double additions
    if (isAddingAttributeRef.current) {
      return;
    }
    
    isAddingAttributeRef.current = true;
    
    if (!graphRef.current) {
      isAddingAttributeRef.current = false;
      return;
    }

    // Find the entity element in the graph
    const allElements = graphRef.current.getElements();
    
    const entityElement = allElements.find(el => 
      el.get('type') === 'delegate.entity' && 
      el.get('data')?.entity?.SchemaName === entitySchemaName
    );

    if (entityElement) {
      // Update the entity's data to include the new attribute
      const currentEntity = entityElement.get('data').entity;
      
      // Check if attribute already exists in the entity
      const attributeExists = currentEntity.Attributes.some((attr: AttributeType) => 
        attr.SchemaName === attribute.SchemaName
      );
      
      let updatedEntity;
      if (attributeExists) {
        // Attribute already exists, just mark it as manually added
        updatedEntity = {
          ...currentEntity,
          manuallyAddedAttributes: [
            ...(currentEntity.manuallyAddedAttributes || []),
            ...(currentEntity.manuallyAddedAttributes?.includes(attribute.SchemaName) ? [] : [attribute.SchemaName])
          ]
        };
      } else {
        // Attribute doesn't exist, add it and mark as manually added
        updatedEntity = {
          ...currentEntity,
          Attributes: [...currentEntity.Attributes, attribute],
          manuallyAddedAttributes: [
            ...(currentEntity.manuallyAddedAttributes || []),
            attribute.SchemaName
          ]
        };
      }

      // Update the element's data
      entityElement.set('data', { entity: updatedEntity });

      // Trigger the updateAttributes method to re-render the entity
      const entityElementTyped = entityElement as EntityElement;
      if (entityElementTyped.updateAttributes) {
        entityElementTyped.updateAttributes(updatedEntity);
      }

      // Update the currentEntities state to reflect the change
      setCurrentEntities(prev => {
        const updated = prev.map(entity => 
          entity.SchemaName === entitySchemaName 
            ? { 
                ...entity, 
                Attributes: attributeExists ? entity.Attributes : [...entity.Attributes, attribute],
                manuallyAddedAttributes: [
                  ...(entity.manuallyAddedAttributes || []),
                  ...(entity.manuallyAddedAttributes?.includes(attribute.SchemaName) ? [] : [attribute.SchemaName])
                ]
              }
            : entity
        );
        return updated;
      });
    }
    
    // Reset the flag
    isAddingAttributeRef.current = false;
  }, []);

  const updateDiagramType = useCallback((type: DiagramType) => {
    setDiagramType(type);
  }, []);

  const initializePaper = useCallback(async (container: HTMLElement, options: any = {}) => {
    // Create graph if it doesn't exist
    if (!graphRef.current) {
      graphRef.current = new dia.Graph();
    }

    await AvoidRouter.load();
    const avoidRouter = new AvoidRouter(graphRef.current, {
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
      ...options
    });

    paperRef.current = paper;
    
    // Setup event listeners
    paper.on('blank:pointerdown', () => {
      updatePanningDisplay(true);
      const paperEl = paper.el as HTMLElement;
      paperEl.style.cursor = 'grabbing';
    });

    paper.on('blank:pointerup', () => {
      updatePanningDisplay(false);
      const paperEl = paper.el as HTMLElement;
      paperEl.style.cursor = 'default';
    });

    paper.on('blank:pointermove', (evt: any) => {
      if (isPanningRef.current) {
        const currentTranslate = paper.translate();
        const deltaX = evt.originalEvent.movementX || 0;
        const deltaY = evt.originalEvent.movementY || 0;
        const newTranslateX = currentTranslate.tx + deltaX;
        const newTranslateY = currentTranslate.ty + deltaY;
        paper.translate(newTranslateX, newTranslateY);
        updatePanPosition({ x: newTranslateX, y: newTranslateY });
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
  }, [updateZoomDisplay, updatePanningDisplay, updateMousePosition, updatePanPosition]);

  const destroyPaper = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    paperRef.current = null;
  }, []);

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
    paper: paperRef.current,
    graph: graphRef.current,
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
    clearSelection,
    initializePaper,
    destroyPaper,
    selectGroup,
    updateMousePosition,
    updatePanPosition,
    addAttributeToEntity,
    updateDiagramType,
  };
}; 