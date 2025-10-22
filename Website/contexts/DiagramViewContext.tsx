import { dia, shapes } from '@joint/core';
import React, { createContext, useContext, ReactNode, useReducer, useEffect, useRef } from 'react';
import { createEntity, EntityElement, EntityElementView } from '@/components/diagramview/diagram-elements/EntityElement';
import EntitySelection, { SelectionElement } from '@/components/diagramview/diagram-elements/Selection';
import { EntityType } from '@/lib/Types';

interface DiagramActions {
    setZoom: (zoom: number) => void;
    setIsPanning: (isPanning: boolean) => void;
    setTranslate: (translate: { x: number; y: number }) => void;
    addEntity: (entityData: EntityType, position?: { x: number; y: number }, label?: string) => void;
    removeEntity: (entitySchemaName: string) => void;
    getGraph: () => dia.Graph | null;
    getPaper: () => dia.Paper | null;
    applyZoomAndPan: (zoom: number, translate: { x: number; y: number }) => void;
    setLoadedDiagram: (filename: string | null, source: 'cloud' | 'file' | null, filePath?: string | null) => void;
    clearDiagram: () => void;
    setDiagramName: (name: string) => void;
    selectEntity: (entityId: string, ctrlClick?: boolean) => void;
    clearSelection: () => void;
    isEntityInDiagram: (entity: EntityType) => boolean;
}

export interface DiagramState extends DiagramActions {
    canvas: React.MutableRefObject<HTMLDivElement | null>;
    zoom: number;
    isPanning: boolean;
    translate: { x: number; y: number };
    loadedDiagramFilename: string | null;
    loadedDiagramSource: 'cloud' | 'file' | null;
    loadedDiagramFilePath: string | null;
    hasLoadedDiagram: boolean;
    diagramName: string;
    selectedEntities: string[];
    entitiesInDiagram: Map<string, EntityType>;
}

const initialState: DiagramState = {
    zoom: 1,
    isPanning: false,
    translate: { x: 0, y: 0 },
    canvas: React.createRef<HTMLDivElement>(),
    loadedDiagramFilename: null,
    loadedDiagramSource: null,
    loadedDiagramFilePath: null,
    hasLoadedDiagram: false,
    diagramName: 'untitled',
    selectedEntities: [],
    entitiesInDiagram: new Map<string, EntityType>(),

    setZoom: () => { throw new Error("setZoom not initialized yet!"); },
    setIsPanning: () => { throw new Error("setIsPanning not initialized yet!"); },
    setTranslate: () => { throw new Error("setTranslate not initialized yet!"); },
    addEntity: () => { throw new Error("addEntity not initialized yet!"); },
    removeEntity: () => { throw new Error("removeEntity not initialized yet!"); },
    getGraph: () => { throw new Error("getGraph not initialized yet!"); },
    getPaper: () => { throw new Error("getPaper not initialized yet!"); },
    applyZoomAndPan: () => { throw new Error("applyZoomAndPan not initialized yet!"); },
    setLoadedDiagram: () => { throw new Error("setLoadedDiagram not initialized yet!"); },
    clearDiagram: () => { throw new Error("clearDiagram not initialized yet!"); },
    setDiagramName: () => { throw new Error("setDiagramName not initialized yet!"); },
    selectEntity: () => { throw new Error("selectEntity not initialized yet!"); },
    clearSelection: () => { throw new Error("clearSelection not initialized yet!"); },
    isEntityInDiagram: () => { throw new Error("isEntityInDiagram not initialized yet!"); },
}

type DiagramViewAction =
  | { type: 'SET_ZOOM', payload: number }
  | { type: 'SET_IS_PANNING', payload: boolean }
  | { type: 'SET_TRANSLATE', payload: { x: number; y: number } }
  | { type: 'SET_LOADED_DIAGRAM', payload: { filename: string | null; source: 'cloud' | 'file' | null; filePath?: string | null } }
  | { type: 'CLEAR_DIAGRAM' }
  | { type: 'SET_DIAGRAM_NAME', payload: string }
  | { type: 'SELECT_ENTITY', payload: { entityId: string; multiSelect: boolean } }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTION', payload: string[] }
  | { type: 'ADD_ENTITY_TO_DIAGRAM', payload: EntityType }
  | { type: 'REMOVE_ENTITY_FROM_DIAGRAM', payload: string };

