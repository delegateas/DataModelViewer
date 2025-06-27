'use client';

import React, { useEffect, useRef, useState } from 'react'
import { dia, shapes, util } from '@joint/core'
import { Groups } from "../generated/Data"
import { EntityElement } from '@/components/diagram/entity/entity';
import debounce from 'lodash/debounce';

interface IDiagramView {}

const routerType = "manhattan"
const routerPadding = 16;
const routerTries = 5000;
const routerDirections = 90;

export default function DiagramView({ }: IDiagramView) {
    const paperRef = useRef<HTMLDivElement>(null);
    const graphInstance = useRef(new dia.Graph());

    const [selectedKey, setSelectedKey] = useState<string>();

    const entityData = Groups[1].Entities;

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
    }, [])

    useEffect(() => {
        if (!paperRef.current) return;
        if (!graphInstance?.current) return;
        const paper = new dia.Paper({
            el: paperRef.current,
            model: graphInstance?.current,
            width: 1920,
            height: 1080,
            gridSize: 8,
            background: { color: '#F8F9FA' },
        });

        // Store entity elements and port maps by SchemaName for easy lookup
        const entityMap = new Map();

        // Entities
        for (const entity of entityData) {
            const { visibleItems, portMap } = EntityElement.getVisibleItemsAndPorts(entity);
            const entityElement = new EntityElement({
                position: { x: 50, y: 50 },
                data: { entity, setSelectedKey }
            });
            entityElement.addTo(graphInstance.current);
            entityMap.set(entity.SchemaName, { element: entityElement, portMap });
        }
        
        util.nextFrame(() => {
            const allElements = graphInstance.current.getElements();
            const obstacles = allElements.map(el => el.getBBox().inflate(routerPadding));

            for (const entity of entityData) {
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

                        link.addTo(graphInstance.current);
                    }
                }
            }
        });

        const reroute = debounce(() => {
            const elements = graphInstance.current.getElements().filter(el => el.get('type') !== 'standard.Link');
            const obstacles = elements.map(el => {
                const bbox = el.getBBox();
                const inflated = bbox.inflate(routerPadding);
                return inflated;
            });

            graphInstance.current.getLinks().forEach(link => {
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
        graphInstance.current.on('change:position change:size change:attrs.line', reroute);

        return () => {
            paper.remove();
        };
    }, [paperRef.current]);

    useEffect(() =>{
        if (!selectedKey || !graphInstance.current) return;
        console.log(graphInstance.current.getLinks())
        // const links = graphInstance.current.getLinks().filter(link => link.target().id === selectedKey);
    }, [selectedKey])

    return (
        <>
            <div ref={paperRef} className='border border-black' />
        </>
    );
}
