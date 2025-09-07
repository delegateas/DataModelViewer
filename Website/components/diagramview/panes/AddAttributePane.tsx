'use client';

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    DialogActions, 
    Button, 
    TextField, 
    Card, 
    CardContent,
    Typography,
    Tooltip
} from '@mui/material';
import { AttributeType } from '@/lib/Types';
import { AssignmentRounded, AttachmentRounded, AttachMoneyRounded, CalendarMonthRounded, ListRounded, NumbersRounded, RttRounded, SearchRounded, ToggleOffRounded } from '@mui/icons-material';

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
        case 'StringAttribute': return RttRounded;
        case 'IntegerAttribute': return NumbersRounded;
        case 'DecimalAttribute': return AttachMoneyRounded;
        case 'DateTimeAttribute': return CalendarMonthRounded;
        case 'BooleanAttribute': return ToggleOffRounded;
        case 'ChoiceAttribute': return ListRounded;
        case 'LookupAttribute': return SearchRounded;
        case 'FileAttribute': return AttachmentRounded;
        case 'StatusAttribute': return AssignmentRounded;
        default: return RttRounded;
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
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
                <DialogTitle>Add Existing Attribute ({availableAttributes.length})</DialogTitle>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {entityName ? `Select an attribute from "${entityName}" to add to the diagram.` : 'Select an attribute to add to the diagram.'}
                </Typography>

                <div className="space-y-6">
                    {/* Search */}
                    <div className="space-y-3">
                        <Typography variant="subtitle2">Search Attributes</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            placeholder="Search by attribute name..."
                        />
                    </div>

                    {/* Available Attributes */}
                    <div className="space-y-3">
                        <Typography variant="subtitle2">Available Attributes ({addableAttributes.length})</Typography>
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
                                                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                                                >
                                                    <CardContent className="p-3 w-full" sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
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
                                                                <Tooltip title={attribute.Description} arrow>
                                                                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center cursor-help">
                                                                        <span className="text-xs text-muted-foreground">?</span>
                                                                    </div>
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
                </div>

                <DialogActions>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
};
