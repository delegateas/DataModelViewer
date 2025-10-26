import html2canvas from 'html2canvas';

export interface PngExportOptions {
    backgroundColor?: string | null;
    scale?: number;
    width?: number;
    height?: number;
    includeGrid?: boolean; // Whether to include the grid background
}

export class DiagramPngExportService {

    /**
     * Calculates the bounding box of all diagram content (excluding grid)
     * @param canvasElement - The diagram canvas DOM element
     * @param padding - Padding to add around content in pixels
     * @returns Bounding box { x, y, width, height }
     */
    private static getContentBoundingBox(
        canvasElement: HTMLElement,
        padding: number = 20
    ): { x: number; y: number; width: number; height: number } | null {
        const svg = canvasElement.querySelector('svg');
        if (!svg) {
            console.warn('[DiagramPngExport] No SVG found in canvas');
            return null;
        }

        // Get all elements except grid-related ones
        const allElements = Array.from(svg.querySelectorAll('g[model-id], g.joint-element, g.joint-link'));

        if (allElements.length === 0) {
            console.warn('[DiagramPngExport] No diagram elements found');
            return null;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        // Calculate bounding box from all diagram elements
        allElements.forEach((element) => {
            try {
                const bbox = (element as SVGGraphicsElement).getBBox();
                minX = Math.min(minX, bbox.x);
                minY = Math.min(minY, bbox.y);
                maxX = Math.max(maxX, bbox.x + bbox.width);
                maxY = Math.max(maxY, bbox.y + bbox.height);
            } catch (e) {
                // Some elements might not support getBBox, skip them
            }
        });

        // If we couldn't calculate bounds, return null
        if (minX === Infinity || minY === Infinity) {
            console.warn('[DiagramPngExport] Could not calculate content bounds');
            return null;
        }

        // Add padding
        const x = Math.max(0, minX - padding);
        const y = Math.max(0, minY - padding);
        const width = (maxX - minX) + (padding * 2);
        const height = (maxY - minY) + (padding * 2);

        console.log('[DiagramPngExport] Content bounds:', { x, y, width, height });
        return { x, y, width, height };
    }

    /**
     * Resolves CSS variables in an element by computing and applying actual values
     * @param original - Original element to read computed styles from
     * @param clone - Cloned element to apply resolved styles to
     */
    private static resolveCssVariables(original: HTMLElement, clone: HTMLElement): void {
        // Get computed style of original element
        const computedStyle = window.getComputedStyle(original);

        // Apply computed values to clone for properties that might use CSS variables
        const propertiesToResolve = [
            'backgroundColor',
            'borderColor',
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor',
            'borderTopStyle',
            'borderRightStyle',
            'borderBottomStyle',
            'borderLeftStyle',
            'borderTopWidth',
            'borderRightWidth',
            'borderBottomWidth',
            'borderLeftWidth',
            'borderRadius',
            'color',
            'fill',
            'stroke'
        ];

        propertiesToResolve.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== '' && value !== 'none') {
                // Force set the style with !important to override any inline styles
                clone.style.setProperty(prop, value, 'important');
            }
        });

        // Recursively resolve CSS variables for all children (including SVG and foreignObject)
        const originalChildren = Array.from(original.children);
        const cloneChildren = Array.from(clone.children);

        for (let i = 0; i < originalChildren.length; i++) {
            const originalChild = originalChildren[i];
            const cloneChild = cloneChildren[i];

            if (originalChild instanceof HTMLElement && cloneChild instanceof HTMLElement) {
                this.resolveCssVariables(originalChild, cloneChild);
            } else if (originalChild instanceof SVGElement && cloneChild instanceof SVGElement) {
                // Handle SVG elements specially
                this.resolveSvgCssVariables(originalChild, cloneChild);
            }
        }
    }

    /**
     * Resolves CSS variables in SVG elements
     * @param original - Original SVG element to read computed styles from
     * @param clone - Cloned SVG element to apply resolved styles to
     */
    private static resolveSvgCssVariables(original: SVGElement, clone: SVGElement): void {
        // Get computed style for SVG element
        const computedStyle = window.getComputedStyle(original);

        // SVG-specific properties
        const svgProps = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray'];

        svgProps.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== '' && value !== 'none') {
                clone.setAttribute(prop, value);
            }
        });

        // Recursively handle SVG children
        const originalChildren = Array.from(original.children);
        const cloneChildren = Array.from(clone.children);

        for (let i = 0; i < originalChildren.length; i++) {
            const originalChild = originalChildren[i];
            const cloneChild = cloneChildren[i];

            if (originalChild instanceof HTMLElement && cloneChild instanceof HTMLElement) {
                this.resolveCssVariables(originalChild, cloneChild);
            } else if (originalChild instanceof SVGElement && cloneChild instanceof SVGElement) {
                this.resolveSvgCssVariables(originalChild, cloneChild);
            }
        }
    }

    /**
     * Clones canvas and removes grid elements from the clone
     * @param canvasElement - The diagram canvas DOM element
     * @returns Cloned element with grid removed
     */
    private static cloneAndRemoveGrid(canvasElement: HTMLElement): HTMLElement {
        // Clone the canvas element (deep clone to get all children)
        const clone = canvasElement.cloneNode(true) as HTMLElement;

        // Resolve CSS variables before removing grid (so we can compute styles correctly)
        this.resolveCssVariables(canvasElement, clone);

        // Remove background color from the main container (makes it transparent)
        clone.style.backgroundColor = 'transparent';

        // Also check for .joint-paper element and make it transparent
        const jointPaper = clone.querySelector('.joint-paper');
        if (jointPaper) {
            (jointPaper as HTMLElement).style.backgroundColor = 'transparent';
        }

        // Remove JointJS grid-related elements from the clone only
        clone.querySelector('.joint-paper-background')?.remove();
        clone.querySelector('.joint-grid-layer')?.remove();

        console.log('[DiagramPngExport] Created clone without grid and background');
        return clone;
    }

    /**
     * Crops a canvas to the specified bounding box
     * @param sourceCanvas - The canvas to crop
     * @param bounds - The bounding box to crop to
     * @param scale - The scale factor used in rendering
     * @returns Cropped canvas
     */
    private static cropCanvas(
        sourceCanvas: HTMLCanvasElement,
        bounds: { x: number; y: number; width: number; height: number },
        scale: number
    ): HTMLCanvasElement {
        const croppedCanvas = document.createElement('canvas');
        const ctx = croppedCanvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get canvas 2D context');
        }

        // Apply scale to bounds
        const scaledX = bounds.x * scale;
        const scaledY = bounds.y * scale;
        const scaledWidth = bounds.width * scale;
        const scaledHeight = bounds.height * scale;

        // Set cropped canvas dimensions
        croppedCanvas.width = scaledWidth;
        croppedCanvas.height = scaledHeight;

        // Draw the cropped portion
        ctx.drawImage(
            sourceCanvas,
            scaledX, scaledY, scaledWidth, scaledHeight, // Source rectangle
            0, 0, scaledWidth, scaledHeight // Destination rectangle
        );

        console.log('[DiagramPngExport] Cropped canvas to content bounds');
        return croppedCanvas;
    }

    /**
     * Converts a canvas element to PNG data URL
     * @param canvasElement - The diagram canvas DOM element
     * @param options - Export options for customization
     * @returns Promise resolving to base64 PNG data URL
     */
    static async exportToPng(
        canvasElement: HTMLElement,
        options: PngExportOptions = {}
    ): Promise<string> {
        const {
            backgroundColor, // Don't set default - let it be undefined/null for transparency
            scale = 2, // Higher scale for better quality
            width,
            height,
            includeGrid = true
        } = options;

        // Use white background by default only if grid is included and no background specified
        const finalBackgroundColor = backgroundColor !== undefined
            ? backgroundColor
            : (includeGrid ? '#ffffff' : null);

        let clonedElement: HTMLElement | null = null;

        try {
            // Calculate content bounding box before any modifications
            const contentBounds = this.getContentBoundingBox(canvasElement, 20);

            // Use clone without grid if requested, otherwise use original
            const elementToCapture = includeGrid
                ? canvasElement
                : this.cloneAndRemoveGrid(canvasElement);

            // If using clone, temporarily add it to DOM (html2canvas needs it in DOM)
            if (!includeGrid && elementToCapture !== canvasElement) {
                clonedElement = elementToCapture;
                clonedElement.style.position = 'absolute';
                clonedElement.style.left = '-9999px';
                clonedElement.style.top = '0';
                document.body.appendChild(clonedElement);
            }

            const canvas = await html2canvas(elementToCapture, {
                backgroundColor: finalBackgroundColor,
                scale,
                width,
                height,
                useCORS: true,
                logging: false,
                allowTaint: true,
            });

            // Remove clone from document if we added it
            if (clonedElement && document.body.contains(clonedElement)) {
                document.body.removeChild(clonedElement);
            }

            // Crop canvas to content bounds if we calculated them
            const finalCanvas = contentBounds
                ? this.cropCanvas(canvas, contentBounds, scale)
                : canvas;

            return finalCanvas.toDataURL('image/png');
        } catch (error) {
            // Clean up clone even if export fails
            if (clonedElement && document.body.contains(clonedElement)) {
                document.body.removeChild(clonedElement);
            }

            console.error('Error exporting diagram to PNG:', error);
            throw new Error('Failed to export diagram as PNG');
        }
    }

    /**
     * Downloads a PNG data URL as a file
     * @param dataUrl - Base64 PNG data URL
     * @param fileName - Name for the downloaded file (without extension)
     * @returns The full filename with extension
     */
    static downloadPng(dataUrl: string, fileName: string): string {
        const fullFileName = `${fileName}.png`;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fullFileName;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return fullFileName;
    }

    /**
     * Converts base64 data URL to blob for upload
     * @param dataUrl - Base64 PNG data URL
     * @returns Blob object
     */
    static dataUrlToBlob(dataUrl: string): Blob {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    }

    /**
     * Converts base64 data URL to base64 string (without data URL prefix)
     * @param dataUrl - Base64 PNG data URL
     * @returns Pure base64 string
     */
    static dataUrlToBase64(dataUrl: string): string {
        return dataUrl.split(',')[1];
    }

    /**
     * Uploads PNG to cloud storage via API
     * @param dataUrl - Base64 PNG data URL
     * @param fileName - Name for the file (without extension)
     * @returns Promise resolving to API response
     */
    static async uploadPngToCloud(dataUrl: string, fileName: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
        try {
            const base64Data = this.dataUrlToBase64(dataUrl);

            const response = await fetch('/api/diagram/export-png', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: `${fileName}.png`,
                    imageData: base64Data,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload PNG to cloud');
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading PNG to cloud:', error);
            throw error;
        }
    }
}
