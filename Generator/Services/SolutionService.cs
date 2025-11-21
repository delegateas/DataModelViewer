using Generator.DTO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for solution queries and component mapping
    /// </summary>
    internal class SolutionService
    {
        private readonly ServiceClient client;
        private readonly IConfiguration configuration;
        private readonly ILogger<SolutionService> logger;

        public SolutionService(ServiceClient client, IConfiguration configuration, ILogger<SolutionService> logger)
        {
            this.client = client;
            this.configuration = configuration;
            this.logger = logger;
        }

        /// <summary>
        /// Retrieves solution IDs based on configuration
        /// </summary>
        public async Task<(List<Guid> SolutionIds, List<Entity> SolutionEntities)> GetSolutionIds()
        {
            var solutionNameArg = configuration["DataverseSolutionNames"];
            if (solutionNameArg == null)
            {
                throw new Exception("Specify one or more solutions");
            }
            var solutionNames = solutionNameArg.Split(",").Select(x => x.Trim().ToLower()).ToList();

            var resp = await client.RetrieveMultipleAsync(new QueryExpression("solution")
            {
                ColumnSet = new ColumnSet("publisherid", "friendlyname", "uniquename", "solutionid"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("uniquename", ConditionOperator.In, solutionNames)
                    }
                }
            });

            return (resp.Entities.Select(e => e.GetAttributeValue<Guid>("solutionid")).ToList(), resp.Entities.ToList());
        }

        /// <summary>
        /// Creates Solution DTOs with their components
        /// </summary>
        public async Task<IEnumerable<Solution>> CreateSolutions(
            List<Entity> solutionEntities,
            IEnumerable<ComponentInfo> solutionComponents,
            IEnumerable<EntityMetadata> allEntityMetadata)
        {
            var solutions = new List<Solution>();

            // Create lookup dictionaries for faster access
            var entityLookup = allEntityMetadata.ToDictionary(e => e.MetadataId ?? Guid.Empty, e => e);

            // Fetch all unique publishers for the solutions
            var publisherIds = solutionEntities
                .Select(s => s.GetAttributeValue<EntityReference>("publisherid").Id)
                .Distinct()
                .ToList();

            var publisherQuery = new QueryExpression("publisher")
            {
                ColumnSet = new ColumnSet("publisherid", "friendlyname", "customizationprefix"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("publisherid", ConditionOperator.In, publisherIds)
                    }
                }
            };

            var publishers = await client.RetrieveMultipleAsync(publisherQuery);
            var publisherLookup = publishers.Entities.ToDictionary(
                p => p.GetAttributeValue<Guid>("publisherid"),
                p => (
                    Name: p.GetAttributeValue<string>("friendlyname") ?? "Unknown Publisher",
                    Prefix: p.GetAttributeValue<string>("customizationprefix") ?? string.Empty
                ));

            // Group components by solution
            var componentsBySolution = solutionComponents.GroupBy(c => c.SolutionId).ToDictionary(g => g.Key, g => g);

            // Process ALL solutions from configuration, not just those with components
            foreach (var solutionEntity in solutionEntities)
            {
                var solutionId = solutionEntity.GetAttributeValue<Guid>("solutionid");

                var solutionName = solutionEntity.GetAttributeValue<string>("friendlyname") ??
                                  solutionEntity.GetAttributeValue<string>("uniquename") ??
                                  "Unknown Solution";

                var publisherId = solutionEntity.GetAttributeValue<EntityReference>("publisherid").Id;
                var publisher = publisherLookup.GetValueOrDefault(publisherId);

                var components = new List<SolutionComponent>();

                // Add components if this solution has any
                if (componentsBySolution.TryGetValue(solutionId, out var solutionGroup))
                {
                    foreach (var component in solutionGroup)
                    {
                        var solutionComponent = CreateSolutionComponent(component, entityLookup, allEntityMetadata, publisherLookup);
                        if (solutionComponent != null)
                        {
                            components.Add(solutionComponent);
                        }
                    }
                }

                // Add solution even if components list is empty (e.g., flow-only solutions)
                solutions.Add(new Solution(
                    solutionName,
                    publisher.Name,
                    publisher.Prefix,
                    components));
            }

            return solutions.AsEnumerable();
        }

        /// <summary>
        /// Creates a solution component DTO from component metadata
        /// </summary>
        private SolutionComponent? CreateSolutionComponent(
            ComponentInfo component,
            Dictionary<Guid, EntityMetadata> entityLookup,
            IEnumerable<EntityMetadata> allEntityMetadata,
            Dictionary<Guid, (string Name, string Prefix)> publisherLookup)
        {
            try
            {
                switch (component.ComponentType)
                {
                    case 1: // Entity
                        // Try to find entity by MetadataId first, then by searching all entities
                        if (entityLookup.TryGetValue(component.ObjectId, out var entityMetadata))
                        {
                            var (publisherName, publisherPrefix) = GetPublisherFromSchemaName(entityMetadata.SchemaName, publisherLookup);
                            return new SolutionComponent(
                                entityMetadata.DisplayName?.UserLocalizedLabel?.Label ?? entityMetadata.SchemaName,
                                entityMetadata.SchemaName,
                                entityMetadata.Description?.UserLocalizedLabel?.Label ?? string.Empty,
                                SolutionComponentType.Entity,
                                publisherName,
                                publisherPrefix);
                        }

                        // Entity lookup by ObjectId is complex in Dataverse, so we'll skip the fallback for now
                        // The primary lookup by MetadataId should handle most cases
                        break;

                    case 2: // Attribute
                        // Search for attribute across all entities
                        foreach (var entity in allEntityMetadata)
                        {
                            var attribute = entity.Attributes?.FirstOrDefault(a => a.MetadataId == component.ObjectId);
                            if (attribute != null)
                            {
                                var (publisherName, publisherPrefix) = GetPublisherFromSchemaName(attribute.SchemaName, publisherLookup);
                                return new SolutionComponent(
                                    attribute.DisplayName?.UserLocalizedLabel?.Label ?? attribute.SchemaName,
                                    attribute.SchemaName,
                                    attribute.Description?.UserLocalizedLabel?.Label ?? string.Empty,
                                    SolutionComponentType.Attribute,
                                    publisherName,
                                    publisherPrefix);
                            }
                        }
                        break;

                    case 3: // Relationship (if you want to add this to the enum later)
                        // Search for relationships across all entities
                        foreach (var entity in allEntityMetadata)
                        {
                            // Check one-to-many relationships
                            var oneToMany = entity.OneToManyRelationships?.FirstOrDefault(r => r.MetadataId == component.ObjectId);
                            if (oneToMany != null)
                            {
                                var (publisherName, publisherPrefix) = GetPublisherFromSchemaName(oneToMany.SchemaName, publisherLookup);
                                return new SolutionComponent(
                                    oneToMany.SchemaName,
                                    oneToMany.SchemaName,
                                    $"One-to-Many: {entity.SchemaName} -> {oneToMany.ReferencingEntity}",
                                    SolutionComponentType.Relationship,
                                    publisherName,
                                    publisherPrefix);
                            }

                            // Check many-to-one relationships
                            var manyToOne = entity.ManyToOneRelationships?.FirstOrDefault(r => r.MetadataId == component.ObjectId);
                            if (manyToOne != null)
                            {
                                var (publisherName, publisherPrefix) = GetPublisherFromSchemaName(manyToOne.SchemaName, publisherLookup);
                                return new SolutionComponent(
                                    manyToOne.SchemaName,
                                    manyToOne.SchemaName,
                                    $"Many-to-One: {entity.SchemaName} -> {manyToOne.ReferencedEntity}",
                                    SolutionComponentType.Relationship,
                                    publisherName,
                                    publisherPrefix);
                            }

                            // Check many-to-many relationships
                            var manyToMany = entity.ManyToManyRelationships?.FirstOrDefault(r => r.MetadataId == component.ObjectId);
                            if (manyToMany != null)
                            {
                                var (publisherName, publisherPrefix) = GetPublisherFromSchemaName(manyToMany.SchemaName, publisherLookup);
                                return new SolutionComponent(
                                    manyToMany.SchemaName,
                                    manyToMany.SchemaName,
                                    $"Many-to-Many: {manyToMany.Entity1LogicalName} <-> {manyToMany.Entity2LogicalName}",
                                    SolutionComponentType.Relationship,
                                    publisherName,
                                    publisherPrefix);
                            }
                        }
                        break;

                    case 20: // Security Role - skip for now as not in enum
                    case 92: // SDK Message Processing Step (Plugin) - skip for now as not in enum
                        break;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning($"Failed to create solution component for ObjectId {component.ObjectId}, ComponentType {component.ComponentType}: {ex.Message}");
            }

            return null;
        }

        /// <summary>
        /// Extracts publisher information from schema name
        /// </summary>
        private static (string PublisherName, string PublisherPrefix) GetPublisherFromSchemaName(
            string schemaName,
            Dictionary<Guid, (string Name, string Prefix)> publisherLookup)
        {
            // Extract prefix from schema name (e.g., "contoso_entity" -> "contoso")
            var parts = schemaName.Split('_', 2);

            if (parts.Length == 2)
            {
                var prefix = parts[0];

                // Find publisher by matching prefix
                foreach (var publisher in publisherLookup.Values)
                {
                    if (publisher.Prefix.Equals(prefix, StringComparison.OrdinalIgnoreCase))
                    {
                        return (publisher.Name, publisher.Prefix);
                    }
                }
            }

            // Default to Microsoft if no prefix or prefix not found
            return ("Microsoft", "");
        }
    }
}
