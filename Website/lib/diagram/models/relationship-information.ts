export type RelationshipInformation = {
    sourceEntitySchemaName: string,
    sourceEntityDisplayName: string,
    targetEntitySchemaName: string,
    targetEntityDisplayName: string,
    RelationshipType: '1-M' | 'M-1' | 'M-M' | 'SELF',
    RelationshipSchemaName: string,
    // Additional details about the relationship
    RelationshipName?: string, // Display name or lookup name
    IsManyToMany?: boolean,
    IsLookup?: boolean, // True if this is a lookup attribute relationship
    LookupAttributeName?: string, // Name of the lookup attribute if IsLookup is true
}