const diagramViewReducer = (state: DiagramState, action: DiagramViewAction): DiagramState => {
  switch (action.type) {
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload }
    case 'SET_IS_PANNING':
      return { ...state, isPanning: action.payload }
    case 'SET_TRANSLATE':
      return { ...state, translate: action.payload }
    case 'SET_LOADED_DIAGRAM':
      return { 
        ...state, 
        loadedDiagramFilename: action.payload.filename,
        loadedDiagramSource: action.payload.source,
        loadedDiagramFilePath: action.payload.filePath || null,
        hasLoadedDiagram: action.payload.filename !== null,
        diagramName: action.payload.filename || 'untitled'
      }
    case 'CLEAR_DIAGRAM':
      return { 
        ...state, 
        loadedDiagramFilename: null,
        loadedDiagramSource: null,
        loadedDiagramFilePath: null,
        hasLoadedDiagram: false,
        diagramName: 'untitled',
        entitiesInDiagram: new Map<string, EntityType>()
      }
    case 'SET_DIAGRAM_NAME':
      return { ...state, diagramName: action.payload }
    case 'SELECT_ENTITY':
      const { entityId, multiSelect } = action.payload;
      if (multiSelect) {
        // Ctrl+click: toggle the entity in selection
        const currentSelection = [...state.selectedEntities];
        const index = currentSelection.indexOf(entityId);
        if (index >= 0) {
          // Remove from selection (ctrl+click on selected entity)
          currentSelection.splice(index, 1);
        } else {
          // Add to selection (ctrl+click on unselected entity)
          currentSelection.push(entityId);
        }
        return { ...state, selectedEntities: currentSelection };
      } else {
        // Regular click: replace selection with single entity
        return { ...state, selectedEntities: [entityId] };
      }
    case 'CLEAR_SELECTION':
      return { ...state, selectedEntities: [] }
    case 'SET_SELECTION':
      return { ...state, selectedEntities: action.payload }
    case 'ADD_ENTITY_TO_DIAGRAM':
      const newEntitiesMap = new Map(state.entitiesInDiagram);
      newEntitiesMap.set(action.payload.SchemaName, action.payload);
      return { ...state, entitiesInDiagram: newEntitiesMap }
    case 'REMOVE_ENTITY_FROM_DIAGRAM':
      const updatedEntitiesMap = new Map(state.entitiesInDiagram);
      updatedEntitiesMap.delete(action.payload);
      return { ...state, entitiesInDiagram: updatedEntitiesMap }
    default:
      return state;
  }
}

const DiagramViewContext = createContext<DiagramState>(initialState);
const DiagramViewDispatcher = createContext<React.Dispatch<DiagramViewAction>>(() => { });

