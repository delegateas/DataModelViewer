import { dia } from "@joint/core";
import { EntityElement } from "../diagram-elements/EntityElement";
import {
    forceSimulation,
    forceLink,
    forceCollide,
    forceCenter,
    forceManyBody,
    SimulationNodeDatum,
    SimulationLinkDatum,
    Simulation
} from "d3-force";

/**
 * Configuration options for the force-directed layout algorithm
 */
export interface ForceDirectedLayoutOptions {
    /** Grid cell size for snapping entities (default: 40) */
    gridSize?: number;
    /** Minimum spacing between entities (default: 180) */
    entitySpacing?: number;
    /** Strength of attraction between connected entities (default: 0.5) */
    linkStrength?: number;
    /** Distance for link force (default: 200) */
    linkDistance?: number;
    /** Strength of repulsion between all entities (default: -300) */
    chargeStrength?: number;
    /** Number of simulation iterations (default: 300) */
    iterations?: number;
    /** Whether to bias towards orthogonal alignment for libavoid (default: true) */
    orthogonalBias?: boolean;
    /** Strength of orthogonal alignment bias (default: 0.3) */
    orthogonalBiasStrength?: number;
}

interface ForceNode extends SimulationNodeDatum {
    id: string;
    element: InstanceType<typeof EntityElement>;
    width: number;
    height: number;
    // d3-force will add x and y
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
    source: string | ForceNode;
    target: string | ForceNode;
    weight: number; // Number of relationships between these entities
}

/**
 * Force-directed layout algorithm optimized for:
 * 1. Grid alignment (for clean diagrams)
 * 2. Readable spacing (avoiding overlap)
 * 3. Minimizing edge crossings (through force simulation)
 * 4. Orthogonal routing compatibility (libavoid optimization)
 */
export class ForceDirectedLayout {
    private paper: dia.Paper;
    private graph: dia.Graph;
    private elements: InstanceType<typeof EntityElement>[];
    private options: Required<ForceDirectedLayoutOptions>;
    private simulation: Simulation<ForceNode, ForceLink> | null = null;

    constructor(
        paper: dia.Paper,
        graph: dia.Graph,
        elements: InstanceType<typeof EntityElement>[],
        options: ForceDirectedLayoutOptions = {}
    ) {
        this.paper = paper;
        this.graph = graph;
        this.elements = elements;
        this.options = {
            gridSize: options.gridSize ?? 40,
            entitySpacing: options.entitySpacing ?? 180,
            linkStrength: options.linkStrength ?? 0.5,
            linkDistance: options.linkDistance ?? 200,
            chargeStrength: options.chargeStrength ?? -300,
            iterations: options.iterations ?? 300,
            orthogonalBias: options.orthogonalBias ?? true,
            orthogonalBiasStrength: options.orthogonalBiasStrength ?? 0.3
        };
    }

    /**
     * Apply the force-directed layout algorithm
     */
    public async applyLayout(): Promise<void> {
        if (this.elements.length === 0) return;

        console.log(`[ForceDirectedLayout] Starting layout for ${this.elements.length} elements`);

        // Build the graph structure for force simulation
        const { nodes, links } = this.buildForceGraph();

        console.log(`[ForceDirectedLayout] Built graph: ${nodes.length} nodes, ${links.length} links`);

        // Validate initial positions
        const invalidNodes = nodes.filter(n => !isFinite(n.x ?? NaN) || !isFinite(n.y ?? NaN));
        if (invalidNodes.length > 0) {
            console.error('[ForceDirectedLayout] Invalid initial positions detected:', invalidNodes);
            return;
        }

        // Create and configure the force simulation
        this.simulation = this.createSimulation(nodes, links);

        // Run the simulation
        await this.runSimulation();

        console.log('[ForceDirectedLayout] Simulation complete, applying positions');

        // Apply grid snapping and position entities
        this.applyPositions(nodes);

        // Clean up
        this.simulation = null;

        console.log('[ForceDirectedLayout] Layout complete');
    }

