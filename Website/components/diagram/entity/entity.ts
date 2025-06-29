import { AttributeType, EntityType } from '@/lib/Types';
import { dia, util } from '@joint/core';
import { EntityBody } from './EntityBody';

interface IEntityElement {
    entity: EntityType;
}

export class EntityElement extends dia.Element {

    initialize(...args: any[]) {
        super.initialize(...args);
        const { entity } = this.get('data') as IEntityElement;
        if (entity) this.updateAttributes(entity);
    }

    static getVisibleItemsAndPorts(entity: EntityType) {
        // Get the primary key attribute
        const primaryKeyAttribute = entity.Attributes.find(attr => attr.IsPrimaryId) ?? 
            { DisplayName: "Key", SchemaName: entity.SchemaName + "id" } as AttributeType;
        
        // Get custom lookup attributes (initially visible)
        const customLookupAttributes = entity.Attributes.filter(attr =>
            attr.AttributeType === "LookupAttribute" && attr.IsCustomAttribute
        );
        
        // Get manually added attributes (stored in entity metadata)
        const manuallyAddedAttributes = entity.Attributes.filter(attr => 
            (entity as any).manuallyAddedAttributes?.includes(attr.SchemaName)
        );
        
        // Combine primary key, custom lookup attributes, and manually added attributes
        const visibleItems = [
            primaryKeyAttribute, 
            ...customLookupAttributes,
            ...manuallyAddedAttributes
        ];

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
        const addButtonHeight = 32; // Space for add button
        const headerHeight = 80;
        const startY = headerHeight + itemYSpacing * 2;

        // Calculate height dynamically based on number of visible items
        const height = startY + visibleItems.length * (itemHeight + itemYSpacing) + addButtonHeight + itemYSpacing;
        
        const leftPorts: dia.Element.Port[] = [];
        const rightPorts: dia.Element.Port[] = [];

        visibleItems.forEach((attr, i) => {
            const portId = `port-${attr.SchemaName.toLowerCase()}`;
            const yPosition = startY + i * (itemHeight + itemYSpacing);

            const portConfig = {
                id: portId,
                group: attr.AttributeType === "LookupAttribute" ? 'right' : 'left',
                args: { y: yPosition },
                attrs: {
                    circle: {
                        r: 6,
                        magnet: true,
                        stroke: '#31d0c6',
                        fill: '#fff',
                        strokeWidth: 2
                    }
                }
            };

            // Only LookupAttributes get ports (for relationships)
            // Other attributes are just displayed in the entity
            if (attr.AttributeType === "LookupAttribute") {
                portConfig.group = 'right';
                rightPorts.push(portConfig);
            } else if (i === 0) { // Key attribute gets a left port
                portConfig.group = 'left';
                leftPorts.push(portConfig);
            }
            // Other attributes don't get ports - they're just displayed
        });

        this.set('ports', {
            groups: {
                left: {
                    position: {
                        name: 'left'
                    },
                    attrs: {
                        circle: {
                            r: 6,
                            magnet: true,
                            stroke: '#31d0c6',
                            fill: '#fff',
                            strokeWidth: 2
                        }
                    }
                },
                right: {
                    position: {
                        name: 'right'
                    },
                    attrs: {
                        circle: {
                            r: 6,
                            magnet: true,
                            stroke: '#31d0c6',
                            fill: '#fff',
                            strokeWidth: 2
                        }
                    }
                }
            },
            items: [...leftPorts, ...rightPorts]
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
