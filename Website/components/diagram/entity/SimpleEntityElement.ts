import { EntityType } from '@/lib/Types';
import { dia } from '@joint/core';

interface ISimpleEntityElement {
    entity: EntityType;
}

export class SimpleEntityElement extends dia.Element {

    initialize(...args: any[]) {
        super.initialize(...args);
        const { entity } = this.get('data') as ISimpleEntityElement;
        if (entity) this.updateEntity(entity);
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
        const icon = entity.IconBase64 != null
            ? `data:image/svg+xml;base64,${entity.IconBase64}`
            : '/vercel.svg';

        return `
            <div class="w-full h-full flex items-center justify-center p-4" data-entity-schema="${entity.SchemaName}">
                <div class="flex items-center space-x-3">
                    <div class="bg-green-100 p-2 rounded-sm">
                        <img src="${icon}" class="w-6 h-6" />
                    </div>
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
            type: 'delegate.simple-entity',
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