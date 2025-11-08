import { dia, shapes } from '@joint/core';
import React, { createContext, useContext, ReactNode, useReducer, useEffect, useRef } from 'react';
import { createEntity, EntityElement, EntityElementView } from '@/components/diagramview/diagram-elements/EntityElement';
import EntitySelection, { SelectionElement } from '@/components/diagramview/diagram-elements/Selection';
import { GridHierarchicalLayout } from '@/components/diagramview/layout/GridHierarchicalLayout';
import { ForceDirectedLayout } from '@/components/diagramview/layout/ForceDirectedLayout';
import { EntityType } from '@/lib/Types';
import { AvoidRouter } from '@/components/diagramview/avoid-router/shared/avoidrouter';
import { initializeRouter } from '@/components/diagramview/avoid-router/shared/initialization';
import { createRelationshipLink, RelationshipLink, RelationshipLinkView, updateLinkMarkers } from '@/components/diagramview/diagram-elements/RelationshipLink';
import { getAllRelationshipsBetween, linkExistsBetween } from '@/lib/diagram/relationship-helpers';
import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';

export interface ExcludedLinkMetadata {
    linkId: string;
    sourceId: string;
    targetId: string;
    sourceSchemaName: string;
    targetSchemaName: string;
    relationshipInformationList: RelationshipInformation[];
    label?: any; // Store the full JointJS label object
}

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
    applySmartLayout: (entities: EntityType[], algorithm?: 'grid' | 'force') => Promise<void>;
    getSelectedEntities: () => EntityType[];
    toggleRelationshipLink: (linkId: string, relationshipSchemaName: string, include: boolean) => void;
    restoreRelationshipLink: (sourceSchemaName: string, targetSchemaName: string) => void;
    getExcludedLinks: () => Map<string, ExcludedLinkMetadata>;
    updateRelationshipLinkLabel: (linkId: string, label: string) => void;
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
    excludedLinks: Map<string, ExcludedLinkMetadata>;
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
    excludedLinks: new Map<string, ExcludedLinkMetadata>(),

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
    toggleRelationshipLink: () => { throw new Error("toggleRelationshipLink not initialized yet!"); },
    restoreRelationshipLink: () => { throw new Error("restoreRelationshipLink not initialized yet!"); },
    getExcludedLinks: () => { throw new Error("getExcludedLinks not initialized yet!"); },
    updateRelationshipLinkLabel: () => { throw new Error("updateRelationshipLinkLabel not initialized yet!"); }
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
    | { type: 'REMOVE_ENTITY_FROM_DIAGRAM', payload: string }
    | { type: 'ADD_EXCLUDED_LINK', payload: ExcludedLinkMetadata }
    | { type: 'REMOVE_EXCLUDED_LINK', payload: string };

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
                entitiesInDiagram: new Map<string, EntityType>(),
                excludedLinks: new Map<string, ExcludedLinkMetadata>()
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
        case 'ADD_EXCLUDED_LINK':
            const newExcludedLinks = new Map(state.excludedLinks);
            // Use a key that identifies the link by source and target
            const linkKey = `${action.payload.sourceSchemaName}-${action.payload.targetSchemaName}`;
            newExcludedLinks.set(linkKey, action.payload);
            return { ...state, excludedLinks: newExcludedLinks }
        case 'REMOVE_EXCLUDED_LINK':
            const updatedExcludedLinks = new Map(state.excludedLinks);
            updatedExcludedLinks.delete(action.payload);
            return { ...state, excludedLinks: updatedExcludedLinks }
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
                elementMove: true,
                linkMove: false,
                labelMove: true
            },
            snapToGrid: true,
            snapLabels: true,
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

    // Create a directed link between two entity elements based on their relationship
    const createDirectedLink = (graph: dia.Graph, sourceEl: dia.Element, targetEl: dia.Element, allRelationships: RelationshipInformation[]) => {
        const sourceData = sourceEl.get('entityData') as EntityType;
        const targetData = targetEl.get('entityData') as EntityType;

        if (!sourceData || !targetData) return;

        const link = createRelationshipLink(sourceEl.id, sourceData.SchemaName, targetEl.id, targetData.SchemaName, allRelationships);
        graph.addCell(link);
    };

    // Find + add links between a *new* entity element and all existing ones (including self-referencing)
    const linkNewEntityToExisting = (graph: dia.Graph, newEl: dia.Element) => {
        const newData = newEl.get('entityData') as EntityType;
        if (!newData) return;

        const selfReferencingRelationships = getAllRelationshipsBetween(newData, newData);

        // Check for self-referencing relationship first
        if (selfReferencingRelationships.length > 0) {
            // Entity has self-referencing relationship
            if (!linkExistsBetween(graph, newEl.id.toString(), newEl.id.toString())) {
                createDirectedLink(graph, newEl, newEl, selfReferencingRelationships);
            }
        }

        // Then check relationships with other entities
        const existing = graph.getElements().filter(el =>
            el.get('type') === 'diagram.EntityElement' && el.id !== newEl.id
        );

        for (const el of existing) {
            const otherData = el.get('entityData') as EntityType;
            if (!otherData) continue;

            const relationships = getAllRelationshipsBetween(newData, otherData);
            if (relationships.length > 0) {
                if (!linkExistsBetween(graph, newEl.id.toString(), el.id.toString())) {
                    createDirectedLink(graph, newEl, el, relationships);
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
            try {
                const entityElement = graphRef.current.getElements().find(el => {
                    const elementType = el.get('type');
                    const entityData = el.get('entityData');

                    const isEntityElement = elementType === 'diagram.EntityElement';
                    const hasMatchingSchema = entityData?.SchemaName === entitySchemaName;

                    return isEntityElement && hasMatchingSchema;
                });

                if (entityElement) {
                    const connectedLinks = graphRef.current.getConnectedLinks(entityElement);

                    connectedLinks.forEach((link) => {
                        try {
                            link.remove();
                        } catch (linkError) {
                            console.error('Error removing link:', link.id, linkError);
                        }
                    });

                    entityElement.remove();
                    dispatch({ type: 'REMOVE_ENTITY_FROM_DIAGRAM', payload: entitySchemaName });
                } else {
                    console.warn('Entity not found in diagram:', entitySchemaName);
                }
            } catch (error) {
                console.error('Error in removeEntity:', error);
            }
        }
    };

    const toggleRelationshipLink = (id: string, relationshipSchemaName: string, include: boolean) => {
        if (graphRef.current) {
            const linkElement = graphRef.current.getLinks().find(link =>
                link.get('type') === 'diagram.RelationshipLink' && link.id === id
            ) as RelationshipLink | undefined;

            if (!linkElement) {
                console.warn('Relationship link not found in diagram:', id);
                return;
            }

            const relations = linkElement.get('relationshipInformationList') as RelationshipInformation[];
            const updatedRelations = relations.map(rel =>
                rel.RelationshipSchemaName === relationshipSchemaName ? { ...rel, isIncluded: include } : rel
            );
            linkElement.set('relationshipInformationList', updatedRelations);

            const allExcluded = updatedRelations.every(r => r.isIncluded === false);
            if (allExcluded) {
                // Store link metadata before removing
                const source = linkElement.get('source') as { id: string };
                const target = linkElement.get('target') as { id: string };
                const sourceSchemaName = linkElement.get('sourceSchemaName');
                const targetSchemaName = linkElement.get('targetSchemaName');
                const labels = linkElement.labels();
                const currentLabel = labels.length > 0 ? labels[0] : undefined;

                const excludedLinkMetadata: ExcludedLinkMetadata = {
                    linkId: id,
                    sourceId: source.id,
                    targetId: target.id,
                    sourceSchemaName,
                    targetSchemaName,
                    relationshipInformationList: updatedRelations,
                    label: currentLabel
                };

                // Add to excluded links
                dispatch({ type: 'ADD_EXCLUDED_LINK', payload: excludedLinkMetadata });

                // Remove the link from the paper
                linkElement.remove();
            } else {
                linkElement.attr('line/style/strokeDasharray', '');
                linkElement.attr('line/style/stroke', 'var(--mui-palette-primary-main)');
                updateLinkMarkers(linkElement);
            }
        }
    }

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

    const applySmartLayout = async (entities: EntityType[], algorithm: 'grid' | 'force' = 'grid') => {
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

            console.log(`[DiagramViewContext] Applying ${algorithm} layout to ${layoutEntities.length} entities`);

            if (algorithm === 'force') {
                // Force-directed layout for dense, interconnected graphs
                const forceLayout = new ForceDirectedLayout(
                    paperRef.current,
                    graphRef.current,
                    layoutEntities,
                    {
                        gridSize: 40,                          // Smaller grid for more flexibility
                        entitySpacing: 180,                    // Minimum spacing between entities
                        linkStrength: 0.5,                     // Attraction strength
                        linkDistance: 200,                     // Desired distance between connected entities
                        chargeStrength: -300,                  // Repulsion strength
                        iterations: 300,                       // Simulation iterations
                        orthogonalBias: true,                  // Bias towards grid alignment
                        orthogonalBiasStrength: 0.3            // Strength of grid bias
                    }
                );

                await forceLayout.applyLayout();
            } else {
                // Grid hierarchical layout optimized for ER diagrams (default)
                const gridLayout = new GridHierarchicalLayout(
                    paperRef.current,
                    graphRef.current,
                    layoutEntities,
                    {
                        gridCellSize: 200,                         // Grid cell size for snapping
                        horizontalSpacing: 300,                    // Extra space for high-connectivity entities (base is 200)
                        verticalSpacing: 300,                      // Space between layers
                        columnsPerRow: 5,                          // Entities per layer before wrapping
                        topPadding: 100,                           // Top margin
                        leftPadding: 100,                          // Left margin
                        highConnectivitySpacingMultiplier: 1.5,    // Not used anymore (using weighted assignment)
                        highConnectivityThreshold: 3               // 3+ relationships = high connectivity
                    }
                );

                await gridLayout.applyLayout();
            }

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

    const restoreRelationshipLink = (sourceSchemaName: string, targetSchemaName: string) => {
        if (!graphRef.current) return;

        const linkKey = `${sourceSchemaName}-${targetSchemaName}`;
        const excludedLink = diagramViewState.excludedLinks.get(linkKey);

        if (!excludedLink) {
            console.warn('Excluded link not found:', linkKey);
            return;
        }

        // Recreate the link with the stored metadata
        const labelText = excludedLink.label?.attrs?.label?.text;
        const link = createRelationshipLink(
            excludedLink.sourceId,
            excludedLink.sourceSchemaName,
            excludedLink.targetId,
            excludedLink.targetSchemaName,
            excludedLink.relationshipInformationList,
            labelText
        );
        link.set('id', excludedLink.linkId);

        // If we have the full label object with position data, restore it
        if (excludedLink.label) {
            link.labels([excludedLink.label]);
        }

        graphRef.current.addCell(link);

        // Remove from excluded links
        dispatch({ type: 'REMOVE_EXCLUDED_LINK', payload: linkKey });
    };

    const getExcludedLinks = () => {
        return diagramViewState.excludedLinks;
    };

    const updateRelationshipLinkLabel = (linkId: string, label: string) => {
        if (!graphRef.current) return;

        const linkElement = graphRef.current.getLinks().find(link =>
            link.get('type') === 'diagram.RelationshipLink' && link.id === linkId
        ) as RelationshipLink | undefined;

        if (!linkElement) {
            console.warn('Relationship link not found in diagram:', linkId);
            return;
        }

        // Get existing labels
        const labels = linkElement.labels();

        if (label) {
            // If label text provided
            if (labels.length > 0) {
                // Update existing label
                const existingLabel = labels[0];
                linkElement.label(0, {
                    ...existingLabel,
                    attrs: {
                        ...existingLabel.attrs,
                        label: {
                            ...existingLabel.attrs?.label,
                            text: label
                        }
                    }
                });
            } else {
                // Create new label
                linkElement.appendLabel({
                    markup: [
                        {
                            tagName: 'rect',
                            selector: 'body'
                        },
                        {
                            tagName: 'text',
                            selector: 'label'
                        }
                    ],
                    attrs: {
                        label: {
                            text: label,
                            fill: 'var(--mui-palette-text-primary)',
                            fontSize: 12,
                            fontFamily: 'sans-serif',
                            textAnchor: 'middle',
                            textVerticalAnchor: 'middle'
                        },
                        body: {
                            ref: 'label',
                            fill: 'white',
                            rx: 3,
                            ry: 3,
                            refWidth: '100%',
                            refHeight: '100%',
                            refX: '0%',
                            refY: '0%'
                        }
                    },
                    position: {
                        distance: 0.5,
                        args: {
                            keepGradient: true,
                            ensureLegibility: true
                        }
                    }
                });
            }
        } else {
            // If label text is empty, remove the label
            if (labels.length > 0) {
                linkElement.removeLabel(0);
            }
        }
    };

    return (
        <DiagramViewContext.Provider value={{ ...diagramViewState, isEntityInDiagram, setZoom, setIsPanning, setTranslate, addEntity, removeEntity, toggleRelationshipLink, restoreRelationshipLink, getExcludedLinks, updateRelationshipLinkLabel, getGraph, getPaper, applyZoomAndPan, setLoadedDiagram, clearDiagram, setDiagramName, selectEntity, clearSelection, applySmartLayout, getSelectedEntities }}>
            <DiagramViewDispatcher.Provider value={dispatch}>
                {children}
            </DiagramViewDispatcher.Provider>
        </DiagramViewContext.Provider>
    )
}

export const useDiagramView = () => useContext(DiagramViewContext);
export const useDiagramViewDispatch = () => useContext(DiagramViewDispatcher);