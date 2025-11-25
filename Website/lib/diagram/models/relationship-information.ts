export type RelationshipInformation = {
    sourceEntitySchemaName: string,
    sourceEntityDisplayName: string,
    targetEntitySchemaName: string,
    targetEntityDisplayName: string,
    RelationshipSchemaName: string,
    RelationshipType: "N:N" | "1:N" | "N:1" | "SELF",
    isIncluded?: boolean,
}