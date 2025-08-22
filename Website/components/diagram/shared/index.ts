// Export all diagram manager classes for easy importing
export { DiagramManager } from './DiagramManager';
export { DiagramEntityManager } from './DiagramEntityManager';
export { DiagramElementManager } from './DiagramElementManager';
export { DiagramPersistenceManager, type DiagramData } from './DiagramPersistenceManager';
export { DiagramInitializer, type DiagramInitializationCallbacks } from './DiagramInitializer';
export { DiagramControls } from './DiagramControls';
export { DiagramSelection } from './DiagramSelection';

// Re-export types that might be useful
export type { DiagramType, DiagramState, DiagramActions } from '../hooks/useDiagramRefactored';
