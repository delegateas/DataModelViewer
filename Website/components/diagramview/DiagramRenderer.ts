import { dia } from '@joint/core';
import { AttributeType, EntityType } from '@/lib/Types';
import { EntityElement } from '@/components/diagramview/elements/EntityElement';

export type IPortMap = Record<string, string>;

export abstract class DiagramRenderer {
    protected graph: dia.Graph;
    protected setSelectedKey?: (key: string | undefined) => void;
    protected onLinkClickHandler?: (link: dia.Link) => void;
    private instanceId: string;
    protected currentSelectedKey?: string;

    constructor(
        graph: dia.Graph | undefined | null,
        options?: {
        setSelectedKey?: (key: string | undefined) => void;
        onLinkClick?: (link: dia.Link) => void;
    }) { 
        this.instanceId = Math.random().toString(36).substr(2, 9);
        if (!graph) throw new Error("Graph must be defined");
        this.graph = graph;
        this.setSelectedKey = options?.setSelectedKey;
        this.onLinkClickHandler = options?.onLinkClick;
        
        // Bind methods to preserve context
        this.onLinkClick = this.onLinkClick.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    abstract onDocumentClick(event: MouseEvent): void;

    abstract createEntity(entity: EntityType, position: { x: number, y: number }): {
        element: dia.Element,
        portMap: IPortMap
    };

    abstract createLinks(entity: EntityType, entityMap: Map<string, { element: dia.Element, portMap: IPortMap }>, allEntities: EntityType[]): void;

    abstract highlightSelectedKey(
        graph: dia.Graph,
        entities: EntityType[],
        selectedKey: string
    ): void;

  abstract updateEntityAttributes(graph: dia.Graph, selectedKey: string | undefined): void;

  abstract onLinkClick(linkView: dia.LinkView, evt: dia.Event): void;

  abstract getVisibleAttributes(entity: EntityType): AttributeType[];

  // Helper method to set selected key and track it internally
  protected setAndTrackSelectedKey(key: string | undefined): void {
    this.currentSelectedKey = key;
    this.setSelectedKey?.(key);
  }

  // Helper method to get current selected key
  protected getCurrentSelectedKey(): string | undefined {
    return this.currentSelectedKey;
  }

  // Method to sync internal state when selectedKey is set externally
  public updateSelectedKey(key: string | undefined): void {
    this.currentSelectedKey = key;
  }

  // Unified method to update an entity regardless of type
  updateEntity(entitySchemaName: string, updatedEntity: EntityType): void {
    // Find the entity element in the graph
    const allElements = this.graph.getElements();
    
    const entityElement = allElements.find(el => 
      (el.get('type') === 'delegate.entity' || el.get('type') === 'delegate.simple-entity') && 
      el.get('data')?.entity?.SchemaName === entitySchemaName
    );

    if (entityElement) {
      // Update the element's data
      entityElement.set('data', { entity: updatedEntity });

      // Call the appropriate update method based on entity type
      if (entityElement.get('type') === 'delegate.entity') {
        // For detailed entities, use updateAttributes
        const entityElementTyped = entityElement as unknown as { updateAttributes: (entity: EntityType) => void };
        if (entityElementTyped.updateAttributes) {
          entityElementTyped.updateAttributes(updatedEntity);
        }
      } else if (entityElement.get('type') === 'delegate.simple-entity') {
        // For simple entities, use updateEntity
        const simpleEntityElementTyped = entityElement as unknown as { updateEntity: (entity: EntityType) => void };
        if (simpleEntityElementTyped.updateEntity) {
          simpleEntityElementTyped.updateEntity(updatedEntity);
        }
      }

      // Recreate links for this entity to reflect attribute changes
      this.recreateEntityLinks(updatedEntity);
    }
  }

  // Helper method to recreate links for a specific entity
  private recreateEntityLinks(entity: EntityType): void {
    // Remove existing links for this entity
    const allElements = this.graph.getElements();
    const entityElement = allElements.find(el => 
      (el.get('type') === 'delegate.entity' || el.get('type') === 'delegate.simple-entity') && 
      el.get('data')?.entity?.SchemaName === entity.SchemaName
    );

    if (entityElement) {
      // Remove all links connected to this entity
      const connectedLinks = this.graph.getConnectedLinks(entityElement);
      connectedLinks.forEach(link => link.remove());
    }

    // Recreate the entity map for link creation
    const entityMap = new Map<string, { element: dia.Element, portMap: IPortMap }>();
    
    allElements.forEach(el => {
      if (el.get('type') === 'delegate.entity' || el.get('type') === 'delegate.simple-entity') {
        const entityData = el.get('data')?.entity;
        if (entityData) {
          // Create appropriate port map based on entity type
          let portMap: IPortMap;
          if (el.get('type') === 'delegate.entity') {
            // For detailed entities, get the actual port map
            const { portMap: detailedPortMap } = EntityElement.getVisibleItemsAndPorts(entityData);
            portMap = detailedPortMap;
          } else {
            // For simple entities, use basic 4-directional ports
            portMap = {
              top: 'port-top',
              right: 'port-right',
              bottom: 'port-bottom',
              left: 'port-left'
            };
          }
          
          entityMap.set(entityData.SchemaName, { element: el, portMap });
        }
      }
    });

    // Recreate links for all entities (this ensures all relationships are updated)
    const allEntities: EntityType[] = [];
    entityMap.forEach((entityInfo) => {
      const entityData = entityInfo.element.get('data')?.entity;
      if (entityData) {
        allEntities.push(entityData);
      }
    });
    
    entityMap.forEach((entityInfo) => {
      const entityData = entityInfo.element.get('data')?.entity;
      if (entityData) {
        this.createLinks(entityData, entityMap, allEntities);
      }
    });
  }
}