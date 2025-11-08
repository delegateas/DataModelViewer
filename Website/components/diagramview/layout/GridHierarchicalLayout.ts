import { dia } from "@joint/core";
import { EntityElement } from "../diagram-elements/EntityElement";

/**
 * Configuration options for the grid hierarchical layout algorithm
 */
export interface GridHierarchicalLayoutOptions {
    /** Grid cell size (default: 200) */
    gridCellSize?: number;
    /** Base horizontal spacing between entities (default: 250) */
    horizontalSpacing?: number;
    /** Base vertical spacing between layers (default: 300) */
    verticalSpacing?: number;
    /** Number of columns before wrapping (default: 5) */
    columnsPerRow?: number;
    /** Vertical padding from top of canvas (default: 100) */
    topPadding?: number;
    /** Horizontal padding from left of canvas (default: 150) */
    leftPadding?: number;
    /** Extra spacing multiplier for high-connectivity entities (default: 1.5) */
    highConnectivitySpacingMultiplier?: number;
    /** Threshold for considering an entity "high connectivity" (default: 3) */
    highConnectivityThreshold?: number;
}

interface LayeredNode {
    element: InstanceType<typeof EntityElement>;
    layer: number;
    inDegree: number;
    outDegree: number;
    totalDegree: number;
    processed: boolean;
    positionInLayer: number; // Position within the layer (0-indexed)
}

/**
 * Grid-based hierarchical layout optimized for ER diagrams
 *
 * This layout algorithm:
 * 1. Groups entities into layers based on relationship direction
 * 2. Arranges entities in a strict grid pattern
 * 3. Minimizes crossing edges by ordering entities within layers
 * 4. Perfect for ER diagrams with clear hierarchies
 */
export class GridHierarchicalLayout {
    private paper: dia.Paper;
    private graph: dia.Graph;
    private elements: InstanceType<typeof EntityElement>[];
    private options: Required<GridHierarchicalLayoutOptions>;

    constructor(
        paper: dia.Paper,
        graph: dia.Graph,
        elements: InstanceType<typeof EntityElement>[],
        options: GridHierarchicalLayoutOptions = {}
    ) {
        this.paper = paper;
        this.graph = graph;
        this.elements = elements;
        this.options = {
            gridCellSize: options.gridCellSize ?? 200,
            horizontalSpacing: options.horizontalSpacing ?? 250,
            verticalSpacing: options.verticalSpacing ?? 300,
            columnsPerRow: options.columnsPerRow ?? 5,
            topPadding: options.topPadding ?? 100,
            leftPadding: options.leftPadding ?? 150,
            highConnectivitySpacingMultiplier: options.highConnectivitySpacingMultiplier ?? 1.5,
            highConnectivityThreshold: options.highConnectivityThreshold ?? 3
        };
    }

    /**
     * Apply the grid hierarchical layout
     */
    public async applyLayout(): Promise<void> {
        if (this.elements.length === 0) return;

        console.log(`[GridHierarchicalLayout] Starting layout for ${this.elements.length} elements`);

        // Build layered graph structure
        const layers = this.buildLayers();

        console.log(`[GridHierarchicalLayout] Created ${layers.length} layers`);

        // Minimize edge crossings within each layer
        this.minimizeCrossings(layers);

        // Apply grid positions
        this.applyGridPositions(layers);

        console.log('[GridHierarchicalLayout] Layout complete');
    }

