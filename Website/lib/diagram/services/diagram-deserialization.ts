import { dia } from '@joint/core';
import { SerializedDiagram } from '../models/serialized-diagram';
import { SerializedEntity } from '../models/serialized-entity';
import { createEntity } from '@/components/diagramview/diagram-elements/EntityElement';
import { createRelationshipLink } from '@/components/diagramview/diagram-elements/RelationshipLink';
import { getAllRelationshipsBetween } from '../relationship-helpers';
import { EntityType } from '@/lib/Types';

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
        getEntityDataBySchemaName: (schemaName: string) => EntityType | undefined,
        applyZoomAndPan: (zoom: number, translate: { x: number; y: number }) => void,
        setLoadedDiagram: (filename: string | null, source: 'cloud' | 'file' | null, filePath?: string | null) => void,
        addEntityToDiagram: (entity: EntityType) => void,
        filename: string,
        source: 'cloud' | 'file',
        filePath?: string,
        addExcludedLink?: (sourceSchemaName: string, targetSchemaName: string, linkId: string, sourceId: string, targetId: string, relationshipInformationList: any[]) => void
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
            const data = getEntityDataBySchemaName(entityData.schemaName);
            if (!data) {
                console.warn(`Entity data not found for schema: ${entityData.schemaName}`);
                return;
            }

            const entity = createEntity({
                position: entityData.position,
                size: entityData.size,
                title: entityData.label,
                entityData: data
            });
            entity.set('id', entityData.id);
            addEntityToDiagram(data);

            graph.addCell(entity);
        });

        // Recreate links with relationship information (if available)
        if (diagramData.links && diagramData.links.length > 0) {
            diagramData.links.forEach((linkData) => {
                const source = getEntityDataBySchemaName(linkData.sourceSchemaName);
                const target = getEntityDataBySchemaName(linkData.targetSchemaName);

                if (!source || !target) {
                    console.warn(`Source or target entity not found for link: ${linkData.sourceSchemaName} -> ${linkData.targetSchemaName}`);
                    return;
                }

                const relations = getAllRelationshipsBetween(source, target).map((rel) => {
                    const relInfo = linkData.relationships.find(r => r.schemaName === rel.RelationshipSchemaName);
                    return {
                        ...rel,
                        isIncluded: relInfo ? relInfo.isIncluded : undefined
                    };
                });

                // Check if all relationships are excluded
                const allExcluded = relations.every(rel => rel.isIncluded === false);

                if (allExcluded && addExcludedLink) {
                    // Don't add to graph, add to excluded links instead
                    addExcludedLink(
                        linkData.sourceSchemaName,
                        linkData.targetSchemaName,
                        linkData.id,
                        linkData.sourceId,
                        linkData.targetId,
                        relations
                    );
                } else {
                    // Add the link to the graph
                    const link = createRelationshipLink(
                        linkData.sourceId,
                        linkData.sourceSchemaName,
                        linkData.targetId,
                        linkData.targetSchemaName,
                        relations
                    );
                    link.set('id', linkData.id);

                    graph.addCell(link);
                }
            });
        }
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