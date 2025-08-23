import { dia, util } from '@joint/core';
import { EntityType } from '@/lib/Types';
import { DiagramEntityManager } from './DiagramEntityManager';
import { DiagramElementManager } from './DiagramElementManager';
import { calculateGridLayout, getDefaultLayoutOptions, calculateEntityHeight, estimateEntityDimensions } from './GridLayoutManager';
import { DiagramRenderer } from '../renderers/DiagramRenderer';

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
        const totalStartTime = performance.now();
        console.log('🎯 Starting diagram rendering...');
        this.logPerformanceContext();

        if (!this.graph || !this.paper || !renderer) {
            console.log('❌ Missing required dependencies for rendering');
            return;
        }

        const currentEntities = this.entityManager.getCurrentEntities();
        const diagramType = this.entityManager.getDiagramType();
        console.log(`📊 Rendering ${currentEntities.length} entities in ${diagramType} mode`);

        // Set loading state when starting diagram creation
        setIsLoading(true);

        // If there are no entities, set loading to false immediately
        if (currentEntities.length === 0) {
            console.log('⚠️ No entities to render');
            setIsLoading(false);
            return;
        }

        // Step 1: Preserve non-entity elements using DiagramElementManager
        let stepStartTime = performance.now();
        const preservedElements = this.preserveNonEntityElements();
        console.log(`⏱️ Step 1 - Preserve elements: ${(performance.now() - stepStartTime).toFixed(2)}ms`);

        // Step 2: Update position tracking with current entity positions
        stepStartTime = performance.now();
        this.updateEntityPositionTracking();
        console.log(`⏱️ Step 2 - Update position tracking: ${(performance.now() - stepStartTime).toFixed(2)}ms`);

        // Step 3: Clean up position tracking for removed entities
        stepStartTime = performance.now();
        this.cleanupRemovedEntityPositions(currentEntities);
        console.log(`⏱️ Step 3 - Cleanup positions: ${(performance.now() - stepStartTime).toFixed(2)}ms`);

        // Step 4: Clear existing elements using DiagramElementManager
        stepStartTime = performance.now();
        this.elementManager.clearAllElements();
        console.log(`⏱️ Step 4 - Clear elements: ${(performance.now() - stepStartTime).toFixed(2)}ms`);

        // Step 5: Restore preserved elements using DiagramElementManager
        stepStartTime = performance.now();
        this.restorePreservedElements(preservedElements);
        console.log(`⏱️ Step 5 - Restore elements: ${(performance.now() - stepStartTime).toFixed(2)}ms`);

        // Step 6: Calculate layout for new entities
        stepStartTime = performance.now();
        const layoutResult = this.calculateEntityLayout(currentEntities, diagramType);
        console.log(`⏱️ Step 6 - Calculate layout: ${(performance.now() - stepStartTime).toFixed(2)}ms`);

        // Step 7: Create entities using the renderer and layout positions
        stepStartTime = performance.now();
        const entityMap = this.createEntities(currentEntities, layoutResult, renderer);
        console.log(`⏱️ Step 7 - Create entities: ${(performance.now() - stepStartTime).toFixed(2)}ms`);

        // Step 8: Create relationships between entities
        stepStartTime = performance.now();
        this.createEntityRelationships(currentEntities, entityMap, renderer);
        const relationshipTime = performance.now() - stepStartTime;
        console.log(`⏱️ Step 8 - Create relationships: ${relationshipTime.toFixed(2)}ms`);

        const totalRenderTime = performance.now() - totalStartTime;
        console.log(`🏁 Total rendering time: ${totalRenderTime.toFixed(2)}ms`);

        // Step 9: Auto-fit and complete loading
        setTimeout(() => {
            const fitStartTime = performance.now();
            fitToScreen();
            console.log(`⏱️ Step 9 - Fit to screen: ${(performance.now() - fitStartTime).toFixed(2)}ms`);
            console.log(`✅ Diagram rendering completed in ${totalRenderTime.toFixed(2)}ms`);
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
        console.log(`📐 Calculating layout for ${currentEntities.length} entities...`);
        
        // Get layout options using GridLayoutManager
        const optionsStartTime = performance.now();
        const layoutOptions = getDefaultLayoutOptions(diagramType as any);
        console.log(`  ⏱️ Got layout options in: ${(performance.now() - optionsStartTime).toFixed(2)}ms`);
        
        // Get actual container dimensions
        const dimensionsStartTime = performance.now();
        const containerRect = this.paper?.el?.getBoundingClientRect();
        const actualContainerWidth = containerRect?.width || layoutOptions.containerWidth;
        const actualContainerHeight = containerRect?.height || layoutOptions.containerHeight;
        console.log(`  ⏱️ Got container dimensions (${actualContainerWidth}x${actualContainerHeight}) in: ${(performance.now() - dimensionsStartTime).toFixed(2)}ms`);
        
        // Update layout options with actual container dimensions
        const updatedLayoutOptions = {
            ...layoutOptions,
            containerWidth: actualContainerWidth,
            containerHeight: actualContainerHeight,
            diagramType: diagramType as any
        };

        // Separate new entities from existing ones
        const separationStartTime = performance.now();
        const newEntities = currentEntities.filter(entity => 
            !this.entityPositions.has(entity.SchemaName)
        );
        const existingEntitiesWithPositions = currentEntities.filter(entity => 
            this.entityPositions.has(entity.SchemaName)
        );
        console.log(`  ⏱️ Separated entities (${newEntities.length} new, ${existingEntitiesWithPositions.length} existing) in: ${(performance.now() - separationStartTime).toFixed(2)}ms`);

        // Track positions of existing entities for collision avoidance
        const positionTrackingStartTime = performance.now();
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
        console.log(`  ⏱️ Position tracking in: ${(performance.now() - positionTrackingStartTime).toFixed(2)}ms`);

        // Calculate grid layout for new entities
        const gridLayoutStartTime = performance.now();
        let layout = { positions: [] as { x: number; y: number }[] };
        if (newEntities.length > 0) {
            // Calculate actual heights for new entities
            const heightCalculationStartTime = performance.now();
            const entityHeights = newEntities.map(entity => calculateEntityHeight(entity, diagramType as any));
            const maxEntityHeight = Math.max(...entityHeights, layoutOptions.entityHeight);
            console.log(`    ⏱️ Height calculation for ${newEntities.length} entities in: ${(performance.now() - heightCalculationStartTime).toFixed(2)}ms`);
            
            const adjustedLayoutOptions = {
                ...updatedLayoutOptions,
                entityHeight: maxEntityHeight,
                diagramType: diagramType as any
            };
            
            const actualLayoutStartTime = performance.now();
            layout = calculateGridLayout(newEntities, adjustedLayoutOptions, placedEntityPositions);
            console.log(`    ⏱️ Grid layout calculation in: ${(performance.now() - actualLayoutStartTime).toFixed(2)}ms`);
        }
        console.log(`  ⏱️ Total grid layout in: ${(performance.now() - gridLayoutStartTime).toFixed(2)}ms`);

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
        
        console.log(`🏗️ Creating entities: ${existingEntitiesWithPositions.length} existing + ${newEntities.length} new`);

        // First, create existing entities with their preserved positions
        let existingStartTime = performance.now();
        existingEntitiesWithPositions.forEach((entity: EntityType, index: number) => {
            const entityStartTime = performance.now();
            const position = this.entityPositions.get(entity.SchemaName);
            if (!position) return; // Skip if position is undefined
            
            const { element, portMap } = renderer.createEntity(entity, position);
            entityMap.set(entity.SchemaName, { element, portMap });
            
            const entityTime = performance.now() - entityStartTime;
            if (entityTime > 10) { // Only log slow entity creations
                console.log(`  🔄 Existing entity ${index + 1}/${existingEntitiesWithPositions.length} (${entity.SchemaName}): ${entityTime.toFixed(2)}ms`);
            }
        });
        
        if (existingEntitiesWithPositions.length > 0) {
            console.log(`  ⏱️ Existing entities created in: ${(performance.now() - existingStartTime).toFixed(2)}ms`);
        }

        // Then, create new entities with grid layout positions
        let newStartTime = performance.now();
        newEntities.forEach((entity: EntityType, index: number) => {
            const entityStartTime = performance.now();
            const position = layout.positions[index] || { x: 50, y: 50 };
            const { element, portMap } = renderer.createEntity(entity, position);
            entityMap.set(entity.SchemaName, { element, portMap });
            
            // Update persistent position tracking for newly placed entities
            this.entityPositions.set(entity.SchemaName, position);
            
            const entityTime = performance.now() - entityStartTime;
            if (entityTime > 10) { // Only log slow entity creations
                console.log(`  🆕 New entity ${index + 1}/${newEntities.length} (${entity.SchemaName}): ${entityTime.toFixed(2)}ms`);
            }
        });
        
        if (newEntities.length > 0) {
            console.log(`  ⏱️ New entities created in: ${(performance.now() - newStartTime).toFixed(2)}ms`);
        }

        return entityMap;
    }

    /**
     * Creates relationships between entities
     */
    private createEntityRelationships(currentEntities: EntityType[], entityMap: Map<any, any>, renderer: DiagramRenderer) {
        const relationshipStartTime = performance.now();
        let totalLinks = 0;
        
        util.nextFrame(() => {
            console.log('🔗 Starting relationship creation...');
            
            currentEntities.forEach((entity, index) => {
                const entityStartTime = performance.now();
                const linksBeforeCount = this.graph.getLinks().length;
                
                renderer.createLinks(entity, entityMap, currentEntities);
                
                const linksAfterCount = this.graph.getLinks().length;
                const newLinksCount = linksAfterCount - linksBeforeCount;
                totalLinks += newLinksCount;
                
                const entityTime = performance.now() - entityStartTime;
                if (entityTime > 5) { // Only log if it takes more than 5ms
                    console.log(`  📎 Entity ${index + 1}/${currentEntities.length} (${entity.SchemaName}): ${newLinksCount} links in ${entityTime.toFixed(2)}ms`);
                }
            });
            
            const totalRelationshipTime = performance.now() - relationshipStartTime;
            console.log(`🔗 Relationship creation completed: ${totalLinks} total links in ${totalRelationshipTime.toFixed(2)}ms`);
            console.log(`📈 Average per entity: ${(totalRelationshipTime / currentEntities.length).toFixed(2)}ms`);
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

    /**
     * Performance analysis helper - logs current system info for performance context
     */
    private logPerformanceContext(): void {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
            console.log('💻 Performance Context:');
            console.log(`  Memory Used: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  Memory Total: ${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`  Memory Limit: ${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
        }
        console.log(`  User Agent: ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
        console.log(`  Hardware Concurrency: ${navigator.hardwareConcurrency || 'unknown'}`);
    }
}
