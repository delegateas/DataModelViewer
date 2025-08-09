import { dia } from '@joint/core';
import { AttributeType, EntityType } from '@/lib/Types';

export type IPortMap = Record<string, string>;

export abstract class DiagramRenderer {
    protected graph: dia.Graph;
    protected setSelectedKey?: (key: string | undefined) => void;

    constructor(
        graph: dia.Graph | undefined | null,
        options?: {
        setSelectedKey?: (key: string | undefined) => void;
    }) { 
        if (!graph) throw new Error("Graph must be defined");
        this.graph = graph;
        this.setSelectedKey = options?.setSelectedKey;
    }

    abstract onDocumentClick(event: MouseEvent): void;

    abstract createEntity(entity: EntityType, position: { x: number, y: number }): {
        element: dia.Element,
        portMap: IPortMap
    };

    abstract createLinks(entity: EntityType, entityMap: Map<string, { element: dia.Element, portMap: IPortMap }>): void;

    abstract highlightSelectedKey(
        graph: dia.Graph,
        entities: EntityType[],
        selectedKey: string
    ): void;

  abstract updateEntityAttributes(graph: dia.Graph, selectedKey: string): void;

  abstract onLinkClick(linkView: dia.LinkView, evt: dia.Event): void;

  abstract getVisibleAttributes(entity: EntityType): AttributeType[];
}