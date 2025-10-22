'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
    Drawer, 
    Box, 
    Typography, 
    IconButton,
    Divider,
    Paper
} from '@mui/material';
import { 
    Close as CloseIcon
} from '@mui/icons-material';
import { useDatamodelData } from '@/contexts/DatamodelDataContext';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { GroupType, EntityType } from '@/lib/Types';
import { EntityGroupAccordion } from '@/components/shared/elements/EntityGroupAccordion';

interface RelatedEntitiesPaneProps {
    open: boolean;
    onClose: () => void;
    entity: EntityType;
}

export const RelatedEntitiesPane = ({ open, onClose, entity }: RelatedEntitiesPaneProps) => {
    const { groups } = useDatamodelData();
    const { addEntity, isEntityInDiagram } = useDiagramView();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Find related entities using memoization for performance
    const relatedEntitiesGroups = useMemo(() => {
        if (!entity || !groups) return [];

        // Get related entity schema names from different sources
        const relatedFromRelationships = new Set<string>();
        const relatedFromLookups = new Set<string>();
        
        // From relationships (TableSchema contains the related entity)
        entity.Relationships.forEach(rel => {
            relatedFromRelationships.add(rel.TableSchema);
        });

        // From lookup attributes (Targets contains related entities)
        entity.Attributes.forEach(attr => {
            if (attr.AttributeType === 'LookupAttribute') {
                attr.Targets.forEach(target => {
                    if (target.IsInSolution) {
                        relatedFromLookups.add(target.Name);
                    }
                });
            }
        });

        // Combine all related entities
        const allRelatedSchemaNames = new Set([...relatedFromRelationships, ...relatedFromLookups]);
        
        // Remove the current entity itself
        allRelatedSchemaNames.delete(entity.SchemaName);

        if (allRelatedSchemaNames.size === 0) return [];

        // Group related entities by their groups
        const relatedGroups: GroupType[] = [];
        
        groups.forEach(group => {
            const relatedEntitiesInGroup = group.Entities.filter(e => 
                allRelatedSchemaNames.has(e.SchemaName)
            );
            
            if (relatedEntitiesInGroup.length > 0) {
                relatedGroups.push({
                    Name: group.Name,
                    Entities: relatedEntitiesInGroup
                });
            }
        });

        return relatedGroups;
    }, [entity, groups]);

    const handleEntityClick = useCallback((clickedEntity: EntityType) => {
        addEntity(
            clickedEntity,
            undefined,
            clickedEntity.DisplayName
        );
    }, [addEntity]);

    const handleGroupToggle = useCallback((groupName: string) => {
        setExpandedGroups(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(groupName)) {
                newExpanded.delete(groupName);
            } else {
                newExpanded.add(groupName);
            }
            return newExpanded;
        });
    }, []);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 400,
                    boxSizing: 'border-box',
                }
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Related Entities
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Entities related to <strong>{entity.DisplayName}</strong> through relationships or lookups
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                {relatedEntitiesGroups.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        No related entities found for this entity.
                    </Typography>
                ) : (
                    <Paper className="border rounded-lg" sx={{ borderColor: 'border.main' }} variant="outlined">
                        {relatedEntitiesGroups.map((group: GroupType) => (
                            <EntityGroupAccordion
                                key={group.Name}
                                group={group}
                                isExpanded={expandedGroups.has(group.Name)}
                                onToggle={handleGroupToggle}
                                onEntityClick={handleEntityClick}
                                showGroupClickIcon={false}
                                isDisabled={isEntityInDiagram}
                            />
                        ))}
                    </Paper>
                )}
            </Box>
        </Drawer>
    );
};