    /**
     * Build force graph structure from JointJS elements
     */
    private buildForceGraph(): { nodes: ForceNode[]; links: ForceLink[] } {
        const nodes: ForceNode[] = [];
        const nodeMap = new Map<string, ForceNode>();

        // Create nodes from elements
        this.elements.forEach(element => {
            const size = element.get('size') || { width: 120, height: 80 };
            const currentPos = element.get('position');

            // Ensure we have valid starting positions
            let startX: number;
            let startY: number;

            if (currentPos && isFinite(currentPos.x) && isFinite(currentPos.y)) {
                // Use existing position (center of element)
                startX = currentPos.x + size.width / 2;
                startY = currentPos.y + size.height / 2;
            } else {
                // Fall back to paper center if position is invalid
                const paperSize = this.paper.getComputedSize();
                startX = paperSize.width / 2;
                startY = paperSize.height / 2;
            }

            const node: ForceNode = {
                id: element.id.toString(),
                element: element,
                width: size.width,
                height: size.height,
                x: startX,
                y: startY
            };

            nodes.push(node);
            nodeMap.set(element.id.toString(), node);
        });

        // Build links from relationships
        const links: ForceLink[] = [];
        const processedPairs = new Set<string>();

        this.elements.forEach(sourceElement => {
            const sourceId = sourceElement.id.toString();
            const sourceNode = nodeMap.get(sourceId);
            if (!sourceNode) return;

            // Get all links connected to this element
            const connectedLinks = this.graph.getConnectedLinks(sourceElement);

            connectedLinks.forEach(link => {
                const linkSource = link.source();
                const linkTarget = link.target();

                if (!linkSource.id || !linkTarget.id) return;

                const targetId = linkTarget.id.toString();
                const targetNode = nodeMap.get(targetId);

                if (!targetNode) return;

                // Avoid duplicate links (A-B and B-A are the same for force simulation)
                const pairKey = [sourceId, targetId].sort().join('-');
                if (processedPairs.has(pairKey)) return;
                processedPairs.add(pairKey);

                // Get relationship information to calculate weight
                const relationshipInfo = link.get('relationshipInformationList') || [];
                const weight = relationshipInfo.length || 1;

                links.push({
                    source: sourceId,
                    target: targetId,
                    weight: weight
                });
            });
        });

        return { nodes, links };
    }

    /**
     * Create and configure the force simulation
     */
    private createSimulation(nodes: ForceNode[], links: ForceLink[]): Simulation<ForceNode, ForceLink> {
        const simulation = forceSimulation<ForceNode, ForceLink>(nodes);

        // Link force: Attract connected entities
        simulation.force("link", forceLink<ForceNode, ForceLink>(links)
            .id(d => d.id)
            .distance(this.options.linkDistance)
            .strength(d => this.options.linkStrength * d.weight) // Stronger pull for multiple relationships
        );

        // Charge force: Repel all entities from each other
        simulation.force("charge", forceManyBody<ForceNode>()
            .strength(this.options.chargeStrength)
        );

        // Center force: Keep the graph centered
        const paperSize = this.paper.getComputedSize();
        const centerX = paperSize.width / 2;
        const centerY = paperSize.height / 2;
        simulation.force("center", forceCenter<ForceNode>(centerX, centerY)
            .strength(0.05)
        );

        // Collision force: Prevent overlap with padding
        const collisionRadius = (node: ForceNode) => {
            const radius = Math.max(node.width, node.height) / 2 + this.options.entitySpacing / 2;
            return isFinite(radius) ? radius : 100; // Fallback to 100 if invalid
        };
        simulation.force("collide", forceCollide<ForceNode>()
            .radius(collisionRadius)
            .strength(0.8)
        );

        // Custom force: Orthogonal bias for libavoid routing
        if (this.options.orthogonalBias) {
            simulation.force("orthogonal", this.createOrthogonalBiasForce());
        }

        return simulation;
    }

