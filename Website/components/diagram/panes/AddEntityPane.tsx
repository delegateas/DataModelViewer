'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search } from 'lucide-react';
import { Groups } from '@/generated/Data';
import { EntityType, GroupType } from '@/lib/Types';

export interface AddEntityPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddEntity: (entity: EntityType) => void;
    currentEntities: EntityType[];
}

export const AddEntityPane: React.FC<AddEntityPaneProps> = ({
    isOpen,
    onOpenChange,
    onAddEntity,
    currentEntities
}) => {
    const [searchTerm, setSearchTerm] = useState('');

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
        onAddEntity(entity);
        onOpenChange(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-96 sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Add Entity to Diagram</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search groups and entities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Groups and Entities List */}
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {filteredData.map((group: GroupType) => (
                            <div key={group.Name} className="space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                    {group.Name}
                                </h3>
                                <div className="space-y-1">
                                    {group.Entities.map((entity: EntityType) => {
                                        const isAlreadyInDiagram = currentEntities.some(e => e.SchemaName === entity.SchemaName);
                                        return (
                                            <Button
                                                key={entity.SchemaName}
                                                variant="ghost"
                                                className={`w-full justify-start text-left h-auto py-3 px-3 ${isAlreadyInDiagram ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (!isAlreadyInDiagram) {
                                                        handleAddEntity(entity);
                                                    }
                                                }}
                                                disabled={isAlreadyInDiagram}
                                            >
                                                <div className="flex flex-col items-start space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{entity.DisplayName}</span>
                                                        {isAlreadyInDiagram && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                In Diagram
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
                </div>
            </SheetContent>
        </Sheet>
    );
};
