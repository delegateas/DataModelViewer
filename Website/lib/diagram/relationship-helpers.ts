import { EntityType } from '../Types';
import { RelationshipInformation } from './models/relationship-information';
import { dia } from '@joint/core';

/**
 * Collect ALL relationships between two entities
 * Only uses the Relationships array - ignores lookup attributes as they're redundant
 * All relationships are normalized to be relative to sourceEntity -> targetEntity direction
 */
export const getAllRelationshipsBetween = (sourceEntity: EntityType, targetEntity: EntityType): RelationshipInformation[] => {
    if (!sourceEntity || !targetEntity) return [];

    const relationships: RelationshipInformation[] = [];
    const isSelfReferencing = sourceEntity.SchemaName === targetEntity.SchemaName;
    const seenSchemas = new Set<string>(); // Track relationship schemas to avoid duplicates

    // Helper to add relationship if not duplicate
    const addRelationship = (rel: RelationshipInformation) => {
        // For M-M relationships, use schema to detect duplicates
        if (rel.RelationshipType === 'N:N' && rel.RelationshipSchemaName) {
            if (seenSchemas.has(rel.RelationshipSchemaName)) {
                return; // Skip duplicate M-M relationship
            }
            seenSchemas.add(rel.RelationshipSchemaName);
        }
        rel.isIncluded = true;
        relationships.push(rel);
    };

    // Collect relationships from SOURCE entity pointing to TARGET
    // These are 1-M relationships where source is the "1" (parent) side
    if (sourceEntity.Relationships) {
        sourceEntity.Relationships.forEach(rel => {
            if (rel.TableSchema?.toLowerCase() === targetEntity.SchemaName.toLowerCase()) {
                addRelationship({
                    sourceEntitySchemaName: sourceEntity.SchemaName,
                    sourceEntityDisplayName: sourceEntity.DisplayName,
                    targetEntitySchemaName: targetEntity.SchemaName,
                    targetEntityDisplayName: targetEntity.DisplayName,
                    RelationshipType: isSelfReferencing ? "SELF" : rel.RelationshipType,
                    RelationshipSchemaName: rel.RelationshipSchema,
                });
            }
        });
    }

    // If not self-referencing, collect relationships from TARGET entity pointing to SOURCE
    // These represent M-1 relationships from source's perspective (target is "1", source is "many")
    if (!isSelfReferencing && targetEntity.Relationships) {
        targetEntity.Relationships.forEach(rel => {
            if (rel.TableSchema?.toLowerCase() === sourceEntity.SchemaName.toLowerCase()) {
                // Normalize to source -> target perspective
                // Target pointing to source means: target (many) -> source (one)
                // From source perspective: source (one) <- target (many) = M-1
                addRelationship({
                    sourceEntitySchemaName: sourceEntity.SchemaName,
                    sourceEntityDisplayName: sourceEntity.DisplayName,
                    targetEntitySchemaName: targetEntity.SchemaName,
                    targetEntityDisplayName: targetEntity.DisplayName,
                    RelationshipType: rel.RelationshipType,
                    RelationshipSchemaName: rel.RelationshipSchema,
                });
            }
        });
    }

    return relationships;
};

/**
 * Check if a link already exists between two element ids (including self-referencing)
 */
export const linkExistsBetween = (graph: dia.Graph, aId: string, bId: string): boolean => {
    const links = graph.getLinks();
    return links.some(l => {
        const s = l.get('source');
        const t = l.get('target');
        const sId = typeof s?.id === 'string' ? s.id : s?.id?.toString?.();
        const tId = typeof t?.id === 'string' ? t.id : t?.id?.toString?.();

        // Handle self-referencing links (same source and target)
        if (aId === bId) {
            return sId === aId && tId === bId;
        }

        // Handle regular links (bidirectional check)
        return (sId === aId && tId === bId) || (sId === bId && tId === aId);
    });
};