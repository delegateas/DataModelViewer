'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { dia, util } from '@joint/core'
import { Groups } from "../../generated/Data"
import { SquareElement } from '@/components/diagram/elements/SquareElement';
import { TextElement } from '@/components/diagram/elements/TextElement';
import { DiagramCanvas } from '@/components/diagram/DiagramCanvas';
import { ZoomCoordinateIndicator } from '@/components/diagram/ZoomCoordinateIndicator';
import { EntityActionsPane, LinkPropertiesPane, LinkProperties } from '@/components/diagram/panes';
import { entityStyleManager } from '@/lib/entity-styling';
import { SquarePropertiesPane } from '@/components/diagram/panes/SquarePropertiesPane';
import { TextPropertiesPane } from '@/components/diagram/panes/TextPropertiesPane';
import { calculateGridLayout, getDefaultLayoutOptions, calculateEntityHeight, estimateEntityDimensions } from '@/components/diagram/GridLayoutManager';
import { AttributeType } from '@/lib/Types';
import { AppSidebar } from '../AppSidebar';
import { DiagramViewProvider, useDiagramViewContext } from '@/contexts/DiagramViewContext';
import { SidebarDiagramView } from './SidebarDiagramView';
import { useSidebarDispatch } from '@/contexts/SidebarContext';
import { SimpleDiagramRenderer } from './renderers/SimpleDiagramRender';
import { DetailedDiagramRender } from './renderers/DetailedDiagramRender';

interface IDiagramView {}

