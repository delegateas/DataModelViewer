'use client';

import React, { useEffect, useRef } from 'react'
import { dia } from '@joint/core'
import { Groups } from "../generated/Data"
import { EntityElement } from '@/components/diagram/entity/entity';
import { Link } from 'lucide-react';
import { title } from 'process';

interface IDiagramView {}

export default function DiagramView({ }: IDiagramView) {
    const paperRef = useRef<HTMLDivElement>(null);

    const subSet = ["account"]//,"contact","opportunity","systemuser","team"]
    const entityData = Groups[1].Entities.filter(e => subSet.includes(e.SchemaName.toLowerCase()));

    useEffect(() => {
        if (!paperRef.current) return;
        const graph = new dia.Graph();
        const paper = new dia.Paper({
            el: paperRef.current,
            model: graph,
            gridSize: 10,
            background: { color: '#F8F9FA' },
        });

        // Entities
        for (const entity of entityData) {
            
            const entityElement = new EntityElement({
                position: { x: 50, y: 50 },
                data: entity
            });
            entityElement.addTo(graph);
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
