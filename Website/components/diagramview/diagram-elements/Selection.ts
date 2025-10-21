import { dia, g, mvc, V, VElement } from "@joint/core";

export const SelectionElement = dia.Element.define('selection.SelectionElement', {
    size: { width: 100, height: 100 },
    attrs: {
    body: {
        refWidth: '100%',
        refHeight: '100%',
        stroke: '#2F80ED',
        strokeWidth: 1,
        strokeDasharray: '4 2',
        fill: 'rgba(47,128,237,0.06)',
        rx: 4, ry: 4
    }
    }
    }, {
        markup: [{
        tagName: 'rect',
        selector: 'body'
    }]
});

export default class EntitySelection {
    private elements: mvc.Collection<dia.Element>;
    private paper: dia.Paper;
    private graph: dia.Graph;

    // transient drag state
    private isDragging: boolean = false;
    private dragStart: g.Point | null = null;
    private overlayRect: VElement | null = null;
    private selectionElement: dia.Element | null = null;

    constructor(paper: dia.Paper) {
        this.elements = new mvc.Collection();
        this.paper = paper;
        this.graph = paper.model as dia.Graph;

        paper.on('blank:pointerdown', this.handleSelectionStart);
        paper.on('blank:pointermove', this.handleAreaSelection);
        paper.on('blank:pointerup', this.handleSelectionEnd);
    }

    private handleSelectionStart = (_evt: dia.Event, x: number, y: number) => {
        this.isDragging = true;
        this.dragStart = new g.Point(x, y);

        // Create transient overlay rect directly in the paper’s SVG layer
        const svgRoot = this.paper.svg as unknown as SVGSVGElement;
        const rect = V('rect', {
            x, y,
            width: 1,
            height: 1,
            'pointer-events': 'none',
            stroke: '#2F80ED',
            'stroke-width': 1,
            'stroke-dasharray': '4 2',
            fill: 'rgba(47,128,237,0.10)',
            rx: 2, ry: 2
        });

        V(svgRoot).append(rect);
        this.overlayRect = rect;
    };

    private handleAreaSelection = (_evt: dia.Event, x: number, y: number) => {
        if (!this.isDragging || !this.dragStart || !this.overlayRect) return;

        const p0 = this.dragStart;
        const p1 = new g.Point(x, y);

        const minX = Math.min(p0.x, p1.x);
        const minY = Math.min(p0.y, p1.y);
        const width = Math.max(1, Math.abs(p1.x - p0.x));
        const height = Math.max(1, Math.abs(p1.y - p0.y));

        this.overlayRect.attr({
            x: minX, y: minY, width, height
        });
    };

    private handleSelectionEnd = (_evt: dia.Event, x: number, y: number) => {
        if (!this.isDragging || !this.dragStart) {
            this.cleanupOverlay();
            return;
        }

        this.isDragging = false;

        const p0 = this.dragStart;
        const p1 = new g.Point(x, y);
        const selRect = new g.Rect(
            Math.min(p0.x, p1.x),
            Math.min(p0.y, p1.y),
            Math.abs(p1.x - p0.x),
            Math.abs(p1.y - p0.y)
        );

        this.cleanupOverlay();
        this.teardownSelectionElement();

        // Ignore tiny clicks (treat as no selection)
        if (selRect.width < 3 && selRect.height < 3) return;

        // Collect fully-inside elements (exclude links & the previous selection element)
        const inside: dia.Element[] = [];
        for (const cell of this.graph.getCells()) {
            if (!cell.isElement()) continue;
            if (cell.get('type') === 'selection.SelectionElement') continue;

            // Use model geometry BBox to avoid stroke inflation
            const bbox = (cell as dia.Element).getBBox({ useModelGeometry: true });
            if (selRect.containsRect(bbox)) {
            inside.push(cell as dia.Element);
            this.paper.findViewByModel(cell).setInteractivity({ stopDelegation: false });
            }
        }

        // Clear previous collection and remember current
        this.elements.reset(inside);

        // If nothing selected, clear selection element
        if (inside.length === 1) {
            this.teardownSelectionElement();
            return;
        }

        // Build a selection container element that wraps the inside bbox
        const groupBBox = inside
            .map((el) => el.getBBox({ deep: true, useModelGeometry: true }))
            .reduce((acc, r) => acc ? acc.union(r) : r, null as g.Rect | null) as g.Rect;

        // Create or update the SelectionElement sized/positioned to the bounding box
        if (!this.selectionElement) {
            this.selectionElement = new SelectionElement({
                position: { x: groupBBox.x, y: groupBBox.y },
                size: { width: groupBBox.width, height: groupBBox.height }
            });
            this.graph.addCell(this.selectionElement);
            // Put it behind the children (so you can still click children if needed)
            this.selectionElement.toBack();
        } else {
            this.selectionElement.position(groupBBox.x, groupBBox.y);
            this.selectionElement.resize(groupBBox.width, groupBBox.height);
            // Ensure it’s behind again (in case z-order changed)
            this.selectionElement.toBack();
        }

        // (Re)embed selected elements into the selection container
        // First, unembed anything previously embedded
        const prev = this.selectionElement.getEmbeddedCells();
        prev.forEach((c) => this.selectionElement!.unembed(c));

        inside.forEach((el) => this.selectionElement!.embed(el));

        // Optional visual affordance when active
        this.selectionElement.attr(['body', 'stroke'], '#2F80ED');
    };

    // --- Helpers ---------------------------------------------------------------

    private teardownSelectionElement() {
        if (!this.selectionElement) return;

        // Unembed and restore interactivity on kids
        const kids = this.selectionElement.getEmbeddedCells();
        for (const k of kids) {
            this.selectionElement.unembed(k);
            this.paper.findViewByModel(k)?.setInteractivity(true);
        }

        // Now it's safe to remove just the container
        this.selectionElement.remove(); // no embedded children to take with it
        this.selectionElement = null;
    }

    private cleanupOverlay() {
        if (this.overlayRect) {
            this.overlayRect.remove();
            this.overlayRect = null;
        }
        this.dragStart = null;
    }

    // Public API (optional): get selected elements
    public getSelected(): dia.Element[] {
        return this.elements.toArray();
    }

    // Public API (optional): clear selection
    public clear() {
        this.elements.reset([]);
        if (this.selectionElement) {
        this.selectionElement.remove();
        this.selectionElement = null;
        }
    }
}