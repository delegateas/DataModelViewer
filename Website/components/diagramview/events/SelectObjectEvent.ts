import { EntityType } from "@/lib/Types";

export type SelectObjectEvent = {
    type: 'entity';
    objectId: string | null;
    data?: EntityType;
}