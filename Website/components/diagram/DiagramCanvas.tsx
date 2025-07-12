import { useDiagramViewContext } from '@/contexts/DiagramViewContext';
import React, { useRef, useEffect, useState } from 'react';

interface DiagramCanvasProps {
  children?: React.ReactNode;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const { 
    isPanning, 
    initializePaper, 
    destroyPaper 
  } = useDiagramViewContext();

  useEffect(() => {
    if (canvasRef.current) {
      const paper = initializePaper(canvasRef.current, {
        background: {
          color: 'transparent' // Make paper background transparent to show CSS dots
        }
      });

      // Track container dimensions
      const updateDimensions = () => {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          setContainerDimensions({ width: rect.width, height: rect.height });
        }
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);

      return () => {
        window.removeEventListener('resize', updateDimensions);
        destroyPaper();
      };
    }
  }, [initializePaper, destroyPaper]);

  return (
    <div className="flex-1 relative overflow-hidden bg-amber-50">
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