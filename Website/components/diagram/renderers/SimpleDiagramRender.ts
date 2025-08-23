// SimpleDiagramRenderer.ts
import { dia, shapes } from '@joint/core';
import { SimpleEntityElement } from '@/components/diagram/elements/SimpleEntityElement';
import { DiagramRenderer, IPortMap } from './DiagramRenderer';
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
        const totalLinksStart = performance.now();
        
        const entityInfoStart = performance.now();
        const entityInfo = entityMap.get(entity.SchemaName);
        if (!entityInfo) return;
        const entityInfoTime = performance.now() - entityInfoStart;

        // Get visible attributes for this entity
        const visibleAttrStart = performance.now();
        const visibleAttributes = this.getVisibleAttributes(entity);
        const visibleAttrTime = performance.now() - visibleAttrStart;

        let totalAttributeTime = 0;
        let totalTargetTime = 0;
        let totalRelationshipFindTime = 0;
        let totalLinkCreationTime = 0;
        let totalAddToGraphTime = 0;
        let linkCount = 0;

        for (const attr of visibleAttributes) {
            const attributeStart = performance.now();
            
            if (attr.AttributeType !== 'LookupAttribute') continue;

            for (const target of attr.Targets) {
                const targetStart = performance.now();
                linkCount++;
                
                const targetInfoStart = performance.now();
                const targetInfo = entityMap.get(target.Name);
                if (!targetInfo) continue;
                const targetInfoTime = performance.now() - targetInfoStart;

                const isSelfRefStart = performance.now();
                const isSelfRef = entityInfo.element.id === targetInfo.element.id;
                const isSelfRefTime = performance.now() - isSelfRefStart;

                // Find the corresponding relationship for this lookup attribute
                const relationshipStart = performance.now();
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
                const relationshipTime = performance.now() - relationshipStart;
                totalRelationshipFindTime += relationshipTime;

                const linkObjectStart = performance.now();
                const link = new shapes.standard.Link({
                    source: isSelfRef
                        ? { id: entityInfo.element.id, port: entityInfo.portMap.right }
                        : { id: entityInfo.element.id },
                    target: isSelfRef
                        ? { id: targetInfo.element.id, port: targetInfo.portMap.left }
                        : { id: targetInfo.element.id },
                    // router: { name: 'avoid', args: {} },
                    router: { name: 'manhattan', args: { padding: 10 } },
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
                const linkObjectTime = performance.now() - linkObjectStart;
                totalLinkCreationTime += linkObjectTime;

                // Store relationship metadata on the link
                const metadataStart = performance.now();
                if (relationship) {
                    link.set('relationshipName', relationship.LookupDisplayName);
                    link.set('relationshipSchema', relationship.RelationshipSchema);
                    link.set('sourceEntity', entity.SchemaName);
                    link.set('targetEntity', target.Name);
                }
                const metadataTime = performance.now() - metadataStart;

                // THIS IS LIKELY WHERE THE PERFORMANCE BOTTLENECK IS
                const addToGraphStart = performance.now();
                link.addTo(this.graph);
                const addToGraphTime = performance.now() - addToGraphStart;
                totalAddToGraphTime += addToGraphTime;

                const totalTargetTimeForThis = performance.now() - targetStart;
                totalTargetTime += totalTargetTimeForThis;

                // Log individual slow links
                if (totalTargetTimeForThis > 30) {
                    console.log(`      🐌 Slow link ${entity.SchemaName} -> ${target.Name}: ${totalTargetTimeForThis.toFixed(2)}ms`);
                    console.log(`        - Target info lookup: ${targetInfoTime.toFixed(2)}ms`);
                    console.log(`        - Self-ref check: ${isSelfRefTime.toFixed(2)}ms`);
                    console.log(`        - Relationship find: ${relationshipTime.toFixed(2)}ms`);
                    console.log(`        - Link object creation: ${linkObjectTime.toFixed(2)}ms`);
                    console.log(`        - Metadata setting: ${metadataTime.toFixed(2)}ms`);
                    console.log(`        - Add to graph (ROUTER CALC): ${addToGraphTime.toFixed(2)}ms`);
                }
            }
            
            totalAttributeTime += (performance.now() - attributeStart);
        }

        const totalTime = performance.now() - totalLinksStart;
        
        // Log summary for this entity if it took significant time
        if (totalTime > 20 && linkCount > 0) {
            console.log(`    📊 Link creation summary for ${entity.SchemaName} (${linkCount} links, ${totalTime.toFixed(2)}ms):`);
            console.log(`      - Entity info: ${entityInfoTime.toFixed(2)}ms`);
            console.log(`      - Visible attributes: ${visibleAttrTime.toFixed(2)}ms`);
            console.log(`      - Relationship finding: ${totalRelationshipFindTime.toFixed(2)}ms`);
            console.log(`      - Link object creation: ${totalLinkCreationTime.toFixed(2)}ms`);
            console.log(`      - Add to graph (ROUTER): ${totalAddToGraphTime.toFixed(2)}ms (${(totalAddToGraphTime/linkCount).toFixed(2)}ms avg)`);
            console.log(`      - Total target processing: ${totalTargetTime.toFixed(2)}ms`);
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
