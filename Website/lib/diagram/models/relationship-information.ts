export type RelationshipInformation = {
    sourceEntitySchemaName: string,
    sourceEntityDisplayName: string,
    targetEntitySchemaName: string,
    targetEntityDisplayName: string,
    RelationshipType: '1-M' | 'M-1' | 'M-M',
    RelationshipSchemaName: string,
}