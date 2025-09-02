'use client';

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    Button, 
    TextField, 
    Collapse, 
    Box, 
    Typography,
    Card,
    CardContent,
    Tooltip 
} from '@mui/material';
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
        <Dialog open={isOpen && selectedEntity !== null} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogContent>
                {selectedEntity && (
                    <>
                        <DialogTitle>{selectedEntity.DisplayName}</DialogTitle>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Typography variant="body2" color="text.secondary">
                                    {selectedEntity.SchemaName}
                                </Typography>
                                {selectedEntity.Description && (
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedEntity.Description}
                                    </Typography>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="space-y-3">
                                    <Typography variant="subtitle2">Actions</Typography>
                                    
                                    {/* Add Attribute Section */}
                                    {onAddAttribute && availableAttributes.length > 0 && (
                                        <Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={() => setIsAttributesExpanded(!isAttributesExpanded)}
                                                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                                            >
                                                <Box display="flex" alignItems="center">
                                                    <Plus style={{ width: 16, height: 16, marginRight: 8 }} />
                                                    Add Attribute
                                                </Box>
                                                {isAttributesExpanded ? <ChevronDown style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
                                            </Button>
                                            
                                            <Collapse in={isAttributesExpanded}>
                                                <Box mt={2}>
                                                    {/* Search */}
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={searchQuery}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                                        placeholder="Search attributes..."
                                                        sx={{ mb: 2 }}
                                                    />

                                                    {/* Available Attributes */}
                                                    <Box sx={{ maxHeight: 192, overflowY: 'auto' }}>
                                                        {addableAttributes.length === 0 ? (
                                                            <Box textAlign="center" py={4}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {searchQuery ? 'No attributes found.' : 'No attributes available.'}
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Box display="flex" flexDirection="column" gap={1}>
                                                                {addableAttributes.map((attribute) => {
                                                                    const AttributeIcon = getAttributeIcon(attribute.AttributeType);
                                                                    const typeLabel = getAttributeTypeLabel(attribute.AttributeType);
                                                                    
                                                                    return (
                                                                        <Card
                                                                            key={attribute.SchemaName}
                                                                            sx={{ 
                                                                                cursor: 'pointer', 
                                                                                '&:hover': { backgroundColor: 'action.hover' },
                                                                                transition: 'background-color 0.2s'
                                                                            }}
                                                                            onClick={() => handleAddAttribute(attribute)}
                                                                        >
                                                                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                                    <AttributeIcon style={{ width: 16, height: 16, color: 'text.secondary' }} />
                                                                                    <Box flexGrow={1} minWidth={0}>
                                                                                        <Typography variant="body2" fontWeight="medium" noWrap>
                                                                                            {attribute.DisplayName}
                                                                                        </Typography>
                                                                                        <Typography variant="caption" color="text.secondary" noWrap>
                                                                                            {typeLabel}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    {attribute.Description && (
                                                                                        <Tooltip title={attribute.Description} arrow>
                                                                                            <Box 
                                                                                                sx={{ 
                                                                                                    width: 16, 
                                                                                                    height: 16, 
                                                                                                    borderRadius: '50%', 
                                                                                                    backgroundColor: 'grey.200',
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    justifyContent: 'center',
                                                                                                    cursor: 'help'
                                                                                                }}
                                                                                            >
                                                                                                <Typography variant="caption" fontSize={10}>?</Typography>
                                                                                            </Box>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                </Box>
                                                                            </CardContent>
                                                                        </Card>
                                                                    );
                                                                })}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    )}

                                    {/* Remove Attribute Section */}
                                    {onRemoveAttribute && removableAttributes.length > 0 && (
                                        <Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={() => setIsRemoveAttributesExpanded(!isRemoveAttributesExpanded)}
                                                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                                            >
                                                <Box display="flex" alignItems="center">
                                                    <Trash2 style={{ width: 16, height: 16, marginRight: 8 }} />
                                                    Remove Attribute
                                                </Box>
                                                {isRemoveAttributesExpanded ? <ChevronDown style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
                                            </Button>
                                            
                                            <Collapse in={isRemoveAttributesExpanded}>
                                                <Box mt={2}>
                                                    <Box sx={{ maxHeight: 192, overflowY: 'auto' }} mb={1}>
                                                        {removableAttributes.map((attribute) => {
                                                            const AttributeIcon = getAttributeIcon(attribute.AttributeType);
                                                            const typeLabel = getAttributeTypeLabel(attribute.AttributeType);
                                                            
                                                            return (
                                                                <Card
                                                                    key={attribute.SchemaName}
                                                                    sx={{ 
                                                                        cursor: 'pointer', 
                                                                        '&:hover': { backgroundColor: 'error.light', opacity: 0.1 },
                                                                        transition: 'background-color 0.2s',
                                                                        mb: 0.5
                                                                    }}
                                                                    onClick={() => handleRemoveAttribute(attribute)}
                                                                >
                                                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <AttributeIcon style={{ width: 16, height: 16, color: 'text.secondary' }} />
                                                                            <Box flexGrow={1} minWidth={0}>
                                                                                <Typography variant="body2" fontWeight="medium" noWrap>
                                                                                    {attribute.DisplayName}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                                                    {typeLabel}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Trash2 style={{ width: 16, height: 16, color: 'error.main' }} />
                                                                        </Box>
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        })}
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Note: Primary key cannot be removed.
                                                    </Typography>
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    )}
                                    
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        fullWidth
                                        onClick={onDeleteEntity}
                                        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                                    >
                                        <Trash2 style={{ width: 16, height: 16, marginRight: 8 }} />
                                        Remove from Diagram
                                    </Button>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <Typography variant="subtitle2">Entity Information</Typography>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <Typography variant="caption" display="block">
                                            Attributes: <strong>{selectedEntity.Attributes.length}</strong>
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Relationships: <strong>{selectedEntity.Relationships?.length || 0}</strong>
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Is Activity: <strong>{selectedEntity.IsActivity ? 'Yes' : 'No'}</strong>
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Audit Enabled: <strong>{selectedEntity.IsAuditEnabled ? 'Yes' : 'No'}</strong>
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
