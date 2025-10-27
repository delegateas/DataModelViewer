import { dia } from "@joint/core";
import { EntityElement } from "../diagram-elements/EntityElement";
import { EntityType } from "@/lib/Types";

export class SmartLayout {
    private paper: dia.Paper;
    private elements: InstanceType<typeof EntityElement>[];
    private gridSpacing: number = 180; // Space between entities
    private centerOffset: number = 40; // Extra space around center entity

    constructor(paper: dia.Paper, elements: InstanceType<typeof EntityElement>[]) {
        this.paper = paper;
        this.elements = elements;
    }

    /**
     * Arranges entities with the most connected entity in the center
     * and others in a grid layout around it
     */
    public applyLayout(): void {
        if (this.elements.length === 0) return;

        if (this.elements.length === 1) {
            // Single entity - place in center of paper
            this.placeSingleEntity();
            return;
        }

        // Find the entity with the most relationships
        const centerEntity = this.findMostConnectedEntity();
        
        // Get remaining entities (excluding center)
        const remainingEntities = this.elements.filter(el => el.id !== centerEntity.id);
        
        // Calculate paper center
        const paperSize = this.paper.getComputedSize();
        const paperCenter = {
            x: paperSize.width / 2,
            y: paperSize.height / 2
        };

        // Place center entity
        this.positionEntity(centerEntity, paperCenter);

        // Arrange remaining entities in a grid around the center
        this.arrangeEntitiesInGrid(remainingEntities, paperCenter);
    }

    /**
     * Places a single entity in the center of the paper
     */
    private placeSingleEntity(): void {
        const paperSize = this.paper.getComputedSize();
        const center = {
            x: paperSize.width / 2,
            y: paperSize.height / 2
        };
        this.positionEntity(this.elements[0], center);
    }

    /**
     * Finds the entity with the most relationships
     */
    private findMostConnectedEntity(): InstanceType<typeof EntityElement> {
        let maxConnections = -1;
        let mostConnectedEntity = this.elements[0];

        for (const element of this.elements) {
            const entityData = element.get('entityData') as EntityType;
            const connectionCount = entityData?.Relationships?.length || 0;
            
            if (connectionCount > maxConnections) {
                maxConnections = connectionCount;
                mostConnectedEntity = element;
            }
        }

        return mostConnectedEntity;
    }

    /**
     * Arranges entities in a grid pattern around a center point
     */
    private arrangeEntitiesInGrid(entities: InstanceType<typeof EntityElement>[], centerPoint: { x: number; y: number }): void {
        if (entities.length === 0) return;

        // Calculate grid dimensions - try to make it roughly square
        const gridSize = Math.ceil(Math.sqrt(entities.length));
        
        // Calculate starting position (top-left of the grid)
        const totalGridWidth = (gridSize - 1) * this.gridSpacing;
        const totalGridHeight = (gridSize - 1) * this.gridSpacing;
        
        const startX = centerPoint.x - totalGridWidth / 2;
        const startY = centerPoint.y - totalGridHeight / 2 - this.centerOffset;

        let entityIndex = 0;
        
        for (let row = 0; row < gridSize && entityIndex < entities.length; row++) {
            for (let col = 0; col < gridSize && entityIndex < entities.length; col++) {
                // Skip the center position if it would conflict with center entity
                const gridX = startX + col * this.gridSpacing;
                const gridY = startY + row * this.gridSpacing;
                
                // Check if this position is too close to center
                const distanceFromCenter = Math.sqrt(
                    Math.pow(gridX - centerPoint.x, 2) + Math.pow(gridY - centerPoint.y, 2)
                );
                
                if (distanceFromCenter < this.gridSpacing * 0.8) {
                    // Skip this position if too close to center
                    continue;
                }

                const entity = entities[entityIndex];
                this.positionEntity(entity, { x: gridX, y: gridY });
                entityIndex++;
            }
        }

        // If we have entities left (because we skipped center positions), place them in a spiral
        if (entityIndex < entities.length) {
            this.arrangeSpiralLayout(entities.slice(entityIndex), centerPoint, gridSize);
        }
    }

    /**
     * Arranges remaining entities in a spiral pattern for overflow
     */
    private arrangeSpiralLayout(entities: InstanceType<typeof EntityElement>[], centerPoint: { x: number; y: number }, gridSize: number): void {
        const spiralRadius = (gridSize + 1) * this.gridSpacing / 2;
        const angleStep = (2 * Math.PI) / entities.length;

        entities.forEach((entity, index) => {
            const angle = index * angleStep;
            const x = centerPoint.x + spiralRadius * Math.cos(angle);
            const y = centerPoint.y + spiralRadius * Math.sin(angle);
            
            this.positionEntity(entity, { x, y });
        });
    }

    /**
     * Positions an entity at the specified coordinates (centered)
     */
    private positionEntity(entity: InstanceType<typeof EntityElement>, position: { x: number; y: number }): void {
        const entitySize = entity.get('size') || { width: 120, height: 80 };
        const centeredPosition = {
            x: position.x - entitySize.width / 2,
            y: position.y - entitySize.height / 2
        };
        
        entity.set('position', centeredPosition);
    }

    /**
     * Sets custom grid spacing
     */
    public setGridSpacing(spacing: number): void {
        this.gridSpacing = spacing;
    }

    /**
     * Sets custom center offset
     */
    public setCenterOffset(offset: number): void {
        this.centerOffset = offset;
    }

    /**
     * Gets statistics about entity connections for debugging
     */
    public getConnectionStats(): Array<{ entityName: string; connectionCount: number }> {
        return this.elements.map(element => {
            const entityData = element.get('entityData') as EntityType;
            return {
                entityName: entityData?.DisplayName || entityData?.SchemaName || 'Unknown',
                connectionCount: entityData?.Relationships?.length || 0
            };
        });
    }
}