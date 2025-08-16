using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO;


public record Relationship(
    bool IsCustom,
    string Name,
    string TableSchema,
    string LookupDisplayName,
    string RelationshipSchema,
    bool IsManyToMany,
    CascadeConfiguration? CascadeConfiguration);
