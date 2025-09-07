import { MouseRounded, ZoomInRounded } from '@mui/icons-material';
import React from 'react';

interface ZoomCoordinateIndicatorProps {
  zoom: number;
  mousePosition: { x: number; y: number } | null;
}

export const ZoomCoordinateIndicator: React.FC<ZoomCoordinateIndicatorProps> = ({
  zoom,
  mousePosition
}) => {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <ZoomInRounded className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">
            {zoomPercentage}%
          </span>
        </div>
        
        {mousePosition && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center space-x-2">
              <MouseRounded className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs">
                X: {mousePosition.x}, Y: {mousePosition.y}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 