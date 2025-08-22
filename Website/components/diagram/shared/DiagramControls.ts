import { dia } from "@joint/core";

export class DiagramControls {
    private paper: dia.Paper;

    private zoom: number = 1;
    private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
    private isPanning: boolean = false;

    constructor(paper: dia.Paper) {
        this.paper = paper;

        this.paper.el.addEventListener('wheel', this.handleWheel.bind(this));
        this.paper.el.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Track panning state
        this.paper.on('blank:pointerdown', () => {
            this.isPanning = false; // Initially not panning
        });
        
        this.paper.on('blank:pointermove', () => {
            this.isPanning = true; // We are now panning
        });
        
        this.paper.on('blank:pointerup', () => {
            // Reset panning state after a short delay
            setTimeout(() => {
                this.isPanning = false;
            }, 100);
        });
    }

    public getZoom() {
        return this.zoom;
    }

    public getPanPosition() {
        return this.mousePosition;
    }

    public getMousePosition() {
        return this.mousePosition;
    }

    public getIsPanning() {
        return this.isPanning;
    }

    public reset() {
        this.paper.scale(1, 1);
        this.paper.translate(0, 0);
        this.zoom = 1;
        this.mousePosition = { x: 0, y: 0 };
    }

    public load(zoom: number, panPosition: { x: number; y: number }) {
        if (zoom && this.paper) {
            this.paper.scale(zoom, zoom);
            this.zoom = zoom;
        }

        if (panPosition && this.paper) {
            this.paper.translate(panPosition.x, panPosition.y);
            this.mousePosition = panPosition;
        }
    }

    public fit(graph: dia.Graph) {
        const elements = graph.getElements();
        if (elements.length > 0) {
            const bbox = graph.getBBox();
            if (bbox) {
                const paperSize = this.paper.getComputedSize();
                const scaleX = (paperSize.width - 100) / bbox.width;
                const scaleY = (paperSize.height - 100) / bbox.height;
                const scale = Math.min(scaleX, scaleY, 2);
                this.paper.scale(scale, scale);

                // Center the content manually
                const centerX = (paperSize.width - bbox.width * scale) / 2 - bbox.x * scale;
                const centerY = (paperSize.height - bbox.height * scale) / 2 - bbox.y * scale;
                this.paper.translate(centerX, centerY);

                this.zoom = scale;
                this.mousePosition = { x: centerX, y: centerY };
            }
        }
    }

    public handleWheel(e: WheelEvent) {
        const currentScale = this.paper.scale();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(3, currentScale.sx * delta));
        
        // Get mouse position relative to paper
        const rect = this.paper.el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate zoom center
        const currentTranslate = this.paper.translate();
        const zoomCenterX = (mouseX - currentTranslate.tx) / currentScale.sx;
        const zoomCenterY = (mouseY - currentTranslate.ty) / currentScale.sy;
        
        // Apply zoom
        this.paper.scale(newScale, newScale);
        
        // Adjust translation to zoom towards mouse position
        const newTranslateX = mouseX - zoomCenterX * newScale;
        const newTranslateY = mouseY - zoomCenterY * newScale;
        this.paper.translate(newTranslateX, newTranslateY);

        this.zoom = newScale;
        this.mousePosition = { x: newTranslateX, y: newTranslateY };
    };

    public handleMouseMove(e: MouseEvent) {
        const rect = this.paper.el.getBoundingClientRect();
        const currentTranslate = this.paper.translate();
        const currentScale = this.paper.scale();

        // Calculate mouse position relative to diagram coordinates
        const mouseX = (e.clientX - rect.left - currentTranslate.tx) / currentScale.sx;
        const mouseY = (e.clientY - rect.top - currentTranslate.ty) / currentScale.sy;

        this.mousePosition = { x: Math.round(mouseX), y: Math.round(mouseY) };
    };
}
