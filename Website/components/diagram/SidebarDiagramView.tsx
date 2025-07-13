import { Groups } from "@/generated/Data"
import { Separator } from "@radix-ui/react-select"
import { GroupSelector } from "./GroupSelector"
import { useDiagramViewContext } from "@/contexts/DiagramViewContext";
import { ZoomOut, ZoomIn, Layers, Database } from "lucide-react";
import { Button } from "../ui/button";
import { DiagramResetButton } from "./DiagramResetButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface ISidebarDiagramViewProps { 

}

export const SidebarDiagramView = ({ }: ISidebarDiagramViewProps) => {

    const { selectedGroup, selectGroup, zoomOut, zoomIn, zoom, resetView, diagramType, updateDiagramType } = useDiagramViewContext();

    return (
        <div className="flex flex-col h-full p-4 space-y-4 w-full min-w-0 overflow-hidden">
            <div className="min-w-0 flex-shrink-0">
                <GroupSelector
                    groups={Groups}
                    selectedGroup={selectedGroup}
                    onGroupSelect={selectGroup}
                />
            </div>

            <Separator />
            
            <div className="space-y-3 min-w-0 flex-shrink-0">
                <h3 className="text-sm font-medium truncate">Diagram Type</h3>
                <Select value={diagramType} onValueChange={updateDiagramType}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="detailed">
                            <div className="flex items-center space-x-2">
                                <Database className="h-4 w-4" />
                                <span>Detailed</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="simple">
                            <div className="flex items-center space-x-2">
                                <Layers className="h-4 w-4" />
                                <span>Simple</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Separator />
                        
            <div className="space-y-3 min-w-0 flex-shrink-0">
                <h3 className="text-sm font-medium truncate">Controls</h3>
                <div className="flex space-x-2 justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        disabled={zoom <= 0.1}
                        className="flex-shrink-0"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        disabled={zoom >= 3}
                        className="flex-shrink-0"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
                <div className="min-w-0">
                    <DiagramResetButton onReset={resetView} />
                </div>
            </div>
        </div>
    )
}