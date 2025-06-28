import React from 'react';
import { GroupType } from '@/lib/Types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FolderOpen, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupSelectorProps {
  groups: GroupType[];
  selectedGroup: GroupType | null;
  onGroupSelect: (group: GroupType) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroup,
  onGroupSelect
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Groups</h3>
        <span className="text-xs text-muted-foreground">
          {groups.length} total
        </span>
      </div>
      
      <Separator />
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {groups.map((group) => {
            const isSelected = selectedGroup?.Name === group.Name;
            const entityCount = group.Entities.length;
            
            return (
              <Button
                key={group.Name}
                variant={isSelected ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  isSelected && "bg-secondary"
                )}
                onClick={() => onGroupSelect(group)}
              >
                <div className="flex items-center space-x-3 w-full">
                  {isSelected ? (
                    <FolderOpen className="h-4 w-4 text-primary" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  )}
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      {group.Name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entityCount} {entityCount === 1 ? 'entity' : 'entities'}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}; 