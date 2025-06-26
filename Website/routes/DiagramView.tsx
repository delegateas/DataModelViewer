'use client';

import React, { useEffect, useRef } from 'react'
import { dia, routers, shapes } from '@joint/core'
import { Groups } from "../generated/Data"
import { EntityElement } from '@/components/diagram/entity/entity';
import { Link } from 'lucide-react';
import { title } from 'process';

interface IDiagramView {}

export default function DiagramView({ }: IDiagramView) {
    const paperRef = useRef<HTMLDivElement>(null);

    const entityData = Groups[1].Entities;
    console.log(entityData)

    useEffect(() => {
        if (!paperRef.current) return;
        const graph = new dia.Graph();
        const paper = new dia.Paper({
            el: paperRef.current,
            model: graph,
            width: 1920,
            height: 1080,
            gridSize: 10,
            background: { color: '#F8F9FA' },
        });

        // Store entity elements and port maps by SchemaName for easy lookup
        const entityMap = new Map();

        // Entities
        for (const entity of entityData) {
            const { visibleItems, portMap } = EntityElement.getVisibleItemsAndPorts(entity);
            const entityElement = new EntityElement({
                position: { x: 50, y: 50 },
                data: entity
            });
            entityElement.addTo(graph);
            entityMap.set(entity.SchemaName, { element: entityElement, portMap });
        }

        console.log(entityMap)

        // Create links for lookups
        for (const entity of entityData) {
            const entityInfo = entityMap.get(entity.SchemaName);
            if (!entityInfo) continue;
            const { portMap } = entityInfo;
            const { visibleItems } = EntityElement.getVisibleItemsAndPorts(entity);
            // Start from index 1 (0 is key)
            for (let i = 1; i < visibleItems.length; i++) {
                const attr = visibleItems[i];
                if (attr.AttributeType !== "LookupAttribute") continue;
                // For each target entity in the lookup
                for (const target of attr.Targets) {
                    const targetInfo = entityMap.get(target.Name);
                    if (!targetInfo) continue;
                    const sourcePort = portMap[attr.SchemaName.toLowerCase()];
                    const targetPort = targetInfo.portMap[`${target.Name.toLowerCase()}id`];
                    const sourceId = entityInfo.element.id;
                    const targetId = targetInfo.element.id;
                
                    if (!sourcePort || !targetPort) {
                        console.warn("Missing port:", { sourcePort, targetPort, attr, target });
                        continue;
                    }
                    if (!sourceId || !targetId) {
                        console.warn("Missing element id:", { sourceId, targetId, entityInfo, targetInfo });
                        continue;
                    }

                    const link = new shapes.standard.Link({
                        source: { id: entityInfo.element.id, port: sourcePort },
                        target: { id: targetInfo.element.id, port: targetPort },
                        router: {
                            name: 'rightAngle',
                            args: { 
                                margin: 32,
                                sourceDirection: routers.rightAngle.Directions.RIGHT,
                                targetDirection: routers.rightAngle.Directions.LEFT
                            }
                        },
                        connector: { name: 'rounded' },
                        attrs: {
                            line: {
                                stroke: '#6366f1',
                                strokeWidth: 2,
                                targetMarker: {
                                    'type': 'path',
                                    'd': 'M 10 -5 L 0 0 L 10 5 Z',
                                    'fill': '#6366f1',
                                    'stroke': '#6366f1',
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

        return () => {
            paper.remove();
        };
    }, [paperRef.current]);

    return (
        <>
            <div ref={paperRef} className='border border-black' />
        </>
    );
}
