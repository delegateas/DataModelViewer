import React, { useState, useEffect } from 'react';
import { Type, Trash2 } from 'lucide-react';
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
import { TextElement, TextElementData } from '../elements/TextElement';

export interface TextPropertiesPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedText: TextElement | null;
    onDeleteText?: () => void;
}

const FONT_SIZES = [
    { name: 'Small', value: 12 },
    { name: 'Normal', value: 14 },
    { name: 'Medium', value: 16 },
    { name: 'Large', value: 20 },
    { name: 'Extra Large', value: 24 }
];

const FONT_FAMILIES = [
    { name: 'System Font', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { name: 'Times', value: 'Times, "Times New Roman", serif' },
    { name: 'Courier', value: 'Courier, "Courier New", monospace' }
];

export const TextPropertiesPane: React.FC<TextPropertiesPaneProps> = ({
    isOpen,
    onOpenChange,
    selectedText,
    onDeleteText
}) => {
    const [textData, setTextData] = useState<TextElementData>({
        text: 'Text Element',
        fontSize: 14,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#000000',
        backgroundColor: 'transparent',
        padding: 8,
        borderRadius: 4,
        textAlign: 'left'
    });

    // Update local state when selected text changes
    useEffect(() => {
        if (selectedText) {
            const data = selectedText.getTextData();
            setTextData({
                text: data.text || 'Text Element',
                fontSize: data.fontSize || 14,
                fontFamily: data.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                color: data.color || '#000000',
                backgroundColor: data.backgroundColor || 'transparent',
                padding: data.padding || 8,
                borderRadius: data.borderRadius || 4,
                textAlign: data.textAlign || 'left'
            });
        }
    }, [selectedText]);

    // Apply changes immediately when any property changes
    useEffect(() => {
        if (selectedText) {
            selectedText.updateTextData(textData);
        }
    }, [textData, selectedText]);

    const handleDataChange = (key: keyof TextElementData, value: string | number) => {
        setTextData(prev => ({ ...prev, [key]: value }));
    };

    const handleDeleteText = () => {
        if (selectedText && onDeleteText) {
            onDeleteText();
            onOpenChange(false);
        }
    };

    if (!selectedText) {
        return null;
    }

    return (
        <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Type size={20} />
                Text Properties
            </DialogTitle>
            <DialogContent sx={{ minHeight: '600px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    {/* Text Content */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Text Content
                        </Typography>
                        <TextField
                            placeholder="Enter your text..."
                            value={textData.text}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('text', e.target.value)}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    <Divider />

                    {/* Typography */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Typography
                        </Typography>
                        
                        {/* Font Family */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Font Family
                            </Typography>
                            <TextField
                                select
                                value={textData.fontFamily}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('fontFamily', e.target.value)}
                                size="small"
                                fullWidth
                                SelectProps={{ native: true }}
                            >
                                {FONT_FAMILIES.map((font) => (
                                    <option key={font.value} value={font.value}>
                                        {font.name}
                                    </option>
                                ))}
                            </TextField>
                        </Box>

                        {/* Font Size */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Font Size
                            </Typography>
                            <TextField
                                select
                                value={textData.fontSize.toString()}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('fontSize', parseInt(e.target.value))}
                                size="small"
                                fullWidth
                                SelectProps={{ native: true }}
                            >
                                {FONT_SIZES.map((size) => (
                                    <option key={size.value} value={size.value.toString()}>
                                        {size.name} ({size.value}px)
                                    </option>
                                ))}
                            </TextField>
                        </Box>

                        {/* Text Alignment */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Text Alignment
                            </Typography>
                            <TextField
                                select
                                value={textData.textAlign}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('textAlign', e.target.value as 'left' | 'center' | 'right')}
                                size="small"
                                fullWidth
                                SelectProps={{ native: true }}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </TextField>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Colors */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Colors
                        </Typography>
                        
                        {/* Text Color */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Text Color
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    type="color"
                                    value={textData.color}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('color', e.target.value)}
                                    sx={{ width: 48, '& .MuiInputBase-input': { padding: 0.5, height: 32 } }}
                                    size="small"
                                />
                                <TextField
                                    type="text"
                                    value={textData.color}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('color', e.target.value)}
                                    placeholder="#000000"
                                    sx={{ flex: 1 }}
                                    size="small"
                                />
                            </Box>
                        </Box>

                        {/* Background Color */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Background Color
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    type="color"
                                    value={textData.backgroundColor === 'transparent' ? '#ffffff' : textData.backgroundColor}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('backgroundColor', e.target.value)}
                                    sx={{ width: 48, '& .MuiInputBase-input': { padding: 0.5, height: 32 } }}
                                    size="small"
                                />
                                <TextField
                                    type="text"
                                    value={textData.backgroundColor}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('backgroundColor', e.target.value)}
                                    placeholder="transparent"
                                    sx={{ flex: 1 }}
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Layout */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Layout
                        </Typography>
                        
                        {/* Padding */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Padding
                            </Typography>
                            <TextField
                                type="number"
                                inputProps={{ min: 0, max: 50, step: 1 }}
                                value={textData.padding}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('padding', parseInt(e.target.value) || 0)}
                                size="small"
                                fullWidth
                            />
                        </Box>

                        {/* Border Radius */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Border Radius
                            </Typography>
                            <TextField
                                type="number"
                                inputProps={{ min: 0, max: 20, step: 1 }}
                                value={textData.borderRadius}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('borderRadius', parseInt(e.target.value) || 0)}
                                size="small"
                                fullWidth
                            />
                        </Box>
                    </Box>

                    <Divider />

                    {/* Delete Section */}
                    {onDeleteText && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'error.main' }}>
                                Danger Zone
                            </Typography>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                fullWidth
                                onClick={handleDeleteText}
                                startIcon={<Trash2 size={16} />}
                            >
                                Delete Text
                            </Button>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};
