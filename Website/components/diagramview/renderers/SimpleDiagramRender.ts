// SimpleDiagramRenderer.ts
import { dia, shapes } from '@joint/core';
import { SimpleEntityElement } from '@/components/diagram/elements/SimpleEntityElement';
import { DiagramRenderer, IPortMap } from '../DiagramRenderer';
import { AttributeType, EntityType } from '@/lib/Types';

export class SimpleDiagramRenderer extends DiagramRenderer {
    
    onDocumentClick(): void { }

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

    createLinks(entity: EntityType, entityMap: Map<string, { element: dia.Element, portMap: IPortMap }>, allEntities: EntityType[]) {
        const entityInfo = entityMap.get(entity.SchemaName);
        if (!entityInfo) return;

        // Get visible attributes for this entity
        const visibleAttributes = this.getVisibleAttributes(entity);

        for (const attr of visibleAttributes) {
        if (attr.AttributeType !== 'LookupAttribute') continue;

        for (const target of attr.Targets) {
            const targetInfo = entityMap.get(target.Name);
            if (!targetInfo) continue;

            const isSelfRef = entityInfo.element.id === targetInfo.element.id;

            // Find the corresponding relationship for this lookup attribute
            // Check both source and target entities as the relationship could be defined on either side
            let relationship = entity.Relationships.find(rel => 
                rel.TableSchema === target.Name && 
                rel.Name === attr.SchemaName
            );
            
            // If not found in source entity, check the target entity
            if (!relationship) {
                const targetEntity = allEntities.find(e => e.SchemaName === target.Name);
                if (targetEntity) {
                    // Look for the reverse relationship in the target entity
                    relationship = targetEntity.Relationships.find(rel => 
                        rel.TableSchema === entity.SchemaName
                    );
                }
            }

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

            // Store relationship metadata on the link
            if (relationship) {
                link.set('relationshipName', relationship.LookupDisplayName);
                link.set('relationshipSchema', relationship.RelationshipSchema);
                link.set('sourceEntity', entity.SchemaName);
                link.set('targetEntity', target.Name);
            }

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

        graph.getLinks().forEach(link => {
            const target = link.target();
            if (target.id === entityId) {
                link.attr('line/stroke', '#ff6b6b');
                link.attr('line/strokeWidth', 4);
            }
        });
    }

    updateEntityAttributes(): void {
        // Simple entities don't display key attributes, so nothing to do
    }

    onLinkClick(linkView: dia.LinkView, evt: dia.Event): void {
        evt.stopPropagation();
        
        const link = linkView.model as dia.Link;
        if (this.onLinkClickHandler) {
            this.onLinkClickHandler(link);
        } else {
            // Fallback alert if no handler is provided
            alert('Relationship info (simple view)');
        }
    }

    getVisibleAttributes(entity: EntityType): AttributeType[] {
        // For simple entities, use the visibleAttributeSchemaNames to determine which attributes are "visible"
        // If no visibleAttributeSchemaNames is set, only show primary key attributes by default
        const visibleSchemaNames = entity.visibleAttributeSchemaNames || 
            entity.Attributes.filter(attr => attr.IsPrimaryId).map(attr => attr.SchemaName);
        
        return entity.Attributes.filter(attr => 
            visibleSchemaNames.includes(attr.SchemaName)
        );
    }
}
