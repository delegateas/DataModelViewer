'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/shared/ui/sheet';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui/select';
import { Separator } from '@/components/shared/ui/separator';
import { dia } from '@joint/core';
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
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Link Properties</SheetTitle>
                    <SheetDescription>
                        Customize the appearance and label of the relationship link.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Label Section */}
                    <div className="space-y-2">
                        <Label htmlFor="label">Link Label</Label>
                        <Input
                            id="label"
                            placeholder="Enter relationship label..."
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearLabel}
                                className="flex-1"
                            >
                                Clear
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleUseRelationshipName}
                                disabled={!getRelationshipName()}
                                className="flex-1"
                                title={getRelationshipName() || 'No relationship name available'}
                            >
                                Use Relationship Name
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Optional text to display on the link
                        </p>
                    </div>

                    <Separator />

                    {/* Color Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Link Color</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_COLORS.borders.map((presetColor) => (
                                <Button
                                    key={presetColor.value}
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 p-1 transition-all hover:scale-105 ${
                                        color === presetColor.value 
                                            ? 'ring-2 ring-blue-500 border-blue-500' 
                                            : ''
                                    }`}
                                    style={{ backgroundColor: presetColor.value }}
                                    onClick={() => handleColorChange(presetColor.value)}
                                    title={presetColor.name}
                                >
                                    <span className="sr-only">{presetColor.name}</span>
                                </Button>
                            ))}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Input
                                type="color"
                                value={customColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="w-12 h-8 p-1 border-2"
                            />
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                placeholder="#3b82f6"
                                className="flex-1 text-sm"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Line Style Section */}
                    <div className="space-y-2">
                        <Label htmlFor="line-style">Line Style</Label>
                        <Select value={lineStyle} onValueChange={setLineStyle}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select line style" />
                            </SelectTrigger>
                            <SelectContent>
                                {LINE_STYLES.map((style) => (
                                    <SelectItem key={style.value} value={style.value}>
                                        {style.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stroke Width Section */}
                    <div className="space-y-2">
                        <Label htmlFor="stroke-width">Line Thickness</Label>
                        <Select value={strokeWidth.toString()} onValueChange={(value) => setStrokeWidth(parseInt(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select thickness" />
                            </SelectTrigger>
                            <SelectContent>
                                {STROKE_WIDTHS.map((width) => (
                                    <SelectItem key={width.value} value={width.value.toString()}>
                                        {width.name} ({width.value}px)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />
                </div>
            </SheetContent>
        </Sheet>
    );
};
