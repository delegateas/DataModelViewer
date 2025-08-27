import React from 'react';
import { GroupType } from '@/lib/Types';
import { Button } from '@/components/shared/ui/button';
import { Separator } from '@/components/shared/ui/separator';
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
    <div className="space-y-4 min-w-0">
      <div className="flex items-center justify-between min-w-0">
        <h3 className="text-sm font-medium truncate">Groups</h3>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {groups.length} total
        </span>
      </div>
      
      <Separator />
      
      <div className="h-[300px] flex flex-col overflow-y-auto overflow-x-hidden w-full min-w-0">
        <div className="space-y-2 min-w-0">
          {groups.map((group) => {
            const isSelected = selectedGroup?.Name === group.Name;
            const entityCount = group.Entities.length;
            
            return (
              <Button
                key={group.Name}
                variant={isSelected ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 min-w-0",
                  isSelected && "bg-secondary"
                )}
                onClick={() => onGroupSelect(group)}
              >
                <div className="flex items-center space-x-3 w-full min-w-0">
                  {isSelected ? (
                    <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">
                      {group.Name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {entityCount} {entityCount === 1 ? 'entity' : 'entities'}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 