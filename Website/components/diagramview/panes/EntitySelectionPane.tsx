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
} from '@mui/material';
import {
    Close as CloseIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useDatamodelData } from '@/contexts/DatamodelDataContext';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { GroupType, EntityType } from '@/lib/Types';
import { EntityGroupAccordion } from '@/components/shared/elements/EntityGroupAccordion';

interface EntitySelectionPaneProps {
    open: boolean;
    onClose: () => void;
}

export const EntitySelectionPane = ({ open, onClose }: EntitySelectionPaneProps) => {
    const { groups } = useDatamodelData();
    const { addEntity, isEntityInDiagram } = useDiagramView();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Calculate total entities
    const totalEntities = useMemo(() => {
        return groups.reduce((sum, group) => sum + group.Entities.length, 0);
    }, [groups]);

    // Filter groups based on search term
    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) return groups;

        const lowerSearch = searchTerm.toLowerCase();
        return groups.map(group => ({
            ...group,
            Entities: group.Entities.filter(e =>
                e.DisplayName.toLowerCase().includes(lowerSearch) ||
                e.SchemaName.toLowerCase().includes(lowerSearch)
            )
        })).filter(group => group.Entities.length > 0);
    }, [groups, searchTerm]);

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

    const handleEntitySelect = useCallback((entity: EntityType) => {
        addEntity(entity, undefined, entity.DisplayName);
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
                            Add Entity
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select an entity to add to the diagram
                    </Typography>

                    {totalEntities > 0 && (
                        <>
                            <Chip
                                label={`${totalEntities} entities available`}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 1.5 }}
                            />

                            {/* Search */}
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
                            />
                        </>
                    )}
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    {groups.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 6, px: 3 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                No entities available
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                                Please load datamodel data first to view available entities.
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
                                    onEntityClick={handleEntitySelect}
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