    /**
     * Build layers using longest-path algorithm for better distribution
     * This ensures entities are spread more evenly across layers
     */
    private buildLayers(): LayeredNode[][] {
        const elementMap = new Map<string, LayeredNode>();
        const elementSet = new Set(this.elements.map(e => e.id.toString()));

        // Initialize nodes with degree information
        this.elements.forEach(element => {
            const connectedLinks = this.graph.getConnectedLinks(element);

            // Count in-degree and out-degree (only for links between selected entities)
            let inDegree = 0;
            let outDegree = 0;

            connectedLinks.forEach(link => {
                const source = link.source();
                const target = link.target();

                if (source.id && target.id) {
                    const sourceInSet = elementSet.has(source.id.toString());
                    const targetInSet = elementSet.has(target.id.toString());

                    if (sourceInSet && targetInSet) {
                        if (target.id === element.id) inDegree++;
                        if (source.id === element.id) outDegree++;
                    }
                }
            });

            elementMap.set(element.id.toString(), {
                element,
                layer: -1,
                inDegree,
                outDegree,
                totalDegree: inDegree + outDegree,
                processed: false,
                positionInLayer: -1
            });
        });

        // Use longest-path layering for better distribution
        const layers = this.computeLongestPathLayers(elementMap);

        return layers;
    }

    /**
     * Compute layers using longest path from sources
     * This distributes nodes more evenly than simple topological sort
     */
    private computeLongestPathLayers(elementMap: Map<string, LayeredNode>): LayeredNode[][] {
        const nodes = Array.from(elementMap.values());

        // Initialize all nodes to layer 0
        nodes.forEach(node => node.layer = 0);

        // Find source nodes (no incoming edges)
        const sources = nodes.filter(n => n.inDegree === 0);

        // If no sources (cyclic graph), treat all nodes as sources
        if (sources.length === 0) {
            console.log('[GridLayout] No source nodes found, using connectivity-based fallback');
            return this.fallbackLayering(nodes);
        }

        // Compute longest path from sources using BFS
        const queue: LayeredNode[] = [...sources];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const node = queue.shift()!;
            const nodeId = node.element.id.toString();

            if (visited.has(nodeId)) continue;
            visited.add(nodeId);

            // Find all outgoing edges
            const links = this.graph.getConnectedLinks(node.element);
            links.forEach(link => {
                const source = link.source();
                const target = link.target();

                if (source.id && target.id && source.id.toString() === nodeId) {
                    const targetNode = elementMap.get(target.id.toString());
                    if (targetNode) {
                        // Update target layer to be at least one more than current
                        targetNode.layer = Math.max(targetNode.layer, node.layer + 1);
                        queue.push(targetNode);
                    }
                }
            });
        }

        // Group nodes by layer
        const layerMap = new Map<number, LayeredNode[]>();
        nodes.forEach(node => {
            if (!layerMap.has(node.layer)) {
                layerMap.set(node.layer, []);
            }
            layerMap.get(node.layer)!.push(node);
        });

        // Convert to array and sort by layer number
        const layers: LayeredNode[][] = [];
        const maxLayer = Math.max(...nodes.map(n => n.layer));

        for (let i = 0; i <= maxLayer; i++) {
            const layerNodes = layerMap.get(i) || [];
            if (layerNodes.length > 0) {
                layers.push(layerNodes);
            }
        }

        console.log(`[GridLayout] Created ${layers.length} layers using longest-path algorithm`);
        layers.forEach((layer, i) => {
            console.log(`  Layer ${i}: ${layer.length} entities`);
        });

