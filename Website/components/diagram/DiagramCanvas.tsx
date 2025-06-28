import React, { useRef, useEffect } from 'react';
import { useDiagramContext } from '@/contexts/DiagramContext';

interface DiagramCanvasProps {
  children?: React.ReactNode;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { 
    isPanning, 
    initializePaper, 
    destroyPaper 
  } = useDiagramContext();

  useEffect(() => {
    if (canvasRef.current) {
      const paper = initializePaper(canvasRef.current, {
        background: {
          color: '#fef3c7' // Light yellow background
        }
      });

      return () => {
        destroyPaper();
      };
    }
  }, [initializePaper, destroyPaper]);

  return (
    <div className="flex-1 relative overflow-hidden dotted-background">
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