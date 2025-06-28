import React from 'react';
import { GroupType, EntityType } from '@/lib/Types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Database, Link, FileText } from 'lucide-react';

interface EntityInfoPanelProps {
  selectedGroup: GroupType | null;
}

export const EntityInfoPanel: React.FC<EntityInfoPanelProps> = ({
  selectedGroup
}) => {
  if (!selectedGroup) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select a group to view information</p>
      </div>
    );
  }

  const entityCount = selectedGroup.Entities.length;
  const relationshipCount = selectedGroup.Entities.reduce(
    (total, entity) => total + entity.Relationships.length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Group Information</h3>
        <Database className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{selectedGroup.Name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {entityCount}
              </div>
              <div className="text-xs text-muted-foreground">
                {entityCount === 1 ? 'Entity' : 'Entities'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {relationshipCount}
              </div>
              <div className="text-xs text-muted-foreground">
                {relationshipCount === 1 ? 'Relationship' : 'Relationships'}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Entity List */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Entities</span>
            </div>
            
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {selectedGroup.Entities.map((entity) => (
                <div
                  key={entity.SchemaName}
                  className="text-xs p-2 rounded border bg-muted/50"
                >
                  <div className="font-medium">{entity.DisplayName}</div>
                  <div className="text-muted-foreground">
                    {entity.Attributes.length} attributes
                  </div>
                  {entity.Description && (
                    <div className="text-muted-foreground mt-1 line-clamp-2">
                      {entity.Description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 