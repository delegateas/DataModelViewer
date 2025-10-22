import { EntityType } from "@/lib/Types";

export type SelectObjectEvent = {
    type: 'none' | 'entity' | 'selection';
    objectId: string | null;
    data?: EntityType[];
}