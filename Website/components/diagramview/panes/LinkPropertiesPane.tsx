'use client';

import React, { useState, useEffect } from 'react';
import { dia } from '@joint/core';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    Button, 
    TextField, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Typography,
    Box,
    Divider
} from '@mui/material';
import { PRESET_COLORS, LINE_STYLES, STROKE_WIDTHS } from '../shared/DiagramConstants';

interface LinkPropertiesPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedLink: dia.Link | null;
    onUpdateLink: (linkId: string | number, properties: LinkProperties) => void;
}

export type { LinkPropertiesPaneProps };

export interface LinkProperties {
    color: string;
    strokeWidth: number;
    strokeDasharray?: string;
    label?: string;
}

export const LinkPropertiesPane: React.FC<LinkPropertiesPaneProps> = ({
    isOpen,
    onOpenChange,
    selectedLink,
    onUpdateLink
}) => {
    const [color, setColor] = useState(PRESET_COLORS.borders[1].value); // Default to Blue
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [lineStyle, setLineStyle] = useState('none');
    const [label, setLabel] = useState('');
    const [customColor, setCustomColor] = useState(PRESET_COLORS.borders[1].value);

    // Load current link properties when selectedLink changes
    useEffect(() => {
        if (selectedLink) {
            const currentColor = selectedLink.attr('line/stroke') || PRESET_COLORS.borders[1].value;
            const currentStrokeWidth = selectedLink.attr('line/strokeWidth') || 2;
            const currentDasharray = selectedLink.attr('line/strokeDasharray') || 'none';
            const currentLabel = selectedLink.label(0)?.attrs?.text?.text || '';

            setColor(currentColor);
            setCustomColor(currentColor);
            setStrokeWidth(currentStrokeWidth);
            setLineStyle(currentDasharray === '' ? 'none' : currentDasharray);
            setLabel(currentLabel);
        }
    }, [selectedLink]);

    // Apply changes immediately when any property changes
    useEffect(() => {
        if (selectedLink) {
            const properties: LinkProperties = {
                color,
                strokeWidth,
                strokeDasharray: lineStyle && lineStyle !== 'none' ? lineStyle : undefined,
                label: label || undefined
            };
            onUpdateLink(selectedLink.id, properties);
        }
    }, [color, strokeWidth, lineStyle, label, selectedLink, onUpdateLink]);

    const handleClearLabel = () => {
        setLabel('');
    };

    const handleUseRelationshipName = () => {
        const relationshipName = getRelationshipName();
        if (relationshipName) {
            setLabel(relationshipName);
        }
    };

    const getRelationshipName = () => {
        if (!selectedLink) return null;
        
        // Try to get the relationship name stored on the link
        const relationshipName = selectedLink.get('relationshipName');
        return relationshipName || null;
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        setCustomColor(newColor);
    };

    return (
        <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogContent>
                <DialogTitle>Link Properties</DialogTitle>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Customize the appearance and label of the relationship link.
                </Typography>

                <Box mt={2} display="flex" flexDirection="column" gap={3}>
                    {/* Label Section */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Link Label</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter relationship label..."
                            value={label}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
                        />
                        <Box display="flex" gap={1} mt={1}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleClearLabel}
                                fullWidth
                            >
                                Clear
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleUseRelationshipName}
                                disabled={!getRelationshipName()}
                                fullWidth
                                title={getRelationshipName() || 'No relationship name available'}
                            >
                                Use Relationship Name
                            </Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            Optional text to display on the link
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Color Section */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>Link Color</Typography>
                        <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={1}>
                            {PRESET_COLORS.borders.map((presetColor) => (
                                <Button
                                    key={presetColor.value}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleColorChange(presetColor.value)}
                                    title={presetColor.name}
                                    sx={{
                                        height: 32,
                                        minWidth: 0,
                                        p: 0.5,
                                        backgroundColor: presetColor.value,
                                        border: color === presetColor.value ? '2px solid' : '1px solid',
                                        borderColor: color === presetColor.value ? 'primary.main' : 'grey.300',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            backgroundColor: presetColor.value
                                        }
                                    }}
                                >
                                    <span style={{ visibility: 'hidden' }}>{presetColor.name}</span>
                                </Button>
                            ))}
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1} mt={2}>
                            <TextField
                                type="color"
                                value={customColor}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value)}
                                sx={{ width: 48, '& .MuiInputBase-input': { p: 0.5 } }}
                                size="small"
                            />
                            <TextField
                                fullWidth
                                size="small"
                                type="text"
                                value={color}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleColorChange(e.target.value)}
                                placeholder="#3b82f6"
                            />
                        </Box>
                    </Box>

                    <Divider />

                    {/* Line Style Section */}
                    <Box>
                        <FormControl fullWidth size="small">
                            <InputLabel>Line Style</InputLabel>
                            <Select
                                value={lineStyle}
                                onChange={(e) => setLineStyle(e.target.value)}
                                label="Line Style"
                            >
                                {LINE_STYLES.map((style) => (
                                    <MenuItem key={style.value} value={style.value}>
                                        {style.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Stroke Width Section */}
                    <Box>
                        <FormControl fullWidth size="small">
                            <InputLabel>Line Thickness</InputLabel>
                            <Select
                                value={strokeWidth.toString()}
                                onChange={(e) => setStrokeWidth(parseInt(e.target.value as string))}
                                label="Line Thickness"
                            >
                                {STROKE_WIDTHS.map((width) => (
                                    <MenuItem key={width.value} value={width.value.toString()}>
                                        {width.name} ({width.value}px)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
