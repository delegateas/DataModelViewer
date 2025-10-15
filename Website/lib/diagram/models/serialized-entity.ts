export interface SerializedEntity {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    label: string;
}