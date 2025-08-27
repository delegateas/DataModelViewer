import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/shared/ui/sheet';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui/select';
import { Separator } from '@/components/shared/ui/separator';
import { Square, Trash2 } from 'lucide-react';
import { SquareElement, SquareElementData } from '../elements/SquareElement';
import { PRESET_COLORS } from '../shared/DiagramConstants';

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
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Square className="w-5 h-5" />
                        Square Properties
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Fill Color Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Fill Color</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_COLORS.fills.map((color) => (
                                <Button
                                    key={color.value}
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 p-1 transition-all hover:scale-105 ${
                                        squareData.fillColor === color.value
                                            ? 'ring-2 ring-blue-500 border-blue-500' 
                                            : ''
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => handlePresetFillColor(color.value)}
                                    title={color.name}
                                >
                                    <span className="sr-only">{color.name}</span>
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="color"
                                value={squareData.fillColor}
                                onChange={(e) => handleDataChange('fillColor', e.target.value)}
                                className="w-12 h-8 p-1 border-2"
                            />
                            <Input
                                type="text"
                                value={squareData.fillColor}
                                onChange={(e) => handleDataChange('fillColor', e.target.value)}
                                placeholder="#f1f5f9"
                                className="flex-1 text-sm"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Border Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Border</Label>
                        
                        {/* Border Color */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Color</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_COLORS.borders.map((color) => (
                                    <Button
                                        key={color.value}
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 p-1 transition-all hover:scale-105 ${
                                            squareData.borderColor === color.value
                                                ? 'ring-2 ring-blue-500 border-blue-500' 
                                                : ''
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => handlePresetBorderColor(color.value)}
                                        title={color.name}
                                    >
                                        <span className="sr-only">{color.name}</span>
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="color"
                                    value={squareData.borderColor}
                                    onChange={(e) => handleDataChange('borderColor', e.target.value)}
                                    className="w-12 h-8 p-1 border-2"
                                />
                                <Input
                                    type="text"
                                    value={squareData.borderColor}
                                    onChange={(e) => handleDataChange('borderColor', e.target.value)}
                                    placeholder="#64748b"
                                    className="flex-1 text-sm"
                                />
                            </div>
                        </div>

                        {/* Border Width */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Width</Label>
                            <Input
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                value={squareData.borderWidth}
                                onChange={(e) => handleDataChange('borderWidth', parseInt(e.target.value) || 0)}
                                className="text-sm"
                            />
                        </div>

                        {/* Border Type */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Style</Label>
                            <Select 
                                value={squareData.borderType} 
                                onValueChange={(value) => handleDataChange('borderType', value)}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Solid</SelectItem>
                                    <SelectItem value="dashed">Dashed</SelectItem>
                                    <SelectItem value="dotted">Dotted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Opacity Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Opacity</Label>
                        <div className="space-y-2">
                            <Input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={squareData.opacity}
                                onChange={(e) => handleDataChange('opacity', parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-xs text-muted-foreground text-center">
                                {Math.round((squareData.opacity || 0.7) * 100)}%
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Delete Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-destructive">Danger Zone</Label>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={handleDeleteSquare}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Square
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
