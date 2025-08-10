import { dia } from '@joint/core';

export class SquareElementView extends dia.ElementView {
    pointermove(evt: dia.Event, x: number, y: number): void {
        // Check if we're in resize mode by looking at element data
        const element = this.model;
        const data = element.get('data') || {};
        
        if (data.isSelected) {
            // Don't allow normal dragging when resize handles are visible
            return;
        }
        
        // For unselected elements, use normal behavior
        super.pointermove(evt, x, y);
    }

    pointerdown(evt: dia.Event, x: number, y: number): void {
        const target = evt.target as HTMLElement;
        
        // Check if clicking on a resize handle
        let selector = target.getAttribute('joint-selector');
        if (!selector) {
            let parent = target.parentElement;
            let depth = 0;
            while (parent && depth < 3) {
                selector = parent.getAttribute('joint-selector');
                if (selector) break;
                parent = parent.parentElement;
                depth++;
            }
        }
        
        if (selector && selector.startsWith('resize-')) {
            // For resize handles, don't start drag but allow event to bubble
            return;
        }
        
        // For all other clicks, use normal behavior
        super.pointerdown(evt, x, y);
    }
}
