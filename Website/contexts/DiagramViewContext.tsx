import React, { createContext, useContext, ReactNode } from 'react';
import { useDiagram, DiagramState, DiagramActions } from '@/hooks/useDiagram';

interface DiagramViewContextType extends DiagramState, DiagramActions {}

const DiagramViewContext = createContext<DiagramViewContextType | null>(null);

interface DiagramViewProviderProps {
  children: ReactNode;
}

export const DiagramViewProvider: React.FC<DiagramViewProviderProps> = ({ children }) => {
  const diagramViewState = useDiagram();

  return (
    <DiagramViewContext.Provider value={diagramViewState}>
      {children}
    </DiagramViewContext.Provider>
  );
};

export const useDiagramViewContext = (): DiagramViewContextType => {
  const context = useContext(DiagramViewContext);
  if (!context) {
    throw new Error('useDiagramViewContext must be used within a DiagramViewProvider');
  }
  return context;
};

export const useDiagramViewContextSafe = (): DiagramViewContextType | null => {
  const context = useContext(DiagramViewContext);
  return context;
}; 