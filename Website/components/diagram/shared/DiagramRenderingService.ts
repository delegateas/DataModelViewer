import { dia, util } from '@joint/core';
import { EntityType } from '@/lib/Types';
import { DiagramEntityManager } from './DiagramEntityManager';
import { DiagramElementManager } from './DiagramElementManager';
import { calculateGridLayout, getDefaultLayoutOptions, calculateEntityHeight, estimateEntityDimensions } from '../GridLayoutManager';
import { DiagramRenderer } from '../DiagramRenderer';

/**
 * Service responsible for rendering and re-rendering diagrams
 * Coordinates between entity management, element management, and layout services
 */
export class DiagramRenderingService {
    private entityManager: DiagramEntityManager;
    private elementManager: DiagramElementManager;
    private graph: dia.Graph;
    private paper: dia.Paper;
    
    // Persistent position tracking for entities
    private entityPositions = new Map<string, { x: number; y: number }>();

    constructor(
        graph: dia.Graph, 
        paper: dia.Paper, 
        entityManager: DiagramEntityManager, 
        elementManager: DiagramElementManager
    ) {
        this.graph = graph;
        this.paper = paper;
        this.entityManager = entityManager;
        this.elementManager = elementManager;
    }

    /**
     * Main rendering method that handles entity positioning and relationship creation
     * Uses manager classes to handle their respective responsibilities
     */
    public renderDiagram(renderer: DiagramRenderer, fitToScreen: () => void, setIsLoading: (loading: boolean) => void): void {
        if (!this.graph || !this.paper || !renderer) {
            return;
        }

        const currentEntities = this.entityManager.getCurrentEntities();
        const diagramType = this.entityManager.getDiagramType();

        // Set loading state when starting diagram creation
        setIsLoading(true);

        // If there are no entities, set loading to false immediately
        if (currentEntities.length === 0) {
            setIsLoading(false);
            return;
        }

        // Step 1: Preserve non-entity elements using DiagramElementManager
        const preservedElements = this.preserveNonEntityElements();

        // Step 2: Update position tracking with current entity positions
        this.updateEntityPositionTracking();

        // Step 3: Clean up position tracking for removed entities
        this.cleanupRemovedEntityPositions(currentEntities);

        // Step 4: Clear existing elements using DiagramElementManager
        this.elementManager.clearAllElements();

        // Step 5: Restore preserved elements using DiagramElementManager
        this.restorePreservedElements(preservedElements);

        // Step 6: Calculate layout for new entities
        const layoutResult = this.calculateEntityLayout(currentEntities, diagramType);

        // Step 7: Create entities using the renderer and layout positions
        const entityMap = this.createEntities(currentEntities, layoutResult, renderer);

        // Step 8: Create relationships between entities
        this.createEntityRelationships(currentEntities, entityMap, renderer);

        // Step 9: Auto-fit and complete loading
        setTimeout(() => {
            fitToScreen();
            setIsLoading(false);
        }, 200);
    }

    /**
     * Preserves squares, text elements, and existing entity positions before clearing
     */
    private preserveNonEntityElements() {
        const squares = this.elementManager.getElementsByType('delegate.square');
        const textElements = this.elementManager.getElementsByType('delegate.text');
        const entityElements = this.graph.getElements().filter(element => {
            const entityData = element.get('data');
            return entityData?.entity; // This is an entity element
        });

        const squareData = squares.map(square => ({
            element: square,
            data: square.get('data'),
            position: square.position(),
            size: square.size()
        }));

        const textData = textElements.map(textElement => ({
            element: textElement,
            data: textElement.get('data'),
            position: textElement.position(),
            size: textElement.size()
        }));

        return { squareData, textData, entityElements };
    }

    /**
     * Updates persistent position tracking with current positions
     */
    private updateEntityPositionTracking() {
        const entityElements = this.graph.getElements().filter(element => {
            const entityData = element.get('data');
            return entityData?.entity; // This is an entity element
        });

        entityElements.forEach(element => {
            const entityData = element.get('data');
            if (entityData?.entity?.SchemaName) {
                const position = element.position();
                this.entityPositions.set(entityData.entity.SchemaName, position);
            }
        });
    }

    /**
     * Cleans up position tracking for entities that are no longer in currentEntities
     */
    private cleanupRemovedEntityPositions(currentEntities: EntityType[]) {
        const currentEntityNames = new Set(currentEntities.map(e => e.SchemaName));
        for (const [schemaName] of this.entityPositions) {
            if (!currentEntityNames.has(schemaName)) {
                this.entityPositions.delete(schemaName);
            }
        }
    }

