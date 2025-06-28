import { useRef, useState, useCallback, useEffect } from 'react';
import { dia } from '@joint/core';
import { GroupType, EntityType } from '@/lib/Types';

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
}

export const useDiagram = (): DiagramState & DiagramActions => {
  const paperRef = useRef<dia.Paper | null>(null);
  const graphRef = useRef<dia.Graph | null>(null);
  const zoomRef = useRef(1);
  const isPanningRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  const [zoom, setZoomState] = useState(1);
  const [isPanning, setIsPanningState] = useState(false);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [currentEntities, setCurrentEntities] = useState<EntityType[]>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

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

  const initializePaper = useCallback((container: HTMLElement, options: any = {}) => {
    // Create graph if it doesn't exist
    if (!graphRef.current) {
      graphRef.current = new dia.Graph();
    }

    // Create paper with dotted background
    const paper = new dia.Paper({
      el: container,
      model: graphRef.current,
      width: '100%',
      height: '100%',
      gridSize: 8,
      background: { 
        color: '#fef3c7', // Light yellow background
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
  };
}; 