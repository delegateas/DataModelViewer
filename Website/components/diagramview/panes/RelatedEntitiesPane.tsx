'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Paper,
    TextField,
    InputAdornment,
    Chip,
    Collapse
} from '@mui/material';
import {
    Close as CloseIcon,
    Search as SearchIcon,
    ExpandMore as ExpandMoreIcon
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
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showStats, setShowStats] = useState<boolean>(true);

    // Find related entities using memoization for performance
    const { relatedEntitiesGroups, relationshipCount, lookupCount, totalCount } = useMemo(() => {
        if (!entity || !groups) return {
            relatedEntitiesGroups: [],
            relationshipCount: 0,
            lookupCount: 0,
            totalCount: 0
        };

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

        if (allRelatedSchemaNames.size === 0) return {
            relatedEntitiesGroups: [],
            relationshipCount: 0,
            lookupCount: 0,
            totalCount: 0
        };

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

        return {
            relatedEntitiesGroups: relatedGroups,
            relationshipCount: relatedFromRelationships.size,
            lookupCount: relatedFromLookups.size,
            totalCount: allRelatedSchemaNames.size
        };
    }, [entity, groups]);

    // Filter groups based on search term
    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) return relatedEntitiesGroups;

        const lowerSearch = searchTerm.toLowerCase();
        return relatedEntitiesGroups.map(group => ({
            ...group,
            Entities: group.Entities.filter(e =>
                e.DisplayName.toLowerCase().includes(lowerSearch) ||
                e.SchemaName.toLowerCase().includes(lowerSearch)
            )
        })).filter(group => group.Entities.length > 0);
    }, [relatedEntitiesGroups, searchTerm]);

    // Check if entity matches search
    const isEntityMatch = useCallback((entity: EntityType) => {
        if (!searchTerm.trim()) return false;
        const lowerSearch = searchTerm.toLowerCase();
        return entity.DisplayName.toLowerCase().includes(lowerSearch) ||
            entity.SchemaName.toLowerCase().includes(lowerSearch);
    }, [searchTerm]);

    // Highlight matching text
    const highlightText = useCallback((text: string, search: string) => {
        if (!search.trim()) return text;
        const parts = text.split(new RegExp(`(${search})`, 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === search.toLowerCase() ? (
                        <span key={i} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>{part}</span>
                    ) : (
                        part
                    )
                )}
            </>
        );
    }, []);

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
                    width: 450,
                    boxSizing: 'border-box',
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'border.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                            Related Entities
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Connected to <strong>{entity.DisplayName}</strong>
                    </Typography>

                    {/* Stats Section */}
                    {totalCount > 0 && (
                        <Box>
                            <Box
                                onClick={() => setShowStats(!showStats)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    mb: 1,
                                    '&:hover': { opacity: 0.7 }
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>
                                    Summary
                                </Typography>
                                <ExpandMoreIcon
                                    sx={{
                                        fontSize: 16,
                                        transform: showStats ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s'
                                    }}
                                />
                            </Box>
                            <Collapse in={showStats}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                    <Chip
                                        label={`${totalCount} Total`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`${relationshipCount} Relationships`}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`${lookupCount} Lookups`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {/* Search */}
                    {totalCount > 0 && (
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search entities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mt: 1.5 }}
                        />
                    )}
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    {relatedEntitiesGroups.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 6, px: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                No related entities found
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                                This entity has no relationships or lookups to other entities in the solution.
                            </Typography>
                        </Box>
                    ) : filteredGroups.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 6, px: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                No entities match your search
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                                Try adjusting your search terms.
                            </Typography>
                        </Box>
                    ) : (
                        <Paper className="border rounded-lg" sx={{ borderColor: 'border.main' }} variant="outlined">
                            {filteredGroups.map((group: GroupType) => (
                                <EntityGroupAccordion
                                    key={group.Name}
                                    group={group}
                                    isExpanded={expandedGroups.has(group.Name)}
                                    onToggle={handleGroupToggle}
                                    onEntityClick={handleEntityClick}
                                    showGroupClickIcon={false}
                                    isDisabled={isEntityInDiagram}
                                    searchTerm={searchTerm}
                                    highlightText={highlightText}
                                    isEntityMatch={isEntityMatch}
                                />
                            ))}
                        </Paper>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};