import { useRef, useState, useCallback, useEffect } from "react";
import { dia } from "@joint/core";
import { EntityType, AttributeType, GroupType } from "@/lib/Types";
import { DiagramRenderer } from "@/components/diagram/renderers/DiagramRenderer";

// Import all the manager classes
import { DiagramInitializer, DiagramInitializationCallbacks } from "./DiagramInitializer";
import { DiagramControls } from "./DiagramControls";
import { DiagramSelection } from "./DiagramSelection";
import { DiagramEntityManager } from "./DiagramEntityManager";
import { DiagramElementManager } from "./DiagramElementManager";
import { DiagramPersistenceManager } from "./DiagramPersistenceManager";
import { DiagramRenderingService } from "./DiagramRenderingService";

export type DiagramType = 'simple' | 'detailed';

export interface DiagramState {
    paper: dia.Paper | null;
    graph: dia.Graph | null;
    currentEntities: EntityType[];
    diagramType: DiagramType;
}

export interface DiagramActions {
    initializePaper: (container: HTMLElement, options?: any) => void;
    destroyPaper: () => void;
    addAttributeToEntity: (entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => void;
    removeAttributeFromEntity: (entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer) => void;
    updateDiagramType: (type: DiagramType) => void;
    addEntityToDiagram: (entity: EntityType, selectedAttributes?: string[]) => void;
    addGroupToDiagram: (group: GroupType, selectedAttributes?: { [entitySchemaName: string]: string[] }) => void;
    removeEntityFromDiagram: (entitySchemaName: string) => void;
    addSquareToDiagram: () => void;
    addTextToDiagram: () => void;
    saveDiagram: () => void;
    loadDiagram: (file: File) => Promise<void>;
    clearDiagram: () => void;
    // Additional control methods
    resetView: () => void;
    fitToScreen: () => void;
}

export class DiagramManager {
    // Manager instances
    private initializer: DiagramInitializer;
    private controls: DiagramControls | null = null;
    private selection: DiagramSelection | null = null;
    private entityManager: DiagramEntityManager | null = null;
    private elementManager: DiagramElementManager | null = null;
    private persistenceManager: DiagramPersistenceManager | null = null;
    private renderingService: DiagramRenderingService | null = null;

    // State
    private paperInitialized: boolean = false;
    private graphInitialized: boolean = false;

    // Event callbacks
    private eventCallbacks: DiagramInitializationCallbacks = {};

    constructor() {
        this.initializer = new DiagramInitializer();
    }

    public setEventCallbacks(callbacks: DiagramInitializationCallbacks): void {
        this.eventCallbacks = callbacks;
        this.initializer.setEventCallbacks(callbacks);
    }

    public async initializePaper(container: HTMLElement, options: any = {}): Promise<void> {
        const { paper, graph } = await this.initializer.initializePaper(container, options);
        
        // Initialize all managers with the paper and graph
        this.controls = new DiagramControls(paper);
        this.selection = new DiagramSelection(paper);
        this.entityManager = new DiagramEntityManager(graph, paper);
        this.elementManager = new DiagramElementManager(graph, paper);
        this.persistenceManager = new DiagramPersistenceManager(graph, paper, this.controls);
        this.renderingService = new DiagramRenderingService(graph, paper, this.entityManager, this.elementManager);

        this.paperInitialized = true;
        this.graphInitialized = true;
    }

    public destroyPaper(): void {
        this.initializer.destroyPaper();
        this.controls = null;
        this.selection = null;
        this.entityManager = null;
        this.elementManager = null;
        this.persistenceManager = null;
        this.paperInitialized = false;
        this.graphInitialized = false;
    }

    // Getters for state
    public getPaper(): dia.Paper | null {
        return this.initializer.getPaper();
    }

    public getGraph(): dia.Graph | null {
        return this.initializer.getGraph();
    }

    public getCurrentEntities(): EntityType[] {
        return this.entityManager?.getCurrentEntities() || [];
    }

    public getDiagramType(): DiagramType {
        return this.entityManager?.getDiagramType() || 'simple';
    }

    public isPaperInitialized(): boolean {
        return this.paperInitialized;
    }

