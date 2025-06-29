'use client';

import React, { useEffect, useState } from 'react'
import { dia, shapes, util } from '@joint/core'
import { Groups } from "../generated/Data"
import { EntityElement } from '@/components/diagram/entity/entity';
import debounce from 'lodash/debounce';
import { 
    SidebarProvider, 
    Sidebar, 
    SidebarHeader, 
    SidebarContent, 
    SidebarFooter 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { DiagramProvider, useDiagramContext } from '@/contexts/DiagramContext';
import { DiagramCanvas } from '@/components/diagram/DiagramCanvas';
import { GroupSelector } from '@/components/diagram/GroupSelector';
import { DiagramResetButton } from '@/components/diagram/DiagramResetButton';
import { ZoomCoordinateIndicator } from '@/components/diagram/ZoomCoordinateIndicator';
import { AddAttributeModal } from '@/components/diagram/AddAttributeModal';
import { calculateGridLayout, getDefaultLayoutOptions, calculateEntityHeight } from '@/components/diagram/GridLayoutManager';
import { AttributeType } from '@/lib/Types';
import { createBackgroundDots } from '@/components/diagram/BackgroundDots';

interface IDiagramView {}

const routerType = "manhattan"
const routerPadding = 16;
const routerTries = 5000;
const routerDirections = 90;

const DiagramContent: React.FC = () => {
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
        addAttributeToEntity
    } = useDiagramContext();
    
    const [selectedKey, setSelectedKey] = useState<string>();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAddAttributeModalOpen, setIsAddAttributeModalOpen] = useState(false);
    const [selectedEntityForAttribute, setSelectedEntityForAttribute] = useState<string>();

    // Auto-select first group on mount
    useEffect(() => {
        if (Groups.length > 0 && !selectedGroup) {
            selectGroup(Groups[0]);
        }
    }, [Groups, selectedGroup, selectGroup]);

    useEffect(() => {
        document.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('button[data-schema-name]') as HTMLElement;
            const addButton = (e.target as HTMLElement).closest('button[data-add-attribute]') as HTMLElement;
            
            if (addButton) {
                // Find the entity this add button belongs to
                const entityElement = addButton.closest('[data-entity-schema]') as HTMLElement;
                if (entityElement) {
                    const entitySchema = entityElement.dataset.entitySchema;
                    setSelectedEntityForAttribute(entitySchema);
                    setIsAddAttributeModalOpen(true);
                }
                return;
            }
            
            if (!target) return;

            const schemaName = target.dataset.schemaName!;
            const isKey = target.dataset.isKey === 'true';

            if (isKey) {
                setSelectedKey(schemaName);
            }
        });
    }, []);

    useEffect(() => {
        if (!graph || !paper || !selectedGroup) return;

        // Clear existing elements
        graph.clear();

        // Recreate background dots after clearing
        createBackgroundDots(graph, paper);

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
        
        console.log('Entity heights:', entityHeights);
        console.log('Max entity height:', maxEntityHeight);
        console.log('Container dimensions:', { width: actualContainerWidth, height: actualContainerHeight });
        
        // Use the maximum height for layout calculation to ensure proper spacing
        const adjustedLayoutOptions = {
            ...updatedLayoutOptions,
            entityHeight: maxEntityHeight
        };
        
        const layout = calculateGridLayout(currentEntities, adjustedLayoutOptions);
        
        console.log('Layout result:', { columns: layout.columns, rows: layout.rows, positions: layout.positions.length });

        // Store entity elements and port maps by SchemaName for easy lookup
        const entityMap = new Map();

        // Create entities in grid layout
        currentEntities.forEach((entity, index) => {
            const position = layout.positions[index] || { x: 50, y: 50 };
            const { visibleItems, portMap } = EntityElement.getVisibleItemsAndPorts(entity);
            const entityElement = new EntityElement({
                position,
                data: { entity, setSelectedKey }
            });
            entityElement.addTo(graph);
            entityMap.set(entity.SchemaName, { element: entityElement, portMap });
        });
        
        util.nextFrame(() => {
            const allElements = graph.getElements();
            // Filter out background dots from obstacles - only use actual entity elements
            const entityElements = allElements.filter(el => el.get('type') !== 'background.dots');
            const obstacles = entityElements.map(el => el.getBBox().inflate(routerPadding));

            // Create relationships
            for (const entity of currentEntities) {
                const entityInfo = entityMap.get(entity.SchemaName);
                if (!entityInfo) continue;
                const { portMap } = entityInfo;
                const { visibleItems } = EntityElement.getVisibleItemsAndPorts(entity);

                for (let i = 1; i < visibleItems.length; i++) {
                    const attr = visibleItems[i];
                    if (attr.AttributeType !== "LookupAttribute") continue;

                    for (const target of attr.Targets) {
                        const targetInfo = entityMap.get(target.Name);
                        if (!targetInfo) continue;

                        const sourcePort = portMap[attr.SchemaName.toLowerCase()];
                        const targetPort = targetInfo.portMap[`${target.Name.toLowerCase()}id`];
                        const sourceId = entityInfo.element.id;
                        const targetId = targetInfo.element.id;

                        if (!sourcePort || !targetPort) continue;

                        // Use a filled arrow for 'many' side, and a small circle for 'one' side
                        const link = new shapes.standard.Link({
                            source: { id: sourceId, port: sourcePort },
                            target: { id: targetId, port: targetPort },
                            router: {
                                name: routerType,
                                args: {
                                    startDirections: ['left', 'right'],
                                    endDirections: ['left', 'right'],
                                    step: paper.options.gridSize,
                                    padding: routerPadding,
                                    maximumLoops: routerTries,
                                    isPointObstacle: (p: dia.Point) => {
                                        return obstacles.some(obs => obs.bbox().containsPoint(p))
                                    },
                                    maxAllowedDirectionChange: routerDirections
                                }
                            },
                            connector: { name: 'rounded' },
                            attrs: {
                                line: {
                                    stroke: '#6366f1',
                                    strokeWidth: 2,
                                    sourceMarker: {
                                        type: 'ellipse',
                                        cx: 0,
                                        cy: 0,
                                        rx: 4,
                                        ry: 4,
                                        fill: '#fff',
                                        stroke: '#6366f1',
                                        strokeWidth: 2
                                    },
                                    targetMarker: {
                                        type: 'path',
                                        d: 'M 10 -5 L 0 0 L 10 5 Z',
                                        fill: '#6366f1',
                                        stroke: '#6366f1'
                                    }
                                }
                            }
                            // No labels
                        });

                        link.addTo(graph);
                    }
                }
            }
        });

        const reroute = debounce(() => {
            const elements = graph.getElements().filter(el => el.get('type') !== 'standard.Link');
            // Filter out background dots from obstacles - only use actual entity elements
            const entityElements = elements.filter(el => el.get('type') !== 'background.dots');
            const obstacles = entityElements.map(el => {
                const bbox = el.getBBox();
                const inflated = bbox.inflate(routerPadding);
                return inflated;
            });

            graph.getLinks().forEach(link => {
                link.router(routerType, {
                    startDirections: ['left', 'right'],
                    endDirections: ['left', 'right'],
                    step: paper.options.gridSize,
                    padding: routerPadding,
                    maximumLoops: routerTries,
                    isPointObstacle: (p: dia.Point) => {
                        return obstacles.some(obs => obs.bbox().containsPoint(p))
                    },
                    maxAllowedDirectionChange: routerDirections
                });
            });
        }, 100);
        graph.on('change:position change:size change:attrs.line', reroute);

        // Auto-fit to screen after a short delay to ensure all elements are rendered
        setTimeout(() => {
            fitToScreen();
        }, 200);

        return () => {
            graph.off('change:position change:size change:attrs.line', reroute);
        };
    }, [graph, paper, selectedGroup, currentEntities]);

    useEffect(() => {
        if (!selectedKey || !graph) return;
        console.log(graph.getLinks())
        // const links = graph.getLinks().filter(link => link.target().id === selectedKey);
    }, [selectedKey, graph]);

    useEffect(() => {
        if (!paper) return;
        // Add link click handler
        const onLinkClick = (linkView: any, evt: any) => {
            evt.stopPropagation();
            // Placeholder: show relationship info and hide option coming soon!
            alert('Relationship info and hide option coming soon!');
        };
        paper.on('link:pointerclick', onLinkClick);
        return () => {
            paper.off('link:pointerclick', onLinkClick);
        };
    }, [paper]);

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
    const visibleAttributes = selectedEntity ? 
        EntityElement.getVisibleItemsAndPorts(selectedEntity).visibleItems : [];

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                {/* Left Sidebar */}
                <Sidebar>
                    <SidebarHeader className="border-b border-border p-4">
                        <h2 className="text-lg font-semibold">Diagram Tools</h2>
                    </SidebarHeader>
                    <SidebarContent className="p-4 space-y-6">
                        {/* Group Selection */}
                        <GroupSelector
                            groups={Groups}
                            selectedGroup={selectedGroup}
                            onGroupSelect={selectGroup}
                        />
                        
                        <Separator />
                        
                        {/* Diagram Controls */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Controls</h3>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={zoomOut}
                                    disabled={zoom <= 0.1}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={zoomIn}
                                    disabled={zoom >= 3}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                            <DiagramResetButton onReset={resetView} />
                        </div>
                    </SidebarContent>
                    <SidebarFooter className="border-t border-border p-4">
                        <div className="text-xs text-muted-foreground">
                            Zoom: {Math.round(zoom * 100)}%
                        </div>
                    </SidebarFooter>
                </Sidebar>

                {/* Main Content */}
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
        </SidebarProvider>
    );
};

export default function DiagramView({ }: IDiagramView) {
    return (
        <DiagramProvider>
            <DiagramContent />
        </DiagramProvider>
    );
}
