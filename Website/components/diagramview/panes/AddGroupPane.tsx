'use client';

import React, { useState, useMemo } from 'react';
import { Search, Database } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    Button, 
    TextField, 
    Typography
} from '@mui/material';
import { Groups } from '@/generated/Data';
import { EntityType, GroupType } from '@/lib/Types';
import { useAttributeSelection } from '@/hooks/useAttributeSelection';
import { AttributeSelectionPanel } from './AttributeSelectionPanel';

export interface AddGroupPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddGroup: (group: GroupType, selectedAttributes?: { [entitySchemaName: string]: string[] }) => void;
    currentEntities: EntityType[];
}

export const AddGroupPane: React.FC<AddGroupPaneProps> = ({
    isOpen,
    onOpenChange,
    onAddGroup,
    currentEntities
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAttributeSettingsExpanded, setIsAttributeSettingsExpanded] = useState(false);
    
    const {
        attributeMode,
        setAttributeMode,
        getSelectedAttributes,
        getAttributeModeDescription,
    } = useAttributeSelection('custom-lookups');

    // Filter groups based on search term
    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) {
            return Groups;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        return Groups.filter(group => 
            group.Name.toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm]);

    const handleAddGroup = (group: GroupType) => {
        // Create attribute selection map for all entities in the group
        const selectedAttributes: { [entitySchemaName: string]: string[] } = {};
        
        group.Entities.forEach(entity => {
            selectedAttributes[entity.SchemaName] = getSelectedAttributes(entity);
        });
        
        onAddGroup(group, selectedAttributes);
        onOpenChange(false);
    };

    // Calculate how many entities from each group are already in the diagram
    const getGroupStatus = (group: GroupType) => {
        const entitiesInDiagram = group.Entities.filter(entity => 
            currentEntities.some(e => e.SchemaName === entity.SchemaName)
        ).length;
        const totalEntities = group.Entities.length;
        return { entitiesInDiagram, totalEntities };
    };

    return (
        <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
            <DialogContent>
                <DialogTitle>Add Group to Diagram</DialogTitle>
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
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            InputProps={{ style: { paddingLeft: '40px' } }}
                        />
                    </div>

                    {/* Groups List */}
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                        {filteredGroups.map((group: GroupType) => {
                            const { entitiesInDiagram, totalEntities } = getGroupStatus(group);
                            const isFullyInDiagram = entitiesInDiagram === totalEntities && totalEntities > 0;
                            const isPartiallyInDiagram = entitiesInDiagram > 0 && entitiesInDiagram < totalEntities;
                            
                            return (
                                <div key={group.Name} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Database className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <Typography variant="subtitle2" className="font-semibold">{group.Name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {group.Entities.length} entities
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <Typography variant="caption" color="text.secondary">
                                                {entitiesInDiagram}/{totalEntities} entities
                                            </Typography>
                                            {isFullyInDiagram && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    All in Diagram
                                                </span>
                                            )}
                                            {isPartiallyInDiagram && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Partially Added
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1">
                                        {group.Entities.slice(0, 5).map((entity: EntityType) => {
                                            const isInDiagram = currentEntities.some(e => e.SchemaName === entity.SchemaName);
                                            return (
                                                <span 
                                                    key={entity.SchemaName}
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        isInDiagram 
                                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                                                    }`}
                                                >
                                                    {entity.DisplayName}
                                                </span>
                                            );
                                        })}
                                        {group.Entities.length > 5 && (
                                            <Typography variant="caption" color="text.secondary" className="px-2 py-1">
                                                +{group.Entities.length - 5} more
                                            </Typography>
                                        )}
                                    </div>
                                    
                                    <Button
                                        variant={isFullyInDiagram ? "outlined" : "contained"}
                                        size="small"
                                        fullWidth
                                        onClick={() => handleAddGroup(group)}
                                        disabled={isFullyInDiagram && totalEntities > 0}
                                    >
                                        {isFullyInDiagram 
                                            ? "All Entities Already Added" 
                                            : isPartiallyInDiagram 
                                                ? `Add Remaining ${totalEntities - entitiesInDiagram} Entities`
                                                : `Add All ${totalEntities} Entities`
                                        }
                                    </Button>
                                </div>
                            );
                        })}
                        {filteredGroups.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No groups found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
