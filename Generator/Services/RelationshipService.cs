using Generator.DTO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.Services;

/// <summary>
/// Service responsible for mapping entity relationships
/// </summary>
internal class RelationshipService
{
    private readonly IConfiguration configuration;
    private readonly ILogger<RelationshipService> logger;
    private readonly SolutionService solutionService;

    public RelationshipService(IConfiguration configuration, ILogger<RelationshipService> logger, SolutionService solutionService)
    {
        this.configuration = configuration;
        this.logger = logger;
        this.solutionService = solutionService;
    }

    /// <summary>
    /// Parses table groups from configuration
    /// </summary>
    public Dictionary<string, string> ParseTableGroups()
    {
        Dictionary<string, string> tablegroups = []; // logicalname -> group
        var tablegroupstring = configuration["TableGroups"];
        if (tablegroupstring?.Length > 0)
        {
            var groupEntries = tablegroupstring.Split(';', StringSplitOptions.RemoveEmptyEntries);
            foreach (var g in groupEntries)
            {
                var tables = g.Split(':');
                if (tables.Length != 2)
                {
                    logger.LogError($"Invalid format for tablegroup entry: ({g})");
                    continue;
                }

                var logicalNames = tables[1].Split(',', StringSplitOptions.RemoveEmptyEntries);
                foreach (var logicalName in logicalNames)
                    if (!tablegroups.TryAdd(logicalName.Trim().ToLower(), tables[0].Trim()))
                    {
                        logger.LogWarning($"Dublicate logicalname detected: {logicalName} (already in tablegroup '{tablegroups[logicalName]}', dublicate found in group '{g}')");
                        continue;
                    }
            }
        }
        return tablegroups;
    }

    /// <summary>
    /// Extracts group and description from entity metadata
    /// </summary>
    public (string? Group, string? Description) GetGroupAndDescription(EntityMetadata entity, IDictionary<string, string> tableGroups)
    {
        var description = entity.Description.UserLocalizedLabel?.Label ?? string.Empty;
        if (!description.StartsWith("#"))
        {
            if (tableGroups.TryGetValue(entity.LogicalName, out var tablegroup))
                return (tablegroup, description);
            return (null, description);
        }

        var newlineIndex = description.IndexOf("\n");
        if (newlineIndex != -1)
        {
            var group = description.Substring(1, newlineIndex - 1).Trim();
            description = description.Substring(newlineIndex + 1);
            return (group, description);
        }

        var withoutHashtag = description.Substring(1).Trim();
        var firstSpace = withoutHashtag.IndexOf(" ");
        if (firstSpace != -1)
            return (withoutHashtag.Substring(0, firstSpace), withoutHashtag.Substring(firstSpace + 1));

        return (withoutHashtag, null);
    }

    /// <summary>
    /// Converts many-to-many relationship metadata to Relationship DTOs
    /// </summary>
    public IEnumerable<Relationship> ConvertManyToManyRelationships(
        IEnumerable<ManyToManyRelationshipMetadata> relationships,
        string entityLogicalName,
        Dictionary<Guid, bool> inclusionMap,
        Dictionary<Guid, (string Name, string Prefix)> publisherMap)
    {
        return relationships.Select(rel =>
        {
            var (pName, pPrefix) = solutionService.GetPublisherFromSchemaName(rel.SchemaName, publisherMap);
            return new Relationship(
                rel.IsCustomRelationship ?? false,
                $"{rel.Entity1AssociatedMenuConfiguration.Label.UserLocalizedLabel.Label} ⟷ {rel.Entity2AssociatedMenuConfiguration.Label.UserLocalizedLabel.Label}",
                entityLogicalName,
                "-",
                rel.SchemaName,
                rel.RelationshipType is RelationshipType.ManyToManyRelationship,
                inclusionMap[rel.MetadataId!.Value],
                pName,
                pPrefix,
                null);
        });
    }

    /// <summary>
    /// Converts one-to-many relationship metadata to Relationship DTOs
    /// </summary>
    public IEnumerable<Relationship> ConvertOneToManyRelationships(
        IEnumerable<OneToManyRelationshipMetadata> relationships,
        string entityLogicalName,
        Dictionary<string, Dictionary<string, string>> attributeMapping,
        Dictionary<Guid, bool> inclusionMap,
        Dictionary<Guid, (string Name, string Prefix)> publisherMap)
    {
        return relationships.Select(rel =>
        {
            var (pName, pPrefix) = solutionService.GetPublisherFromSchemaName(rel.SchemaName, publisherMap);
            return new Relationship(
                rel.IsCustomRelationship ?? false,
                rel.ReferencingEntityNavigationPropertyName ?? rel.ReferencedEntity,
                entityLogicalName,
                attributeMapping[rel.ReferencingEntity][rel.ReferencingAttribute],
                rel.SchemaName,
                rel.RelationshipType is not RelationshipType.ManyToManyRelationship,
                inclusionMap[rel.MetadataId!.Value],
                pName,
                pPrefix,
                rel.CascadeConfiguration);
        });
    }
}
