'use client';

import React, { useEffect, useState } from 'react'
import { dia, shapes, util } from '@joint/core'
import { Groups } from "../../generated/Data"
import { EntityElement } from '@/components/diagram/entity/entity';
import { SimpleEntityElement } from '@/components/diagram/entity/SimpleEntityElement';
import debounce from 'lodash/debounce';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { DiagramCanvas } from '@/components/diagram/DiagramCanvas';
import { GroupSelector } from '@/components/diagram/GroupSelector';
import { DiagramResetButton } from '@/components/diagram/DiagramResetButton';
import { ZoomCoordinateIndicator } from '@/components/diagram/ZoomCoordinateIndicator';
import { AddAttributeModal } from '@/components/diagram/AddAttributeModal';
import { calculateGridLayout, getDefaultLayoutOptions, calculateEntityHeight } from '@/components/diagram/GridLayoutManager';
import { AttributeType } from '@/lib/Types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { AppSidebar } from '../AppSidebar';
import { DiagramViewProvider, useDiagramViewContext } from '@/contexts/DiagramViewContext';
import { SidebarDiagramView } from './SidebarDiagramView';
import { useSidebarDispatch } from '@/contexts/SidebarContext';

interface IDiagramView {}

const routerType = "manhattan"
const routerPadding = 16;
const routerTries = 5000;
const routerDirections = 90;

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

    // Auto-select first group on mount
    useEffect(() => {
        if (Groups.length > 0 && !selectedGroup) {
            selectGroup(Groups[0]);
        }
    }, [Groups, selectedGroup, selectGroup]);

    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
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
            
            if (target) {
                const schemaName = target.dataset.schemaName!;
                const isKey = target.dataset.isKey === 'true';

                if (isKey) {
                    setSelectedKey(schemaName);
                }
            } else {
                // Clicked outside of any key attribute, clear selection
                setSelectedKey(undefined);
            }
        };

        document.addEventListener('click', handleDocumentClick);
        
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    useEffect(() => {
        if (!graph || !paper || !selectedGroup) return;

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
            
            if (diagramType === 'simple') {
                // Create simple entity (no attributes, no ports)
                const entityElement = new SimpleEntityElement({
                    position,
                    data: { entity }
                });
                entityElement.addTo(graph);
                entityMap.set(entity.SchemaName, { element: entityElement, portMap: {} });
            } else {
                // Create detailed entity with attributes and ports
                const { visibleItems, portMap } = EntityElement.getVisibleItemsAndPorts(entity);
                const entityElement = new EntityElement({
                    position,
                    data: { entity, setSelectedKey, selectedKey }
                });
                entityElement.addTo(graph);
                entityMap.set(entity.SchemaName, { element: entityElement, portMap });
            }
        });
        
        util.nextFrame(() => {
            // Get all entity elements (exclude background dots and links)
            const entityElements = graph.getElements().filter(el => 
                el.get('type') !== 'background.dots' && 
                el.get('type') !== 'standard.Link'
            );
            
            // Create obstacles from entity bounding boxes with padding
            const obstacles = entityElements.map(el => {
                const bbox = el.getBBox();
                return bbox.inflate(routerPadding); // This returns a Rect, not an object with bbox()
            });

            console.log('Created obstacles:', obstacles.length, 'for entities:', entityElements.length);

            // Create relationships
            for (const entity of currentEntities) {
                const entityInfo = entityMap.get(entity.SchemaName);
                if (!entityInfo) continue;
                const { portMap } = entityInfo;
                const { visibleItems } = EntityElement.getVisibleItemsAndPorts(entity);

                if (diagramType === 'simple') {
                    // For simple diagram, create links between entity centers
                    for (const entity of currentEntities) {
                        const entityInfo = entityMap.get(entity.SchemaName);
                        if (!entityInfo) continue;
                        
                        // Find all lookup attributes and create links
                        for (const attr of entity.Attributes) {
                            if (attr.AttributeType !== "LookupAttribute") continue;
                            
                            for (const target of attr.Targets) {
                                const targetInfo = entityMap.get(target.Name);
                                if (!targetInfo) continue;

                                const sourceId = entityInfo.element.id;
                                const targetId = targetInfo.element.id;

                                // Create link connecting entity centers
                                const link = new shapes.standard.Link({
                                    source: { id: sourceId },
                                    target: { id: targetId },
                                    router: {
                                        name: routerType,
                                        args: {
                                            startDirections: ['left', 'right', 'top', 'bottom'],
                                            endDirections: ['left', 'right', 'top', 'bottom'],
                                            step: paper.options.gridSize,
                                            padding: routerPadding,
                                            maximumLoops: routerTries,
                                            isPointObstacle: (p: dia.Point) => {
                                                return obstacles.some(obs => obs.containsPoint(p))
                                            },
                                            maxAllowedDirectionChange: routerDirections
                                        }
                                    },
                                    connector: { name: 'rounded' },
                                    attrs: {
                                        line: {
                                            stroke: '#42a5f5',
                                            strokeWidth: 2,
                                            sourceMarker: {
                                                type: 'ellipse',
                                                cx: -6,
                                                cy: 0,
                                                rx: 4,
                                                ry: 4,
                                                fill: '#fff',
                                                stroke: '#42a5f5',
                                                strokeWidth: 2,
                                            },
                                            targetMarker: {
                                                type: 'path',
                                                d: 'M 10 -5 L 0 0 L 10 5 Z',
                                                fill: '#42a5f5',
                                                stroke: '#42a5f5'
                                            }
                                        }
                                    }
                                });

                                link.addTo(graph);
                            }
                        }
                    }
                } else {
                    // For detailed diagram, use ports
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
                                    step: paper.options.gridSize || 8,
                                    padding: routerPadding,
                                    maximumLoops: routerTries,
                                    // Fixed obstacle detection function
                                    isPointObstacle: (point: dia.Point) => {
                                        return obstacles.some(obstacle => {
                                            // obstacle is already a Rect from inflate(), so we can use containsPoint directly
                                            return obstacle.containsPoint(point);
                                        });
                                    },
                                    maxAllowedDirectionChange: routerDirections
                                }
                            },
                            connector: { name: 'rounded' },
                            attrs: {
                                line: {
                                    stroke: '#42a5f5',
                                    strokeWidth: 2,
                                    sourceMarker: {
                                        type: 'ellipse',
                                        cx: -6,
                                        cy: 0,
                                        rx: 4,
                                        ry: 4,
                                        fill: '#fff',
                                        stroke: '#42a5f5',
                                        strokeWidth: 2,
                                    },
                                    targetMarker: {
                                        type: 'path',
                                        d: 'M 10 -5 L 0 0 L 10 5 Z',
                                        fill: '#42a5f5',
                                        stroke: '#42a5f5'
                                    }
                                }
                            }
                        });

                        link.addTo(graph);
                    }
                }
            }
        }
    });

        // Fixed rerouting function
        const reroute = debounce(() => {
            console.log('Rerouting links...');
            
            // Get all entity elements (exclude background dots and links)
            const entityElements = graph.getElements().filter(el => 
                el.get('type') !== 'background.dots' && 
                el.get('type') !== 'standard.Link'
            );
            
            // Create fresh obstacles for rerouting
            const obstacles = entityElements.map(el => {
                const bbox = el.getBBox();
                return bbox.inflate(routerPadding);
            });

            console.log('Rerouting with obstacles:', obstacles.length);

            // Update all links with new routing
            graph.getLinks().forEach(link => {
                link.router(routerType, {
                    startDirections: ['left', 'right'],
                    endDirections: ['left', 'right'],
                    step: paper.options.gridSize || 8,
                    padding: routerPadding,
                    maximumLoops: routerTries,
                    // Fixed obstacle detection for rerouting
                    isPointObstacle: (point: dia.Point) => {
                        return obstacles.some(obstacle => {
                            return obstacle.containsPoint(point);
                        });
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
    }, [graph, paper, selectedGroup, currentEntities, diagramType]);

    useEffect(() => {
        if (!selectedKey || !graph) return;
        
        // Reset all links to default styling
        graph.getLinks().forEach(link => {
            link.attr('line/stroke', '#42a5f5');
            link.attr('line/strokeWidth', 2);
            link.attr('line/targetMarker/stroke', '#42a5f5');
            link.attr('line/targetMarker/fill', '#42a5f5');
            link.attr('line/sourceMarker/stroke', '#42a5f5');
        });
        
        // Find the entity that contains the selected key
        const entityWithKey = currentEntities.find(entity => 
            entity.Attributes.some(attr => 
                attr.SchemaName === selectedKey && attr.IsPrimaryId
            )
        );
        
        if (entityWithKey) {
                    // Find all links that target this entity's key port
        const targetEntityId = graph.getElements().find(el => 
            (el.get('type') === 'delegate.entity' || el.get('type') === 'delegate.simple-entity') && 
            el.get('data')?.entity?.SchemaName === entityWithKey.SchemaName
        )?.id;
        
        if (targetEntityId) {
            if (diagramType === 'simple') {
                // For simple diagram, highlight all links to this entity
                const linksToHighlight = graph.getLinks().filter(link => {
                    const target = link.target();
                    return target.id === targetEntityId;
                });
                
                // Apply highlighting to the found links
                linksToHighlight.forEach(link => {
                    link.attr('line/stroke', '#ff6b6b'); // Red color for highlighted links
                    link.attr('line/strokeWidth', 4); // Thicker stroke for highlighted links
                });
                
                console.log(`Highlighted ${linksToHighlight.length} links targeting entity: ${entityWithKey.SchemaName}`);
            } else {
                // For detailed diagram, highlight links to specific key port
                const targetPort = `port-${selectedKey.toLowerCase()}`;
                
                const linksToHighlight = graph.getLinks().filter(link => {
                    const target = link.target();
                    return target.id === targetEntityId && target.port === targetPort;
                });
                
                // Apply highlighting to the found links
                linksToHighlight.forEach(link => {
                    link.attr('line/stroke', '#ff6b6b'); // Red color for highlighted links
                    link.attr('line/strokeWidth', 4); // Thicker stroke for highlighted links
                    link.attr('line/targetMarker/stroke', '#ff6b6b');
                    link.attr('line/targetMarker/fill', '#ff6b6b');
                    link.attr('line/sourceMarker/stroke', '#ff6b6b');
                });
                
                console.log(`Highlighted ${linksToHighlight.length} links targeting key: ${selectedKey}`);
            }
        }
    }
    }, [selectedKey, graph, currentEntities]);

    // Update entity elements when selectedKey changes
    useEffect(() => {
        if (!graph || !selectedKey) return;
        
        // Update all entity elements with the new selectedKey
        graph.getElements().forEach(el => {
            if (el.get('type') === 'delegate.entity') {
                const currentData = el.get('data');
                el.set('data', { ...currentData, selectedKey });
                
                // Trigger re-render of the entity
                const entityElement = el as EntityElement;
                if (entityElement.updateAttributes) {
                    entityElement.updateAttributes(currentData.entity);
                }
            } else if (el.get('type') === 'delegate.simple-entity') {
                // Simple entities don't need key highlighting updates
                // They don't have attributes to highlight
            }
        });
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
