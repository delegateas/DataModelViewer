export interface SerializedRelationship {
    schemaName: string;
    isIncluded?: boolean;
}

export interface SerializedLink {
    id: string;
    sourceId: string;
    sourceSchemaName: string;
    targetId: string;
    targetSchemaName: string;
    relationships: SerializedRelationship[];
}