    /**
     * Custom force to bias node positions towards orthogonal alignment
     * This helps libavoid create cleaner orthogonal routes
     */
    private createOrthogonalBiasForce() {
        const strength = this.options.orthogonalBiasStrength;
        const gridSize = this.options.gridSize;

        return (alpha: number) => {
            this.simulation?.nodes().forEach(node => {
                if (node.x === undefined || node.y === undefined) return;

                // Calculate nearest grid-aligned position
                const nearestGridX = Math.round(node.x / gridSize) * gridSize;
                const nearestGridY = Math.round(node.y / gridSize) * gridSize;

                // Apply gentle force towards grid alignment
                const dx = nearestGridX - node.x;
                const dy = nearestGridY - node.y;

                // Velocity adjustments (d3-force uses vx/vy for velocity)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ('vx' in node && 'vy' in node) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (node as any).vx += dx * strength * alpha;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (node as any).vy += dy * strength * alpha;
                }
            });
        };
    }

    /**
     * Run the simulation for a fixed number of iterations
     */
    private async runSimulation(): Promise<void> {
        if (!this.simulation) return;

        return new Promise<void>((resolve) => {
            if (!this.simulation) {
                resolve();
                return;
            }

            // Stop automatic ticking
            this.simulation.stop();

            // Run for specified iterations
            for (let i = 0; i < this.options.iterations; i++) {
                this.simulation.tick();

                // Check for NaN values during simulation
                if (i % 50 === 0) { // Check every 50 iterations
                    const nodes = this.simulation.nodes();
                    const hasInvalidPositions = nodes.some(n =>
                        !isFinite(n.x ?? NaN) || !isFinite(n.y ?? NaN)
                    );

                    if (hasInvalidPositions) {
                        console.error('Simulation produced invalid positions at iteration', i);
                        console.log('Stopping simulation early to prevent NaN propagation');
                        break;
                    }
                }
            }

            resolve();
        });
    }

    /**
     * Apply the calculated positions to the actual elements
     * with grid snapping - uses batch mode to prevent libavoid from processing intermediate states
     */
    private applyPositions(nodes: ForceNode[]): void {
        // CRITICAL: Use batch mode to prevent libavoid from processing each position change
        // This prevents NaN errors from intermediate positions during animation
        this.graph.startBatch('layout');

        try {
            nodes.forEach(node => {
                // Validate positions - skip if undefined or NaN
                if (node.x === undefined || node.y === undefined ||
                    !isFinite(node.x) || !isFinite(node.y)) {
                    console.warn('Invalid position for node:', node.id, { x: node.x, y: node.y });
                    return;
                }

                // Snap to grid
                const snappedX = this.snapToGrid(node.x);
                const snappedY = this.snapToGrid(node.y);

                // Convert from center position to top-left corner
                const finalX = snappedX - node.width / 2;
                const finalY = snappedY - node.height / 2;

                // Final validation before applying
                if (!isFinite(finalX) || !isFinite(finalY)) {
                    console.warn('Invalid final position for node:', node.id, { finalX, finalY });
                    return;
                }

                // Apply position immediately (no animation to avoid libavoid issues)
                // The { silent: false } ensures the change is recorded but batched
                node.element.set('position', { x: finalX, y: finalY }, { dry: false });
            });
        } finally {
            // Stop batch mode - this triggers a single libavoid update for all changes
            this.graph.stopBatch('layout');
        }
    }

    /**
     * Snap a coordinate to the nearest grid point
     */
    private snapToGrid(value: number): number {
        return Math.round(value / this.options.gridSize) * this.options.gridSize;
    }

    /**
     * Get statistics about the layout for debugging
     */
    public getLayoutStats(): {
        entityCount: number;
        linkCount: number;
        averageConnections: number;
        options: Required<ForceDirectedLayoutOptions>;
    } {
        const { nodes, links } = this.buildForceGraph();

        return {
            entityCount: nodes.length,
            linkCount: links.length,
            averageConnections: nodes.length > 0 ? (links.length * 2) / nodes.length : 0,
            options: this.options
        };
    }

    /**
     * Stop the simulation if it's running
     */
    public stop(): void {
        this.simulation?.stop();
        this.simulation = null;
    }
}
