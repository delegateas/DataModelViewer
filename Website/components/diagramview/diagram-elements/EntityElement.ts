import { dia, util } from '@joint/core';

export const EntityElementView = dia.ElementView.extend({
    
    events: {
        'mouseenter': 'onMouseEnter',
        'mouseleave': 'onMouseLeave',
        'contextmenu': 'onContextMenu'
    },

    initialize: function(options?: any) {
        dia.ElementView.prototype.initialize.call(this, options);
        this.updateTitle();
        
        // Drag state
        this.isDragging = false;
        this.dragStartPosition = null;
        this.initialPosition = null;
        this.dragMoveHandler = null;
        this.dragEndHandler = null;
    },

    onMouseEnter: function() {
        // Change cursor and highlight entity
        this.model.attr('container/style/cursor', 'move');
        this.model.attr('container/style/backgroundColor', 'var(--mui-palette-background-default)');
    },

    onMouseLeave: function() {
        // Change cursor back and remove highlight  
        this.model.attr('container/style/cursor', 'default');
        this.model.attr('container/style/backgroundColor', 'var(--mui-palette-background-paper)');
    },

    onContextMenu: function(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        // Dispatch a custom event for context menu
        const contextMenuEvent = new CustomEvent('entityContextMenu', {
            detail: { 
                entityId: String(this.model.id), 
                x: evt.clientX, 
                y: evt.clientY 
            }
        });
        window.dispatchEvent(contextMenuEvent);
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
                border: '2px solid var(--mui-palette-primary-main)',
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

export function createEntity(options: {
    position?: { x: number; y: number };
    title?: string;
    size?: { width: number; height: number };
} = {}) {
    const label = options.title || 'New Entity';
    const entity = new EntityElement({
        position: options.position || { x: 0, y: 0 },
        size: options.size || { width: 120, height: 80 },
        label
    });

    return entity;
}