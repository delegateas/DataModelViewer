import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Maximize, 
    Settings,
    Layers,
    Search
} from 'lucide-react';
import { useDiagramContext } from '@/contexts/DiagramContext';

export const DiagramControls: React.FC = () => {
  const { 
    zoom, 
    resetView, 
    fitToScreen 
  } = useDiagramContext();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">View Controls</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
            Reset View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={fitToScreen}
          >
            <Maximize className="h-4 w-4" />
            Fit to Screen
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2">Tools</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Search className="h-4 w-4" />
            Search Entities
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Layers className="h-4 w-4" />
            Layer Manager
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4" />
            Diagram Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DiagramZoomDisplay: React.FC = () => {
  const { zoom } = useDiagramContext();

  return (
    <div className="text-xs text-muted-foreground">
      Zoom: {Math.round(zoom * 100)}%
    </div>
  );
};

export const DiagramZoomControls: React.FC = () => {
  const { zoomIn, zoomOut } = useDiagramContext();

  return (
    <div className="flex flex-col space-y-2">
      <Button 
        size="icon" 
        variant="secondary"
        onClick={zoomIn}
        className="h-8 w-8"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant="secondary"
        onClick={zoomOut}
        className="h-8 w-8"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
}; 