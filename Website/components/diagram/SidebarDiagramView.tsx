import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Database, Square, Type, Settings, Hammer, Users, Save, Upload, Smartphone, RotateCcw, Trash2, Route } from 'lucide-react';
import { useDiagramViewContextSafe } from '@/contexts/DiagramViewContext';
import { AddEntityPane, AddGroupPane, ResetToGroupPane } from '@/components/diagram/panes';
import { useIsMobile } from '@/hooks/use-mobile';
import { GroupType } from '@/lib/Types';

interface ISidebarDiagramViewProps { 

}

export const SidebarDiagramView = ({ }: ISidebarDiagramViewProps) => {
    const diagramContext = useDiagramViewContextSafe();
    const isMobile = useIsMobile();
    const [isDataExpanded, setIsDataExpanded] = useState(true);
    const [isGeneralExpanded, setIsGeneralExpanded] = useState(false);
    const [isRouterExpanded, setIsRouterExpanded] = useState(false);
    const [isEntitySheetOpen, setIsEntitySheetOpen] = useState(false);
    const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
    const [isResetSheetOpen, setIsResetSheetOpen] = useState(false);

    // If not in diagram context, show a message or return null
    if (!diagramContext) {
        return (
            <div className="flex flex-col h-full w-full p-4">
                <div className="text-center text-muted-foreground">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Diagram tools are only available on the diagram page.</p>
                </div>
            </div>
        );
    }

    const { addEntityToDiagram, addGroupToDiagram, addSquareToDiagram, addTextToDiagram, saveDiagram, loadDiagram, currentEntities, diagramType, updateDiagramType, clearDiagram, routeAllConnections } = diagramContext;

    const handleLoadDiagram = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            loadDiagram(file).catch(error => {
                alert('Failed to load diagram: ' + error.message);
            });
        }
        // Reset input value to allow loading the same file again
        event.target.value = '';
    };

    const handleResetToGroup = (group: GroupType) => {
        // First clear the entire diagram
        clearDiagram();
        // Then add the selected group
        addGroupToDiagram(group);
    };

    const handleRouteAll = () => {
        routeAllConnections();
    };

    // Use the clearDiagram function from the hook
    // const clearDiagram function is already available from the context

    return (
        <div className="flex flex-col h-full w-full">
            <Tabs defaultValue="build" className="w-full">
                <TabsList className="w-full grid-cols-3 flex">
                    <TabsTrigger value="build" className="flex items-center gap-2 text-xs flex-1">
                        <Hammer className="min-w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2 text-xs flex-1">
                        <Settings className="min-w-4 h-4" />
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="build" className="p-4 space-y-4">
                    {/* Mobile Notice */}
                    {isMobile && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 text-amber-800">
                                <Smartphone className="w-4 h-4 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium">Mobile Mode</p>
                                    <p className="text-amber-700 mt-1">
                                        Some advanced features may have limited functionality on mobile devices. 
                                        For the best experience, use a desktop computer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
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

                    {/* Router Section */}
                    <Collapsible open={isRouterExpanded} onOpenChange={setIsRouterExpanded}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                                <span className="font-medium">Router</span>
                                {isRouterExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pl-4 pt-2">
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start gap-2 h-auto py-2"
                                onClick={handleRouteAll}
                            >
                                <Route className="w-4 h-4" />
                                Re-route All
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
                                <h3 className="font-medium text-sm">Save & Load</h3>
                                <p className="text-xs text-muted-foreground">
                                    Save your diagram or load an existing one
                                </p>
                                <div className="flex flex-col space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={saveDiagram}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Diagram
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start relative overflow-hidden cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4 mr-2 cursor-pointer" />
                                        Load Diagram
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleLoadDiagram}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            id="load-diagram"
                                        />
                                    </Button>
                                </div>
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
                        
                        <div className="border-t pt-4">
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm">Diagram Actions</h3>
                                <p className="text-xs text-muted-foreground">
                                    Reset or clear your diagram
                                </p>
                                <div className="flex flex-col space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => setIsResetSheetOpen(true)}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Reset to Group
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={clearDiagram}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear All
                                    </Button>
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

            {/* Reset to Group Pane */}
            <ResetToGroupPane
                isOpen={isResetSheetOpen}
                onOpenChange={setIsResetSheetOpen}
                onResetToGroup={handleResetToGroup}
            />
        </div>
    );
}