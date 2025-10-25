import { dia, shapes } from '@joint/core';
import React, { createContext, useContext, ReactNode, useReducer, useEffect, useRef } from 'react';
import { createEntity, EntityElement, EntityElementView } from '@/components/diagramview/diagram-elements/EntityElement';
import EntitySelection, { SelectionElement } from '@/components/diagramview/diagram-elements/Selection';
import { SmartLayout } from '@/components/diagramview/layout/SmartLayout';
import { EntityType, ExtendedEntityInformationType } from '@/lib/Types';
import { AvoidRouter } from '@/components/diagramview/avoid-router/shared/avoidrouter';
import { initializeRouter } from '@/components/diagramview/avoid-router/shared/initialization';
import { createRelationshipLink, createDirectedRelationshipLink, RelationshipLink, RelationshipLinkView } from '@/components/diagramview/diagram-elements/RelationshipLink';
import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';

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
    applySmartLayout: (entities: EntityType[]) => void;
    getSelectedEntities: () => EntityType[];
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
    applySmartLayout: () => { throw new Error("applySmartLayout not initialized yet!"); },
    getSelectedEntities: () => { throw new Error("getSelectedEntities not initialized yet!"); },
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
        
        const graph = new dia.Graph({}, { 
            cellNamespace: { 
                ...shapes, 
                diagram: { EntityElement, RelationshipLink }, 
                selection: { SelectionElement } 
            } 
        });
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
            cellViewNamespace: { ...shapes, diagram: { EntityElement, EntityElementView, RelationshipLink, RelationshipLinkView }, selection: { SelectionElement } }
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

        initializeRouter(graph, paper).then(() => {
            const router = new AvoidRouter(graph, {
                shapeBufferDistance: 20,
                idealNudgingDistance: 10,
            });

            router.addGraphListeners();
            router.routeAll();
        });

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

    // Determine the relationship direction between two entities
    const getRelationshipDirection = (sourceEntity: EntityType, targetEntity: EntityType): '1-M' | 'M-1' | 'M-M' | 'SELF' | null => {
        if (!sourceEntity || !targetEntity) return null;

        // Handle self-referencing relationships
        if (sourceEntity.SchemaName === targetEntity.SchemaName) {
            // Check if entity has self-referencing lookup or relationship
            const hasSelfLookup = hasLookupTo(sourceEntity, sourceEntity.SchemaName);
            const hasSelfRelationship = sourceEntity.Relationships?.some(r => 
                r.TableSchema?.toLowerCase() === sourceEntity.SchemaName.toLowerCase()
            );
            
            if (hasSelfLookup || hasSelfRelationship) {
                return 'SELF';
            }
            return null;
        }

        let sourceToTargetType: 'none' | '1' | 'M' = 'none';
        let targetToSourceType: 'none' | '1' | 'M' = 'none';

        // Check if source has a lookup to target (source is "many", target is "one")
        if (hasLookupTo(sourceEntity, targetEntity.SchemaName)) {
            sourceToTargetType = 'M';
            targetToSourceType = '1';
        }

        // Check if target has a lookup to source (target is "many", source is "one")
        if (hasLookupTo(targetEntity, sourceEntity.SchemaName)) {
            targetToSourceType = 'M';
            sourceToTargetType = '1';
        }

        // Check relationships from source entity
        if (sourceEntity.Relationships) {
            const sourceRelationship = sourceEntity.Relationships.find(r => 
                r.TableSchema?.toLowerCase() === targetEntity.SchemaName.toLowerCase()
            );
            
            if (sourceRelationship) {
                if (sourceRelationship.IsManyToMany) {
                    return 'M-M';
                }
                // For 1-to-many relationships defined in the source entity,
                // the source is typically the "1" side and target is the "many" side
                if (sourceToTargetType === 'none') {
                    sourceToTargetType = '1';
                    targetToSourceType = 'M';
                }
            }
        }

        // Check relationships from target entity
        if (targetEntity.Relationships) {
            const targetRelationship = targetEntity.Relationships.find(r => 
                r.TableSchema?.toLowerCase() === sourceEntity.SchemaName.toLowerCase()
            );
            
            if (targetRelationship) {
                if (targetRelationship.IsManyToMany) {
                    return 'M-M';
                }
                // For 1-to-many relationships defined in the target entity,
                // the target is typically the "1" side and source is the "many" side
                if (targetToSourceType === 'none') {
                    targetToSourceType = '1';
                    sourceToTargetType = 'M';
                }
            }
        }

        // Determine final direction
        if (sourceToTargetType === '1' && targetToSourceType === 'M') {
            return '1-M'; // Source is one, target is many
        } else if (sourceToTargetType === 'M' && targetToSourceType === '1') {
            return 'M-1'; // Source is many, target is one
        } else if (sourceToTargetType === 'M' && targetToSourceType === 'M') {
            return 'M-M'; // Both are many
        }

        return null; // Unable to determine or no relationship
    };

    // True if an entity has a lookup attribute targeting targetSchema
    const hasLookupTo = (entity: EntityType, targetSchema: string): boolean => {
        return entity.Attributes?.some(a => a.AttributeType === "LookupAttribute" &&
            (a as any).Targets?.some((t: ExtendedEntityInformationType) =>
                t?.Name?.toLowerCase() === targetSchema.toLowerCase()
            )
        ) ?? false;
    };

    // True if an entity declares a relationship to targetSchema
    const hasRelationshipTo = (entity: EntityType, targetSchema: string): boolean => {
        if (!entity.Relationships) return false;

        const needle = targetSchema.toLowerCase();
        return entity.Relationships.some(r => {
            const tableHit = r.TableSchema?.toLowerCase() === needle;
            const nameHit = r.Name?.toLowerCase() === needle;
            const schemaHit = r.RelationshipSchema?.toLowerCase()?.includes(needle);
            return tableHit || nameHit || schemaHit;
        });
    };

    // Decide if two entities should be linked (including self-referencing)
    const shouldLinkEntities = (a: EntityType, b: EntityType): boolean => {
        if (!a || !b) return false;
        
        // Allow self-referencing relationships
        if (a.SchemaName === b.SchemaName) {
            // Check if entity has self-referencing lookup or relationship
            const hasSelfLookup = hasLookupTo(a, a.SchemaName);
            const hasSelfRelationship = hasRelationshipTo(a, a.SchemaName);
            return hasSelfLookup || hasSelfRelationship;
        }

        // Link if either side references the other via lookup or relationship
        const aToB = hasLookupTo(a, b.SchemaName) || hasRelationshipTo(a, b.SchemaName);
        const bToA = hasLookupTo(b, a.SchemaName) || hasRelationshipTo(b, a.SchemaName);

        return aToB || bToA;
    };

    // Do we already have a link between two element ids (including self-referencing)?
    const linkExistsBetween = (graph: dia.Graph, aId: string, bId: string): boolean => {
        const links = graph.getLinks();
        return links.some(l => {
            const s = l.get('source');
            const t = l.get('target');
            const sId = typeof s?.id === 'string' ? s.id : s?.id?.toString?.();
            const tId = typeof t?.id === 'string' ? t.id : t?.id?.toString?.();
            
            // Handle self-referencing links (same source and target)
            if (aId === bId) {
                return sId === aId && tId === bId;
            }
            
            // Handle regular links (bidirectional check)
            return (sId === aId && tId === bId) || (sId === bId && tId === aId);
        });
    };

    // Create a directed link between two entity elements based on their relationship
    const createDirectedLink = (graph: dia.Graph, sourceEl: dia.Element, targetEl: dia.Element) => {
        const sourceData = sourceEl.get('entityData') as EntityType;
        const targetData = targetEl.get('entityData') as EntityType;
        
        if (!sourceData || !targetData) return;

        const direction = getRelationshipDirection(sourceData, targetData);
        
        if (direction) {
            const info: RelationshipInformation = {
                sourceEntitySchemaName: sourceData.SchemaName,
                sourceEntityDisplayName: sourceData.DisplayName,
                targetEntitySchemaName: targetData.SchemaName,
                targetEntityDisplayName: targetData.DisplayName,
                RelationshipType: direction,
                RelationshipSchemaName: "" // TODO: found inside the relationship definitions (but what about lookups?)
            };
            const link = createDirectedRelationshipLink(sourceEl.id, targetEl.id, direction, info);
            graph.addCell(link);
        } else {
            // Fallback to undirected link if direction cannot be determined
            const link = createRelationshipLink(sourceEl.id, targetEl.id);
            graph.addCell(link);
        }
    };

    // Find + add links between a *new* entity element and all existing ones (including self-referencing)
    const linkNewEntityToExisting = (graph: dia.Graph, newEl: dia.Element) => {
        const newData = newEl.get('entityData') as EntityType;
        if (!newData) return;

        // Check for self-referencing relationship first
        if (shouldLinkEntities(newData, newData)) {
            console.log("Self-referencing relationship detected");
            // Entity has self-referencing relationship
            if (!linkExistsBetween(graph, newEl.id.toString(), newEl.id.toString())) {
                createDirectedLink(graph, newEl, newEl);
            }
        }

        // Then check relationships with other entities
        const existing = graph.getElements().filter(el =>
            el.get('type') === 'diagram.EntityElement' && el.id !== newEl.id
        );

        for (const el of existing) {
            const otherData = el.get('entityData') as EntityType;
            if (!otherData) continue;

            if (shouldLinkEntities(newData, otherData)) {
                if (!linkExistsBetween(graph, newEl.id.toString(), el.id.toString())) {
                    createDirectedLink(graph, newEl, el);
                }
            }
        }
    };

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
            
            // Snap entity position to grid (grid size is 20px)
            const gridSize = 20;
            const snappedX = Math.round((entityX - 60) / gridSize) * gridSize; // Center the entity (120px width)
            const snappedY = Math.round((entityY - 40) / gridSize) * gridSize; // Center the entity (80px height)
            
            const entityLabel = label || `Entity ${graphRef.current.getCells().length + 1}`;
            
            // Create the new entity using our custom EntityElement
            const entity = createEntity({
                position: { x: snappedX, y: snappedY },
                title: entityLabel,
                size: { width: 120, height: 80 },
                entityData
            });
            
            graphRef.current.addCell(entity);

            linkNewEntityToExisting(graphRef.current, entity);
            
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

    const applySmartLayout = (entities: EntityType[]) => {
        if (graphRef.current && paperRef.current) {
            // Get all entity elements from the graph
            const entityElements = graphRef.current.getCells().filter(
                cell => cell.get('type') === 'diagram.EntityElement'
            ) as InstanceType<typeof EntityElement>[];

            if (entityElements.length === 0) {
                console.warn('No entities found to layout');
                return;
            }

            const layoutEntities = entityElements.filter(el => {
                const entityData = el.get('entityData') as EntityType;
                return entities.some(e => e.SchemaName === entityData.SchemaName);
            });

            if (layoutEntities.length === 0) {
                console.warn('No matching entities found in diagram for layout');
                return;
            }

            // Create and apply the smart layout
            const smartLayout = new SmartLayout(paperRef.current, layoutEntities);
            smartLayout.applyLayout();

            // Recalculate selection bounding box after layout change
            if (selectionRef.current) {
                selectionRef.current.recalculateBoundingBox();
            }
        } else {
            console.error('Graph or Paper not initialized');
        }
    };

    const getSelectedEntities = (): EntityType[] => {
        if (!graphRef.current) {
            return [];
        }

        // Get currently selected entity IDs from state
        const selectedEntityIds = diagramViewState.selectedEntities;
        
        if (selectedEntityIds.length === 0) {
            // If no individual entity selection, check for area selection
            if (selectionRef.current) {
                const selectedElements = selectionRef.current.getSelected();
                return selectedElements
                    .filter(el => el.get('type') === 'diagram.EntityElement')
                    .map(el => el.get('entityData') as EntityType)
                    .filter(data => data != null);
            }
            return [];
        }

        // Get entities by their IDs
        const entities: EntityType[] = [];
        for (const entityId of selectedEntityIds) {
            const element = graphRef.current.getCell(entityId);
            if (element && element.get('type') === 'diagram.EntityElement') {
                const entityData = element.get('entityData') as EntityType;
                if (entityData) {
                    entities.push(entityData);
                }
            }
        }

        return entities;
    };

    return (
        <DiagramViewContext.Provider value={{ ...diagramViewState, isEntityInDiagram, setZoom, setIsPanning, setTranslate, addEntity, removeEntity, getGraph, getPaper, applyZoomAndPan, setLoadedDiagram, clearDiagram, setDiagramName, selectEntity, clearSelection, applySmartLayout, getSelectedEntities }}>
            <DiagramViewDispatcher.Provider value={dispatch}>
                {children}
            </DiagramViewDispatcher.Provider>
        </DiagramViewContext.Provider>
    )
}

export const useDiagramView = () => useContext(DiagramViewContext);
export const useDiagramViewDispatch = () => useContext(DiagramViewDispatcher);