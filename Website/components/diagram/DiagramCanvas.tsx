import { useDiagramViewContext } from '@/contexts/DiagramViewContext';
import React, { useRef, useEffect, useState } from 'react';

interface DiagramCanvasProps {
  children?: React.ReactNode;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  const { 
    getIsPanning, 
    initializePaper, 
    destroyPaper 
  } = useDiagramViewContext();

  // Track Ctrl key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Handle window blur to reset ctrl state
    const handleBlur = () => setIsCtrlPressed(false);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

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

  // Determine cursor based on state
  const getCursor = () => {
    if (getIsPanning()) return 'cursor-grabbing';
    if (isCtrlPressed) return 'cursor-grab';
    return 'cursor-crosshair'; // Default to crosshair for area selection
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <div 
        ref={canvasRef} 
        className={`w-full h-full ${getCursor()}`}
      />
      
      {/* Interaction mode indicators */}
      {getIsPanning() && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Panning...
        </div>
      )}
      
      {isCtrlPressed && !getIsPanning() && (
        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2">
          <kbd className="bg-green-600 px-1 rounded text-xs">Ctrl</kbd>
          Hold + Drag to Pan
        </div>
      )}
      
      {!isCtrlPressed && !getIsPanning() && (
        <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 border border-white rounded-sm"></div>
          Drag to Select Area
        </div>
      )}
      
      {children}
    </div>
  );
}; 