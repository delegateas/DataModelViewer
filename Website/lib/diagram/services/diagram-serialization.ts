import { dia } from '@joint/core';
import { SerializedEntity } from '../models/serialized-entity';
import { SerializedDiagram } from '../models/serialized-diagram';
import { SerializedLink } from '../models/serialized-link';
import { RelationshipInformation } from '../models/relationship-information';
import { EntityElement } from '@/components/diagramview/diagram-elements/EntityElement';
import { RelationshipLink } from '@/components/diagramview/diagram-elements/RelationshipLink';

export class DiagramSerializationService {
    static serializeDiagram(
        graph: dia.Graph | null,
        zoom: number,
        translate: { x: number; y: number },
        diagramName: string
    ): SerializedDiagram {
        if (!graph) {
            throw new Error('No diagram graph available');
        }

        const cells = graph.getCells();
        const entities: SerializedEntity[] = [];
        const links: SerializedLink[] = [];

        cells.forEach((cell) => {
            if (cell.isElement()) {
                // This is an entity/element
                const element = cell as EntityElement;
                const position = element.position();
                const size = element.size();
                const attrs = element.attributes.attrs || {};

                entities.push({
                    id: element.id.toString(),
                    type: element.attributes.type || 'standard.Rectangle',
                    position: { x: position.x, y: position.y },
                    size: { width: size.width, height: size.height },
                    label: attrs.label?.text || attrs.body?.text || `Entity ${entities.length + 1}`,
                    schemaName: element.get('entityData').SchemaName
                });
            } else if (cell.isLink()) {
                // This is a link/relationship
                const link = cell as RelationshipLink;
                const source = link.get('source');
                const target = link.get('target');
                const relationshipInformationList = link.get('relationshipInformationList') as RelationshipInformation[] || [];

                // Only save links that have relationship information
                if (relationshipInformationList.length > 0 && source?.id && target?.id) {
                    links.push({
                        id: link.id.toString(),
                        sourceId: source.id.toString(),
                        sourceSchemaName: link.get('sourceSchemaName'),
                        targetId: target.id.toString(),
                        targetSchemaName: link.get('targetSchemaName'),
                        relationships: relationshipInformationList.map((relInfo) => ({
                            schemaName: relInfo.RelationshipSchemaName,
                            isIncluded: relInfo.isIncluded
                        }))
                    });
                }
            }
        });

        return {
            id: crypto.randomUUID(),
            name: diagramName,
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
                zoom,
                translate,
                canvasSize: { width: 1920, height: 1080 } // Default canvas size
            },
            entities,
            links
        };
    }

    static async saveDiagram(diagramData: SerializedDiagram, overwriteFilePath?: string): Promise<object> {
        const requestBody = overwriteFilePath
            ? { ...diagramData, overwriteFilePath }
            : diagramData;

        const response = await fetch('/api/diagram/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save diagram');
        }

        return response.json();
    }

    static downloadDiagramAsJson(diagramData: SerializedDiagram): { fileName: string; success: boolean } {
        try {
            const jsonString = JSON.stringify(diagramData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            // Create a download URL
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `${diagramData.name}_${timestamp}.json`;

            // Create a temporary anchor element and trigger download
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName;
            anchor.style.display = 'none';

            // Append to body, click, and remove
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);

            // Clean up the URL object
            URL.revokeObjectURL(url);

            return { fileName, success: true };
        } catch (error) {
            console.error('Error downloading diagram as JSON:', error);
            throw new Error('Failed to download diagram file');
        }
    }
}