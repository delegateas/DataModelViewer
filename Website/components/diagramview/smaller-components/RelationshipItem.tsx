import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';
import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import React from 'react';
import { CheckCircleOutline, BlockOutlined, FiberNewOutlined } from '@mui/icons-material';

interface IRelationshipItemProps {
    relationship: RelationshipInformation;
    isToggled: boolean | undefined;
    onToggle: (newState: boolean | undefined) => void;
}

type RelationshipState = 'new' | 'included' | 'excluded';

export const RelationshipItem = ({ relationship, isToggled, onToggle }: IRelationshipItemProps) => {

    // Determine current state based on isToggled value
    const getCurrentState = (): RelationshipState => {
        if (isToggled === undefined) return 'new';
        return isToggled ? 'included' : 'excluded';
    };

    // Check if this is actually a new relationship
    const isNewRelationship = relationship.isIncluded === undefined;

    const handleStateChange = (_event: React.MouseEvent<HTMLElement>, newState: RelationshipState | null) => {
        if (newState === null) return; // Don't allow deselection

        // Don't allow switching to 'new' state for non-new relationships
        if (newState === 'new' && !isNewRelationship) return;

        switch (newState) {
            case 'new':
                onToggle(undefined);
                break;
            case 'included':
                onToggle(true);
                break;
            case 'excluded':
                onToggle(false);
                break;
        }
    };

    const currentState = getCurrentState();

    // Get arrow symbol based on relationship type
    const getRelationshipSymbol = (type: '1-M' | 'M-1' | 'M-M' | 'SELF'): string => {
        // Match the exact format from RelationshipInformation type
        switch (type) {
            case 'M-1':
                return '→'; // Many-to-One: source has many, target is one
            case '1-M':
                return '←'; // One-to-Many: source is one, target has many
            case 'M-M':
                return '↔'; // Many-to-Many
            case 'SELF':
                return '↻'; // Self-referencing relationship
            default:
                return '—';
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderColor: currentState === 'excluded' ? 'text.disabled' : 'divider',
                opacity: currentState === 'excluded' ? 0.6 : 1,
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: currentState === 'excluded' ? 'text.disabled' : 'primary.main',
                    backgroundColor: 'action.hover'
                }
            }}
        >
            {/* Relationship Header - Compact */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '13px' }} noWrap>
                        {relationship.sourceEntityDisplayName}
                    </Typography>
                    <Chip
                        label={getRelationshipSymbol(relationship.RelationshipType)}
                        size="small"
                        sx={{
                            height: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            minWidth: '32px',
                            '& .MuiChip-label': { px: 0.5 }
                        }}
                    />
                    <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '13px' }} noWrap>
                        {relationship.targetEntityDisplayName}
                    </Typography>
                </Box>

                {relationship.IsManyToMany && (
                    <Chip
                        label="N:N"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: '20px', fontSize: '10px', fontWeight: 600 }}
                    />
                )}
            </Box>

            {/* Schema Name */}
            {relationship.RelationshipSchemaName && (
                <Typography
                    variant='caption'
                    sx={{
                        fontSize: '11px',
                        color: 'text.secondary',
                        display: 'block',
                        mb: 1.5,
                        fontFamily: 'monospace'
                    }}
                    noWrap
                >
                    {relationship.RelationshipSchemaName}
                </Typography>
            )}

            {/* State Toggle Button Group */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <ToggleButtonGroup
                    value={currentState}
                    exclusive
                    onChange={handleStateChange}
                    size="small"
                    fullWidth
                    sx={{
                        '& .MuiToggleButton-root': {
                            textTransform: 'none',
                            fontSize: '11px',
                            py: 0.5,
                            border: 1,
                            '&.Mui-selected': {
                                fontWeight: 600,
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                    backgroundColor: 'primary.dark'
                                }
                            },
                            '&.Mui-disabled': {
                                opacity: 0.3
                            }
                        }
                    }}
                >
                    <ToggleButton
                        value="new"
                        aria-label="new relationship"
                        disabled={!isNewRelationship}
                    >
                        <FiberNewOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                        New
                    </ToggleButton>
                    <ToggleButton value="included" aria-label="included relationship">
                        <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} />
                        Included
                    </ToggleButton>
                    <ToggleButton value="excluded" aria-label="excluded relationship">
                        <BlockOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                        Excluded
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </Paper>
    );
};
