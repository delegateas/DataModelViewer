import { SerializedEntity } from "./serialized-entity";
import { SerializedLink } from "./serialized-link";

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
    links: SerializedLink[];
}