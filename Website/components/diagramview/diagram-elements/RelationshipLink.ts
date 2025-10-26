import { diagramEvents } from "@/lib/diagram/DiagramEventBridge";
import { RelationshipInformation } from "@/lib/diagram/models/relationship-information";
import { dia } from "@joint/core";

export const RelationshipLink = dia.Link.define('diagram.RelationshipLink', {
    connector: { name: 'jumpover', args: { type: "arc", radius: 10 } },
    z: 1,
    markup: [
        {
            tagName: 'path',
            selector: 'wrapper',
            attributes: {
                'fill': 'none',
                'cursor': 'pointer',
                'stroke': 'transparent',
                'stroke-linecap': 'round'
            }
        },
        {
            tagName: 'path',
            selector: 'line',
            attributes: {
                'fill': 'none',
                'pointer-events': 'none'
            }
        }
    ],
    attrs: {
        line: {
            connection: true,
            stroke: 'var(--mui-palette-primary-main)',
            strokeWidth: 1
        },
        wrapper: {
            connection: true,
            strokeWidth: 10,
            strokeLinejoin: 'round'
        }
    }
});


export const RelationshipLinkView = dia.LinkView.extend({
    
    events: {
        'pointerdown': 'onPointerDown',
        'mouseenter': 'onMouseEnter',
        'mouseleave': 'onMouseLeave',
    },

    onMouseEnter: function() {
        this.model.attr('line/strokeWidth', 2);
    },

    onMouseLeave: function() {
        this.model.attr('line/strokeWidth', 1);
    },

    onPointerDown: function(evt: PointerEvent) {
        evt.stopPropagation();
        evt.preventDefault();

        // Get the relationships array from the model
        const relationships = this.model.get('relationshipInformationList') || [this.model.get('relationshipInformation')].filter(Boolean);

        diagramEvents.dispatchRelationshipSelect(
            String(this.model.id),
            relationships
        );
    }
});

export const createRelationshipLink = (sourceId: dia.Cell.ID, targetId: dia.Cell.ID) => {
    return new RelationshipLink({
        source: { id: sourceId },
        target: { id: targetId }
    });
}

const circleMarker = {
  type: 'circle',
  r: 3,
  cx: 4,
  z: 1,
  fill: 'var(--mui-palette-background-default)',
  stroke: 'var(--mui-palette-primary-main)',
  'stroke-width': 1
};

// Create a directed relationship link with proper markers
export const createDirectedRelationshipLink = (
    sourceId: dia.Cell.ID,
    targetId: dia.Cell.ID,
    direction: '1-M' | 'M-1' | 'M-M' | 'SELF',
    relationshipInformationList: RelationshipInformation[]
) => {
    const link = new RelationshipLink({
        source: { id: sourceId },
        target: { id: targetId },
        relationshipInformationList,
        // Keep the first one for backward compatibility
        relationshipInformation: relationshipInformationList[0]
    });

    // Set markers based on relationship direction
    switch (direction) {
        case '1-M':
            link.attr('line/targetMarker', circleMarker);
            break;
        case 'M-1':
            link.attr('line/sourceMarker', circleMarker);
            break;
        case 'M-M':
            link.attr('line/sourceMarker', circleMarker);
            link.attr('line/targetMarker', circleMarker);
            break;
        case 'SELF':
            // Self-referencing relationship - create a loop with markers
            link.attr('line/sourceMarker', circleMarker);
            link.attr('line/targetMarker', circleMarker);
            break;
    }

    if (sourceId === targetId) {
        link.set('source', { id: sourceId, port: 'self-out' });
        link.set('target', { id: targetId, port: 'self-in' });
    }

    return link;
}