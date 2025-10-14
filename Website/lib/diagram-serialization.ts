import { dia } from '@joint/core';

interface SerializedEntity {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    label: string;
}

export interface SerializedDiagram {
    id: string;
    name: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    metadata: {
        zoom: number;
        translate: { x: number; y: number };
        canvasSize: { width: number; height: number };
    };
    entities: SerializedEntity[];
}

export class DiagramSerializationService {
    static serializeDiagram(
        graph: dia.Graph | null,
        zoom: number,
        translate: { x: number; y: number }
    ): SerializedDiagram {
        if (!graph) {
            throw new Error('No diagram graph available');
        }

        const cells = graph.getCells();
        const entities: SerializedEntity[] = [];

        cells.forEach((cell) => {
            if (cell.isElement()) {
                // This is an entity/element
                const element = cell as dia.Element;
                const position = element.position();
                const size = element.size();
                const attrs = element.attributes.attrs || {};
                
                entities.push({
                    id: element.id.toString(),
                    type: element.attributes.type || 'standard.Rectangle',
                    position: { x: position.x, y: position.y },
                    size: { width: size.width, height: size.height },
                    label: attrs.label?.text || attrs.body?.text || `Entity ${entities.length + 1}`
                });
            }
        });

        return {
            id: crypto.randomUUID(),
            name: `Diagram_${new Date().toISOString().split('T')[0]}`,
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
                zoom,
                translate,
                canvasSize: { width: 1920, height: 1080 } // Default canvas size
            },
            entities
        };
    }

    static async saveDiagram(diagramData: SerializedDiagram): Promise<object> {
        const response = await fetch('/api/diagram/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(diagramData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save diagram');
        }

        return response.json();
    }
}