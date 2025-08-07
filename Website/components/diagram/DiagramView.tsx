'use client';

import React, { useEffect, useMemo, useState } from 'react'
import { dia, shapes, util } from '@joint/core'
import { Groups } from "../../generated/Data"
import { EntityElement } from '@/components/diagram/entity/entity';
import { SimpleEntityElement } from '@/components/diagram/entity/SimpleEntityElement';
import debounce from 'lodash/debounce';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { DiagramCanvas } from '@/components/diagram/DiagramCanvas';
import { ZoomCoordinateIndicator } from '@/components/diagram/ZoomCoordinateIndicator';
import { AddAttributeModal } from '@/components/diagram/AddAttributeModal';
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
        diagramType
    } = useDiagramViewContext();
    
    const [selectedKey, setSelectedKey] = useState<string>();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAddAttributeModalOpen, setIsAddAttributeModalOpen] = useState(false);
    const [selectedEntityForAttribute, setSelectedEntityForAttribute] = useState<string>();

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
            setSelectedKey,
            setSelectedEntityForAttribute,
            setIsAddAttributeModalOpen
        });
    }, [diagramType, graph, setSelectedKey, setSelectedEntityForAttribute, setIsAddAttributeModalOpen]);

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

        // Clear existing elements
        graph.clear();

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
        paper.on('link:pointerclick', renderer.onLinkClick);
        return () => {
            paper.off('link:pointerclick', renderer.onLinkClick);
        };
    }, [paper, renderer]);

    const handleAddAttribute = (attribute: AttributeType) => {
        if (!selectedEntityForAttribute) return;
        addAttributeToEntity(selectedEntityForAttribute, attribute);
        setIsAddAttributeModalOpen(false);
        setSelectedEntityForAttribute(undefined);
    };

    // Find the entity display name for the modal
    const selectedEntity = currentEntities.find(entity => entity.SchemaName === selectedEntityForAttribute);
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
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">Group:</span>
                                <span className="text-sm font-medium">
                                    {selectedGroup?.Name || 'None'}
                                </span>
                            </div>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">Entities:</span>
                                <span className="text-sm font-medium">
                                    {currentEntities.length}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <PanelLeft className="h-4 w-4" />
                            </Button>
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

            {/* Add Attribute Modal */}
            <AddAttributeModal
                isOpen={isAddAttributeModalOpen}
                onClose={() => setIsAddAttributeModalOpen(false)}
                onAddAttribute={handleAddAttribute}
                entityName={selectedEntityName}
                availableAttributes={availableAttributes}
                visibleAttributes={visibleAttributes}
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
