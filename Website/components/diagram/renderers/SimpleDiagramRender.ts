// SimpleDiagramRenderer.ts
import { dia, shapes } from '@joint/core';
import { SimpleEntityElement } from '@/components/diagram/entity/SimpleEntityElement';
import { DiagramRenderer, IPortMap } from '../DiagramRenderer';
import { EntityElement } from '../entity/entity';
import { AttributeType, EntityType } from '@/lib/Types';

export class SimpleDiagramRenderer extends DiagramRenderer {
    
    onDocumentClick(event: MouseEvent): void { }

    createEntity(entity: EntityType, position: { x: number, y: number }) {
        const entityElement = new SimpleEntityElement({
            position,
            data: { entity }
        });

        entityElement.addTo(this.graph);

        // 4-directional port map
        const portMap = {
            top: 'port-top',
            right: 'port-right',
            bottom: 'port-bottom',
            left: 'port-left'
        };

        return { element: entityElement, portMap };
    }

    createLinks(entity: EntityType, entityMap: Map<string, { element: dia.Element, portMap: IPortMap }>) {
        const entityInfo = entityMap.get(entity.SchemaName);
        if (!entityInfo) return;

        for (const attr of entity.Attributes) {
        if (attr.AttributeType !== 'LookupAttribute') continue;

        for (const target of attr.Targets) {
            const targetInfo = entityMap.get(target.Name);
            if (!targetInfo) continue;

            const isSelfRef = entityInfo.element.id === targetInfo.element.id;

            const link = new shapes.standard.Link({
                source: isSelfRef
                    ? { id: entityInfo.element.id, port: entityInfo.portMap.right }
                    : { id: entityInfo.element.id },
                target: isSelfRef
                    ? { id: targetInfo.element.id, port: targetInfo.portMap.left }
                    : { id: targetInfo.element.id },
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
            el.get('type') === 'delegate.simple-entity' &&
            el.get('data')?.entity?.SchemaName === entity.SchemaName
        )?.id;

        if (!entityId) return;

        graph.getLinks().forEach(link => {
            const target = link.target();
            if (target.id === entityId) {
                link.attr('line/stroke', '#ff6b6b');
                link.attr('line/strokeWidth', 4);
            }
        });
    }

    updateEntityAttributes(graph: dia.Graph, selectedKey: string): void {
        // Simple entities don't display key attributes, so nothing to do
    }

    onLinkClick(linkView: dia.LinkView, evt: dia.Event): void {
        evt.stopPropagation();
        alert('Relationship info (simple view)');
    }

    getVisibleAttributes(entity: EntityType): AttributeType[] {
        return entity.Attributes;
    }
}
