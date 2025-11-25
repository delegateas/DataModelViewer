using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO;


public record Relationship(
    bool IsCustom,
    string Name,
    string TableSchema,
    string LookupDisplayName,
    string RelationshipSchema,
    string IsManyToMany,
    bool IsExplicit,
    string PublisherName,
    string PublisherPrefix,
    CascadeConfiguration? CascadeConfiguration,
    List<SolutionInfo> Solutions);
