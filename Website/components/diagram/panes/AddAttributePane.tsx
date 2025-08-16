'use client';

import React, { useState } from 'react';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetFooter 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    Type, 
    Calendar, 
    Hash, 
    Search, 
    DollarSign, 
    ToggleLeft, 
    FileText, 
    List, 
    Activity,
} from 'lucide-react';
import { AttributeType } from '@/lib/Types';

export interface AddAttributePaneProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAttribute: (attribute: AttributeType) => void;
    entityName?: string;
    availableAttributes: AttributeType[];
    visibleAttributes: AttributeType[];
}

const getAttributeIcon = (attributeType: string) => {
    switch (attributeType) {
        case 'StringAttribute': return Type;
        case 'IntegerAttribute': return Hash;
        case 'DecimalAttribute': return DollarSign;
        case 'DateTimeAttribute': return Calendar;
        case 'BooleanAttribute': return ToggleLeft;
        case 'ChoiceAttribute': return List;
        case 'LookupAttribute': return Search;
        case 'FileAttribute': return FileText;
        case 'StatusAttribute': return Activity;
        default: return Type;
    }
};

const getAttributeTypeLabel = (attributeType: string) => {
    switch (attributeType) {
        case 'StringAttribute': return 'Text';
        case 'IntegerAttribute': return 'Number (Whole)';
        case 'DecimalAttribute': return 'Number (Decimal)';
        case 'DateTimeAttribute': return 'Date & Time';
        case 'BooleanAttribute': return 'Yes/No';
        case 'ChoiceAttribute': return 'Choice';
        case 'LookupAttribute': return 'Lookup';
        case 'FileAttribute': return 'File';
        case 'StatusAttribute': return 'Status';
        default: return attributeType.replace('Attribute', '');
    }
};

export const AddAttributePane: React.FC<AddAttributePaneProps> = ({
    isOpen,
    onClose,
    onAddAttribute,
    entityName,
    availableAttributes,
    visibleAttributes
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Filter out attributes that are already visible in the diagram
    const visibleAttributeNames = visibleAttributes.map(attr => attr.SchemaName);
    const addableAttributes = availableAttributes.filter(attr => 
        !visibleAttributeNames.includes(attr.SchemaName) &&
        attr.DisplayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddAttribute = (attribute: AttributeType) => {
        onAddAttribute(attribute);
        setSearchQuery('');
        onClose();
    };

    return (
        <TooltipProvider>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="right" className="w-[500px] sm:w-[540px]">
                    <SheetHeader>
                        <SheetTitle>Add Existing Attribute ({availableAttributes.length})</SheetTitle>
                        <SheetDescription>
                            {entityName ? `Select an attribute from "${entityName}" to add to the diagram.` : 'Select an attribute to add to the diagram.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 mt-6">
                        {/* Search */}
                        <div className="space-y-3">
                            <Label htmlFor="search">Search Attributes</Label>
                            <Input
                                id="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by attribute name..."
                            />
                        </div>

                        {/* Available Attributes */}
                        <div className="space-y-3">
                            <Label>Available Attributes ({addableAttributes.length})</Label>
                            <div className="h-[400px] w-full rounded-md border p-4 flex flex-col overflow-y-scroll">
                                <div className="w-full">
                                    {addableAttributes.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8">
                                            {searchQuery ? 'No attributes found matching your search.' : 'No attributes available to add.'}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 w-full">
                                            {addableAttributes.map((attribute) => {
                                                const AttributeIcon = getAttributeIcon(attribute.AttributeType);
                                                const typeLabel = getAttributeTypeLabel(attribute.AttributeType);
                                                
                                                return (
                                                    <Card 
                                                        key={attribute.SchemaName} 
                                                        className="cursor-pointer hover:bg-accent transition-colors w-full"
                                                        onClick={() => handleAddAttribute(attribute)}
                                                    >
                                                        <CardContent className="p-3 w-full">
                                                            <div className="flex items-center gap-3 w-full">
                                                                <div className="flex-shrink-0 w-4 h-4">
                                                                    <AttributeIcon className="w-4 h-4 text-muted-foreground" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="font-medium text-sm truncate">
                                                                        {attribute.DisplayName}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground truncate">
                                                                        {typeLabel} • {attribute.SchemaName}
                                                                    </div>
                                                                </div>
                                                                {attribute.Description && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center cursor-help">
                                                                                <span className="text-xs text-muted-foreground">?</span>
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="left" className="max-w-xs">
                                                                            <p className="text-sm">{attribute.Description}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>
        </TooltipProvider>
    );
};
