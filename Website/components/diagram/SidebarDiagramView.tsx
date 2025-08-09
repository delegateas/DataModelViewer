import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Database, Square, Type, Settings, Layers, Hammer, Users } from 'lucide-react';
import { useDiagramViewContext } from '@/contexts/DiagramViewContext';
import { AddEntityPane, AddGroupPane } from '@/components/diagram/panes';
import { DiagramType } from '@/hooks/useDiagram';

interface ISidebarDiagramViewProps { 

}

export const SidebarDiagramView = ({ }: ISidebarDiagramViewProps) => {
    const { addEntityToDiagram, addGroupToDiagram, addSquareToDiagram, addTextToDiagram, currentEntities, diagramType, updateDiagramType } = useDiagramViewContext();
    const [isDataExpanded, setIsDataExpanded] = useState(true);
    const [isGeneralExpanded, setIsGeneralExpanded] = useState(false);
    const [isEntitySheetOpen, setIsEntitySheetOpen] = useState(false);
    const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);

    return (
        <div className="flex flex-col h-full w-full">
            <Tabs defaultValue="build" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="build" className="flex items-center gap-2 text-xs">
                        <Hammer className="min-w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="layers" className="flex items-center gap-2 text-xs">
                        <Layers className="min-w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2 text-xs">
                        <Settings className="min-w-4 h-4" />
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="build" className="p-4 space-y-4">
                    {/* Data Section */}
                    <Collapsible open={isDataExpanded} onOpenChange={setIsDataExpanded}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                                <span className="font-medium">Data</span>
                                {isDataExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pl-4 pt-2">
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-2 h-auto py-2"
                                onClick={() => setIsEntitySheetOpen(true)}
                            >
                                <Database className="w-4 h-4" />
                                Entity
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-2 h-auto py-2"
                                onClick={() => setIsGroupSheetOpen(true)}
                            >
                                <Users className="w-4 h-4" />
                                Group
                            </Button>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* General Section */}
                    <Collapsible open={isGeneralExpanded} onOpenChange={setIsGeneralExpanded}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                                <span className="font-medium">General</span>
                                {isGeneralExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pl-4 pt-2">
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-2 h-auto py-2"
                                onClick={addSquareToDiagram}
                            >
                                <Square className="w-4 h-4" />
                                Square
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-2 h-auto py-2"
                                onClick={addTextToDiagram}
                            >
                                <Type className="w-4 h-4" />
                                Text
                            </Button>
                        </CollapsibleContent>
                    </Collapsible>
                </TabsContent>
                
                <TabsContent value="layers" className="p-4">
                    <p className="text-sm text-muted-foreground">Layers functionality coming soon...</p>
                </TabsContent>
                
                <TabsContent value="settings" className="p-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-medium text-sm">Diagram Type</h3>
                            <p className="text-xs text-muted-foreground">
                                Choose between simple or detailed entity view
                            </p>
                            <div className="flex flex-col space-y-2">
                                <Button
                                    variant={diagramType === 'simple' ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => updateDiagramType('simple')}
                                >
                                    <Database className="w-4 h-4 mr-2" />
                                    Simple View
                                </Button>
                                <Button
                                    variant={diagramType === 'detailed' ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => updateDiagramType('detailed')}
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Detailed View
                                </Button>
                            </div>
                        </div>
                        
                        <div className="border-t pt-4">
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm">Current Settings</h3>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>Diagram Type: <span className="font-medium capitalize">{diagramType}</span></p>
                                    <p>Entities in Diagram: <span className="font-medium">{currentEntities.length}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Entity Pane */}
            <AddEntityPane
                isOpen={isEntitySheetOpen}
                onOpenChange={setIsEntitySheetOpen}
                onAddEntity={addEntityToDiagram}
                currentEntities={currentEntities}
            />

            {/* Add Group Pane */}
            <AddGroupPane
                isOpen={isGroupSheetOpen}
                onOpenChange={setIsGroupSheetOpen}
                onAddGroup={addGroupToDiagram}
                currentEntities={currentEntities}
            />
        </div>
    );
}