        return layers;
    }

    /**
     * Fallback layering for graphs with no clear hierarchy
     * Distributes nodes evenly based on connectivity
     */
    private fallbackLayering(nodes: LayeredNode[]): LayeredNode[][] {
        // Sort by connectivity (most connected first)
        nodes.sort((a, b) => b.totalDegree - a.totalDegree);

        // Distribute into sqrt(n) layers for roughly square layout
        const layers: LayeredNode[][] = [];
        const nodesPerLayer = Math.ceil(Math.sqrt(nodes.length));

        for (let i = 0; i < nodes.length; i += nodesPerLayer) {
            const layerNodes = nodes.slice(i, i + nodesPerLayer);
            layerNodes.forEach(n => n.layer = layers.length);
            layers.push(layerNodes);
        }

        console.log(`[GridLayout] Using fallback layering: ${layers.length} layers`);
        return layers;
    }

    /**
     * Minimize edge crossings using barycentric heuristic
     * Also optimizes positioning by placing high-connectivity nodes in center
     */
    private minimizeCrossings(layers: LayeredNode[][]): void {
        if (layers.length < 2) return;

        // First pass: Sort each layer by connectivity (high-connectivity in center)
        layers.forEach(layer => {
            this.sortLayerByConnectivity(layer);
        });

        // Second pass: Barycentric optimization
        const MAX_ITERATIONS = 10;

        for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
            let improved = false;

            // Forward pass
            for (let i = 1; i < layers.length; i++) {
                if (this.orderLayerByBarycenter(layers[i], layers[i - 1], 'down')) {
                    improved = true;
                }
            }

            // Backward pass
            for (let i = layers.length - 2; i >= 0; i--) {
                if (this.orderLayerByBarycenter(layers[i], layers[i + 1], 'up')) {
                    improved = true;
                }
            }

            if (!improved) break;
        }

        // Final pass: Update position indices
        layers.forEach(layer => {
            layer.forEach((node, index) => {
                node.positionInLayer = index;
            });
        });
    }

    /**
     * Sort layer entities by connectivity, placing high-connectivity entities in the center
     * This minimizes the distance relationships have to travel
     */
    private sortLayerByConnectivity(layer: LayeredNode[]): void {
        // Sort by total degree (descending)
        layer.sort((a, b) => b.totalDegree - a.totalDegree);

        // Reorder to place high-connectivity nodes in center
        const reordered: LayeredNode[] = [];
        let left = true;

        layer.forEach(node => {
            if (left) {
                reordered.push(node);
            } else {
                reordered.unshift(node);
            }
            left = !left;
        });

        // Update the layer array in-place
        layer.length = 0;
        layer.push(...reordered);
    }

    /**
     * Order a layer based on weighted barycentric position relative to adjacent layer
     * Connections to high-connectivity nodes have more influence
     */
    private orderLayerByBarycenter(
        layer: LayeredNode[],
        adjacentLayer: LayeredNode[],
        direction: 'up' | 'down'
    ): boolean {
        const barycenters: Array<{ node: LayeredNode; position: number }> = [];

        layer.forEach(node => {
            let weightedSum = 0;
            let totalWeight = 0;

            adjacentLayer.forEach((adjNode, index) => {
                const connectionCount = this.getConnectionCount(node.element, adjNode.element);
                if (connectionCount > 0) {
                    // Weight by connection count and node importance
                    const weight = connectionCount * (1 + adjNode.totalDegree * 0.1);
                    weightedSum += index * weight;
                    totalWeight += weight;
                }
            });

            const barycenter = totalWeight > 0
                ? weightedSum / totalWeight
                : layer.indexOf(node); // Keep original position if no connections

            barycenters.push({ node, position: barycenter });
        });

        // Sort by barycentric position
        barycenters.sort((a, b) => a.position - b.position);

        // Check if order changed
        const changed = barycenters.some((item, index) => layer[index] !== item.node);

        // Update layer order
        layer.length = 0;
        layer.push(...barycenters.map(b => b.node));

        return changed;
    }

    /**
     * Check if two elements are connected by any link
     */
    private areNodesConnected(elem1: InstanceType<typeof EntityElement>, elem2: InstanceType<typeof EntityElement>): boolean {
        const links = this.graph.getConnectedLinks(elem1);
        return links.some(link => {
            const source = link.source();
            const target = link.target();
            return (
                (source.id === elem1.id && target.id === elem2.id) ||
                (source.id === elem2.id && target.id === elem1.id)
            );
        });
    }

    /**
     * Get the number of relationships between two elements
     */
    private getConnectionCount(elem1: InstanceType<typeof EntityElement>, elem2: InstanceType<typeof EntityElement>): number {
        const links = this.graph.getConnectedLinks(elem1);
        let count = 0;

        links.forEach(link => {
            const source = link.source();
            const target = link.target();

            if ((source.id === elem1.id && target.id === elem2.id) ||
                (source.id === elem2.id && target.id === elem1.id)) {
                // Count the number of relationships in this link
                const relationshipInfo = link.get('relationshipInformationList') || [];
                count += Math.max(1, relationshipInfo.length);
            }
        });

        return count;
    }

    /**
     * Apply grid positions to all entities using weighted coordinate assignment
     * High-connectivity entities get proportionally more horizontal space
     */
    private applyGridPositions(layers: LayeredNode[][]): void {
        // Use batch mode to prevent libavoid from processing each change
        this.graph.startBatch('layout');

        try {
            layers.forEach((layer, layerIndex) => {
                const baseY = this.options.topPadding + (layerIndex * this.options.verticalSpacing);

                if (layer.length === 0) return;

                // Calculate total weight for this layer
                // Weight = connectivity + 1 (so even isolated nodes get space)
                const totalWeight = layer.reduce((sum, node) => {
                    const weight = Math.max(1, node.totalDegree);
                    return sum + weight;
                }, 0);

                // Calculate total available width for this layer
                // Use paper width or a reasonable maximum
                const paperSize = this.paper.getComputedSize();
                const availableWidth = Math.max(
                    paperSize.width - this.options.leftPadding * 2,
                    layer.length * this.options.horizontalSpacing
                );

                // Minimum space per entity (to prevent overlap)
                const minSpacing = 200;
                const totalMinWidth = layer.length * minSpacing;

                // Extra distributable space
                const extraSpace = Math.max(0, availableWidth - totalMinWidth);

                // Assign X coordinates based on weight proportion
                let currentX = this.options.leftPadding;

                layer.forEach((node, index) => {
                    // Base space (minimum)
                    let allocatedWidth = minSpacing;

                    // Add extra space proportional to weight
                    if (totalWeight > 0 && extraSpace > 0) {
                        const weight = Math.max(1, node.totalDegree);
                        const proportion = weight / totalWeight;
                        allocatedWidth += extraSpace * proportion;
                    }

                    // Position entity at center of allocated space
                    const centerX = currentX + allocatedWidth / 2;

                    // Snap to grid
                    const snappedX = this.snapToGrid(centerX);
                    const snappedY = this.snapToGrid(baseY);

                    // Get entity size and position it
                    const size = node.element.get('size') || { width: 120, height: 80 };
                    const finalX = snappedX - size.width / 2;
                    const finalY = snappedY - size.height / 2;

                    // Validate position
                    if (isFinite(finalX) && isFinite(finalY)) {
                        node.element.set('position', { x: finalX, y: finalY }, { dry: false });

                        // Log high-connectivity entities for debugging
                        if (node.totalDegree >= this.options.highConnectivityThreshold) {
                            console.log(
                                `[GridLayout] High-connectivity entity (${node.totalDegree} rels): ` +
                                `layer ${layerIndex}, allocated width: ${allocatedWidth.toFixed(0)}px`
                            );
                        }
                    } else {
                        console.warn('Invalid position calculated for entity:', node.element.id);
                    }

                    // Move to next position
                    currentX += allocatedWidth;
                });
            });
        } finally {
            this.graph.stopBatch('layout');
        }
    }

    /**
     * Snap coordinate to grid
     */
    private snapToGrid(value: number): number {
        return Math.round(value / this.options.gridCellSize) * this.options.gridCellSize;
    }

    /**
     * Get statistics about the layout for debugging
     */
    public getLayoutStats(): {
        entityCount: number;
        layerCount: number;
        options: Required<GridHierarchicalLayoutOptions>;
    } {
        const layers = this.buildLayers();

        return {
            entityCount: this.elements.length,
            layerCount: layers.length,
            options: this.options
        };
    }
}
