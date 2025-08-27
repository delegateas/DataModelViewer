import { EntityType } from '@/lib/Types';
import { dia } from '@joint/core';

interface ISimpleEntityElement {
    entity: EntityType;
}

export class SimpleEntityElement extends dia.Element {

    initialize(...args: Parameters<dia.Element['initialize']>) {
        super.initialize(...args);
        const { entity } = this.get('data') as ISimpleEntityElement;
        if (entity) this.updateEntity(entity);

        // Add 4 ports: top, left, right, bottom, and make them invisible
        this.set('ports', {
            groups: {
                top: {
                    position: { name: 'top' },
                    attrs: {
                        circle: {
                            r: 6,
                            magnet: true,
                            fill: '#fff',
                            stroke: '#42a5f5',
                            strokeWidth: 2,
                            visibility: 'hidden',
                        },
                    },
                },
                left: {
                    position: { name: 'left', args: { dx: 6 } }, 
                    attrs: {
                        circle: {
                            r: 6,
                            magnet: true,
                            fill: '#fff',
                            stroke: '#42a5f5',
                            strokeWidth: 2,
                            visibility: 'hidden',
                        },
                    },
                },
                right: {
                    position: { name: 'right' },
                    attrs: {
                        circle: {
                            r: 6,
                            magnet: true,
                            fill: '#fff',
                            stroke: '#42a5f5',
                            strokeWidth: 2,
                            visibility: 'hidden',
                        },
                    },
                },
                bottom: {
                    position: { name: 'bottom' },
                    attrs: {
                        circle: {
                            r: 6,
                            magnet: true,
                            fill: '#fff',
                            stroke: '#42a5f5',
                            strokeWidth: 2,
                            visibility: 'hidden',
                        },
                    },
                },
            },
            items: [
                { id: 'port-top', group: 'top' },
                { id: 'port-left', group: 'left' },
                { id: 'port-right', group: 'right' },
                { id: 'port-bottom', group: 'bottom' },
            ],
        });
    }

    updateEntity(entity: EntityType) {
        const html = this.createSimpleEntityHTML(entity);

        // Markup
        const baseMarkup = [
            { tagName: 'rect', selector: 'body' },
            { tagName: 'foreignObject', selector: 'fo' }
        ];

        this.set('markup', baseMarkup);

        // Simple entity with just name - fixed size
        const width = 200;
        const height = 80;

        this.set('attrs', {
            ...this.get('attrs'),
            body: {
                refWidth: '100%',
                refHeight: '100%',
                fill: '#fff',
                stroke: '#d1d5db',
                rx: 12
            },
            fo: {
                refWidth: '100%',
                refHeight: '100%',
                html
            }
        });

        this.resize(width, height);
    }

    private createSimpleEntityHTML(entity: EntityType): string {
        return `
            <div class="w-full h-full flex items-center justify-center p-4" data-entity-schema="${entity.SchemaName}">
                <div class="flex items-center space-x-3">
                    <div class="text-center">
                        <h3 class="font-bold text-lg">${entity.DisplayName}</h3>
                        <p class="text-sm text-gray-600 font-mono">${entity.SchemaName}</p>
                    </div>
                </div>
            </div>
        `;
    }

    defaults() {
        return {
            type: 'delegate.entity',
            size: { width: 200, height: 80 },
            attrs: {
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    fill: '#fff',
                    stroke: '#d1d5db',
                    rx: 12
                },
                fo: {
                    refX: 0,
                    refY: 0
                }
            },
            markup: [] // dynamic in updateEntity
        };
    }
}