    /**
     * Restores preserved elements after clearing
     */
    private restorePreservedElements(preservedElements: any) {
        const { squareData, textData } = preservedElements;

        // Re-add preserved squares with their data
        squareData.forEach(({ element, data, position, size }: any) => {
            element.addTo(this.graph);
            element.position(position.x, position.y);
            element.resize(size.width, size.height);
            element.set('data', data);
            element.toBack(); // Keep squares at the back
        });

        // Re-add preserved text elements with their data
        textData.forEach(({ element, data, position, size }: any) => {
            element.addTo(this.graph);
            element.position(position.x, position.y);
            element.resize(size.width, size.height);
            element.set('data', data);
            element.toFront(); // Keep text elements at the front
        });
    }

    /**
     * Calculates layout for new entities using GridLayoutManager
     */
    private calculateEntityLayout(currentEntities: EntityType[], diagramType: string) {
        // Get layout options using GridLayoutManager
        const layoutOptions = getDefaultLayoutOptions(diagramType as any);
        
        // Get actual container dimensions
        const containerRect = this.paper?.el?.getBoundingClientRect();
        const actualContainerWidth = containerRect?.width || layoutOptions.containerWidth;
        const actualContainerHeight = containerRect?.height || layoutOptions.containerHeight;
        
        // Update layout options with actual container dimensions
        const updatedLayoutOptions = {
            ...layoutOptions,
            containerWidth: actualContainerWidth,
            containerHeight: actualContainerHeight,
            diagramType: diagramType as any
        };

        // Separate new entities from existing ones
        const newEntities = currentEntities.filter(entity => 
            !this.entityPositions.has(entity.SchemaName)
        );
        const existingEntitiesWithPositions = currentEntities.filter(entity => 
            this.entityPositions.has(entity.SchemaName)
        );

        // Track positions of existing entities for collision avoidance
        const placedEntityPositions: { x: number; y: number; width: number; height: number }[] = [];
        existingEntitiesWithPositions.forEach(entity => {
            const position = this.entityPositions.get(entity.SchemaName);
            if (position) {
                const dimensions = estimateEntityDimensions(entity, diagramType as any);
                placedEntityPositions.push({
                    x: position.x,
                    y: position.y,
                    width: dimensions.width,
                    height: dimensions.height
                });
            }
        });

        // Calculate grid layout for new entities
        let layout = { positions: [] as { x: number; y: number }[] };
        if (newEntities.length > 0) {
            // Calculate actual heights for new entities
            const entityHeights = newEntities.map(entity => calculateEntityHeight(entity, diagramType as any));
            const maxEntityHeight = Math.max(...entityHeights, layoutOptions.entityHeight);
            
            const adjustedLayoutOptions = {
                ...updatedLayoutOptions,
                entityHeight: maxEntityHeight,
                diagramType: diagramType as any
            };
            
            layout = calculateGridLayout(newEntities, adjustedLayoutOptions, placedEntityPositions);
        }

        return {
            newEntities,
            existingEntitiesWithPositions,
            layout
        };
    }

    /**
     * Creates entities using the renderer and layout positions
     */
    private createEntities(currentEntities: EntityType[], layoutResult: any, renderer: DiagramRenderer) {
        const { newEntities, existingEntitiesWithPositions, layout } = layoutResult;
        const entityMap = new Map();

        // First, create existing entities with their preserved positions
        existingEntitiesWithPositions.forEach((entity: EntityType) => {
            const position = this.entityPositions.get(entity.SchemaName);
            if (!position) return; // Skip if position is undefined
            
            const { element, portMap } = renderer.createEntity(entity, position);
            entityMap.set(entity.SchemaName, { element, portMap });
        });

        // Then, create new entities with grid layout positions
        newEntities.forEach((entity: EntityType, index: number) => {
            const position = layout.positions[index] || { x: 50, y: 50 };
            const { element, portMap } = renderer.createEntity(entity, position);
            entityMap.set(entity.SchemaName, { element, portMap });
            
            // Update persistent position tracking for newly placed entities
            this.entityPositions.set(entity.SchemaName, position);
        });

        return entityMap;
    }

    /**
     * Creates relationships between entities
     */
    private createEntityRelationships(currentEntities: EntityType[], entityMap: Map<any, any>, renderer: DiagramRenderer) {
        util.nextFrame(() => {
            currentEntities.forEach(entity => {
                renderer.createLinks(entity, entityMap, currentEntities);
            });
        });
    }

    /**
     * Gets the current entity positions for external access
     */
    public getEntityPositions(): Map<string, { x: number; y: number }> {
        return new Map(this.entityPositions);
    }

    /**
     * Sets entity positions (useful for loading saved diagrams)
     */
    public setEntityPositions(positions: Map<string, { x: number; y: number }>): void {
        this.entityPositions = new Map(positions);
    }

    /**
     * Clears all entity positions
     */
    public clearEntityPositions(): void {
        this.entityPositions.clear();
    }
}
