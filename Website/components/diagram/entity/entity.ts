import { AttributeType, EntityType } from '@/lib/Types';
import { dia, util } from '@joint/core';
import { EntityBody } from './EntityBody';
import Attributes from '@/components/Attributes';

export class EntityElement extends dia.Element {

    initialize(...args: any[]) {
        super.initialize(...args);
        const entity = this.get('data');
        if (entity) this.updateAttributes(entity);
    }

    static getVisibleItemsAndPorts(entity: EntityType) {
        const itemHeight = 32;
        const headerHeight = 80;
        const maxHeight = 360; // default size
        const availableHeight = maxHeight - headerHeight;
        const maxVisibleItems = Math.floor(availableHeight / itemHeight);
        const visibleItems = [
            { DisplayName: "Key", SchemaName: entity.SchemaName + "id" } as AttributeType,
            ...entity.Attributes.filter(attr =>
                attr.AttributeType === "LookupAttribute" &&
                !attr.IsManaged &&
                !attr.SchemaName.startsWith("msdyn")
            )
        ].slice(0, maxVisibleItems);
        // Map SchemaName to port name
        const portMap: Record<string, string> = {};
        for (const attr of visibleItems) {
            portMap[attr.SchemaName.toLowerCase()] = `port-${attr.SchemaName.toLowerCase()}`;
        }
        return { visibleItems, portMap };
    }

    updateAttributes(entity: EntityType) {
        const { visibleItems, portMap } = EntityElement.getVisibleItemsAndPorts(entity);
        const html = EntityBody({ entity, visibleItems });

        // Markup
        const baseMarkup = [
            { tagName: 'rect', selector: 'body' },
            { tagName: 'foreignObject', selector: 'fo' }
        ];

        this.set('markup', baseMarkup);

        const itemHeight = 28;
        const itemYSpacing = 8;
        const itemXSpacing = 16;
        const startY = 80 + itemYSpacing / 2;

        const height = startY + visibleItems.length * (itemHeight + itemYSpacing);

        // Generate ports and SVG attributes
        const portItems = visibleItems.map((attr, i) => {
            const portId = `port-${attr.SchemaName.toLowerCase()}`;
            const y = startY + i * (itemHeight + itemYSpacing);

            return {
                id: portId,
                group: 'attribute',
                args: { x: itemXSpacing, y },
                attrs: {
                    'attribute-rect': {
                        width: 480 - itemXSpacing * 2,
                        fill: "transparent",
                        height: itemHeight,
                        magnet: true
                    },
                }
            };
        });

        this.set('ports', {
            groups: {
                attribute: {
                    position: {
                        name: 'absolute'
                    },
                    markup: [
                        { tagName: 'rect', selector: 'attribute-rect' }
                    ]
                }
            },
            items: portItems
        });

        this.set('attrs', {
            ...this.get('attrs'),
            fo: {
                refWidth: '100%',
                refHeight: '100%',
                html
            }
        });

        this.resize(480, height);
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