const DiagramContent = () => {
    const { 
        graph, 
        paper, 
        selectedGroup, 
        currentEntities,
        zoom,
        mousePosition,
        isPanning,
        selectGroup,
        fitToScreen,
        addAttributeToEntity,
        removeAttributeFromEntity,
        diagramType,
        removeEntityFromDiagram
    } = useDiagramViewContext();
    
    const [selectedKey, setSelectedKey] = useState<string>();
    const [selectedEntityForActions, setSelectedEntityForActions] = useState<string>();
    const [selectedArea, setSelectedArea] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } }>({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
    const [isLoading, setIsLoading] = useState(true);
    
    // Persistent tracking of entity positions across renders
    const entityPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
    
    // Track previous diagram type to detect changes
    const previousDiagramTypeRef = useRef<string>(diagramType);

    // Wrapper for setSelectedKey to pass to renderer
    const handleSetSelectedKey = useCallback((key: string | undefined) => {
        setSelectedKey(key);
    }, []);

    // Link click handler to pass to renderer
    const handleLinkClick = useCallback((link: dia.Link) => {
        setSelectedLink(link);
        setIsLinkPropertiesSheetOpen(true);
    }, []);
    const [isEntityActionsSheetOpen, setIsEntityActionsSheetOpen] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<SquareElement | null>(null);
    const [isSquarePropertiesSheetOpen, setIsSquarePropertiesSheetOpen] = useState(false);
    const [selectedText, setSelectedText] = useState<TextElement | null>(null);
    const [isTextPropertiesSheetOpen, setIsTextPropertiesSheetOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState<dia.Link | null>(null);
    const [isLinkPropertiesSheetOpen, setIsLinkPropertiesSheetOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeData, setResizeData] = useState<{
        element: SquareElement;
        handle: string;
        startSize: { width: number; height: number };
        startPosition: { x: number; y: number };
        startPointer: { x: number; y: number };
    } | null>(null);

    const renderer = useMemo(() => {
        if (!graph) return null;

        const RendererClass = (() => {
            switch (diagramType) {
                case 'simple':
                    return SimpleDiagramRenderer;
                case 'detailed':
                    return DetailedDiagramRender;
                default:
                    return SimpleDiagramRenderer; // fallback
            }
        })();

        return new RendererClass(graph, {
            setSelectedKey: handleSetSelectedKey,
            onLinkClick: handleLinkClick
        });
    }, [diagramType, graph, handleSetSelectedKey, handleLinkClick]);

    useEffect(() => {
        if (Groups.length > 0 && !selectedGroup) {
            selectGroup(Groups[0]);
        }
    }, [Groups, selectedGroup, selectGroup]);

    // Handle loading state when basic dependencies are ready
    useEffect(() => {
        if (graph && renderer) { // Remove paper dependency here since it might not be ready
            // If we have the basic dependencies but no selected group or no entities, stop loading
            if (!selectedGroup || currentEntities.length === 0) {
                setIsLoading(false);
            }
        }
    }, [graph, renderer, selectedGroup, currentEntities]); // Remove paper from dependencies

    useEffect(() => {
        if (!renderer) return;
        
        // Bind the method to the renderer instance
        const boundOnDocumentClick = renderer.onDocumentClick.bind(renderer);
        document.addEventListener('click', boundOnDocumentClick);
        return () => {
            document.removeEventListener('click', boundOnDocumentClick);
        };
    }, [renderer]);

    useEffect(() => {
        if (!graph || !paper || !selectedGroup || !renderer) {
            return;
        }

        // Check if diagram type has changed and clear all positions if so
        let diagramTypeChanged = false;
        if (previousDiagramTypeRef.current !== diagramType) {
            entityPositionsRef.current.clear();
            previousDiagramTypeRef.current = diagramType;
            diagramTypeChanged = true;
        }

        // Set loading state when starting diagram creation
        setIsLoading(true);

        // If there are no entities, set loading to false immediately
        if (currentEntities.length === 0) {
            setIsLoading(false);
            return;
        }

        // Preserve squares, text elements, and existing entity positions before clearing
        const squares = graph.getElements().filter(element => element.get('type') === 'delegate.square');
        const textElements = graph.getElements().filter(element => element.get('type') === 'delegate.text');
        const existingEntities = graph.getElements().filter(element => {
            const entityData = element.get('data');
            return entityData?.entity; // This is an entity element
        });
        
        const squareData = squares.map(square => ({
            element: square,
            data: square.get('data'),
            position: square.position(),
            size: square.size()
        }));
        const textData = textElements.map(textElement => ({
            element: textElement,
            data: textElement.get('data'),
            position: textElement.position(),
            size: textElement.size()
        }));
        
        // Update persistent position tracking with current positions
        // Skip this if diagram type changed to ensure all entities are treated as new
        if (!diagramTypeChanged) {
            existingEntities.forEach(element => {
                const entityData = element.get('data');
                if (entityData?.entity?.SchemaName) {
                    const position = element.position();
                    entityPositionsRef.current.set(entityData.entity.SchemaName, position);
                }
            });
        } else {
        }
        
        // Clean up position tracking for entities that are no longer in currentEntities
        const currentEntityNames = new Set(currentEntities.map(e => e.SchemaName));
        for (const [schemaName] of entityPositionsRef.current) {
            if (!currentEntityNames.has(schemaName)) {
                entityPositionsRef.current.delete(schemaName);
            }
        }
        
        // Clear existing elements
        graph.clear();
        
        // Re-add preserved squares with their data
        squareData.forEach(({ element, data, position, size }) => {
            element.addTo(graph);
            element.position(position.x, position.y);
            element.resize(size.width, size.height);
            element.set('data', data);
            element.toBack(); // Keep squares at the back
        });

        // Re-add preserved text elements with their data
        textData.forEach(({ element, data, position, size }) => {
            element.addTo(graph);
            element.position(position.x, position.y);
            element.resize(size.width, size.height);
            element.set('data', data);
            element.toFront(); // Keep text elements at the front
        });

        // Calculate grid layout
        const layoutOptions = getDefaultLayoutOptions(diagramType);
        
        // Get actual container dimensions
        const containerRect = paper?.el?.getBoundingClientRect();
        const actualContainerWidth = containerRect?.width || layoutOptions.containerWidth;
        const actualContainerHeight = containerRect?.height || layoutOptions.containerHeight;
        
        // Update layout options with actual container dimensions
        const updatedLayoutOptions = {
            ...layoutOptions,
            containerWidth: actualContainerWidth,
            containerHeight: actualContainerHeight,
            diagramType: diagramType
        };
        
        // Separate new entities from existing ones using persistent position tracking
        const newEntities = currentEntities.filter(entity => 
            !entityPositionsRef.current.has(entity.SchemaName)
        );
        const existingEntitiesWithPositions = currentEntities.filter(entity => 
            entityPositionsRef.current.has(entity.SchemaName)
        );
        

        // Store entity elements and port maps by SchemaName for easy lookup
        const entityMap = new Map();
        const placedEntityPositions: { x: number; y: number; width: number; height: number }[] = [];
        
        // First, create existing entities with their preserved positions
        existingEntitiesWithPositions.forEach((entity) => {
            const position = entityPositionsRef.current.get(entity.SchemaName);
            if (!position) return; // Skip if position is undefined
            
            const { element, portMap } = renderer.createEntity(entity, position);
            entityMap.set(entity.SchemaName, { element, portMap });
            
            // Track this position for collision avoidance
            const dimensions = estimateEntityDimensions(entity, diagramType);
            placedEntityPositions.push({
                x: position.x,
                y: position.y,
                width: dimensions.width,
                height: dimensions.height
            });
        });
        
        
        // Then, create new entities with grid layout that avoids already placed entities
        if (newEntities.length > 0) {
            // Calculate actual heights for new entities based on diagram type
            const entityHeights = newEntities.map(entity => calculateEntityHeight(entity, diagramType));
            const maxEntityHeight = Math.max(...entityHeights, layoutOptions.entityHeight);
            
            const adjustedLayoutOptions = {
                ...updatedLayoutOptions,
                entityHeight: maxEntityHeight,
                diagramType: diagramType
            };
            
            
            const layout = calculateGridLayout(newEntities, adjustedLayoutOptions, placedEntityPositions);
            
            // Create new entities with grid layout positions
            newEntities.forEach((entity, index) => {
                const position = layout.positions[index] || { x: 50, y: 50 };
                const { element, portMap } = renderer.createEntity(entity, position);
                entityMap.set(entity.SchemaName, { element, portMap });
                
                // Update persistent position tracking for newly placed entities
                entityPositionsRef.current.set(entity.SchemaName, position);
            });
        } else {
        }
        
        util.nextFrame(() => {
            currentEntities.forEach(entity => {
                renderer.createLinks(entity, entityMap, currentEntities);
            });
        });

        // Auto-fit to screen after a short delay to ensure all elements are rendered
        setTimeout(() => {
            fitToScreen();
            // Set loading to false once diagram is complete
            setIsLoading(false);
        }, 200);
    }, [graph, paper, selectedGroup, currentEntities, diagramType]);

    useEffect(() => {
        if (!graph || !renderer) return;
        
        // Sync the renderer's internal selectedKey state
        renderer.updateSelectedKey(selectedKey);
        
        // Reset all links to default color first
        graph.getLinks().forEach(link => {
            link.attr('line/stroke', '#42a5f5');
            link.attr('line/strokeWidth', 2);
            link.attr('line/targetMarker/stroke', '#42a5f5');
            link.attr('line/targetMarker/fill', '#42a5f5');
            link.attr('line/sourceMarker/stroke', '#42a5f5');
        });
        
        // Only highlight if there's a selected key
        if (selectedKey) {
            renderer.highlightSelectedKey(graph, currentEntities, selectedKey);
        }
    }, [selectedKey, graph, currentEntities, renderer]);

    useEffect(() => {
        if (!graph || !renderer) return;
        renderer.updateEntityAttributes(graph, selectedKey);
    }, [selectedKey, graph, renderer]);

    useEffect(() => {
        if (!paper || !renderer) return;
        
        // Handle link clicks
        paper.on('link:pointerclick', renderer.onLinkClick);
        
        // Handle entity clicks
        const handleElementClick = (elementView: dia.ElementView, evt: dia.Event) => {
            evt.stopPropagation();
            const element = elementView.model;
            const elementType = element.get('type');
            
            // Check if Ctrl is pressed - if so, skip opening any panes (selection is handled in useDiagram)
            const isCtrlPressed = (evt.originalEvent as MouseEvent)?.ctrlKey || (evt.originalEvent as MouseEvent)?.metaKey;
            if (isCtrlPressed) {
                return;
            }
            
            if (elementType === 'delegate.square') {
                const squareElement = element as SquareElement;
                
                // Only open properties panel for squares (resize handles are shown on hover)
                setSelectedSquare(squareElement);
                setIsSquarePropertiesSheetOpen(true);
                return;
            }
            
            if (elementType === 'delegate.text') {
                const textElement = element as TextElement;
                
                // Open properties panel for text elements
                setSelectedText(textElement);
                setIsTextPropertiesSheetOpen(true);
                return;
            }
            
            // Handle entity clicks
            // Check if the click target is an attribute button
            const target = evt.originalEvent?.target as HTMLElement;
            const isAttributeButton = target?.closest('button[data-schema-name]');
            
            // If clicking on an attribute, let the renderer handle it and don't open the entity actions sheet
            if (isAttributeButton) {
                return;
            }
            
            const entityData = element.get('data');
            
            if (entityData?.entity) {
                setSelectedEntityForActions(entityData.entity.SchemaName);
                setIsEntityActionsSheetOpen(true);
            }
        };

        // Handle element hover for cursor indication
        const handleElementMouseEnter = (elementView: dia.ElementView) => {
            const element = elementView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                // Handle square hover
                elementView.el.style.cursor = 'pointer';
                // Add a subtle glow effect for squares
                element.attr('body/filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))');
                
                // Don't show resize handles on general hover - only on edge hover
                return;
            }
            
            if (elementType === 'delegate.text') {
                // Handle text hover
                elementView.el.style.cursor = 'pointer';
                // Add a subtle glow effect for text elements
                element.attr('body/filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))');
                return;
            }
            
            // Handle entity hover using centralized style manager
            const entityData = element.get('data');
            
            if (entityData?.entity && paper) {
                entityStyleManager.handleEntityMouseEnter(element, paper);
            }
        };

        const handleElementMouseLeave = (elementView: dia.ElementView) => {
            const element = elementView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                // Handle square hover leave
                elementView.el.style.cursor = 'default';
                // Remove glow effect
                element.attr('body/filter', 'none');
                
                // Hide resize handles when leaving square area (unless selected for properties)
                const squareElement = element as SquareElement;
                if (selectedSquare?.id !== squareElement.id) {
                    squareElement.hideResizeHandles();
                }
                return;
            }
            
            if (elementType === 'delegate.text') {
                // Handle text hover leave
                elementView.el.style.cursor = 'default';
                // Remove glow effect
                element.attr('body/filter', 'none');
                return;
            }
            
            // Handle entity hover leave using centralized style manager
            const entityData = element.get('data');
            
            if (entityData?.entity && paper) {
                entityStyleManager.handleEntityMouseLeave(element, paper);
            }
        };
        
        paper.on('element:pointerclick', handleElementClick);
        paper.on('element:mouseenter', handleElementMouseEnter);
        paper.on('element:mouseleave', handleElementMouseLeave);
        
        // Handle mouse movement over squares to show resize handles only near edges
        const handleSquareMouseMove = (cellView: dia.CellView, evt: dia.Event) => {
            const element = cellView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                const squareElement = element as SquareElement;
                const bbox = element.getBBox();
                
                // Check if clientX and clientY are defined before using them
                if (evt.clientX === undefined || evt.clientY === undefined) return;
                
                const paperLocalPoint = paper.clientToLocalPoint(evt.clientX, evt.clientY);
                
                const edgeThreshold = 15; // pixels from edge to show handles
                const isNearEdge = (
                    // Near left or right edge
                    (paperLocalPoint.x <= bbox.x + edgeThreshold || 
                     paperLocalPoint.x >= bbox.x + bbox.width - edgeThreshold) ||
                    // Near top or bottom edge  
                    (paperLocalPoint.y <= bbox.y + edgeThreshold ||
                     paperLocalPoint.y >= bbox.y + bbox.height - edgeThreshold)
                );
                
                if (isNearEdge) {
                    squareElement.showResizeHandles();
                    cellView.el.style.cursor = 'move';
                } else {
                    // Only hide if not selected for properties (check current state)
                    const currentSelectedSquare = selectedSquare;
                    if (currentSelectedSquare?.id !== squareElement.id) {
                        squareElement.hideResizeHandles();
                    }
                    cellView.el.style.cursor = 'move';
                }
            }
        };
        
        paper.on('cell:mousemove', handleSquareMouseMove);
        
        // Handle pointer down for resize handles - capture before other events
        paper.on('cell:pointerdown', (cellView: dia.CellView, evt: dia.Event) => {
            const element = cellView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                const target = evt.target as HTMLElement;
                
                // More reliable selector detection for resize handles
                let selector = target.getAttribute('joint-selector');
                
                if (!selector) {
                    // Try to find parent with selector
                    let parent = target.parentElement;
                    let depth = 0;
                    while (parent && !selector && depth < 5) {
                        selector = parent.getAttribute('joint-selector');
                        parent = parent.parentElement;
                        depth++;
                    }
                }
                
                if (selector && selector.startsWith('resize-')) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    
                    const squareElement = element as SquareElement;
                    const bbox = element.getBBox();
                    
                    const resizeInfo = {
                        element: squareElement,
                        handle: selector,
                        startSize: { width: bbox.width, height: bbox.height },
                        startPosition: { x: bbox.x, y: bbox.y },
                        startPointer: { x: evt.clientX || 0, y: evt.clientY || 0 }
                    };
                    
                    setResizeData(resizeInfo);
                    setIsResizing(true);
                }
            }
        });
        
        return () => {
            paper.off('link:pointerclick', renderer.onLinkClick);
            paper.off('element:pointerclick', handleElementClick);
            paper.off('element:mouseenter', handleElementMouseEnter);
            paper.off('element:mouseleave', handleElementMouseLeave);
            paper.off('cell:mousemove', handleSquareMouseMove);
            paper.off('cell:pointerdown');
        };
    }, [paper, renderer, selectedSquare]);

    // Handle resize operations
    useEffect(() => {
        if (!isResizing || !resizeData || !paper) return;

        let animationId: number;

        const handleMouseMove = (evt: MouseEvent) => {
            if (!resizeData) return;

            // Cancel previous animation frame to prevent stacking
            if (animationId) {
                cancelAnimationFrame(animationId);
            }

            // Use requestAnimationFrame for smooth updates
            animationId = requestAnimationFrame(() => {
                const { element, handle, startSize, startPosition, startPointer } = resizeData;
                const deltaX = evt.clientX - startPointer.x;
                const deltaY = evt.clientY - startPointer.y;

                // Adjust deltas based on paper scaling and translation
                const scale = paper.scale();
                const translate = paper.translate();
                const adjustedDeltaX = deltaX / scale.sx;
                const adjustedDeltaY = deltaY / scale.sy;

                const newSize = { width: startSize.width, height: startSize.height };
                const newPosition = { x: startPosition.x, y: startPosition.y };

                // Calculate new size and position based on resize handle
                switch (handle) {
                    case 'resize-se': // Southeast
                        newSize.width = Math.max(50, startSize.width + adjustedDeltaX);
                        newSize.height = Math.max(30, startSize.height + adjustedDeltaY);
                        break;
                    case 'resize-sw': // Southwest
                        newSize.width = Math.max(50, startSize.width - adjustedDeltaX);
                        newSize.height = Math.max(30, startSize.height + adjustedDeltaY);
                        newPosition.x = startPosition.x + adjustedDeltaX;
                        break;
                    case 'resize-ne': // Northeast
                        newSize.width = Math.max(50, startSize.width + adjustedDeltaX);
                        newSize.height = Math.max(30, startSize.height - adjustedDeltaY);
                        newPosition.y = startPosition.y + adjustedDeltaY;
                        break;
                    case 'resize-nw': // Northwest
                        newSize.width = Math.max(50, startSize.width - adjustedDeltaX);
                        newSize.height = Math.max(30, startSize.height - adjustedDeltaY);
                        newPosition.x = startPosition.x + adjustedDeltaX;
                        newPosition.y = startPosition.y + adjustedDeltaY;
                        break;
                    case 'resize-e': // East
                        newSize.width = Math.max(50, startSize.width + adjustedDeltaX);
                        break;
                    case 'resize-w': // West
                        newSize.width = Math.max(50, startSize.width - adjustedDeltaX);
                        newPosition.x = startPosition.x + adjustedDeltaX;
                        break;
                    case 'resize-s': // South
                        newSize.height = Math.max(30, startSize.height + adjustedDeltaY);
                        break;
                    case 'resize-n': // North
                        newSize.height = Math.max(30, startSize.height - adjustedDeltaY);
                        newPosition.y = startPosition.y + adjustedDeltaY;
                        break;
                }

                // Apply the new size and position in a single batch update
                element.resize(newSize.width, newSize.height);
                element.position(newPosition.x, newPosition.y);
            });
        };

        const handleMouseUp = () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            setIsResizing(false);
            setResizeData(null);
        };

        // Add global event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Cleanup
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizeData, paper]);

    // Handle clicking outside to deselect squares and manage area selection
    useEffect(() => {
        if (!paper) return;

        const handleBlankClick = (evt: dia.Event, x: number, y: number) => {
            if (selectedSquare) {
                selectedSquare.hideResizeHandles();
                setSelectedSquare(null);
                setIsSquarePropertiesSheetOpen(false);
            }
        }

        const handleBlankPointerDown = (evt: dia.Event, x: number, y: number) => {
            
            // Don't set selected area if we were panning
            if (!isPanning) {
                setSelectedArea({ 
                    ...selectedArea,
                    start: { x, y }
                });
            }
        };

        const handleBlankPointerUp = (evt: dia.Event, x: number, y: number) => {
            if (!isPanning && Math.abs(selectedArea.start.x - x) > 10 && Math.abs(selectedArea.start.y - y) > 10) {
                // TODO
            }
        };

        paper.on('blank:pointerdown', handleBlankPointerDown);
        paper.on('blank:pointerup', handleBlankPointerUp);
        paper.on('blank:pointerclick', handleBlankClick);

        return () => {
            paper.off('blank:pointerdown', handleBlankPointerDown);
            paper.off('blank:pointerup', handleBlankPointerUp);
            paper.off('blank:pointerclick', handleBlankClick);
        };
    }, [paper, selectedSquare, isPanning, selectedArea]);

    const handleAddAttribute = (attribute: AttributeType) => {
        if (!selectedEntityForActions || !renderer) return;
        addAttributeToEntity(selectedEntityForActions, attribute, renderer);
    };

    const handleRemoveAttribute = (attribute: AttributeType) => {
        if (!selectedEntityForActions || !renderer) return;
        removeAttributeFromEntity(selectedEntityForActions, attribute, renderer);
    };

    const handleDeleteEntity = () => {
        if (selectedEntityForActions) {
            removeEntityFromDiagram(selectedEntityForActions);
            setIsEntityActionsSheetOpen(false);
            setSelectedEntityForActions(undefined);
        }
    };

    const handleDeleteSquare = () => {
        if (selectedSquare && graph) {
            // Remove the square from the graph
            selectedSquare.remove();
            // Clear the selection
            setSelectedSquare(null);
            setIsSquarePropertiesSheetOpen(false);
        }
    };

    const handleDeleteText = () => {
        if (selectedText && graph) {
            // Remove the text from the graph
            selectedText.remove();
            // Clear the selection
            setSelectedText(null);
            setIsTextPropertiesSheetOpen(false);
        }
    };

    const handleUpdateLink = (linkId: string | number, properties: LinkProperties) => {
        if (!graph) return;
        
        const link = graph.getCell(linkId) as dia.Link;
        if (!link) return;

        // Update link appearance
        link.attr('line/stroke', properties.color);
        link.attr('line/strokeWidth', properties.strokeWidth);
        link.attr('line/targetMarker/stroke', properties.color);
        link.attr('line/targetMarker/fill', properties.color);
        link.attr('line/sourceMarker/stroke', properties.color);
        
        if (properties.strokeDasharray) {
            link.attr('line/strokeDasharray', properties.strokeDasharray);
        } else {
            link.removeAttr('line/strokeDasharray');
        }

        // Update or remove label
        if (properties.label) {
            link.label(0, {
                attrs: {
                    rect: {
                        fill: 'white',
                        stroke: '#e5e7eb',
                        strokeWidth: 1,
                        rx: 4,
                        ry: 4,
                        ref: 'text',
                        refX: -8,
                        refY: 0,
                        refWidth: '100%',
                        refHeight: '100%',
                        refWidth2: 16,
                        refHeight2: 8,
                    },
                    text: {
                        text: properties.label,
                        fill: properties.color,
                        fontSize: 14,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        textAnchor: 'start',
                        dominantBaseline: 'central',
                    }
                },
                position: {
                    distance: 0.5,
                    offset: -1
                }
            });
        } else {
            link.removeLabel(0);
        }
    };

    // Find the selected entity for actions
    const selectedEntityForActionsData = currentEntities.find(entity => entity.SchemaName === selectedEntityForActions);
    
    // Find the entity display name for the modal
    const selectedEntity = currentEntities.find(entity => entity.SchemaName === selectedEntityForActions);
    
    // Get available and visible attributes for the selected entity
    const availableAttributes = selectedEntity?.Attributes || [];
    const visibleAttributes = selectedEntity && renderer
        ? renderer.getVisibleAttributes(selectedEntity)
        : [];

    return (
        <>
            <div className="flex flex-col flex-1">
                {/* Beta Disclaimer Banner */}
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">β</span>
                        </div>
                        <p className="text-sm text-amber-800">
                            <strong>Open Beta Feature:</strong> This ER Diagram feature is currently in beta. Some functionality may not work fully. <b>we do not recommend more than 20 entities</b>
                        </p>
                    </div>
                </div>
                
                {/* Diagram Area */}
                <div className='flex-1 flex flex-col bg-slate-50 relative' style={{
                    backgroundSize: `${zoom * 10}%`,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}>
                    {isLoading && (
                        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex gap-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-4 w-4 rounded-full bg-blue-500 animate-bounce"
                                            style={{
                                                animationDelay: `${i * 0.1}s`,
                                                animationDuration: "0.8s"
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-slate-600 animate-pulse">
                                    Loading diagram...
                                </p>
                            </div>
                        </div>
                    )}
                    <DiagramCanvas>
                        {/* Zoom and Coordinate Indicator */}
                        <ZoomCoordinateIndicator 
                            zoom={zoom}
                            mousePosition={mousePosition}
                        />
                    </DiagramCanvas>
                </div>
            </div>

            {/* Entity Actions Pane */}
            <EntityActionsPane
                isOpen={isEntityActionsSheetOpen}
                onOpenChange={setIsEntityActionsSheetOpen}
                selectedEntity={selectedEntityForActionsData || null}
                onDeleteEntity={handleDeleteEntity}
                onAddAttribute={handleAddAttribute}
                onRemoveAttribute={handleRemoveAttribute}
                availableAttributes={availableAttributes}
                visibleAttributes={visibleAttributes}
            />

            {/* Square Properties Pane */}
            <SquarePropertiesPane
                isOpen={isSquarePropertiesSheetOpen}
                onOpenChange={setIsSquarePropertiesSheetOpen}
                selectedSquare={selectedSquare}
                onDeleteSquare={handleDeleteSquare}
            />

            {/* Text Properties Pane */}
            <TextPropertiesPane
                isOpen={isTextPropertiesSheetOpen}
                onOpenChange={setIsTextPropertiesSheetOpen}
                selectedText={selectedText}
                onDeleteText={handleDeleteText}
            />

            {/* Link Properties Pane */}
            <LinkPropertiesPane
                isOpen={isLinkPropertiesSheetOpen}
                onOpenChange={(open) => {
                    setIsLinkPropertiesSheetOpen(open);
                    if (!open) setSelectedLink(null);
                }}
                selectedLink={selectedLink}
                onUpdateLink={handleUpdateLink}
            />
        </>
    )
};

export default function DiagramView({ }: IDiagramView) {
    const dispatch = useSidebarDispatch();

    useEffect(() => {
        dispatch({ type: "SET_ELEMENT", payload: <SidebarDiagramView /> })
    }, [])

    return (
        <DiagramViewProvider>
            <div className="flex">
                <AppSidebar />
                <DiagramContent />
            </div>
        </DiagramViewProvider>
    );
}
