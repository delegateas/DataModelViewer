// Export all diagram manager classes for easy importing
export { DiagramManager } from './DiagramManager';
export { DiagramEntityManager } from './DiagramEntityManager';
export { DiagramElementManager } from './DiagramElementManager';
export { DiagramPersistenceManager, type DiagramData } from './DiagramPersistenceManager';
export { DiagramInitializer, type DiagramInitializationCallbacks } from './DiagramInitializer';
export { DiagramControls } from './DiagramControls';
export { DiagramSelection } from './DiagramSelection';
export { DiagramRenderingService } from './DiagramRenderingService';

// Re-export types that might be useful - using the original for now since it's backward compatible
export type { DiagramType, DiagramState, DiagramActions } from '../hooks/useDiagram';
