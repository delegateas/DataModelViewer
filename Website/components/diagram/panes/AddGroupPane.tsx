'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search, Database } from 'lucide-react';
import { Groups } from '@/generated/Data';
import { EntityType, GroupType } from '@/lib/Types';

export interface AddGroupPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddGroup: (group: GroupType) => void;
    currentEntities: EntityType[];
}

export const AddGroupPane: React.FC<AddGroupPaneProps> = ({
    isOpen,
    onOpenChange,
    onAddGroup,
    currentEntities
}) => {
    const [searchTerm, setSearchTerm] = useState('');

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
        onAddGroup(group);
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
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-96 sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Add Group to Diagram</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
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
                                                <h3 className="font-semibold text-sm">{group.Name}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {group.Entities.length} entities
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <div className="text-xs text-muted-foreground">
                                                {entitiesInDiagram}/{totalEntities} entities
                                            </div>
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
                                            <span className="text-xs text-muted-foreground px-2 py-1">
                                                +{group.Entities.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                    
                                    <Button
                                        variant={isFullyInDiagram ? "outline" : "default"}
                                        size="sm"
                                        className="w-full"
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
            </SheetContent>
        </Sheet>
    );
};
