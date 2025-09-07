import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    Button, 
    TextField, 
    Typography,
    Box,
    Divider
} from '@mui/material';
import { SquareElement, SquareElementData } from '../elements/SquareElement';
import { PRESET_COLORS } from '../shared/DiagramConstants';
import { DeleteRounded, SquareRounded } from '@mui/icons-material';

export interface SquarePropertiesPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedSquare: SquareElement | null;
    onDeleteSquare?: () => void;
}

export const SquarePropertiesPane: React.FC<SquarePropertiesPaneProps> = ({
    isOpen,
    onOpenChange,
    selectedSquare,
    onDeleteSquare
}) => {
    const [squareData, setSquareData] = useState<SquareElementData>({
        borderColor: PRESET_COLORS.borders[0].value,
        fillColor: PRESET_COLORS.fills[0].value,
        borderWidth: 2,
        borderType: 'dashed',
        opacity: 0.7
    });

    // Update local state when selected square changes
    useEffect(() => {
        if (selectedSquare) {
            const data = selectedSquare.getSquareData();
            setSquareData({
                borderColor: data.borderColor || PRESET_COLORS.borders[0].value,
                fillColor: data.fillColor || PRESET_COLORS.fills[0].value,
                borderWidth: data.borderWidth || 2,
                borderType: data.borderType || 'dashed',
                opacity: data.opacity || 0.7
            });
        }
    }, [selectedSquare]);

    const handleDataChange = (key: keyof SquareElementData, value: string | number) => {
        const newData = { ...squareData, [key]: value };
        setSquareData(newData);
        
        // Apply changes immediately to the square
        if (selectedSquare) {
            selectedSquare.updateSquareData(newData);
        }
    };

    const handlePresetFillColor = (color: string) => {
        handleDataChange('fillColor', color);
    };

    const handlePresetBorderColor = (color: string) => {
        handleDataChange('borderColor', color);
    };

    const handleDeleteSquare = () => {
        if (selectedSquare && onDeleteSquare) {
            onDeleteSquare();
            onOpenChange(false); // Close the panel after deletion
        }
    };

    if (!selectedSquare) {
        return null;
    }

    return (
        <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SquareRounded />
                Square Properties
            </DialogTitle>
            <DialogContent sx={{ minHeight: '500px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    {/* Fill Color Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Fill Color
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 2 }}>
                            {PRESET_COLORS.fills.map((color) => (
                                <Button
                                    key={color.value}
                                    variant="outlined"
                                    size="small"
                                    sx={{ 
                                        minWidth: 0, 
                                        height: 32, 
                                        padding: 0.5, 
                                        backgroundColor: color.value,
                                        border: squareData.fillColor === color.value ? 2 : 1,
                                        borderColor: squareData.fillColor === color.value ? 'primary.main' : 'divider',
                                        '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                    onClick={() => handlePresetFillColor(color.value)}
                                    title={color.name}
                                />
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                type="color"
                                value={squareData.fillColor}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('fillColor', e.target.value)}
                                sx={{ width: 48, '& .MuiInputBase-input': { padding: 0.5, height: 32 } }}
                                size="small"
                            />
                            <TextField
                                type="text"
                                value={squareData.fillColor}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('fillColor', e.target.value)}
                                placeholder="#f1f5f9"
                                sx={{ flex: 1 }}
                                size="small"
                            />
                        </Box>
                    </Box>

                    <Divider />

                    {/* Border Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Border
                        </Typography>
                        
                        {/* Border Color */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Color
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 2 }}>
                                {PRESET_COLORS.borders.map((color) => (
                                    <Button
                                        key={color.value}
                                        variant="outlined"
                                        size="small"
                                        sx={{ 
                                            minWidth: 0, 
                                            height: 32, 
                                            padding: 0.5, 
                                            backgroundColor: color.value,
                                            border: squareData.borderColor === color.value ? 2 : 1,
                                            borderColor: squareData.borderColor === color.value ? 'primary.main' : 'divider',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                        onClick={() => handlePresetBorderColor(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    type="color"
                                    value={squareData.borderColor}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('borderColor', e.target.value)}
                                    sx={{ width: 48, '& .MuiInputBase-input': { padding: 0.5, height: 32 } }}
                                    size="small"
                                />
                                <TextField
                                    type="text"
                                    value={squareData.borderColor}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('borderColor', e.target.value)}
                                    placeholder="#64748b"
                                    sx={{ flex: 1 }}
                                    size="small"
                                />
                            </Box>
                        </Box>

                        {/* Border Width */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Width
                            </Typography>
                            <TextField
                                type="number"
                                inputProps={{ min: 0, max: 10, step: 1 }}
                                value={squareData.borderWidth}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('borderWidth', parseInt(e.target.value) || 0)}
                                size="small"
                                fullWidth
                            />
                        </Box>

                        {/* Border Type */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Style
                            </Typography>
                            <TextField
                                select
                                value={squareData.borderType}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('borderType', e.target.value)}
                                size="small"
                                fullWidth
                                SelectProps={{ native: true }}
                            >
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                            </TextField>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Opacity Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Opacity
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                            <TextField
                                type="range"
                                inputProps={{ min: 0, max: 1, step: 0.1 }}
                                value={squareData.opacity}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('opacity', parseFloat(e.target.value))}
                                fullWidth
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                {Math.round((squareData.opacity || 0.7) * 100)}%
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Delete Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'error.main' }}>
                            Danger Zone
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            fullWidth
                            onClick={handleDeleteSquare}
                            startIcon={<DeleteRounded />}
                        >
                            Delete Square
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
