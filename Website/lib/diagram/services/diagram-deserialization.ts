import { dia, shapes } from '@joint/core';
import { SerializedDiagram } from '../models/serialized-diagram';
import { SerializedEntity } from '../models/serialized-entity';

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
        setZoom: (zoom: number) => void,
        setTranslate: (translate: { x: number; y: number }) => void,
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

        // Restore zoom and pan
        setZoom(diagramData.metadata.zoom);
        setTranslate(diagramData.metadata.translate);

        // Set loaded diagram info
        setLoadedDiagram(filename, source, filePath);

        // Theme-aware entity colors using MUI CSS variables (same as addEntity)
        const colors = [
            { fill: 'var(--mui-palette-primary-main)', stroke: 'var(--mui-palette-primary-dark)' },
            { fill: 'var(--mui-palette-success-main)', stroke: 'var(--mui-palette-success-dark)' },
            { fill: 'var(--mui-palette-warning-main)', stroke: 'var(--mui-palette-warning-dark)' },
            { fill: 'var(--mui-palette-error-main)', stroke: 'var(--mui-palette-error-dark)' },
            { fill: 'var(--mui-palette-secondary-main)', stroke: 'var(--mui-palette-secondary-dark)' },
            { fill: 'var(--mui-palette-info-main)', stroke: 'var(--mui-palette-info-dark)' },
        ];
        
        const textColor = 'var(--mui-palette-primary-contrastText)';

        // Recreate entities
        diagramData.entities.forEach((entityData: SerializedEntity, index: number) => {
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];

            const rect = new shapes.standard.Rectangle({
                id: entityData.id,
                position: entityData.position,
                size: entityData.size,
                attrs: {
                    body: {
                        fill: color.fill,
                        stroke: color.stroke,
                        strokeWidth: 2,
                        rx: 8,
                        ry: 8
                    },
                    label: {
                        text: entityData.label,
                        fill: textColor,
                        fontSize: 14,
                        fontFamily: 'Arial, sans-serif'
                    }
                }
            });

            graph.addCell(rect);
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