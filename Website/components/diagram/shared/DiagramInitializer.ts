import { dia, routers } from "@joint/core";
import { AvoidRouter } from "@/components/diagram/avoid-router/avoidrouter";
import { SquareElementView } from "@/components/diagram/elements/SquareElementView";
import { SquareElement } from "@/components/diagram/elements/SquareElement";
import { TextElement } from "@/components/diagram/elements/TextElement";

export interface DiagramInitializationCallbacks {
    onSquareHover?: (square: SquareElement, isHover: boolean) => void;
    onTextHover?: (text: TextElement, isHover: boolean) => void;
    onEntityHover?: (entityData: any, isHover: boolean) => void;
    onLinkClick?: (link: dia.Link) => void;
}

export class DiagramInitializer {
    private graph: dia.Graph | null = null;
    private paper: dia.Paper | null = null;
    private eventCallbacks: DiagramInitializationCallbacks = {};

    public setEventCallbacks(callbacks: DiagramInitializationCallbacks): void {
        this.eventCallbacks = callbacks;
    }

    public async initializePaper(
        container: HTMLElement,
        options: any = {}
    ): Promise<{ paper: dia.Paper; graph: dia.Graph }> {
        // Create graph if it doesn't exist
        if (!this.graph) {
            this.graph = new dia.Graph();
        }

        try {
            await AvoidRouter.load();
        } catch (error) {
            console.error('❌ Failed to initialize AvoidRouter:', error);
            // Continue without avoid router if it fails
        }
        
        let avoidRouter;
        try {
            avoidRouter = new AvoidRouter(this.graph, {
                shapeBufferDistance: 10,
                idealNudgingDistance: 15,
            });
            avoidRouter.routeAll();
            avoidRouter.addGraphListeners();
            (routers as any).avoid = function(vertices: any, options: any, linkView: any) {
                const graph = linkView.model.graph as dia.Graph;
                const avoidRouterInstance = (graph as any).__avoidRouter__ as AvoidRouter;

                if (!avoidRouterInstance) {
                    return vertices;
                }

                const link = linkView.model as dia.Link;

                // This will update link using libavoid if possible
                avoidRouterInstance.updateConnector(link);
                const connRef = avoidRouterInstance.edgeRefs[link.id];
                if (!connRef) {
                    return vertices;
                }

                const route = connRef.displayRoute();
                return avoidRouterInstance.getVerticesFromAvoidRoute(route);
            };
            (this.graph as any).__avoidRouter__ = avoidRouter;
        } catch (error) {
            console.error('Failed to initialize AvoidRouter instance:', error);
            // Continue without avoid router functionality
        }

        // Create paper with light amber background
        this.paper = new dia.Paper({
            el: container,
            model: this.graph,
            width: '100%',
            height: '100%',
            gridSize: 8,
            background: { 
                color: '#fef3c7', // Light amber background
                ...options.background
            },
            // Configure custom views
            cellViewNamespace: {
                'delegate': {
                    'square': SquareElementView
                }
            },

            // Disable interactive for squares when resize handles are visible
            interactive: function(cellView: any) {
                const element = cellView.model;
                if (element.get('type') === 'delegate.square') {
                    const data = element.get('data') || {};
                    // Disable dragging if resize handles are visible
                    if (data.isSelected) {
                        return { elementMove: false };
                    }
                }
                return true; // Enable dragging for other elements or unselected squares
            },
            ...options
        });

        this.setupPaperEventHandlers();
        
        return { paper: this.paper, graph: this.graph };
    }

    private setupPaperEventHandlers(): void {
        if (!this.paper) return;

        // Add centralized hover handlers
        this.paper.on('element:mouseenter', (elementView: dia.ElementView) => {
            const element = elementView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                const squareElement = element as SquareElement;
                // Handle square hover
                elementView.el.style.cursor = 'pointer';
                // Add a subtle glow effect for squares
                element.attr('body/filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))');
                this.eventCallbacks.onSquareHover?.(squareElement, true);
                return;
            }
            
            if (elementType === 'delegate.text') {
                const textElement = element as TextElement;
                // Handle text hover
                elementView.el.style.cursor = 'pointer';
                // Add a subtle glow effect for text elements
                element.attr('body/filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))');
                this.eventCallbacks.onTextHover?.(textElement, true);
                return;
            }
            
            // Handle entity hover using centralized style manager
            if (elementType === 'delegate.entity') {
                const entityData = element.get('data');
                if (entityData?.entity) {
                    this.eventCallbacks.onEntityHover?.(entityData, true);
                }
            }
        });

        this.paper.on('element:mouseleave', (elementView: dia.ElementView) => {
            const element = elementView.model;
            const elementType = element.get('type');
            
            if (elementType === 'delegate.square') {
                elementView.el.style.cursor = 'default';
                element.attr('body/filter', 'none');
                const squareElement = element as SquareElement;
                this.eventCallbacks.onSquareHover?.(squareElement, false);
            }
            
            if (elementType === 'delegate.text') {
                elementView.el.style.cursor = 'default';
                element.attr('body/filter', 'none');
                const textElement = element as TextElement;
                this.eventCallbacks.onTextHover?.(textElement, false);
            }
            
            // Handle entity hover leave using centralized style manager
            if (elementType === 'delegate.entity') {
                const entityData = element.get('data');
                if (entityData?.entity) {
                    this.eventCallbacks.onEntityHover?.(entityData, false);
                }
            }
        });

        // Add centralized link click handler
        this.paper.on('link:pointerclick', (linkView: any, evt: any) => {
            const link = linkView.model as dia.Link;
            this.eventCallbacks.onLinkClick?.(link);
        });
    }

    public destroyPaper(): void {
        if (this.paper) {
            this.paper.remove();
            this.paper = null;
        }
        if (this.graph) {
            this.graph.clear();
            this.graph = null;
        }
    }

    public getPaper(): dia.Paper | null {
        return this.paper;
    }

    public getGraph(): dia.Graph | null {
        return this.graph;
    }

    public isPaperInitialized(): boolean {
        return this.paper !== null;
    }

    public isGraphInitialized(): boolean {
        return this.graph !== null;
    }
}
