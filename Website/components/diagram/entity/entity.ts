import { AttributeType, EntityType } from '@/lib/Types';
import { dia, util } from '@joint/core';
import { EntityBody } from './EntityBody';

export class EntityElement extends dia.Element {

    initialize(...args: any[]) {
        super.initialize(...args);
        const entity = this.get('data');
        if (entity) this.updateAttributes(entity);
    }

    updateAttributes(entity: EntityType) {
        const itemHeight = 32;
        const headerHeight = 80;
        const maxHeight = this.get('size')!.height;
        const availableHeight = maxHeight - headerHeight;
        const maxVisibleItems = Math.floor(availableHeight / itemHeight);
        // thoughts only custom no MS lookups. Then we can add functionality to add extra lookups 
        console.log(entity.Relationships.filter(r => !r.Name.startsWith("regarding") 
            && !r.Name.startsWith("object") 
            && !r.Name.startsWith("record") 
            && !r.Name.startsWith("msa") 
            && !r.Name.startsWith("master")))
        const visibleItems = entity.Attributes.filter(attr => attr.AttributeType === "LookupAttribute" && attr.Targets.every(t => t.IsInSolution)).slice(0, maxVisibleItems);

        const html = EntityBody({ entity, visibleItems });

        // links for relationships
        const itemAttrs: any = {};
        visibleItems.forEach((_, i) => {
            itemAttrs[`port-${i}`] = {
                ref: 'body',
                refX: '100%',
                refY: 80 + i * itemHeight + itemHeight / 2,
                xAlignment: 'middle',
                yAlignment: 'middle',
                magnet: true,
                r: 6,
                fill: '#2563eb',
                stroke: '#1e40af'
            };
        });

        this.set('attrs', {
            ...this.get('attrs'),
            fo: {
                refWidth: '100%',
                refHeight: '100%',
                html
            },
            ...itemAttrs
        });

        // Markup
        const baseMarkup = [
            { tagName: 'rect', selector: 'body' },
            {
                tagName: 'foreignObject',
                selector: 'fo'
            },
            ...visibleItems.map((_, i) => ({
                tagName: 'circle',
                selector: `port-${i}`
            }))
        ];

        this.set('markup', baseMarkup);
    }

    defaults() {
        return {
            type: 'delegate.entity',
            size: { width: 480, height: 360 },
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
            markup: [] // dynamic in updateItems
        };
    }
}
