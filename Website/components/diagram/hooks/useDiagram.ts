import { useRef, useState, useCallback, useEffect } from 'react';
import { dia } from '@joint/core';
import { GroupType, EntityType, AttributeType } from '@/lib/Types';
import { DiagramRenderer } from '@/components/diagram/renderers/DiagramRenderer';
import { entityStyleManager } from '@/lib/entity-styling';
import { DiagramManager } from '@/components/diagram/shared/DiagramManager';

export type DiagramType = 'simple' | 'detailed';

export interface DiagramState {
  paper: dia.Paper | null;
  graph: dia.Graph | null;
  currentEntities: EntityType[];
  diagramType: DiagramType;
}

export interface DiagramActions {
  initializePaper: (container: HTMLElement, options?: any) => void;
  destroyPaper: () => void;
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
  fitToScreen: () => void;
  resetView: () => void;
  setEventCallbacks: (callbacks: any) => void;
  getZoom: () => number;
  getMousePosition: () => { x: number; y: number };
  getIsPanning: () => boolean;
  getRenderingService: () => any | null;
}

export const useDiagram = (): DiagramState & DiagramActions => {
  // Create diagram manager instance
  const diagramManagerRef = useRef<DiagramManager>(new DiagramManager());
  
  // State to trigger re-renders
  const [currentEntities, setCurrentEntities] = useState<EntityType[]>([]);
  const [diagramType, setDiagramType] = useState<DiagramType>('simple');
  const [paperInitialized, setPaperInitialized] = useState(false);
  const [graphInitialized, setGraphInitialized] = useState(false);

  const diagramManager = diagramManagerRef.current;

  // Setup event callbacks
  useEffect(() => {
    diagramManager.setEventCallbacks({
      onSquareHover: (square, isHover) => {
        // Handle square hover logic if needed
      },
      onTextHover: (text, isHover) => {
        // Handle text hover logic if needed
      },
      onEntityHover: (entityData, isHover) => {
        // Handle entity hover logic if needed
        if (entityData?.entity && diagramManager.getPaper() && diagramManager.getGraph()) {
          const graph = diagramManager.getGraph()!;
          const paper = diagramManager.getPaper()!;
          const element = graph.getElements().find(el => 
            el.get('data')?.entity?.SchemaName === entityData.entity.SchemaName
          );
          
          if (element) {
            if (isHover) {
              entityStyleManager.handleEntityMouseEnter(element, paper);
            } else {
              entityStyleManager.handleEntityMouseLeave(element, paper);
            }
          }
        }
      },
      onLinkClick: (link) => {
        // Handle link click logic if needed
      }
    });
  }, [diagramManager]);

  const resetView = useCallback(() => {
    diagramManager.resetView();
  }, [diagramManager]);

  const fitToScreen = useCallback(() => {
    diagramManager.fitToScreen();
  }, [diagramManager]);

  const addAttributeToEntity = useCallback((entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => {
    const updated = diagramManager.addAttributeToEntity(entitySchemaName, attribute, renderer);
    if (updated) {
      setCurrentEntities(diagramManager.getCurrentEntities());
    }
  }, [diagramManager]);

  const removeAttributeFromEntity = useCallback((entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => {
    const updated = diagramManager.removeAttributeFromEntity(entitySchemaName, attribute, renderer);
    if (updated) {
      setCurrentEntities(diagramManager.getCurrentEntities());
    }
  }, [diagramManager]);

  const updateDiagramType = useCallback((type: DiagramType) => {
    diagramManager.setDiagramType(type);
    setDiagramType(type);
  }, [diagramManager]);

  const addEntityToDiagram = useCallback((entity: EntityType, selectedAttributes?: string[]) => {
    const added = diagramManager.addEntityToDiagram(entity, selectedAttributes);
    if (added) {
      setCurrentEntities(diagramManager.getCurrentEntities());
      // Trigger fit to screen after addition
      setTimeout(() => {
        fitToScreen();
      }, 100);
    }
  }, [diagramManager, fitToScreen]);

  const addGroupToDiagram = useCallback((group: GroupType, selectedAttributes?: { [entitySchemaName: string]: string[] }) => {
    const addedEntities = diagramManager.addGroupToDiagram(group, selectedAttributes);
    if (addedEntities.length > 0) {
      setCurrentEntities(diagramManager.getCurrentEntities());
      // Trigger fit to screen after addition
      setTimeout(() => {
        fitToScreen();
      }, 100);
    }
  }, [diagramManager, fitToScreen]);

  const removeEntityFromDiagram = useCallback((entitySchemaName: string) => {
    const removed = diagramManager.removeEntityFromDiagram(entitySchemaName);
    if (removed) {
      setCurrentEntities(diagramManager.getCurrentEntities());
    }
  }, [diagramManager]);

  const addSquareToDiagram = useCallback(() => {
    return diagramManager.addSquareToDiagram();
  }, [diagramManager]);

  const addTextToDiagram = useCallback(() => {
    return diagramManager.addTextToDiagram();
  }, [diagramManager]);

  const saveDiagram = useCallback(() => {
    diagramManager.saveDiagram();
  }, [diagramManager]);

  const loadDiagram = useCallback(async (file: File): Promise<void> => {
    await diagramManager.loadDiagram(file);
    // Update local state after loading
    setCurrentEntities(diagramManager.getCurrentEntities());
    setDiagramType(diagramManager.getDiagramType());
  }, [diagramManager]);

  const clearDiagram = useCallback(() => {
    diagramManager.clearDiagram();
    setCurrentEntities([]);
  }, [diagramManager]);

  const initializePaper = useCallback(async (container: HTMLElement, options: any = {}) => {
    await diagramManager.initializePaper(container, options);
    setPaperInitialized(true);
    setGraphInitialized(true);
  }, [diagramManager]);

  const destroyPaper = useCallback(() => {
    diagramManager.destroyPaper();
    setPaperInitialized(false);
    setGraphInitialized(false);
    setCurrentEntities([]);
    setDiagramType('simple');
  }, [diagramManager]);

  const setEventCallbacks = useCallback((callbacks: any) => {
    diagramManager.setEventCallbacks(callbacks);
  }, [diagramManager]);

  const getZoom = useCallback(() => {
    return diagramManager.getZoom();
  }, [diagramManager]);

  const getMousePosition = useCallback(() => {
    return diagramManager.getMousePosition();
  }, [diagramManager]);

  const getIsPanning = useCallback(() => {
    return diagramManager.getIsPanning();
  }, [diagramManager]);

  const getRenderingService = useCallback(() => {
    return diagramManager.getRenderingService();
  }, [diagramManager]);

  // Update selection styling whenever selectedElements changes
  useEffect(() => {
    const paper = diagramManager.getPaper();
    const graph = diagramManager.getGraph();
    if (paper && graph) {
      const selectedElements = diagramManager.getSelectedElements();
      entityStyleManager.handleSelectionChange(selectedElements, graph, paper);
    }
  }, [diagramManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      diagramManager.destroyPaper();
    };
  }, [diagramManager]);

  return {
    // State
    paper: paperInitialized ? diagramManager.getPaper() : null,
    graph: graphInitialized ? diagramManager.getGraph() : null,
    currentEntities,
    diagramType,
    
    // Actions
    initializePaper,
    destroyPaper,
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
    fitToScreen,
    resetView,
    setEventCallbacks,
    getZoom,
    getMousePosition,
    getIsPanning,
    getRenderingService,
  };
};
