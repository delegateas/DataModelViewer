import { RelationshipInformation } from "@/lib/diagram/models/relationship-information";
import { EntityType } from "@/lib/Types";

export type SelectObjectEvent = {
    type: 'none' | 'entity' | 'selection' | 'relationship';
    objectId: string | undefined;
    data?: EntityType[] | RelationshipInformation[];
}