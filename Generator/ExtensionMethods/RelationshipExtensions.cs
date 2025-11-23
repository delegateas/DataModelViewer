using Generator.DTO;
using Generator.Services;
using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.ExtensionMethods;

public static class RelationshipExtensions
{
    public static IEnumerable<Relationship> ConvertToRelationship(this IEnumerable<ManyToManyRelationshipMetadata> relationships, string entityLogicalName, Dictionary<Guid, bool> inclusionMap)
    {
        return relationships.Select(rel => new Relationship(
                            rel.IsCustomRelationship ?? false,
                            $"{rel.Entity1AssociatedMenuConfiguration.Label.UserLocalizedLabel.Label} ⟷ {rel.Entity2AssociatedMenuConfiguration.Label.UserLocalizedLabel.Label}",
                            entityLogicalName,
                            "-",
                            rel.SchemaName,
                            rel.RelationshipType is RelationshipType.ManyToManyRelationship,
                            inclusionMap[rel.MetadataId!.Value],
                            null));
    }

    public static IEnumerable<Relationship> ConvertToRelationship(this IEnumerable<OneToManyRelationshipMetadata> relationships, string entityLogicalName, Dictionary<string, Dictionary<string, string>> attributeMapping, Dictionary<Guid, bool> inclusionMap)
    {
        return relationships.Select(rel => new Relationship(
                            rel.IsCustomRelationship ?? false,
                            rel.ReferencingEntityNavigationPropertyName ?? rel.ReferencedEntity,
                            entityLogicalName,
                            attributeMapping[rel.ReferencingEntity][rel.ReferencingAttribute],
                            rel.SchemaName,
                            rel.RelationshipType is not RelationshipType.ManyToManyRelationship,
                            inclusionMap[rel.MetadataId!.Value],
                            rel.CascadeConfiguration));
    }
}
