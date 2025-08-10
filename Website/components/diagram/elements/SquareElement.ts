import { dia } from '@joint/core';
import { PRESET_COLORS } from '../shared/DiagramConstants';

export interface SquareElementData {
    id?: string;
    borderColor?: string;
    fillColor?: string;
    borderWidth?: number;
    borderType?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
    isSelected?: boolean;
}

export class SquareElement extends dia.Element {
    
    initialize(...args: Parameters<dia.Element['initialize']>) {
        super.initialize(...args);
        this.updateSquareAttrs();
    }

    updateSquareAttrs() {
        const data = this.get('data') as SquareElementData || {};
        const {
            borderColor = PRESET_COLORS.borders[0].value,
            fillColor = PRESET_COLORS.fills[0].value,
            borderWidth = 2,
            borderType = 'dashed',
            opacity = 0.7
        } = data;

        this.attr({
            body: {
                fill: fillColor,
                fillOpacity: opacity,
                stroke: borderColor,
                strokeWidth: borderWidth,
                strokeDasharray: this.getStrokeDashArray(borderType),
                rx: 8, // Rounded corners
                ry: 8
            }
        });
    }

    private getStrokeDashArray(borderType: string): string {
        switch (borderType) {
            case 'dashed':
                return '10,5';
            case 'dotted':
                return '2,3';
            default:
                return 'none';
        }
    }

    defaults() {
        return {
            type: 'delegate.square',
            size: { width: 150, height: 100 },
            attrs: {
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    fill: '#f1f5f9',
                    fillOpacity: 0.7,
                    stroke: '#64748b',
                    strokeWidth: 2,
                    rx: 8,
                    ry: 8,
                    cursor: 'pointer'
                },
                // Resize handles - initially hidden
                'resize-nw': {
                    ref: 'body',
                    refX: 0,
                    refY: 0,
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 'nw-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                },
                'resize-ne': {
                    ref: 'body',
                    refX: '100%',
                    refY: 0,
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 'ne-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                },
                'resize-sw': {
                    ref: 'body',
                    refX: 0,
                    refY: '100%',
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 'sw-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                },
                'resize-se': {
                    ref: 'body',
                    refX: '100%',
                    refY: '100%',
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 'se-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                },
                // Side handles
                'resize-n': {
                    ref: 'body',
                    refX: '50%',
                    refY: 0,
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 'n-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                },
                'resize-s': {
                    ref: 'body',
                    refX: '50%',
                    refY: '100%',
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 's-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                },
                'resize-w': {
                    ref: 'body',
                    refX: 0,
                    refY: '50%',
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 'w-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                },
                'resize-e': {
                    ref: 'body',
                    refX: '100%',
                    refY: '50%',
                    x: -4,
                    y: -4,
                    width: 8,
                    height: 8,
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 1,
                    cursor: 'e-resize',
                    visibility: 'hidden',
                    pointerEvents: 'all'
                }
            },
            markup: [
                {
                    tagName: 'rect',
                    selector: 'body'
                },
                // Resize handles
                { tagName: 'rect', selector: 'resize-nw' },
                { tagName: 'rect', selector: 'resize-ne' },
                { tagName: 'rect', selector: 'resize-sw' },
                { tagName: 'rect', selector: 'resize-se' },
                { tagName: 'rect', selector: 'resize-n' },
                { tagName: 'rect', selector: 'resize-s' },
                { tagName: 'rect', selector: 'resize-w' },
                { tagName: 'rect', selector: 'resize-e' }
            ]
        };
    }

    // Method to update square properties
    updateSquareData(data: Partial<SquareElementData>) {
        const currentData = this.get('data') || {};
        this.set('data', { ...currentData, ...data });
        this.updateSquareAttrs();
    }

    // Get current square data
    getSquareData(): SquareElementData {
        return this.get('data') || {};
    }

    // Show resize handles
    showResizeHandles() {
        const handles = ['resize-nw', 'resize-ne', 'resize-sw', 'resize-se', 'resize-n', 'resize-s', 'resize-w', 'resize-e'];
        handles.forEach(handle => {
            this.attr(`${handle}/visibility`, 'visible');
        });
        
        // Update data to track selection state
        const currentData = this.get('data') || {};
        this.set('data', { ...currentData, isSelected: true });
    }

    // Hide resize handles
    hideResizeHandles() {
        const handles = ['resize-nw', 'resize-ne', 'resize-sw', 'resize-se', 'resize-n', 'resize-s', 'resize-w', 'resize-e'];
        handles.forEach(handle => {
            this.attr(`${handle}/visibility`, 'hidden');
        });
        
        // Update data to track selection state
        const currentData = this.get('data') || {};
        this.set('data', { ...currentData, isSelected: false });
    }

    // Check if resize handles are visible
    areResizeHandlesVisible(): boolean {
        const data = this.get('data') as SquareElementData || {};
        return data.isSelected || false;
    }

    // Get the resize handle that was clicked
    getResizeHandle(target: HTMLElement): string | null {
        // Check if the target itself has the selector
        const selector = target.getAttribute('data-selector');
        if (selector && selector.startsWith('resize-')) {
            return selector;
        }
        
        // Check parent elements for the selector
        let currentElement = target.parentElement;
        while (currentElement) {
            const parentSelector = currentElement.getAttribute('data-selector');
            if (parentSelector && parentSelector.startsWith('resize-')) {
                return parentSelector;
            }
            currentElement = currentElement.parentElement;
        }
        
        // Alternative approach: check the SVG element class or tag
        const tagName = target.tagName?.toLowerCase();
        if (tagName === 'rect') {
            // Check if this rect is one of our resize handles
            const parent = target.parentElement;
            if (parent) {
                // Look for JointJS generated elements with our selector
                const allRects = parent.querySelectorAll('rect[data-selector^="resize-"]');
                for (let i = 0; i < allRects.length; i++) {
                    if (allRects[i] === target) {
                        return (allRects[i] as HTMLElement).getAttribute('data-selector');
                    }
                }
            }
        }
        
        return null;
    }
}
