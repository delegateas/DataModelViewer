'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    Button, 
    TextField, 
    Checkbox,
    Typography,
    FormControlLabel
} from '@mui/material';
import { Groups } from '@/generated/Data';
import { EntityType, GroupType, AttributeType } from '@/lib/Types';
import { useAttributeSelection } from '@/hooks/useAttributeSelection';
import { AttributeSelectionPanel } from './AttributeSelectionPanel';

export interface AddEntityPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddEntity: (entity: EntityType, selectedAttributes?: string[]) => void;
    currentEntities: EntityType[];
}

export const AddEntityPane: React.FC<AddEntityPaneProps> = ({
    isOpen,
    onOpenChange,
    onAddEntity,
    currentEntities
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntity, setSelectedEntity] = useState<EntityType | null>(null);
    const [isAttributeSettingsExpanded, setIsAttributeSettingsExpanded] = useState(false);
    
    const {
        attributeMode,
        setAttributeMode,
        customSelectedAttributes,
        getSelectedAttributes,
        initializeCustomAttributes,
        toggleCustomAttribute,
        resetCustomAttributes,
        getAttributeModeDescription,
    } = useAttributeSelection('custom-lookups');

    // Filter groups and entities based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) {
            return Groups;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        return Groups.map(group => ({
            ...group,
            Entities: group.Entities.filter(entity => 
                entity.DisplayName.toLowerCase().includes(lowerSearchTerm) ||
                entity.SchemaName.toLowerCase().includes(lowerSearchTerm) ||
                group.Name.toLowerCase().includes(lowerSearchTerm)
            )
        })).filter(group => 
            group.Name.toLowerCase().includes(lowerSearchTerm) || 
            group.Entities.length > 0
        );
    }, [searchTerm]);

    const handleAddEntity = (entity: EntityType) => {
        const selectedAttributes = getSelectedAttributes(entity);
        onAddEntity(entity, selectedAttributes);
        onOpenChange(false);
        setSelectedEntity(null);
        resetCustomAttributes();
    };

    const handleEntityClick = (entity: EntityType) => {
        if (attributeMode === 'custom') {
            setSelectedEntity(entity);
            initializeCustomAttributes(entity);
        } else {
            handleAddEntity(entity);
        }
    };

    const handleCustomAttributeToggle = (attributeSchemaName: string, checked: boolean) => {
        toggleCustomAttribute(attributeSchemaName, checked);
    };

    return (
        <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
            <DialogContent>
                <DialogTitle>Add Entity to Diagram</DialogTitle>
                <div className="space-y-4">
                    {/* Attribute Selection Options */}
                    <AttributeSelectionPanel
                        attributeMode={attributeMode}
                        setAttributeMode={setAttributeMode}
                        isExpanded={isAttributeSettingsExpanded}
                        setIsExpanded={setIsAttributeSettingsExpanded}
                        getAttributeModeDescription={getAttributeModeDescription}
                    />

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search groups and entities..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            sx={{ pl: '40px' }}
                            InputProps={{ style: { paddingLeft: '40px' } }}
                        />
                    </div>

                    {/* Groups and Entities List */}
                    {!selectedEntity ? (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {filteredData.map((group: GroupType) => (
                                <div key={group.Name} className="space-y-2">
                                    <Typography variant="overline" color="text.secondary" className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                        {group.Name}
                                    </Typography>
                                    <div className="space-y-1">
                                        {group.Entities.map((entity: EntityType) => {
                                            const isAlreadyInDiagram = currentEntities.some(e => e.SchemaName === entity.SchemaName);
                                            return (
                                                <Button
                                                    key={entity.SchemaName}
                                                    variant="text"
                                                    className={`w-full justify-start text-left h-auto py-3 px-3 ${isAlreadyInDiagram ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        if (!isAlreadyInDiagram) {
                                                            handleEntityClick(entity);
                                                        }
                                                    }}
                                                    disabled={isAlreadyInDiagram}
                                                    sx={{
                                                        justifyContent: 'flex-start',
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        py: 1.5,
                                                        px: 1.5,
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    <div className="flex flex-col items-start space-y-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{entity.DisplayName}</span>
                                                            {isAlreadyInDiagram && (
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                    In Diagram
                                                                </span>
                                                            )}
                                                            {attributeMode === 'custom' && !isAlreadyInDiagram && (
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                    Click to configure
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{entity.SchemaName}</span>
                                                        {entity.Description && (
                                                            <span className="text-xs text-muted-foreground line-clamp-2">
                                                                {entity.Description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {filteredData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No entities found matching your search.
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Custom Attribute Selection View */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Typography variant="subtitle1" className="font-medium">Configure {selectedEntity.DisplayName}</Typography>
                                    <Typography variant="body2" color="text.secondary">Select attributes to include</Typography>
                                </div>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={() => setSelectedEntity(null)}
                                >
                                    Back
                                </Button>
                            </div>

                            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                {selectedEntity.Attributes.map((attribute: AttributeType) => {
                                    const isChecked = customSelectedAttributes.includes(attribute.SchemaName);
                                    const isPrimaryKey = attribute.IsPrimaryId;
                                    
                                    return (
                                        <div 
                                            key={attribute.SchemaName}
                                            className={`flex items-center space-x-3 p-2 rounded border ${isPrimaryKey ? 'bg-muted/50 border-muted' : 'hover:bg-muted/30'}`}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isPrimaryKey || isChecked}
                                                        disabled={isPrimaryKey}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                            handleCustomAttributeToggle(attribute.SchemaName, e.target.checked)
                                                        }
                                                    />
                                                }
                                                label=""
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-sm">{attribute.DisplayName}</span>
                                                    {isPrimaryKey && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            Primary Key
                                                        </span>
                                                    )}
                                                    {attribute.AttributeType === "LookupAttribute" && (
                                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                            Lookup
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{attribute.SchemaName}</p>
                                                {attribute.Description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{attribute.Description}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex space-x-2">
                                <Button 
                                    onClick={() => handleAddEntity(selectedEntity)}
                                    variant="contained"
                                    fullWidth
                                >
                                    Add Entity with {customSelectedAttributes.length + 1} Attributes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
