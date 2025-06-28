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
import { EntityInfoPanel } from '@/components/diagram/EntityInfoPanel';
import { DiagramResetButton } from '@/components/diagram/DiagramResetButton';
import { ZoomCoordinateIndicator } from '@/components/diagram/ZoomCoordinateIndicator';
import { calculateGridLayout, getDefaultLayoutOptions } from '@/components/diagram/GridLayoutManager';

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
        resetView
    } = useDiagramContext();
    
    const [selectedKey, setSelectedKey] = useState<string>();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Auto-select first group on mount
    useEffect(() => {
        if (Groups.length > 0 && !selectedGroup) {
            selectGroup(Groups[0]);
        }
    }, [Groups, selectedGroup, selectGroup]);

    useEffect(() => {
        document.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('button[data-schema-name]') as HTMLElement;
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

        // Calculate grid layout
        const layoutOptions = getDefaultLayoutOptions();
        const layout = calculateGridLayout(currentEntities, layoutOptions);

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
            const obstacles = allElements.map(el => el.getBBox().inflate(routerPadding));

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
                                    strokeWidth: 1,
                                    targetMarker: {
                                        type: 'path',
                                        d: 'M 10 -5 L 0 0 L 10 5 Z',
                                        fill: '#6366f1',
                                        stroke: '#6366f1'
                                    }
                                }
                            },
                            labels: [
                                {
                                    position: 0.05,
                                    attrs: {
                                        text: { text: '*', fontSize: 18, fill: '#6366f1', fontWeight: 'bold' },
                                        rect: { fill: 'white', stroke: 'none' }
                                    }
                                },
                                {
                                    position: 0.95,
                                    attrs: {
                                        text: { text: '+', fontSize: 18, fill: '#6366f1', fontWeight: 'bold' },
                                        rect: { fill: 'white', stroke: 'none' }
                                    }
                                }
                            ]
                        });

                        link.addTo(graph);
                    }
                }
            }
        });

        const reroute = debounce(() => {
            const elements = graph.getElements().filter(el => el.get('type') !== 'standard.Link');
            const obstacles = elements.map(el => {
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

        return () => {
            graph.off('change:position change:size change:attrs.line', reroute);
        };
    }, [graph, paper, selectedGroup, currentEntities]);

    useEffect(() => {
        if (!selectedKey || !graph) return;
        console.log(graph.getLinks())
        // const links = graph.getLinks().filter(link => link.target().id === selectedKey);
    }, [selectedKey, graph]);

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
                        
                        {/* Entity Information */}
                        <EntityInfoPanel selectedGroup={selectedGroup} />
                        
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
