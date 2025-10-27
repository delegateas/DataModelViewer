'use client';

import React, { useState, useCallback } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
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

    const handleEntitySelect = useCallback((entity: EntityType) => {
        addEntity(entity, undefined, entity.DisplayName);
    }, []);

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
                        Select Entity to Add
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                {groups.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        No entity groups found. Please load datamodel data first.
                    </Typography>
                ) : (
                    <Paper className="border rounded-lg" sx={{ borderColor: 'border.main' }} variant="outlined">
                        {groups.map((group: GroupType) => (
                            <EntityGroupAccordion
                                key={group.Name}
                                group={group}
                                isExpanded={expandedGroups.has(group.Name)}
                                onToggle={handleGroupToggle}
                                onEntityClick={handleEntitySelect}
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