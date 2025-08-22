import { dia } from "@joint/core";
import { SquareElement } from "@/components/diagram/elements/SquareElement";
import { TextElement } from "@/components/diagram/elements/TextElement";
import { PRESET_COLORS } from "@/components/diagram/shared/DiagramConstants";

export class DiagramElementManager {
    private graph: dia.Graph;
    private paper: dia.Paper;

    constructor(graph: dia.Graph, paper: dia.Paper) {
        this.graph = graph;
        this.paper = paper;
    }

    public addSquare(): SquareElement | null {
        if (!this.graph || !this.paper) {
            return null;
        }

        // Get all existing elements to find the lowest Y position (bottom-most)
        const allElements = this.graph.getElements();
        let lowestY = 50; // Default starting position
        
        if (allElements.length > 0) {
            // Find the bottom-most element and add margin
            allElements.forEach(element => {
                const bbox = element.getBBox();
                const elementBottom = bbox.y + bbox.height;
                if (elementBottom > lowestY) {
                    lowestY = elementBottom + 30; // Add 30px margin
                }
            });
        }

        // Create a new square element
        const squareElement = new SquareElement({
            position: { 
                x: 100, // Fixed X position 
                y: lowestY 
            },
            data: {
                id: `square-${Date.now()}`, // Unique ID
                borderColor: PRESET_COLORS.borders[0].value,
                fillColor: PRESET_COLORS.fills[0].value,
                borderWidth: 2,
                borderType: 'dashed',
                opacity: 0.7
            }
        });

        // Add the square to the graph
        squareElement.addTo(this.graph);
        
        // Send square to the back so it renders behind entities
        squareElement.toBack();

        return squareElement;
    }

    public addText(): TextElement | null {
        if (!this.graph || !this.paper) {
            return null;
        }

        // Get all existing elements to find the lowest Y position (bottom-most)
        const allElements = this.graph.getElements();
        let lowestY = 50; // Default starting position
        
        if (allElements.length > 0) {
            // Find the bottom-most element and add margin
            allElements.forEach(element => {
                const bbox = element.getBBox();
                const elementBottom = bbox.y + bbox.height;
                if (elementBottom > lowestY) {
                    lowestY = elementBottom + 30; // Add 30px margin
                }
            });
        }

        // Create a new text element
        const textElement = new TextElement({
            position: { 
                x: 100, // Fixed X position 
                y: lowestY 
            },
            size: { width: 120, height: 25 },
            attrs: {
                body: {
                    fill: 'transparent',
                    stroke: 'none'
                },
                label: {
                    text: 'Sample Text',
                    fill: 'black',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    textAnchor: 'start',
                    textVerticalAnchor: 'top',
                    x: 2,
                    y: 2
                }
            }
        });

        // Don't call updateTextElement in constructor to avoid positioning conflicts
        textElement.set('data', {
            text: 'Text Element',
            fontSize: 14,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: 'black',
            backgroundColor: 'transparent',
            padding: 8,
            borderRadius: 4,
            textAlign: 'left'
        });

        // Add the text to the graph
        textElement.addTo(this.graph);

        return textElement;
    }

    public removeElement(element: dia.Element): boolean {
        if (!this.graph || !element) {
            return false;
        }

        try {
            // Remove all links connected to this element
            const connectedLinks = this.graph.getConnectedLinks(element);
            connectedLinks.forEach(link => link.remove());
            
            // Remove the element
            element.remove();
            return true;
        } catch (error) {
            console.error('Failed to remove element:', error);
            return false;
        }
    }

    public getElementsByType(type: string): dia.Element[] {
        if (!this.graph) {
            return [];
        }

        return this.graph.getElements().filter(element => element.get('type') === type);
    }

    public getElementById(id: string): dia.Element | null {
        if (!this.graph) {
            return null;
        }

        return this.graph.getElements().find(element => element.id === id) || null;
    }

    public clearAllElements(): void {
        if (this.graph) {
            this.graph.clear();
        }
    }

    public getAllElements(): dia.Element[] {
        if (!this.graph) {
            return [];
        }

        return this.graph.getElements();
    }
}