    public isGraphInitialized(): boolean {
        return this.graphInitialized;
    }

    // Entity management methods
    public setDiagramType(type: DiagramType): void {
        this.entityManager?.setDiagramType(type);
    }

    public addEntityToDiagram(entity: EntityType, selectedAttributes?: string[]): boolean {
        if (!this.entityManager) return false;
        return this.entityManager.addEntity(entity, selectedAttributes);
    }

    public addGroupToDiagram(group: GroupType, selectedAttributes?: { [entitySchemaName: string]: string[] }): EntityType[] {
        if (!this.entityManager) return [];
        return this.entityManager.addGroup(group, selectedAttributes);
    }

    public removeEntityFromDiagram(entitySchemaName: string): boolean {
        if (!this.entityManager) return false;
        const removed = this.entityManager.removeEntity(entitySchemaName);
        if (removed) {
            // Trigger fit to screen after removal
            setTimeout(() => {
                this.fitToScreen();
            }, 100);
        }
        return removed;
    }

    public addAttributeToEntity(entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer): boolean {
        if (!this.entityManager) return false;
        
        const updated = this.entityManager.addAttributeToEntity(entitySchemaName, attribute);
        
        // Update the diagram using the renderer's unified method
        if (updated && renderer) {
            const updatedEntity = this.entityManager.getEntityBySchemaName(entitySchemaName);
            if (updatedEntity) {
                renderer.updateEntityAttributes(this.getGraph()!, entitySchemaName);
            }
        }
        
        return updated;
    }

    public removeAttributeFromEntity(entitySchemaName: string, attribute: AttributeType, renderer?: DiagramRenderer): boolean {
        if (!this.entityManager) return false;
        
        const updated = this.entityManager.removeAttributeFromEntity(entitySchemaName, attribute);
        
        // Update the diagram using the renderer's unified method
        if (updated && renderer) {
            const updatedEntity = this.entityManager.getEntityBySchemaName(entitySchemaName);
            if (updatedEntity) {
                renderer.updateEntityAttributes(this.getGraph()!, entitySchemaName);
            }
        }
        
        return updated;
    }

    // Element management methods
    public addSquareToDiagram(): any {
        return this.elementManager?.addSquare() || null;
    }

    public addTextToDiagram(): any {
        return this.elementManager?.addText() || null;
    }

    // Control methods
    public resetView(): void {
        if (this.controls && this.selection) {
            this.controls.reset();
            this.selection.clearSelection();
        }
    }

    public fitToScreen(): void {
        if (this.controls && this.getGraph()) {
            this.controls.fit(this.getGraph()!);
        }
    }

    // Persistence methods
    public saveDiagram(): void {
        if (this.persistenceManager && this.entityManager) {
            this.persistenceManager.saveDiagram(
                this.entityManager.getDiagramType(),
                this.entityManager.getCurrentEntities()
            );
        }
    }

    public async loadDiagram(file: File): Promise<void> {
        if (this.persistenceManager && this.entityManager) {
            await this.persistenceManager.loadDiagram(
                file,
                (type) => this.entityManager!.setDiagramType(type),
                (entities) => this.entityManager!.setCurrentEntities(entities)
            );
        }
    }

    public clearDiagram(): void {
        if (this.persistenceManager && this.entityManager && this.selection) {
            this.persistenceManager.clearDiagram(
                (entities) => this.entityManager!.setCurrentEntities(entities),
                () => this.selection!.clearSelection()
            );
        }
    }

    // Selection methods
    public getSelectedElements(): dia.Cell.ID[] {
        return this.selection?.getSelectedElements() || [];
    }

    public clearSelection(): void {
        this.selection?.clearSelection();
    }

    // Control state methods
    public getZoom(): number {
        return this.controls?.getZoom() || 1;
    }

    public getMousePosition(): { x: number; y: number } {
        return this.controls?.getMousePosition() || { x: 0, y: 0 };
    }

    public getIsPanning(): boolean {
        return this.controls?.getIsPanning() || false;
    }

    // Rendering service access
    public getRenderingService(): DiagramRenderingService | null {
        return this.renderingService;
    }
}
