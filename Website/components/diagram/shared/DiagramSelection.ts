import { dia } from "@joint/core";

export class DiagramSelection {
    private paper: dia.Paper;

    private selectionStartX: number = 0;
    private selectionStartY: number = 0;

    private selectedElements: dia.Cell.ID[] = [];

    // the element drawn on the screen
    private selectionElement: SVGRectElement | null = null;

    constructor (paper: dia.Paper) {
        this.paper = paper;

        // register selection events
        this.paper.on('blank:pointerdown', this.handleSelectionStart);
        this.paper.on('blank:pointermove', this.handleSelectionMouseMove);
        this.paper.on('element:pointerup', this.handleSelectionToggle);
    }

    /////////////////////////////////////////////////////////////////////
    //                              SELECTION                          //
    /////////////////////////////////////////////////////////////////////
    public handleSelectionStart(evt: dia.Event, x: number, y: number) {
        this.selectionStartX = x;
        this.selectionStartY = y;
    }

    public handleSelectionToggle(elementView: dia.ElementView, evt: dia.Event, x: number, y: number) {
        if (evt.ctrlKey || evt.metaKey) {
            if (this.selectedElements.includes(elementView.model.id)) {
                this.deselectElement(elementView);
            } else {
                this.selectElement(elementView);
            }
        }
    }

    public selectElement(elementView: dia.ElementView) {
        const elementId = elementView.model.id;
        if (!this.selectedElements.includes(elementId)) {
            this.selectedElements.push(elementId);

            const foreignObject = elementView.el.querySelector('foreignObject');
            const htmlContent = foreignObject?.querySelector('[data-entity-schema]') as HTMLElement;
            htmlContent.style.border = '3px solid #3b82f6';
            htmlContent.style.borderRadius = '12px';
            elementView.el.style.cursor = 'pointer';
        }
    }

    public deselectElement(elementView: dia.ElementView) {
        const elementId = elementView.model.id;
        this.selectedElements = this.selectedElements.filter(id => id !== elementId);

        const foreignObject = elementView.el.querySelector('foreignObject');
        const htmlContent = foreignObject?.querySelector('[data-entity-schema]') as HTMLElement;
        htmlContent.style.border = 'none';
        htmlContent.style.borderRadius = '';
        elementView.el.style.cursor = 'default';
    }

    public clearSelection() {
        this.selectedElements = [];
    }

    public getSelectedElements() {
        return this.selectedElements;
    }

    public createSelectionOverlay(x: number, y: number, width: number, height: number) {
        const paperSvg = this.paper.el.querySelector('svg');
        if (!paperSvg) return null;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x.toString());
        rect.setAttribute('y', y.toString());
        rect.setAttribute('width', width.toString());
        rect.setAttribute('height', height.toString());
        rect.setAttribute('fill', 'rgba(59, 130, 246, 0.1)');
        rect.setAttribute('stroke', '#3b82f6');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('stroke-dasharray', '5,5');
        rect.setAttribute('pointer-events', 'none');
        rect.style.zIndex = '1000';
        
        paperSvg.appendChild(rect);
        return rect;
    };

    public handleSelectionMouseMove(evt: dia.Event, x: number, y: number) {
        // Handle area selection
        const currentTranslate = this.paper.translate();
        const currentScale = this.paper.scale();
        const rect = (this.paper.el as HTMLElement).getBoundingClientRect();
        const event = evt.originalEvent as MouseEvent;
        
        // Calculate current mouse position in diagram coordinates
        const currentX = (event.clientX - rect.left - currentTranslate.tx) / currentScale.sx;
        const currentY = (event.clientY - rect.top - currentTranslate.ty) / currentScale.sy;

        // Calculate selection rectangle bounds
        const rectX = Math.min(this.selectionStartX, currentX);
        const rectY = Math.min(this.selectionStartY, currentY);
        const width = Math.abs(currentX - this.selectionStartX);
        const height = Math.abs(currentY - this.selectionStartY);

        // Convert to screen coordinates for overlay
        const screenX = rectX * currentScale.sx + currentTranslate.tx;
        const screenY = rectY * currentScale.sy + currentTranslate.ty;
        const screenWidth = width * currentScale.sx;
        const screenHeight = height * currentScale.sy;
        
        // Update or create selection overlay
        if (this.selectionElement) {
            this.selectionElement.setAttribute('x', screenX.toString());
            this.selectionElement.setAttribute('y', screenY.toString());
            this.selectionElement.setAttribute('width', screenWidth.toString());
            this.selectionElement.setAttribute('height', screenHeight.toString());
        } else {
            this.selectionElement = this.createSelectionOverlay(screenX, screenY, screenWidth, screenHeight);
        }

        // Visual indication of selected elements
        if (width > 10 && height > 10) {
            const selectedElements = this.paper.findElementViewsInArea({
                x: this.selectionStartX,
                y: this.selectionStartY,
                width: x - this.selectionStartX,
                height: y - this.selectionStartY
            } as dia.BBox);
            selectedElements.forEach(view => this.selectElement(view));
        }
    }
}
