'use client';

import React, { useState, useCallback } from 'react';
import { 
    Drawer, 
    Box, 
    Typography, 
    IconButton,
    Divider,
    Paper,
    Chip,
    Button
} from '@mui/material';
import { 
    Close as CloseIcon,
    CloseRounded,
    ExtensionRounded
} from '@mui/icons-material';
import { useDatamodelData } from '@/contexts/DatamodelDataContext';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { GroupType, EntityType } from '@/lib/Types';
import { EntityGroupAccordion } from '@/components/shared/elements/EntityGroupAccordion';

interface EntitySelectionPaneProps {
    open: boolean;
    onClose: () => void;
}

export const EntitySelectionPane =({ open, onClose }: EntitySelectionPaneProps) => {
    const { groups } = useDatamodelData();
    const { addEntity } = useDiagramView();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [selectedEntities, setSelectedEntities] = useState<EntityType[]>([]);

    const handleEntitySelect = useCallback((entity: EntityType) => {
        setSelectedEntities(prev => {
            if (prev.find(e => e.SchemaName === entity.SchemaName)) {
                return prev;
            }
            return [...prev, entity];
        });
    }, []);

    const handleEntityDeselect = useCallback((entity: EntityType) => {
        setSelectedEntities(prev => prev.filter(e => e.SchemaName !== entity.SchemaName));
    }, []);

    const handleSubmit = () => {
        selectedEntities.forEach(entity => {
            addEntity(undefined, entity.DisplayName, entity);
        });
        setSelectedEntities([]);
        onClose();
    }

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
                
                <Divider sx={{ mb: 2 }} />

                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Selected:
                    </Typography>
                    {selectedEntities.map((entity) => (
                        <Chip variant='outlined' size='small' className="m-0.5" key={entity.SchemaName} icon={
                            entity.IconBase64 ? <div 
                                className="h-4 w-4 ml-1"
                                style={{
                                    maskImage: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                                    maskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    backgroundColor: 'currentColor'
                                }}
                            /> : <ExtensionRounded />} deleteIcon={<CloseRounded className='w-4 h-4' />} 
                            label={entity.DisplayName} 
                            onDelete={() => handleEntityDeselect(entity)} />
                    ))}
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
                            />
                        ))}
                    </Paper>
                )}
                
                <Divider sx={{ my: 2 }} />

                <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth disabled={selectedEntities.length === 0}>
                    Add Selected Entities
                </Button>
            </Box>
        </Drawer>
    );
};