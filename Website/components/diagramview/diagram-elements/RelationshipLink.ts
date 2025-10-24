import { dia } from "@joint/core";

export const RelationshipLink = dia.Link.define('diagram.RelationshipLink', {
    connector: { name: 'jumpover', args: { type: "arc", radius: 10 } },
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
            strokeWidth: 1,
            sourceMarker: { 'type': 'path', 'd': '' },
            targetMarker: { 'type': 'path', 'd': '' }
        },
        wrapper: {
            connection: true,
            strokeWidth: 10,
            strokeLinejoin: 'round'
        }
    }
});


export const RelationshipLinkView = dia.LinkView.extend({
    
});

export const createRelationshipLink = (sourceId: dia.Cell.ID, targetId: dia.Cell.ID) => {
    return new RelationshipLink({
        source: { id: sourceId },
        target: { id: targetId }
    });
}