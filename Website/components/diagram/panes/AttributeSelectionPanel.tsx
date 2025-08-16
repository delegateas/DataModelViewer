'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { AttributeSelectionMode } from '@/hooks/useAttributeSelection';

export interface AttributeSelectionPanelProps {
    attributeMode: AttributeSelectionMode;
    setAttributeMode: (mode: AttributeSelectionMode) => void;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    getAttributeModeDescription: (mode: AttributeSelectionMode) => string;
}

export const AttributeSelectionPanel: React.FC<AttributeSelectionPanelProps> = ({
    attributeMode,
    setAttributeMode,
    isExpanded,
    setIsExpanded,
    getAttributeModeDescription
}) => {
    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Attribute Selection
                    </span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 p-3 border rounded-lg bg-muted/10">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Default attributes to include:</Label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="minimal"
                                name="attributeMode"
                                checked={attributeMode === 'minimal'}
                                onChange={() => setAttributeMode('minimal')}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="minimal" className="text-sm">
                                {getAttributeModeDescription('minimal')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="custom-lookups"
                                name="attributeMode"
                                checked={attributeMode === 'custom-lookups'}
                                onChange={() => setAttributeMode('custom-lookups')}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="custom-lookups" className="text-sm">
                                {getAttributeModeDescription('custom-lookups')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="all-lookups"
                                name="attributeMode"
                                checked={attributeMode === 'all-lookups'}
                                onChange={() => setAttributeMode('all-lookups')}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="all-lookups" className="text-sm">
                                {getAttributeModeDescription('all-lookups')}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="custom"
                                name="attributeMode"
                                checked={attributeMode === 'custom'}
                                onChange={() => setAttributeMode('custom')}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="custom" className="text-sm">
                                {getAttributeModeDescription('custom')}
                            </Label>
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
