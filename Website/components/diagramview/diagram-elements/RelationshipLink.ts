import { diagramEvents } from "@/lib/diagram/DiagramEventBridge";
import { RelationshipInformation } from "@/lib/diagram/models/relationship-information";
import { dia } from "@joint/core";

export type RelationshipLink = dia.Link & {
    get(key: 'relationshipInformationList'): RelationshipInformation[];
    get(key: 'sourceSchemaName'): string;
    get(key: 'targetSchemaName'): string;
};

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

    onMouseEnter: function () {
        this.model.attr('line/strokeWidth', 2);
    },

    onMouseLeave: function () {
        this.model.attr('line/strokeWidth', 1);
    },

    onPointerDown: function (evt: PointerEvent) {
        // Get the relationships array from the model
        const relationships = this.model.get('relationshipInformationList') || [];

        diagramEvents.dispatchRelationshipSelect(
            String(this.model.id),
            relationships
        );
    }
});

const circleMarker = {
    type: 'circle',
    r: 3,
    cx: 4,
    z: 1,
    fill: 'var(--mui-palette-background-default)',
    stroke: 'var(--mui-palette-primary-main)',
    'stroke-width': 1
};

/**
 * Calculate and set markers on a link based on included relationships only
 */
export const updateLinkMarkers = (link: dia.Link) => {
    const relationshipInformationList = link.get('relationshipInformationList') as RelationshipInformation[] || [];

    // Filter to only included relationships (default to true if not specified)
    const includedRelationships = relationshipInformationList.filter(rel => rel.isIncluded !== false);

    // Clear existing markers first
    link.attr('line/targetMarker', null);
    link.attr('line/sourceMarker', null);

    // Set markers based on included relationships
    includedRelationships.forEach((relInfo) => {
        if (relInfo.RelationshipType === '1-M') {
            link.attr('line/targetMarker', circleMarker);
        } else if (relInfo.RelationshipType === 'M-1' || relInfo.RelationshipType === 'SELF') {
            link.attr('line/sourceMarker', circleMarker);
        } else if (relInfo.RelationshipType === 'M-M') {
            link.attr('line/targetMarker', circleMarker);
            link.attr('line/sourceMarker', circleMarker);
        }
    });
};

// Create a directed relationship link with proper markers
export const createRelationshipLink = (
    sourceId: dia.Cell.ID,
    sourceSchemaName: string,
    targetId: dia.Cell.ID,
    targetSchemaName: string,
    relationshipInformationList: RelationshipInformation[],
    label?: string
) => {
    const link = new RelationshipLink({
        source: { id: sourceId },
        target: { id: targetId },
        sourceSchemaName,
        targetSchemaName,
        relationshipInformationList,
    });

    // Add label if provided using JointJS label system
    if (label) {
        link.appendLabel({
            markup: [
                {
                    tagName: 'rect',
                    selector: 'body'
                },
                {
                    tagName: 'text',
                    selector: 'label'
                }
            ],
            attrs: {
                label: {
                    text: label,
                    fill: 'var(--mui-palette-text-primary)',
                    fontSize: 12,
                    fontFamily: 'sans-serif',
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle'
                },
                body: {
                    ref: 'label',
                    fill: 'white',
                    rx: 3,
                    ry: 3,
                    refWidth: '100%',
                    refHeight: '100%',
                    refX: '0%',
                    refY: '0%'
                }
            },
            position: {
                distance: 0.5,
                args: {
                    keepGradient: true,
                    ensureLegibility: true
                }
            }
        });
    }

    // Calculate markers based on included relationships only
    updateLinkMarkers(link);

    if (sourceId === targetId) {
        link.set('source', { id: sourceId, port: 'self-out' });
        link.set('target', { id: targetId, port: 'self-in' });
    }

    if (relationshipInformationList.some(rel => rel.isIncluded === undefined)) {
        link.attr("line/strokeDasharray", "5 5");
        link.attr("line/stroke", "var(--mui-palette-warning-main)");
    } else if (relationshipInformationList.every(rel => rel.isIncluded === false)) {
        link.attr('line/style/strokeDasharray', '1 1');
        link.attr('line/style/stroke', 'var(--mui-palette-text-secondary)');
        link.attr('line/targetMarker', null);
        link.attr('line/sourceMarker', null);
    }

    return link;
}