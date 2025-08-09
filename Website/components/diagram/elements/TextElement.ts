import { dia, shapes, util } from '@joint/core';

export interface TextElementData {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    textAlign: 'left' | 'center' | 'right';
}

export class TextElement extends shapes.standard.Rectangle {
    
    defaults() {
        return util.defaultsDeep({
            type: 'delegate.text',
            size: { width: 200, height: 40 },
            attrs: {
                root: {
                    magnetSelector: 'false'
                },
                body: {
                    fill: 'transparent',
                    stroke: 'transparent',
                    strokeWidth: 0,
                    rx: 4,
                    ry: 4
                },
                label: {
                    text: 'Text Element',
                    fontSize: 14,
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fill: '#000000',
                    textAnchor: 'start',
                    textVerticalAnchor: 'top',
                    x: 8,
                    y: 8
                }
            }
        }, super.defaults);
    }

    constructor(attributes?: any, options?: any) {
        super(attributes, options);
        
        // Set initial data if provided
        const initialData: TextElementData = {
            text: 'Text Element',
            fontSize: 14,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#000000',
            backgroundColor: 'transparent',
            padding: 8,
            borderRadius: 4,
            textAlign: 'left',
            ...attributes?.data
        };
        
        this.set('data', initialData);
        this.updateTextElement(initialData);
    }

    updateTextElement(data: TextElementData) {
        // Update the visual appearance based on data
        this.attr({
            body: {
                fill: data.backgroundColor,
                rx: data.borderRadius,
                ry: data.borderRadius
            },
            label: {
                text: data.text,
                fontSize: data.fontSize,
                fontFamily: data.fontFamily,
                fill: data.color,
                textAnchor: this.getTextAnchor(data.textAlign),
                textVerticalAnchor: 'top',
                x: this.getTextX(data.textAlign, data.padding),
                y: data.padding
            }
        });

        // Adjust element size based on text content
        this.adjustSizeToText(data);
    }

    private getTextAnchor(textAlign: 'left' | 'center' | 'right'): string {
        switch (textAlign) {
            case 'center': return 'middle';
            case 'right': return 'end';
            default: return 'start';
        }
    }

    private getTextX(textAlign: 'left' | 'center' | 'right', padding: number): number {
        const size = this.size();
        switch (textAlign) {
            case 'center': return size.width / 2;
            case 'right': return size.width - padding;
            default: return padding;
        }
    }

    private adjustSizeToText(data: TextElementData) {
        // Calculate approximate text width (rough estimation)
        const charWidth = data.fontSize * 0.6; // Approximate character width
        const textWidth = data.text.length * charWidth;
        const minWidth = Math.max(textWidth + (data.padding * 2), 100);
        const minHeight = Math.max(data.fontSize + (data.padding * 2), 30);

        this.resize(minWidth, minHeight);
    }

    getTextData(): TextElementData {
        return this.get('data') || {};
    }

    updateTextData(newData: Partial<TextElementData>) {
        const currentData = this.getTextData();
        const updatedData = { ...currentData, ...newData };
        this.set('data', updatedData);
        this.updateTextElement(updatedData);
    }
}

// Register the custom element
(shapes as any).delegate = {
    ...(shapes as any).delegate,
    text: TextElement
};
