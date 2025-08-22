import { dia } from "@joint/core";
import { EntityType, AttributeType, GroupType } from "@/lib/Types";

export class DiagramEntityManager {
    private graph: dia.Graph;
    private paper: dia.Paper;
    private currentEntities: EntityType[] = [];
    private diagramType: 'simple' | 'detailed' = 'simple';

    constructor(graph: dia.Graph, paper: dia.Paper) {
        this.graph = graph;
        this.paper = paper;
    }

    public getCurrentEntities(): EntityType[] {
        return [...this.currentEntities];
    }

    public setCurrentEntities(entities: EntityType[]): void {
        this.currentEntities = [...entities];
    }

    public getDiagramType(): 'simple' | 'detailed' {
        return this.diagramType;
    }

    public setDiagramType(type: 'simple' | 'detailed'): void {
        this.diagramType = type;
    }

    public addEntity(entity: EntityType, selectedAttributes?: string[]): boolean {
        if (!this.graph || !this.paper) {
            return false;
        }

        // Check if entity already exists in the diagram
        const existingEntity = this.currentEntities.find(e => e.SchemaName === entity.SchemaName);
        if (existingEntity) {
            return false; // Entity already in diagram
        }

        let initialVisibleAttributes: string[];
        
        if (selectedAttributes) {
            // Use provided selected attributes
            initialVisibleAttributes = selectedAttributes;
        } else {
            // Initialize entity with default visible attributes
            const primaryKey = entity.Attributes.find(attr => attr.IsPrimaryId);
            const customLookupAttributes = entity.Attributes.filter(attr =>
                attr.AttributeType === "LookupAttribute" && attr.IsCustomAttribute
            );
            
            initialVisibleAttributes = [
                ...(primaryKey ? [primaryKey.SchemaName] : []),
                ...customLookupAttributes.map(attr => attr.SchemaName)
            ];
        }
        
        const entityWithVisibleAttributes = {
            ...entity,
            visibleAttributeSchemaNames: initialVisibleAttributes
        };

        // Update current entities
        this.currentEntities = [...this.currentEntities, entityWithVisibleAttributes];
        return true;
    }

    public addGroup(group: GroupType, selectedAttributes?: { [entitySchemaName: string]: string[] }): EntityType[] {
        if (!this.graph || !this.paper) {
            return [];
        }

        // Filter out entities that are already in the diagram
        const newEntities = group.Entities.filter(entity => 
            !this.currentEntities.some(e => e.SchemaName === entity.SchemaName)
        );

        if (newEntities.length === 0) {
            return []; // All entities from this group are already in diagram
        }

        // Initialize new entities with provided or default visible attributes
        const entitiesWithVisibleAttributes = newEntities.map(entity => {
            let initialVisibleAttributes: string[];
            
            if (selectedAttributes && selectedAttributes[entity.SchemaName]) {
                // Use the provided selected attributes
                initialVisibleAttributes = selectedAttributes[entity.SchemaName];
            } else {
                // Fall back to default (primary key + custom lookup attributes)
                const primaryKey = entity.Attributes.find(attr => attr.IsPrimaryId);
                const customLookupAttributes = entity.Attributes.filter(attr =>
                    attr.AttributeType === "LookupAttribute" && attr.IsCustomAttribute
                );
                
                initialVisibleAttributes = [
                    ...(primaryKey ? [primaryKey.SchemaName] : []),
                    ...customLookupAttributes.map(attr => attr.SchemaName)
                ];
            }
            
            return {
                ...entity,
                visibleAttributeSchemaNames: initialVisibleAttributes
            };
        });

        // Update current entities with new entities from the group
        this.currentEntities = [...this.currentEntities, ...entitiesWithVisibleAttributes];
        return entitiesWithVisibleAttributes;
    }

    public removeEntity(entitySchemaName: string): boolean {
        if (!this.graph) {
            return false;
        }

        // Remove the entity from currentEntities state
        const initialLength = this.currentEntities.length;
        this.currentEntities = this.currentEntities.filter(entity => entity.SchemaName !== entitySchemaName);

        if (this.currentEntities.length === initialLength) {
            return false; // Entity was not found
        }

        // Find and remove the entity element from the graph
        const entityElement = this.graph.getElements().find(el => 
            (el.get('type') === 'delegate.entity' || el.get('type') === 'delegate.simple-entity') && 
            el.get('data')?.entity?.SchemaName === entitySchemaName
        );

        if (entityElement) {
            // Remove all links connected to this entity
            const connectedLinks = this.graph.getConnectedLinks(entityElement);
            connectedLinks.forEach(link => link.remove());
            
            // Remove the entity element
            entityElement.remove();
        }

        return true;
    }

    public addAttributeToEntity(entitySchemaName: string, attribute: AttributeType): boolean {
        // Update the currentEntities state
        let updated = false;
        this.currentEntities = this.currentEntities.map(entity => {
            if (entity.SchemaName === entitySchemaName) {
                const visibleAttrs = entity.visibleAttributeSchemaNames || [];
                if (!visibleAttrs.includes(attribute.SchemaName)) {
                    updated = true;
                    return {
                        ...entity,
                        visibleAttributeSchemaNames: [...visibleAttrs, attribute.SchemaName]
                    };
                }
            }
            return entity;
        });

        return updated;
    }

    public removeAttributeFromEntity(entitySchemaName: string, attribute: AttributeType): boolean {
        // Update the currentEntities state
        let updated = false;
        this.currentEntities = this.currentEntities.map(entity => {
            if (entity.SchemaName === entitySchemaName) {
                const visibleAttrs = entity.visibleAttributeSchemaNames || [];
                if (visibleAttrs.includes(attribute.SchemaName)) {
                    updated = true;
                    return {
                        ...entity,
                        visibleAttributeSchemaNames: visibleAttrs.filter(attr => attr !== attribute.SchemaName)
                    };
                }
            }
            return entity;
        });

        return updated;
    }

    public getEntityBySchemaName(schemaName: string): EntityType | undefined {
        return this.currentEntities.find(entity => entity.SchemaName === schemaName);
    }

    public clearAllEntities(): void {
        this.currentEntities = [];
    }

    public hasEntity(entitySchemaName: string): boolean {
        return this.currentEntities.some(entity => entity.SchemaName === entitySchemaName);
    }
}
