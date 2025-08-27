import { useDiagramViewContext } from '@/contexts/DiagramViewContext';
import React, { useRef, useEffect, useState } from 'react';

interface DiagramCanvasProps {
  children?: React.ReactNode;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  const { 
    isPanning, 
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
    if (isPanning) return 'cursor-grabbing';
    if (isCtrlPressed) return 'cursor-grab';
    return 'cursor-crosshair'; // Default to crosshair for area selection
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <div 
        ref={canvasRef} 
        className={`w-full h-full ${getCursor()}`}
      />
     
      {children}
    </div>
  );
}; 