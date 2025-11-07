import { useDiagramView } from '@/contexts/DiagramViewContext';
import { RelationshipInformation } from '@/lib/diagram/models/relationship-information';
import { Box, Chip, Typography, TextField, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { RelationshipItem } from './RelationshipItem';

interface IRelationshipPropertiesProps {
    relationships: RelationshipInformation[];
    linkId?: string;
}

const RelationshipProperties = ({ relationships, linkId }: IRelationshipPropertiesProps) => {

    const { toggleRelationshipLink, updateRelationshipLinkLabel, getGraph } = useDiagramView();
    const [isToggled, setIsToggled] = useState<Map<number, boolean | undefined>>(relationships.reduce((map, rel, index) => {
        map.set(index, rel.isIncluded);
        return map;
    }, new Map<number, boolean | undefined>()));
    const [label, setLabel] = useState<string>('');

    // Load current label from link when component mounts or linkId changes
    useEffect(() => {
        if (!linkId) return;

        const graph = getGraph();
        if (!graph) return;

        const link = graph.getLinks().find(l => l.id === linkId);
        if (link) {
            const labels = link.labels();
            const currentLabel = labels.length > 0 ? labels[0].attrs?.label?.text || '' : '';
            setLabel(currentLabel);
        }
    }, [linkId, getGraph]);

    const handleToggleInclude = (index: number, newValue: boolean | undefined) => {
        if (!linkId) return;

        // Only call toggleRelationshipLink if switching between included/excluded (not for 'new' state)
        if (newValue !== undefined) {
            toggleRelationshipLink(linkId, relationships[index].RelationshipSchemaName, newValue);
        }

        setIsToggled((prev) => new Map(prev).set(index, newValue));
    };

    const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLabel = event.target.value;
        setLabel(newLabel);
        if (linkId) {
            updateRelationshipLinkLabel(linkId, newLabel);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', py: 1, flexShrink: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Relationship Link
                </Typography>
                <Chip
                    label={`${relationships.length} relationship${relationships.length !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: '20px', fontSize: '11px' }}
                />
            </Box>

            <Divider sx={{ flexShrink: 0 }} />

            {/* Link Label Input */}
            <Box sx={{ px: 0, py: 2, flexShrink: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.secondary' }}>
                    Link Label
                </Typography>
                <TextField
                    value={label}
                    onChange={handleLabelChange}
                    size="small"
                    fullWidth
                    placeholder="Enter custom label (optional)"
                    sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }}
                />
            </Box>

            <Divider sx={{ flexShrink: 0 }} />

            {/* Relationships List - Scrollable */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', pt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1.5, display: 'block', color: 'text.secondary', flexShrink: 0 }}>
                    Relationships on this Link
                </Typography>
                <Box sx={{
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    flexGrow: 1,
                    pb: 2,
                }}>
                    {relationships.map((rel, index) => (
                        <RelationshipItem
                            key={index}
                            relationship={rel}
                            isToggled={isToggled.get(index)}
                            onToggle={(newValue) => handleToggleInclude(index, newValue)}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

export default RelationshipProperties;