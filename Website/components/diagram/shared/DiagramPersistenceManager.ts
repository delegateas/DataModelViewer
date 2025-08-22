import { dia } from "@joint/core";
import { EntityType } from "@/lib/Types";
import { DiagramControls } from "./DiagramControls";
import { SquareElement } from "@/components/diagram/elements/SquareElement";
import { TextElement } from "@/components/diagram/elements/TextElement";

export interface DiagramData {
    version: string;
    timestamp: string;
    diagramType: 'simple' | 'detailed';
    currentEntities: EntityType[];
    graph: any;
    viewState: {
        panPosition: { x: number; y: number };
        zoom: number;
    };
}

export class DiagramPersistenceManager {
    private graph: dia.Graph;
    private paper: dia.Paper;
    private diagramControls: DiagramControls;

    constructor(graph: dia.Graph, paper: dia.Paper, diagramControls: DiagramControls) {
        this.graph = graph;
        this.paper = paper;
        this.diagramControls = diagramControls;
    }

    public saveDiagram(
        diagramType: 'simple' | 'detailed',
        currentEntities: EntityType[]
    ): void {
        if (!this.graph) {
            console.warn('No graph available to save');
            return;
        }

        // Use JointJS built-in JSON export
        const graphJSON = this.graph.toJSON();
        
        // Create diagram data structure with additional metadata
        const diagramData: DiagramData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            diagramType,
            currentEntities,
            graph: graphJSON,
            viewState: {
                panPosition: this.diagramControls.getPanPosition(),
                zoom: this.diagramControls.getZoom()
            }
        };

        // Create blob and download
        const jsonString = JSON.stringify(diagramData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `diagram-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    public async loadDiagram(
        file: File,
        setDiagramType: (type: 'simple' | 'detailed') => void,
        setCurrentEntities: (entities: EntityType[]) => void
    ): Promise<void> {
        try {
            const text = await file.text();
            const diagramData: DiagramData = JSON.parse(text);
            
            if (!this.graph || !this.paper) {
                console.warn('Graph or paper not available for loading');
                return;
            }

            // Clear current diagram
            this.graph.clear();
            
            // Use JointJS built-in JSON import
            if (diagramData.graph) {
                // Manual recreation approach since cellNamespace isn't working
                const cells = diagramData.graph.cells || [];
                
                cells.forEach((cellData: any) => {
                    try {
                        let cell: dia.Cell | null = null;

                        if (cellData.type === 'delegate.square') {
                            cell = new SquareElement(cellData);
                        } else if (cellData.type === 'delegate.text') {
                            cell = new TextElement(cellData);
                        } else if (cellData.type === 'delegate.entity' || cellData.type === 'delegate.simple-entity') {
                            // For entity elements, we need to use the appropriate constructor
                            // This might require importing the specific entity element classes
                            cell = new dia.Element(cellData);
                        } else if (cellData.type && cellData.type.includes('Link')) {
                            cell = new dia.Link(cellData);
                        } else {
                            // Fallback for other element types
                            cell = new dia.Element(cellData);
                        }

                        if (cell) {
                            cell.addTo(this.graph);
                        }
                    } catch (cellError) {
                        console.warn('Failed to create cell:', cellData.type, cellError);
                    }
                });
                
            } else {
                console.warn('No graph data found in diagram file');
            }
            
            // Restore diagram type
            if (diagramData.diagramType) {
                setDiagramType(diagramData.diagramType);
            }
            
            // Restore entities
            if (diagramData.currentEntities) {
                setCurrentEntities(diagramData.currentEntities);
            }
            
            // Restore view settings
            if (diagramData.viewState) {
                const { panPosition: savedPanPosition, zoom: savedZoom } = diagramData.viewState;
                this.diagramControls.load(savedZoom, savedPanPosition);
            }
        } catch (error) {
            console.error('Failed to load diagram:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            throw new Error('Failed to load diagram file. Please check the file format.');
        }
    }

    public clearDiagram(
        setCurrentEntities: (entities: EntityType[]) => void,
        clearSelection: () => void
    ): void {
        if (!this.graph) {
            console.warn('Graph not available for clearing');
            return;
        }

        // Clear the entire diagram
        this.graph.clear();
        
        // Reset currentEntities state
        setCurrentEntities([]);
        
        // Clear selection
        clearSelection();
    }

    public exportDiagramAsImage(format: 'png' | 'svg' = 'png'): void {
        if (!this.paper) {
            console.warn('Paper not available for export');
            return;
        }

        try {
            if (format === 'svg') {
                const svg = this.paper.el.querySelector('svg');
                if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const blob = new Blob([svgData], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `diagram-${new Date().toISOString().split('T')[0]}.svg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            } else {
                // PNG export would require additional canvas conversion logic
                console.warn('PNG export not implemented yet');
            }
        } catch (error) {
            console.error('Failed to export diagram:', error);
        }
    }
}
