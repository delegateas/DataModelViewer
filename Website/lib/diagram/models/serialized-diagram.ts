import { SerializedEntity } from "./serialized-entity";

export interface SerializedDiagram {
    id: string;
    name: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    metadata: {
        zoom: number;
        translate: { x: number; y: number };
        canvasSize: { width: number; height: number };
    };
    entities: SerializedEntity[];
}