// Type definitions for diagram events
export interface EntitySelectEventDetail {
    entityId: string;
    ctrlKey: boolean;
}

export interface EntityContextMenuEventDetail {
    entityId: string;
    x: number;
    y: number;
}

export interface EntityDragStartEventDetail {
    entityId: string;
    startX: number;
    startY: number;
}

export interface EntityDragEndEventDetail {
    entityIds: string[];
}

// Custom event type definitions
export interface EntitySelectEvent extends CustomEvent {
    detail: EntitySelectEventDetail;
}

export interface EntityContextMenuEvent extends CustomEvent {
    detail: EntityContextMenuEventDetail;
}

export interface EntityDragStartEvent extends CustomEvent {
    detail: EntityDragStartEventDetail;
}

export interface EntityDragEndEvent extends CustomEvent {
    detail: EntityDragEndEventDetail;
}

// Event type map for type safety
export interface DiagramEventMap {
    'entitySelect': EntitySelectEvent;
    'entityContextMenu': EntityContextMenuEvent;
    'entityDragStart': EntityDragStartEvent;
    'entityDragEnd': EntityDragEndEvent;
}

// Type-safe event dispatcher class
export class DiagramEventDispatcher {
    static dispatch<K extends keyof DiagramEventMap>(
        type: K,
        detail: DiagramEventMap[K]['detail']
    ): void {
        const event = new CustomEvent(type, { detail }) as DiagramEventMap[K];
        window.dispatchEvent(event);
    }

    static addEventListener<K extends keyof DiagramEventMap>(
        type: K,
        listener: (event: DiagramEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void {
        window.addEventListener(type, listener as EventListener, options);
    }

    static removeEventListener<K extends keyof DiagramEventMap>(
        type: K,
        listener: (event: DiagramEventMap[K]) => void,
        options?: boolean | EventListenerOptions
    ): void {
        window.removeEventListener(type, listener as EventListener, options);
    }
}