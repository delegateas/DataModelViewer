'use client';

import React, { useState } from 'react';
import { 
    Drawer, 
    Box, 
    Typography, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemText, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails,
    IconButton,
    Divider
} from '@mui/material';
import { 
    Close as CloseIcon, 
    ExpandMore as ExpandMoreIcon,
    FolderOpen as GroupIcon,
    TableChart as EntityIcon
} from '@mui/icons-material';
import { useDatamodelData } from '@/contexts/DatamodelDataContext';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { GroupType, EntityType } from '@/lib/Types';

interface EntitySelectionPaneProps {
    open: boolean;
    onClose: () => void;
}

export const EntitySelectionPane =({ open, onClose }: EntitySelectionPaneProps) => {
    const { groups } = useDatamodelData();
    const { addEntity, zoom, translate } = useDiagramView();
    const [expandedGroups, setExpandedGroups] = useState<Map<string, boolean>>(new Map());

    const handleEntitySelect = (entity: EntityType) => {
        // Add entity at center of current view
        const centerX = (-translate.x / zoom) + (400 / zoom);
        const centerY = (-translate.y / zoom) + (300 / zoom);
        
        // Use DisplayName for the entity label
        addEntity({ x: centerX, y: centerY }, entity.DisplayName);
        
        // Close the pane after selection
        onClose();
    };

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
                
                {groups.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        No entity groups found. Please load datamodel data first.
                    </Typography>
                ) : (
                    <List sx={{ p: 0 }}>
                        {groups.map((group: GroupType) => (
                            <Accordion 
                                disableGutters
                                key={group.Name}
                                expanded={expandedGroups.get(group.Name) || false}
                                onChange={(_, isExpanded) => {
                                    setExpandedGroups(prev => {
                                        const newMap = new Map(prev);
                                        if (isExpanded) {
                                            newMap.set(group.Name, true);
                                        } else {
                                            newMap.delete(group.Name);
                                        }
                                        return newMap;
                                    });
                                }}
                                sx={{ 
                                    boxShadow: 'none', 
                                    '&:before': { display: 'none' },
                                    '& .MuiAccordionSummary-root': { 
                                        minHeight: 48,
                                        '&.Mui-expanded': { minHeight: 48 }
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        '& .MuiAccordionSummary-content': {
                                            alignItems: 'center',
                                            gap: 1
                                        }
                                    }}
                                >
                                    <GroupIcon sx={{ color: 'text.secondary' }} />
                                    <Typography variant="body2" fontWeight="medium">
                                        {group.Name}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ ml: 'auto', mr: 1 }}
                                    >
                                        ({group.Entities.length} entities)
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pt: 0 }}>
                                    <List sx={{ p: 0 }}>
                                        {group.Entities.map((entity: EntityType) => (
                                            <ListItem key={entity.SchemaName} disablePadding>
                                                <ListItemButton
                                                    onClick={() => handleEntitySelect(entity)}
                                                    sx={{ 
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    <EntityIcon 
                                                        sx={{ 
                                                            mr: 2, 
                                                            color: 'primary.main',
                                                            fontSize: 20
                                                        }} 
                                                    />
                                                    <ListItemText
                                                        primary={entity.DisplayName}
                                                        secondary={entity.SchemaName}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            fontWeight: 'medium'
                                                        }}
                                                        secondaryTypographyProps={{
                                                            variant: 'caption',
                                                            color: 'text.secondary'
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </List>
                )}
            </Box>
        </Drawer>
    );
};