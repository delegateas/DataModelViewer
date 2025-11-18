using Generator.DTO;
using Generator.DTO.Attributes;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for mapping entity relationships
    /// </summary>
    internal class RelationshipService
    {
        private readonly IConfiguration configuration;

        public RelationshipService(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        /// <summary>
        /// Maps one-to-many relationships for an entity
        /// </summary>
        public List<Relationship> MapOneToManyRelationships(
            EntityMetadata entity,
            Dictionary<string, ExtendedEntityInformation> logicalToSchema,
            Dictionary<string, Dictionary<string, string>> attributeLogicalToSchema)
        {
            return (entity.OneToManyRelationships ?? Enumerable.Empty<OneToManyRelationshipMetadata>())
                .Where(x => logicalToSchema.ContainsKey(x.ReferencingEntity) && logicalToSchema[x.ReferencingEntity].IsInSolution && attributeLogicalToSchema[x.ReferencingEntity].ContainsKey(x.ReferencingAttribute))
                .Select(x => new Relationship(
                    x.IsCustomRelationship ?? false,
                    x.ReferencingEntityNavigationPropertyName,
                    logicalToSchema[x.ReferencingEntity].Name,
                    attributeLogicalToSchema[x.ReferencingEntity][x.ReferencingAttribute],
                    x.SchemaName,
                    IsManyToMany: false,
                    x.CascadeConfiguration))
                .ToList();
        }

        /// <summary>
        /// Maps many-to-many relationships for an entity
        /// </summary>
        public List<DTO.Relationship> MapManyToManyRelationships(
            EntityMetadata entity,
            List<ManyToManyRelationshipMetadata> relevantManyToMany,
            Dictionary<string, ExtendedEntityInformation> logicalToSchema)
        {
            return relevantManyToMany
                .Where(x => logicalToSchema.ContainsKey(x.Entity1LogicalName) && logicalToSchema[x.Entity1LogicalName].IsInSolution)
                .Select(x =>
                {
                    var useEntity1 = x.Entity1LogicalName == entity.LogicalName;

                    var label = !useEntity1
                        ? x.Entity1AssociatedMenuConfiguration.Label.UserLocalizedLabel?.Label ?? x.Entity1NavigationPropertyName
                        : x.Entity2AssociatedMenuConfiguration.Label.UserLocalizedLabel?.Label ?? x.Entity2NavigationPropertyName;

                    return new DTO.Relationship(
                        x.IsCustomRelationship ?? false,
                        label ?? x.SchemaName, // Fallback to schema name if no localized label is available, this is relevant for some Default/System Many to Many relationships.
                        logicalToSchema[!useEntity1 ? x.Entity1LogicalName : x.Entity2LogicalName].Name,
                        "-",
                        x.SchemaName,
                        IsManyToMany: true,
                        null
                    );
                })
                .ToList();
        }

        /// <summary>
        /// Parses table groups from configuration
        /// </summary>
        public Dictionary<string, string> ParseTableGroups(ILogger<RelationshipService> logger)
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
    }
}
