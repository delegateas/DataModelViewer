import { useDiagramViewContext } from '@/contexts/DiagramViewContext';
import React, { useRef, useEffect } from 'react';

interface DiagramCanvasProps {
  children?: React.ReactNode;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const { 
    isPanning, 
    initializePaper, 
    destroyPaper 
  } = useDiagramViewContext();

  useEffect(() => {
    if (canvasRef.current) {
      initializePaper(canvasRef.current, {
        background: {
          color: 'transparent' // Make paper background transparent to show CSS dots
        }
      });

      return () => {
        destroyPaper();
      };
    }
  }, [initializePaper, destroyPaper]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <div 
        ref={canvasRef} 
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
      />
      
      {/* Panning indicator */}
      {isPanning && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          Panning...
        </div>
      )}
      
      {children}
    </div>
  );
}; 