export const DiagramViewProvider = ({ children }: { children: ReactNode }) => {
    const [diagramViewState, dispatch] = useReducer(diagramViewReducer, initialState);
    const selectionRef = useRef<EntitySelection | null>(null);

    const setZoom = (zoom: number) => {
        dispatch({ type: 'SET_ZOOM', payload: zoom });
    }

    const setIsPanning = (isPanning: boolean) => {
        dispatch({ type: 'SET_IS_PANNING', payload: isPanning });
    }

    const setTranslate = (translate: { x: number; y: number }) => {
        dispatch({ type: 'SET_TRANSLATE', payload: translate });
    }

    const setLoadedDiagram = (filename: string | null, source: 'cloud' | 'file' | null, filePath?: string | null) => {
        dispatch({ type: 'SET_LOADED_DIAGRAM', payload: { filename, source, filePath } });
    }

    const clearDiagram = () => {
        // Clear the graph if it exists
        if (graphRef.current) {
            graphRef.current.clear();
        }
        dispatch({ type: 'CLEAR_DIAGRAM' });
    }

    const setDiagramName = (name: string) => {
        dispatch({ type: 'SET_DIAGRAM_NAME', payload: name });
    }

    // Refs to store graph and paper instances
    const graphRef = useRef<dia.Graph | null>(null);
    const paperRef = useRef<dia.Paper | null>(null);
   
    useEffect(() => {
        if (!diagramViewState.canvas.current) return;
        
        const graph = new dia.Graph({}, { cellNamespace: shapes });
        graphRef.current = graph;
        
        // Theme-aware colors using MUI CSS variables
        const gridMinorColor = "var(--mui-palette-border-main)";
        const gridMajorColor = "var(--mui-palette-border-main)";
        const backgroundColor = 'var(--mui-palette-background-default)';

        const paper = new dia.Paper({
            model: graph,
            width: '100%',
            height: '100%',
            gridSize: 20,
            drawGrid: {
                name: 'doubleMesh',
                args: [
                    { color: gridMinorColor, thickness: 1 }, // Minor grid lines
                    { color: gridMajorColor, thickness: 2, scaleFactor: 5 } // Major grid lines
                ]
            },
            background: {
                color: backgroundColor
            },
            interactive: { 
                elementMove: true
            },
            snapToGrid: true,
            frozen: true,
            async: true,
            cellViewNamespace: { ...shapes, diagram: { EntityElement, EntityElementView }, selection: { SelectionElement } }
        });

        paperRef.current = paper;
        diagramViewState.canvas.current.appendChild(paper.el);

        selectionRef.current = new EntitySelection(paper);
        
        // Update all entity views with selection callbacks when entities are added
        // Variables for panning, zooming and selection
        let isPanning = false;
        let panStartX = 0;
        let panStartY = 0;
        let currentZoom = diagramViewState.zoom;
        let currentTranslate = { ...diagramViewState.translate };

        // Mouse down handler for panning and selection
        const handleMouseDown = (evt: MouseEvent) => {
            if (evt.ctrlKey) {
                evt.preventDefault();
                isPanning = true;
                panStartX = evt.clientX;
                panStartY = evt.clientY;
                setIsPanning(true);
                diagramViewState.canvas.current!.style.cursor = 'grabbing';
            }
        };

        // Mouse move handler for panning, selection and dragging
        const handleMouseMove = (evt: MouseEvent) => {
            if (isPanning && evt.ctrlKey) {
                evt.preventDefault();
                const deltaX = evt.clientX - panStartX;
                const deltaY = evt.clientY - panStartY;
                
                // Update current translate position
                currentTranslate.x += deltaX;
                currentTranslate.y += deltaY;
                
                // Apply the full transform (scale + translate)
                paper.matrix({
                    a: currentZoom,
                    b: 0,
                    c: 0,
                    d: currentZoom,
                    e: currentTranslate.x,
                    f: currentTranslate.y
                });
                
                // Update context state
                setTranslate({ ...currentTranslate });
                
                panStartX = evt.clientX;
                panStartY = evt.clientY;
            }
        };

        // Mouse up handler for panning and selection
        const handleMouseUp = (evt: MouseEvent) => {
            if (isPanning) {
                evt.preventDefault();
                isPanning = false;
                setIsPanning(false);
                diagramViewState.canvas.current!.style.cursor = 'default';
            }
        };

        // Wheel handler for zooming and scrolling
        const handleWheel = (evt: WheelEvent) => {
            if (evt.ctrlKey) {
                // Zoom functionality
                evt.preventDefault();
                
                const zoomFactor = evt.deltaY > 0 ? 0.9 : 1.1;
                const newZoom = Math.max(0.1, Math.min(3, currentZoom * zoomFactor));
                
                if (newZoom !== currentZoom) {
                    // Get mouse position relative to canvas
                    const rect = diagramViewState.canvas.current!.getBoundingClientRect();
                    const mouseX = evt.clientX - rect.left;
                    const mouseY = evt.clientY - rect.top;
                    
                    // Calculate zoom center offset
                    const zoomRatio = newZoom / currentZoom;
                    
                    // Adjust translation to zoom around mouse position
                    currentTranslate.x = mouseX - (mouseX - currentTranslate.x) * zoomRatio;
                    currentTranslate.y = mouseY - (mouseY - currentTranslate.y) * zoomRatio;
                    
                    currentZoom = newZoom;
                    
                    // Apply the full transform (scale + translate)
                    paper.matrix({
                        a: currentZoom,
                        b: 0,
                        c: 0,
                        d: currentZoom,
                        e: currentTranslate.x,
                        f: currentTranslate.y
                    });
                    
                    // Update context state
                    setZoom(newZoom);
                    setTranslate({ ...currentTranslate });
                }
            } else {
                // Scroll functionality
                evt.preventDefault();
                
                const scrollSpeed = 50;
                
                // Handle scrolling with priority for horizontal scroll
                if (evt.deltaX !== 0) {
                    // Horizontal scroll wheel (if available) - only move horizontally
                    currentTranslate.x -= evt.deltaX > 0 ? scrollSpeed : -scrollSpeed;
                } else if (evt.shiftKey) {
                    // Shift + scroll = horizontal scrolling
                    currentTranslate.x -= evt.deltaY > 0 ? scrollSpeed : -scrollSpeed;
                } else {
                    // Regular scroll = vertical scrolling only
                    currentTranslate.y -= evt.deltaY > 0 ? scrollSpeed : -scrollSpeed;
                }
                
                // Apply the full transform (scale + translate)
                paper.matrix({
                    a: currentZoom,
                    b: 0,
                    c: 0,
                    d: currentZoom,
                    e: currentTranslate.x,
                    f: currentTranslate.y
                });
                
                // Update context state
                setTranslate({ ...currentTranslate });
            }
        };

        // Add event listeners
        const canvas = diagramViewState.canvas.current;
        canvas.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        
        // Unfreeze and render the paper to make it interactive
        paper.render();
        paper.unfreeze();
        
        return () => {
            // Remove event listeners
            canvas.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
            
            paper.remove();
        };
    }, []);

    // Context functions
    const addEntity = (entityData: EntityType, position?: { x: number; y: number }, label?: string) => {
        if (graphRef.current && paperRef.current) {
            let entityX: number;
            let entityY: number;
            
            if (position) {
                // If position is provided, use it as-is (already in paper coordinates)
                entityX = position.x;
                entityY = position.y;
            } else {
                // Calculate the center of the current viewport
                const canvasElement = diagramViewState.canvas.current!;
                const canvasRect = canvasElement.getBoundingClientRect();
                
                // Get the center point of the visible canvas in screen coordinates
                const centerScreenX = canvasRect.left + (canvasRect.width / 2);
                const centerScreenY = canvasRect.top + (canvasRect.height / 2);
                
                // Convert screen coordinates to paper coordinates
                const centerPaperPoint = paperRef.current.clientToLocalPoint({ 
                    x: centerScreenX, 
                    y: centerScreenY 
                });
                
                entityX = centerPaperPoint.x;
                entityY = centerPaperPoint.y;
            }
            
            const entityLabel = label || `Entity ${graphRef.current.getCells().length + 1}`;
            
            // Create the new entity using our custom EntityElement
            const entity = createEntity({
                position: { x: entityX - 60, y: entityY - 40 }, // Center the entity (120x80 default size)
                title: entityLabel,
                size: { width: 120, height: 80 },
                entityData
            });
            
            graphRef.current.addCell(entity);
            
            // Dispatch action to update the entities map in state
            dispatch({ type: 'ADD_ENTITY_TO_DIAGRAM', payload: entityData });
            
            return entity;
        }
        return null;
    };

    const removeEntity = (entitySchemaName: string) => {
        if (graphRef.current) {
            const entityElement = graphRef.current.getElements().find(el => {
                const elementType = el.get('type');
                const entityData = el.get('entityData');
                
                const isEntityElement = elementType === 'diagram.EntityElement';
                const hasMatchingSchema = entityData?.SchemaName === entitySchemaName;
                
                return isEntityElement && hasMatchingSchema;
            });

            if (entityElement) {
                // Remove all links connected to this entity
                const connectedLinks = graphRef.current.getConnectedLinks(entityElement);
                connectedLinks.forEach(link => link.remove());
                // Remove the entity element from the graph
                entityElement.remove();
                // Dispatch action to update the entities map in state
                dispatch({ type: 'REMOVE_ENTITY_FROM_DIAGRAM', payload: entitySchemaName });
            } else {
                console.warn('Entity not found in diagram:', entitySchemaName);
            }
        }
    };

    const getGraph = () => {
        return graphRef.current;
    };

    const getPaper = () => {
        return paperRef.current;
    };

    const applyZoomAndPan = (zoom: number, translate: { x: number; y: number }) => {
        if (paperRef.current) {
            // Apply the transform matrix to the paper
            paperRef.current.matrix({
                a: zoom,
                b: 0,
                c: 0,
                d: zoom,
                e: translate.x,
                f: translate.y
            });
            
            // Update the context state
            setZoom(zoom);
            setTranslate(translate);
        }
    };

    const selectEntity = (entityId: string, ctrlClick: boolean = false) => {
        // Calculate the new selection state first
        let newSelectedEntities;
        if (ctrlClick) {
            const currentSelection = [...diagramViewState.selectedEntities];
            const index = currentSelection.indexOf(entityId);
            if (index >= 0) {
                currentSelection.splice(index, 1);
            } else {
                currentSelection.push(entityId);
            }
            newSelectedEntities = currentSelection;
        } else {
            newSelectedEntities = [entityId];
        }

        if (graphRef.current) {
            const allEntities = graphRef.current.getCells().filter(cell => cell.get('type') === 'diagram.EntityElement');
            
            if (ctrlClick) {
                // Ctrl+click: toggle the entity in selection - use calculated new state
                const willBeSelected = newSelectedEntities.includes(entityId);
                
                const entity = graphRef.current.getCell(entityId);
                if (entity) {
                    const borderColor = willBeSelected ? 
                        '2px solid var(--mui-palette-secondary-main)' : 
                        '2px solid var(--mui-palette-primary-main)';
                    entity.attr('container/style/border', borderColor);
                }
            } else {
                // Regular click: clear all selections visually first, then select this one
                allEntities.forEach(entity => {
                    entity.attr('container/style/border', '2px solid var(--mui-palette-primary-main)');
                });
                
                const entity = graphRef.current.getCell(entityId);
                if (entity) {
                    entity.attr('container/style/border', '2px solid var(--mui-palette-secondary-main)');
                }
            }
        }
        
        // Update state
        dispatch({ type: 'SELECT_ENTITY', payload: { entityId, multiSelect: ctrlClick } });
    };

    const clearSelection = () => {
        dispatch({ type: 'CLEAR_SELECTION' });
        
        // Clear visual selection state on all entities
        if (graphRef.current) {
            const allEntities = graphRef.current.getCells().filter(cell => cell.get('type') === 'diagram.EntityElement');
            allEntities.forEach(entity => {
                entity.attr('container/style/border', '2px solid var(--mui-palette-primary-main)');
            });
        }
    };

    const isEntityInDiagram = (entity: EntityType) => {
        return diagramViewState.entitiesInDiagram.has(entity.SchemaName);
    };

    return (
        <DiagramViewContext.Provider value={{ ...diagramViewState, isEntityInDiagram, setZoom, setIsPanning, setTranslate, addEntity, removeEntity, getGraph, getPaper, applyZoomAndPan, setLoadedDiagram, clearDiagram, setDiagramName, selectEntity, clearSelection }}>
            <DiagramViewDispatcher.Provider value={dispatch}>
                {children}
            </DiagramViewDispatcher.Provider>
        </DiagramViewContext.Provider>
    )
}

export const useDiagramView = () => useContext(DiagramViewContext);
export const useDiagramViewDispatch = () => useContext(DiagramViewDispatcher);