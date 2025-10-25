import { dia, mvc, util } from '@joint/core';
import { EntityType } from '@/lib/Types';
import { diagramEvents } from '@/lib/diagram/DiagramEventBridge';

export type EntityElement = dia.Element & {
    get(key: 'entityData'): EntityType | undefined;
    get(key: 'label'): string | undefined;
};
export type EntityElementView = dia.ElementView<EntityElement> & {
    onSelect(): void;
    onDeselect(): void;
};

interface IEntityOptions extends mvc.ViewBaseOptions {
    position?: { x: number; y: number };
    title?: string;
    size?: { width: number; height: number };
    entityData?: EntityType;
};

export const EntityElementView = dia.ElementView.extend({
    
    events: {
        'mouseenter': 'onMouseEnter',
        'mouseleave': 'onMouseLeave',
        'contextmenu': 'onContextMenu',
        'pointerdown': 'onPointerDown',
        'pointerup': 'onPointerUp',
    },

    initialize: function(options?: IEntityOptions) {
        dia.ElementView.prototype.initialize.call(this, options);
        this.updateTitle();
        this.isSelected = false; // Track selection state
    },

    onMouseEnter: function() {
        // Only apply hover effects if not selected
        if (!this.isSelected) {
            this.model.attr('container/style/cursor', 'move');
            this.model.attr('container/style/backgroundColor', 'var(--mui-palette-background-default)');
            this.model.attr('container/style/borderColor', 'var(--mui-palette-primary-main)');
        }
    },

    onMouseLeave: function() {
        // Only remove hover effects if not selected
        if (!this.isSelected) {
            this.model.attr('container/style/cursor', 'default');
            this.model.attr('container/style/backgroundColor', 'var(--mui-palette-background-paper)');
            this.model.attr('container/style/borderColor', 'var(--mui-palette-border-main)');
        }
    },

    onContextMenu: function(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        // Dispatch a custom event for context menu
        diagramEvents.dispatchEntityContextMenu(
            String(this.model.id), 
            evt.clientX, 
            evt.clientY
        );
    },

    onPointerDown: function() {
        this.model.attr('container/style/cursor', 'grabbing');
        
        diagramEvents.dispatchEntitySelect(
            String(this.model.id),
            this.model.get('entityData')
        );
    },

    onPointerUp: function() {
        this.model.attr('container/style/cursor', 'move');
    },

    onSelect: function() {
        // Apply the same styling as hover but for selection
        this.model.attr('container/style/backgroundColor', 'var(--mui-palette-background-default)');
        this.model.attr('container/style/borderColor', 'var(--mui-palette-primary-main)');
        this.model.attr('container/style/cursor', 'move');
        
        // Mark as selected for state tracking
        this.isSelected = true;
    },

    onDeselect: function() {
        // Remove selection styling back to normal state
        this.model.attr('container/style/backgroundColor', 'var(--mui-palette-background-paper)');
        this.model.attr('container/style/borderColor', 'var(--mui-palette-border-main)');
        this.model.attr('container/style/cursor', 'default');
        
        // Mark as not selected
        this.isSelected = false;
    },

    updateTitle: function() {
        const label = this.model.get('label') || 'Entity';
        this.model.attr('title/html', label);
    },

    remove: function() {
        // Clean up any remaining event listeners
        if (this.dragMoveHandler) {
            document.removeEventListener('mousemove', this.dragMoveHandler);
        }
        if (this.dragEndHandler) {
            document.removeEventListener('mouseup', this.dragEndHandler);
        }
        dia.ElementView.prototype.remove.call(this);
    }
});

export const EntityElement = dia.Element.define('diagram.EntityElement', {
    size: { width: 120, height: 80 },
    z: 10,
    attrs: {
        foreignObject: {
            width: 'calc(w)',
            height: 'calc(h)'
        },
        container: {
            style: {
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--mui-palette-background-paper)',
                border: '2px solid var(--mui-palette-border-main)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                boxSizing: 'border-box'
            }
        },
        title: {
            html: 'Entity',
            style: {
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--mui-palette-text-primary)',
                textAlign: 'center',
                wordBreak: 'break-word'
            }
        }
    }
}, {
    markup: util.svg/* xml */`
        <foreignObject @selector="foreignObject">
            <div 
                xmlns="http://www.w3.org/1999/xhtml" 
                @selector="container"
                class="entity-container duration-300 transition-colors"
            >
                <span @selector="title" class="entity-title"></span>
            </div>
        </foreignObject>
    `
});

export function createEntity(options: IEntityOptions = {}) {
    const label = options.title || 'New Entity';
    const entity = new EntityElement({
        position: options.position || { x: 0, y: 0 },
        size: options.size || { width: 120, height: 80 },
        label,
        entityData: options.entityData
    });

    return entity;
}