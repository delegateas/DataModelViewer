import React, { createContext, useContext, ReactNode } from 'react';
import { useDiagram, DiagramState, DiagramActions } from '@/hooks/useDiagram';

interface DiagramContextType extends DiagramState, DiagramActions {}

const DiagramContext = createContext<DiagramContextType | null>(null);

interface DiagramProviderProps {
  children: ReactNode;
}

export const DiagramProvider: React.FC<DiagramProviderProps> = ({ children }) => {
  const diagramState = useDiagram();

  return (
    <DiagramContext.Provider value={diagramState}>
      {children}
    </DiagramContext.Provider>
  );
};

export const useDiagramContext = (): DiagramContextType => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagramContext must be used within a DiagramProvider');
  }
  return context;
}; 