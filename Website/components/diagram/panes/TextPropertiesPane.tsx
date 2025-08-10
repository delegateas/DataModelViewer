import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Type, Trash2 } from 'lucide-react';
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
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Type className="w-5 h-5" />
                        Text Properties
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Text Content */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Text Content</Label>
                        <Input
                            placeholder="Enter your text..."
                            value={textData.text}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('text', e.target.value)}
                        />
                    </div>

                    <Separator />

                    {/* Typography */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Typography</Label>
                        
                        {/* Font Family */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Font Family</Label>
                            <Select 
                                value={textData.fontFamily} 
                                onValueChange={(value) => handleDataChange('fontFamily', value)}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FONT_FAMILIES.map((font) => (
                                        <SelectItem key={font.value} value={font.value}>
                                            {font.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Font Size */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Font Size</Label>
                            <Select 
                                value={textData.fontSize.toString()} 
                                onValueChange={(value) => handleDataChange('fontSize', parseInt(value))}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FONT_SIZES.map((size) => (
                                        <SelectItem key={size.value} value={size.value.toString()}>
                                            {size.name} ({size.value}px)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Text Alignment */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Text Alignment</Label>
                            <Select 
                                value={textData.textAlign} 
                                onValueChange={(value: 'left' | 'center' | 'right') => handleDataChange('textAlign', value)}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Colors */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Colors</Label>
                        
                        {/* Text Color */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Text Color</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="color"
                                    value={textData.color}
                                    onChange={(e) => handleDataChange('color', e.target.value)}
                                    className="w-12 h-8 p-1 border-2"
                                />
                                <Input
                                    type="text"
                                    value={textData.color}
                                    onChange={(e) => handleDataChange('color', e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1 text-sm"
                                />
                            </div>
                        </div>

                        {/* Background Color */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Background Color</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="color"
                                    value={textData.backgroundColor === 'transparent' ? '#ffffff' : textData.backgroundColor}
                                    onChange={(e) => handleDataChange('backgroundColor', e.target.value)}
                                    className="w-12 h-8 p-1 border-2"
                                />
                                <Input
                                    type="text"
                                    value={textData.backgroundColor}
                                    onChange={(e) => handleDataChange('backgroundColor', e.target.value)}
                                    placeholder="transparent"
                                    className="flex-1 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Layout */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Layout</Label>
                        
                        {/* Padding */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Padding</Label>
                            <Input
                                type="number"
                                min="0"
                                max="50"
                                step="1"
                                value={textData.padding}
                                onChange={(e) => handleDataChange('padding', parseInt(e.target.value) || 0)}
                                className="text-sm"
                            />
                        </div>

                        {/* Border Radius */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Border Radius</Label>
                            <Input
                                type="number"
                                min="0"
                                max="20"
                                step="1"
                                value={textData.borderRadius}
                                onChange={(e) => handleDataChange('borderRadius', parseInt(e.target.value) || 0)}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Delete Section */}
                    {onDeleteText && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={handleDeleteText}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Text
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
