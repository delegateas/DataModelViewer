// DetailedDiagramRender.ts
import { dia, shapes } from '@joint/core';
import { SimpleEntityElement } from '@/components/diagram/entity/SimpleEntityElement';
import { DiagramRenderer, IPortMap } from '../DiagramRenderer';
import { EntityElement } from '../entity/EntityElement';
import { AttributeType, EntityType } from '@/lib/Types';

export class DetailedDiagramRender extends DiagramRenderer {
    
    onDocumentClick(event: MouseEvent): void {
        const target = (event.target as HTMLElement).closest('button[data-schema-name]') as HTMLElement;

        if (target) {
            const schemaName = target.dataset.schemaName!;
            const isKey = target.dataset.isKey === 'true';

            if (isKey) this.setSelectedKey?.(schemaName);
        } else {
            this.setSelectedKey?.(undefined);
        }
    }

    createEntity(entity: EntityType, position: { x: number, y: number }) {
        const { visibleItems, portMap } = EntityElement.getVisibleItemsAndPorts(entity);
        const entityElement = new EntityElement({
        position,
        data: { entity }
        });

        entityElement.addTo(this.graph);
        return { element: entityElement, portMap };
    }

    createLinks(entity: EntityType, entityMap: Map<string, { element: dia.Element, portMap: IPortMap }>) {
        const entityInfo = entityMap.get(entity.SchemaName);
        if (!entityInfo) return;

        const { portMap } = entityInfo;
        const { visibleItems } = EntityElement.getVisibleItemsAndPorts(entity);

        for (let i = 1; i < visibleItems.length; i++) {
            const attr = visibleItems[i];
            if (attr.AttributeType !== 'LookupAttribute') continue;

            for (const target of attr.Targets) {
                const targetInfo = entityMap.get(target.Name);
                if (!targetInfo) continue;

                const sourcePort = portMap[attr.SchemaName.toLowerCase()];
                const targetPort = targetInfo.portMap[`${target.Name.toLowerCase()}id`];
                if (!sourcePort || !targetPort) continue;

                const link = new shapes.standard.Link({
                source: { id: entityInfo.element.id, port: sourcePort },
                target: { id: targetInfo.element.id, port: targetPort },
                router: { name: 'avoid', args: {} },
                connector: { name: 'jumpover', args: { radius: 8 } },
                attrs: {
                    line: {
                    stroke: '#42a5f5',
                    strokeWidth: 2,
                    sourceMarker: {
                        type: 'ellipse',
                        cx: -6,
                        cy: 0,
                        rx: 4,
                        ry: 4,
                        fill: '#fff',
                        stroke: '#42a5f5',
                        strokeWidth: 2,
                    },
                    targetMarker: {
                        type: 'path',
                        d: 'M 6 -3 L 0 0 L 6 3 Z',
                        fill: '#42a5f5',
                        stroke: '#42a5f5'
                    }
                    }
                }
            });

            link.addTo(this.graph);
        }
        }
    }

    highlightSelectedKey(graph: dia.Graph, entities: EntityType[], selectedKey: string): void {
        const entity = entities.find(e =>
            e.Attributes.some(a => a.SchemaName === selectedKey && a.IsPrimaryId)
        );
        if (!entity) return;

        const entityId = graph.getElements().find(el =>
            el.get('type') === 'delegate.entity' &&
            el.get('data')?.entity?.SchemaName === entity.SchemaName
        )?.id;

        if (!entityId) return;

        const portId = `port-${selectedKey.toLowerCase()}`;
        graph.getLinks().forEach(link => {
            const target = link.target();
            if (target.id === entityId && target.port === portId) {
                link.attr('line/stroke', '#ff6b6b');
                link.attr('line/strokeWidth', 4);
                link.attr('line/targetMarker/stroke', '#ff6b6b');
                link.attr('line/targetMarker/fill', '#ff6b6b');
                link.attr('line/sourceMarker/stroke', '#ff6b6b');
            }
        });
    }

    updateEntityAttributes(graph: dia.Graph, selectedKey: string): void {
        graph.getElements().forEach(el => {
            if (el.get('type') === 'delegate.entity') {
                const currentData = el.get('data');
                el.set('data', { ...currentData, selectedKey });

                const entityElement = el as unknown as EntityElement;
                if (entityElement.updateAttributes) {
                    entityElement.updateAttributes(currentData.entity);
                }
            }
        });
    }

    onLinkClick(linkView: dia.LinkView, evt: dia.Event): void {
        evt.stopPropagation();
        alert('Relationship info (detailed view)');
    }

    getVisibleAttributes(entity: EntityType): AttributeType[] {
        return EntityElement.getVisibleItemsAndPorts(entity).visibleItems;
    }
}
