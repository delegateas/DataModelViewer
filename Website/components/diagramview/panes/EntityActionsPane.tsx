'use client';

import React, { useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/shared/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/shared/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shared/ui/tooltip';
import { 
    Trash2, 
    Plus, 
    ChevronDown, 
    ChevronRight,
    Type, 
    Calendar, 
    Hash, 
    Search, 
    DollarSign, 
    ToggleLeft, 
    FileText, 
    List, 
    Activity
} from 'lucide-react';
import { EntityType, AttributeType } from '@/lib/Types';

export interface EntityActionsPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedEntity: EntityType | null;
    onDeleteEntity: () => void;
    onAddAttribute?: (attribute: AttributeType) => void;
    onRemoveAttribute?: (attribute: AttributeType) => void;
    availableAttributes?: AttributeType[];
    visibleAttributes?: AttributeType[];
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

export const EntityActionsPane: React.FC<EntityActionsPaneProps> = ({
    isOpen,
    onOpenChange,
    selectedEntity,
    onDeleteEntity,
    onAddAttribute,
    onRemoveAttribute,
    availableAttributes = [],
    visibleAttributes = []
}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAttributesExpanded, setIsAttributesExpanded] = useState(false);
    const [isRemoveAttributesExpanded, setIsRemoveAttributesExpanded] = useState(false);

    // Filter out attributes that are already visible in the diagram
    const visibleAttributeNames = visibleAttributes.map(attr => attr.SchemaName);
    const addableAttributes = availableAttributes.filter(attr => 
        !visibleAttributeNames.includes(attr.SchemaName) &&
        attr.DisplayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddAttribute = (attribute: AttributeType) => {
        if (onAddAttribute) {
            onAddAttribute(attribute);
            setSearchQuery('');
            setIsAttributesExpanded(false);
        }
    };

    const handleRemoveAttribute = (attribute: AttributeType) => {
        if (onRemoveAttribute) {
            onRemoveAttribute(attribute);
        }
    };

    // Filter removable attributes (exclude primary key)
    const removableAttributes = visibleAttributes.filter(attr => 
        !attr.IsPrimaryId // Don't allow removing primary key - all other visible attributes can be removed
    );

    return (
        <TooltipProvider>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-96">
                    <SheetHeader>
                        <SheetTitle>Entity Actions</SheetTitle>
                    </SheetHeader>
                    
                    {selectedEntity && (
                        <div className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-medium">{selectedEntity.DisplayName}</h3>
                                <p className="text-sm text-muted-foreground">{selectedEntity.SchemaName}</p>
                                {selectedEntity.Description && (
                                    <p className="text-xs text-muted-foreground">{selectedEntity.Description}</p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Actions</h4>
                                    
                                    {/* Add Attribute Section */}
                                    {onAddAttribute && availableAttributes.length > 0 && (
                                        <Collapsible open={isAttributesExpanded} onOpenChange={setIsAttributesExpanded}>
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full justify-between"
                                                >
                                                    <span className="flex items-center">
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Attribute
                                                    </span>
                                                    {isAttributesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-3 space-y-3">
                                                {/* Search */}
                                                <div>
                                                    <Input
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="Search attributes..."
                                                        className="text-sm"
                                                    />
                                                </div>

                                                {/* Available Attributes */}
                                                <div className="max-h-48 overflow-y-auto space-y-1">
                                                    {addableAttributes.length === 0 ? (
                                                        <div className="text-center text-muted-foreground py-4 text-sm">
                                                            {searchQuery ? 'No attributes found.' : 'No attributes available.'}
                                                        </div>
                                                    ) : (
                                                        addableAttributes.map((attribute) => {
                                                            const AttributeIcon = getAttributeIcon(attribute.AttributeType);
                                                            const typeLabel = getAttributeTypeLabel(attribute.AttributeType);
                                                            
                                                            return (
                                                                <div
                                                                    key={attribute.SchemaName} 
                                                                    className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-accent transition-colors"
                                                                    onClick={() => handleAddAttribute(attribute)}
                                                                >
                                                                    <AttributeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="font-medium text-sm truncate">
                                                                            {attribute.DisplayName}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground truncate">
                                                                            {typeLabel}
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
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )}

                                    {/* Remove Attribute Section */}
                                    {onRemoveAttribute && removableAttributes.length > 0 && (
                                        <Collapsible open={isRemoveAttributesExpanded} onOpenChange={setIsRemoveAttributesExpanded}>
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full justify-between"
                                                >
                                                    <span className="flex items-center">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove Attribute
                                                    </span>
                                                    {isRemoveAttributesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-3 space-y-3">
                                                {/* Removable Attributes */}
                                                <div className="max-h-48 overflow-y-auto space-y-1">
                                                    {removableAttributes.map((attribute) => {
                                                        const AttributeIcon = getAttributeIcon(attribute.AttributeType);
                                                        const typeLabel = getAttributeTypeLabel(attribute.AttributeType);
                                                        
                                                        return (
                                                            <div
                                                                key={attribute.SchemaName} 
                                                                className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-destructive/10 transition-colors"
                                                                onClick={() => handleRemoveAttribute(attribute)}
                                                            >
                                                                <AttributeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="font-medium text-sm truncate">
                                                                        {attribute.DisplayName}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground truncate">
                                                                        {typeLabel}
                                                                    </div>
                                                                </div>
                                                                <Trash2 className="w-4 h-4 text-destructive flex-shrink-0" />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Note: Primary key cannot be removed.
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )}
                                    
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={onDeleteEntity}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove from Diagram
                                    </Button>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Entity Information</h4>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>Attributes: <span className="font-medium">{selectedEntity.Attributes.length}</span></p>
                                        <p>Relationships: <span className="font-medium">{selectedEntity.Relationships?.length || 0}</span></p>
                                        <p>Is Activity: <span className="font-medium">{selectedEntity.IsActivity ? 'Yes' : 'No'}</span></p>
                                        <p>Audit Enabled: <span className="font-medium">{selectedEntity.IsAuditEnabled ? 'Yes' : 'No'}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </TooltipProvider>
    );
};
