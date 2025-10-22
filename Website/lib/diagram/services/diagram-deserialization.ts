import { dia } from '@joint/core';
import { SerializedDiagram } from '../models/serialized-diagram';
import { SerializedEntity } from '../models/serialized-entity';
import { EntityElement } from '@/components/diagramview/diagram-elements/EntityElement';

export interface DiagramFile {
    path: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    size: number;
}

export class DiagramDeserializationService {
    static async loadDiagramFromCloud(filePath: string): Promise<SerializedDiagram> {
        const response = await fetch('/api/diagram/load', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load diagram');
        }

        return response.json();
    }

    static async getAvailableDiagrams(): Promise<DiagramFile[]> {
        const response = await fetch('/api/diagram/list');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get diagram list');
        }

        return response.json();
    }

    static deserializeDiagram(
        diagramData: SerializedDiagram,
        graph: dia.Graph | null,
        applyZoomAndPan: (zoom: number, translate: { x: number; y: number }) => void,
        setLoadedDiagram: (filename: string | null, source: 'cloud' | 'file' | null, filePath?: string | null) => void,
        filename: string,
        source: 'cloud' | 'file',
        filePath?: string
    ): void {
        if (!graph) {
            throw new Error('No diagram graph available for deserialization');
        }

        // Clear existing diagram
        graph.clear();

        // Restore zoom and pan - apply directly to the paper
        applyZoomAndPan(diagramData.metadata.zoom, diagramData.metadata.translate);

        // Set loaded diagram info
        setLoadedDiagram(filename, source, filePath);

        // Recreate entities
        diagramData.entities.forEach((entityData: SerializedEntity) => {

            const entity = new EntityElement({
                id: entityData.id,
                position: entityData.position,
                size: entityData.size,
                title: entityData.label
            });

            graph.addCell(entity);
        });
    }

    static loadDiagramFromFile(file: File): Promise<SerializedDiagram> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const diagramData = JSON.parse(content) as SerializedDiagram;
                    
                    // Validate the diagram data structure
                    if (!diagramData.id || !diagramData.entities || !diagramData.metadata) {
                        throw new Error('Invalid diagram file format');
                    }
                    
                    resolve(diagramData);
                } catch (error) {
                    reject(new Error(`Failed to parse diagram file: ${error instanceof Error ? error.message : 'Unknown error'}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read diagram file'));
            };
            
            reader.readAsText(file);
        });
    }
}