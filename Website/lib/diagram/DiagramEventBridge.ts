import { SelectObjectEvent } from '@/components/diagramview/events/SelectObjectEvent';
import { EntityType } from '../Types';
import { RelationshipInformation } from './models/relationship-information';

/**
 * Event bridge class that provides a simple interface for both React and Joint.js components
 * to dispatch and listen to diagram events without complex hook or context overhead.
 */
export class DiagramEventBridge {
    private static instance: DiagramEventBridge;

    private constructor() { }

    static getInstance(): DiagramEventBridge {
        if (!DiagramEventBridge.instance) {
            DiagramEventBridge.instance = new DiagramEventBridge();
        }
        return DiagramEventBridge.instance;
    }

    dispatchEntitySelect(entityId: string, entityData: EntityType) {
        const event = new CustomEvent<SelectObjectEvent>('selectObject', {
            detail: {
                type: 'entity',
                objectId: entityId,
                data: [entityData]
            }
        });
        window.dispatchEvent(event);
    }

    dispatchRelationshipSelect(relationshipId: string, relationshipData: RelationshipInformation | RelationshipInformation[]) {
        // Ensure data is always an array
        const dataArray = Array.isArray(relationshipData) ? relationshipData : [relationshipData];

        const event = new CustomEvent<SelectObjectEvent>('selectObject', {
            detail: {
                type: 'relationship',
                objectId: relationshipId,
                data: dataArray
            }
        });
        window.dispatchEvent(event);
    }

    dispatchSelectionChange(entities: EntityType[]) {
        const event = new CustomEvent<SelectObjectEvent>('selectObject', {
            detail: {
                type: 'selection',
                objectId: undefined,
                data: entities
            }
        });
        window.dispatchEvent(event);
    }

    dispatchClear() {
        const event = new CustomEvent<SelectObjectEvent>('selectObject', {
            detail: {
                type: 'none',
                objectId: undefined,
                data: []
            }
        });
        window.dispatchEvent(event);
    }

    dispatchEntityContextMenu(entityId: string, x: number, y: number) {
        const event = new CustomEvent('entityContextMenu', {
            detail: { entityId, x, y }
        });
        window.dispatchEvent(event);
    }

    // Event listening methods - can be used by React components
    addEventListener(eventType: 'selectObject', handler: (event: CustomEvent<SelectObjectEvent>) => void): void;
    addEventListener(eventType: 'entityContextMenu', handler: (event: CustomEvent) => void): void;
    addEventListener(eventType: string, handler: (event: CustomEvent) => void): void {
        window.addEventListener(eventType, handler as EventListener);
    }

    removeEventListener(eventType: 'selectObject', handler: (event: CustomEvent<SelectObjectEvent>) => void): void;
    removeEventListener(eventType: 'entityContextMenu', handler: (event: CustomEvent) => void): void;
    removeEventListener(eventType: string, handler: (event: CustomEvent) => void): void {
        window.removeEventListener(eventType, handler as EventListener);
    }

    // Convenience method for React components that need to handle selection events
    onSelectionEvent(callback: (event: SelectObjectEvent) => void): () => void {
        const handler = (evt: CustomEvent<SelectObjectEvent>) => {
            callback(evt.detail);
        };

        this.addEventListener('selectObject', handler);

        // Return cleanup function
        return () => this.removeEventListener('selectObject', handler);
    }

    // Convenience method for React components that need to handle context menu events
    onContextMenuEvent(callback: (entityId: string, x: number, y: number) => void): () => void {
        const handler = (evt: CustomEvent) => {
            const { entityId, x, y } = evt.detail;
            callback(entityId, x, y);
        };

        this.addEventListener('entityContextMenu', handler);

        // Return cleanup function
        return () => this.removeEventListener('entityContextMenu', handler);
    }
}

// Export singleton instance for easy access
export const diagramEvents = DiagramEventBridge.getInstance();