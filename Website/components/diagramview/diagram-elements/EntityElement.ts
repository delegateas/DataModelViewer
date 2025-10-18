import { dia, util } from '@joint/core';

export const EntityElementView = dia.ElementView.extend({
    
    events: {
        'click': 'onEntityClick',
        'dblclick': 'onTitleDoubleClick',
        'mouseenter': 'onMouseEnter',
        'mouseleave': 'onMouseLeave',
        'contextmenu': 'onContextMenu'
    },

    initialize: function(options?: any) {
        dia.ElementView.prototype.initialize.call(this, options);
        this.listenTo(this.model, 'change:label', this.updateTitle);
        this.updateTitle();
    },

    onEntityClick: function(evt: MouseEvent) {
        this.preventDefaultInteraction(evt);
    },

    onTitleDoubleClick: function(evt: Event) {
        evt.preventDefault();
        evt.stopPropagation();
    },

    onMouseEnter: function() {
        this.model.attr('container/style/cursor', 'move');
    },

    onMouseLeave: function() {
        this.model.attr('container/style/cursor', 'default');
    },

    onContextMenu: function(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopPropagation();

        const customEvent = new CustomEvent('entityContextMenu', {
            detail: {
                entityId: this.model.id,
                x: evt.clientX,
                y: evt.clientY
            }
        });
        window.dispatchEvent(customEvent);
    },

    updateTitle: function() {
        const label = this.model.get('label') || 'Entity';
        this.model.attr('title/html', label);
    },
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
                class="entity-container"
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