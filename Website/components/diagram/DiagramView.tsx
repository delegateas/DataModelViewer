'use client';

import React, { useEffect, useMemo, useState } from 'react'
import { dia, shapes, util } from '@joint/core'
import { Groups } from "../../generated/Data"
import { EntityElement } from '@/components/diagram/entity/EntityElement';
import { SimpleEntityElement } from '@/components/diagram/entity/SimpleEntityElement';
import { SquareElement } from '@/components/diagram/entity/SquareElement';
import debounce from 'lodash/debounce';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeft, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';
import { DiagramCanvas } from '@/components/diagram/DiagramCanvas';
import { ZoomCoordinateIndicator } from '@/components/diagram/ZoomCoordinateIndicator';
import { AddEntityPane, EntityActionsPane } from '@/components/diagram/panes';
import { SquarePropertiesPane } from '@/components/diagram/panes/SquarePropertiesPane';
import { calculateGridLayout, getDefaultLayoutOptions, calculateEntityHeight } from '@/components/diagram/GridLayoutManager';
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
        selectGroup,
        zoomIn,
        zoomOut,
        resetView,
        fitToScreen,
        addAttributeToEntity,
        removeAttributeFromEntity,
        diagramType,
        removeEntityFromDiagram
    } = useDiagramViewContext();
    
    const [selectedKey, setSelectedKey] = useState<string>();
    const [selectedEntityForActions, setSelectedEntityForActions] = useState<string>();
    const [isEntityActionsSheetOpen, setIsEntityActionsSheetOpen] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<SquareElement | null>(null);
    const [isSquarePropertiesSheetOpen, setIsSquarePropertiesSheetOpen] = useState(false);
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
            setSelectedKey
        });
    }, [diagramType, graph, setSelectedKey]);

    useEffect(() => {
        if (Groups.length > 0 && !selectedGroup) selectGroup(Groups[0]);
    }, [Groups, selectedGroup, selectGroup]);

    useEffect(() => {
        if (!renderer) return;
        document.addEventListener('click', renderer.onDocumentClick);
        return () => {
            document.removeEventListener('click', renderer.onDocumentClick);
        };
    }, [renderer]);

    useEffect(() => {
        if (!graph || !paper || !selectedGroup || !renderer) return;

        // Preserve squares before clearing - only clear entities and links
        const squares = graph.getElements().filter(element => element.get('type') === 'delegate.square');
        const squareData = squares.map(square => ({
            element: square,
            data: square.get('data'),
            position: square.position(),
            size: square.size()
        }));
        
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

        // Calculate grid layout
        const layoutOptions = getDefaultLayoutOptions();
        
        // Get actual container dimensions
        const containerRect = paper?.el?.getBoundingClientRect();
        const actualContainerWidth = containerRect?.width || layoutOptions.containerWidth;
        const actualContainerHeight = containerRect?.height || layoutOptions.containerHeight;
        
        // Update layout options with actual container dimensions
        const updatedLayoutOptions = {
            ...layoutOptions,
            containerWidth: actualContainerWidth,
            containerHeight: actualContainerHeight
        };
        
        // Calculate actual heights for each entity
        const entityHeights = currentEntities.map(entity => calculateEntityHeight(entity));
        const maxEntityHeight = Math.max(...entityHeights, layoutOptions.entityHeight);
        
        // Use the maximum height for layout calculation to ensure proper spacing
        const adjustedLayoutOptions = {
            ...updatedLayoutOptions,
            entityHeight: maxEntityHeight
        };
        
        const layout = calculateGridLayout(currentEntities, adjustedLayoutOptions);

        // Store entity elements and port maps by SchemaName for easy lookup
        const entityMap = new Map();
        // Create entities in grid layout
        currentEntities.forEach((entity, index) => {
            const position = layout.positions[index] || { x: 50, y: 50 };
            const { element, portMap } = renderer.createEntity(entity, position);
            entityMap.set(entity.SchemaName, { element, portMap });
        });
        
        util.nextFrame(() => {
            currentEntities.forEach(entity => {
                renderer.createLinks(entity, entityMap);
            });
        });

        // Auto-fit to screen after a short delay to ensure all elements are rendered
        setTimeout(() => {
            fitToScreen();
        }, 200);
    }, [graph, paper, selectedGroup, currentEntities, diagramType]);

    useEffect(() => {
        if (!selectedKey || !graph || !renderer) return;
        
        graph.getLinks().forEach(link => {
            link.attr('line/stroke', '#42a5f5');
            link.attr('line/strokeWidth', 2);
            link.attr('line/targetMarker/stroke', '#42a5f5');
            link.attr('line/targetMarker/fill', '#42a5f5');
            link.attr('line/sourceMarker/stroke', '#42a5f5');
        });
        
        renderer.highlightSelectedKey(graph, currentEntities, selectedKey);
    }, [selectedKey, graph, currentEntities, renderer]);

    useEffect(() => {
        if (!graph || !selectedKey || !renderer) return;
        renderer.updateEntityAttributes(graph, selectedKey);
    }, [selectedKey, graph, renderer]);

    useEffect(() => {
        if (!paper || !renderer) return;
        
        // Handle link clicks
        paper.on('link:pointerclick', renderer.onLinkClick);
        
        // Handle entity clicks
        const handleElementClick = (elementView: any, evt: any) => {
            evt.stopPropagation();
            const element = elementView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                const squareElement = element as SquareElement;
                
                // Only open properties panel for squares (resize handles are shown on hover)
                setSelectedSquare(squareElement);
                setIsSquarePropertiesSheetOpen(true);
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
        const handleElementMouseEnter = (elementView: any) => {
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
            
            // Handle entity hover
            const entityData = element.get('data');
            
            if (entityData?.entity) {
                // Change cursor on the SVG element
                elementView.el.style.cursor = 'pointer';
                
                // Find the foreignObject and its HTML content for the border effect
                const foreignObject = elementView.el.querySelector('foreignObject');
                const htmlContent = foreignObject?.querySelector('[data-entity-schema]');
                
                if (htmlContent && !htmlContent.hasAttribute('data-hover-active')) {
                    htmlContent.setAttribute('data-hover-active', 'true');
                    htmlContent.style.border = '1px solid #3b82f6';
                    htmlContent.style.borderRadius = '10px';
                }
            }
        };

        const handleElementMouseLeave = (elementView: any) => {
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
            
            // Handle entity hover leave
            const entityData = element.get('data');
            
            if (entityData?.entity) {
                // Remove hover styling
                elementView.el.style.cursor = 'default';
                
                // Remove border from HTML content
                const foreignObject = elementView.el.querySelector('foreignObject');
                const htmlContent = foreignObject?.querySelector('[data-entity-schema]');
                
                if (htmlContent) {
                    htmlContent.removeAttribute('data-hover-active');
                    htmlContent.style.border = 'none';
                }
            }
        };
        
        paper.on('element:pointerclick', handleElementClick);
        paper.on('element:mouseenter', handleElementMouseEnter);
        paper.on('element:mouseleave', handleElementMouseLeave);
        
        // Handle mouse movement over squares to show resize handles only near edges
        const handleSquareMouseMove = (cellView: any, evt: any) => {
            const element = cellView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                const squareElement = element as SquareElement;
                const bbox = element.getBBox();
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
        paper.on('cell:pointerdown', (cellView: any, evt: any) => {
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
                        startPointer: { x: evt.clientX, y: evt.clientY }
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

                let newSize = { width: startSize.width, height: startSize.height };
                let newPosition = { x: startPosition.x, y: startPosition.y };

                // Calculate new size and position based on resize handle
                switch (handle) {
                    case 'resize-se': // Southeast
                        newSize.width = Math.max(50, startSize.width + deltaX);
                        newSize.height = Math.max(30, startSize.height + deltaY);
                        break;
                    case 'resize-sw': // Southwest
                        newSize.width = Math.max(50, startSize.width - deltaX);
                        newSize.height = Math.max(30, startSize.height + deltaY);
                        newPosition.x = startPosition.x + deltaX;
                        break;
                    case 'resize-ne': // Northeast
                        newSize.width = Math.max(50, startSize.width + deltaX);
                        newSize.height = Math.max(30, startSize.height - deltaY);
                        newPosition.y = startPosition.y + deltaY;
                        break;
                    case 'resize-nw': // Northwest
                        newSize.width = Math.max(50, startSize.width - deltaX);
                        newSize.height = Math.max(30, startSize.height - deltaY);
                        newPosition.x = startPosition.x + deltaX;
                        newPosition.y = startPosition.y + deltaY;
                        break;
                    case 'resize-e': // East
                        newSize.width = Math.max(50, startSize.width + deltaX);
                        break;
                    case 'resize-w': // West
                        newSize.width = Math.max(50, startSize.width - deltaX);
                        newPosition.x = startPosition.x + deltaX;
                        break;
                    case 'resize-s': // South
                        newSize.height = Math.max(30, startSize.height + deltaY);
                        break;
                    case 'resize-n': // North
                        newSize.height = Math.max(30, startSize.height - deltaY);
                        newPosition.y = startPosition.y + deltaY;
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

    // Handle clicking outside to deselect squares
    useEffect(() => {
        if (!paper) return;

        const handleBlankClick = () => {
            if (selectedSquare) {
                selectedSquare.hideResizeHandles();
                setSelectedSquare(null);
                setIsSquarePropertiesSheetOpen(false);
            }
        };

        paper.on('blank:pointerclick', handleBlankClick);

        return () => {
            paper.off('blank:pointerclick', handleBlankClick);
        };
    }, [paper, selectedSquare]);

    const handleAddAttribute = (attribute: AttributeType) => {
        if (!selectedEntityForActions) return;
        addAttributeToEntity(selectedEntityForActions, attribute);
    };

    const handleRemoveAttribute = (attribute: AttributeType) => {
        if (!selectedEntityForActions) return;
        removeAttributeFromEntity(selectedEntityForActions, attribute);
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

    // Find the selected entity for actions
    const selectedEntityForActionsData = currentEntities.find(entity => entity.SchemaName === selectedEntityForActions);
    
    // Find the entity display name for the modal
    const selectedEntity = currentEntities.find(entity => entity.SchemaName === selectedEntityForActions);
    const selectedEntityName = selectedEntity?.DisplayName;
    
    // Get available and visible attributes for the selected entity
    const availableAttributes = selectedEntity?.Attributes || [];
    const visibleAttributes = selectedEntity && renderer
        ? renderer.getVisibleAttributes(selectedEntity)
        : [];

    return (
        <>
            <div className="flex flex-col flex-1">
                {/* Top Toolbar */}
                <div className="border-b border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold">Data Model Diagram</h1>
                            <Separator orientation="vertical" className="h-6" />
                        </div>
                    </div>
                </div>

                {/* Diagram Area */}
                
                <div className='flex-1 flex flex-col bg-slate-50' style={{
                    backgroundSize: `${zoom * 10}%`,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}>
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
