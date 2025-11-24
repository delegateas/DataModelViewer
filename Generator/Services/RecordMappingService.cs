using Generator.DTO;
using Generator.DTO.Attributes;
using Generator.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for creating Record DTOs from entity metadata
    /// Orchestrates attribute mapping, relationship mapping, and grouping logic
    /// </summary>
    internal class RecordMappingService
    {
        private readonly AttributeMappingService attributeMappingService;
        private readonly RelationshipService relationshipService;
        private readonly SolutionService solutionService;

        public RecordMappingService(
            AttributeMappingService attributeMappingService,
            RelationshipService relationshipService,
            IConfiguration configuration,
            ILogger<RecordMappingService> logger,
            ILogger<RelationshipService> relationshipLogger,
            SolutionService solutionService)
        {
            this.attributeMappingService = attributeMappingService;
            this.relationshipService = relationshipService;
            this.solutionService = solutionService;
        }

        /// <summary>
        /// Creates a Record DTO from entity metadata
        /// </summary>
        public Record CreateRecord(
            EntityMetadata entity,
            List<AttributeMetadata> relevantAttributes,
            List<Relationship> relevantRelationships,
            Dictionary<string, ExtendedEntityInformation> logicalToSchema,
            List<SecurityRole> securityRoles,
            List<Key> keys,
            Dictionary<string, string> entityIconMap,
            Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
            Dictionary<Guid, bool> inclusionMap,
            Dictionary<Guid, List<WorkflowInfo>> workflowDependencies,
            Dictionary<Guid, (string Name, string Prefix)> publisherMap,
            Dictionary<Guid, List<SolutionInfo>> componentSolutionMap)
        {
            var attributes =
                relevantAttributes
                .Select(metadata => attributeMappingService.MapAttribute(metadata, entity, logicalToSchema, attributeUsages, inclusionMap, workflowDependencies, publisherMap, componentSolutionMap))
                .Where(x => !string.IsNullOrEmpty(x.DisplayName))
                .ToList();

            var tablegroups = relationshipService.ParseTableGroups();
            var (group, description) = relationshipService.GetGroupAndDescription(entity, tablegroups);

            entityIconMap.TryGetValue(entity.LogicalName, out string? iconBase64);

            var (pName, pPrefix) = solutionService.GetPublisherFromSchemaName(entity.SchemaName, publisherMap);

            // Get solution info for this entity
            var entitySolutions = componentSolutionMap.GetValueOrDefault(entity.MetadataId!.Value, new List<SolutionInfo>());

            return new Record(
                    entity.DisplayName.ToLabelString(),
                    entity.SchemaName,
                    group,
                    description?.PrettyDescription(),
                    entity.IsAuditEnabled.Value,
                    entity.IsActivity ?? false,
                    entity.IsCustomEntity ?? false,
                    pName,
                    pPrefix,
                    entity.OwnershipType ?? OwnershipTypes.UserOwned,
                    entity.HasNotes ?? false,
                    attributes,
                    relevantRelationships,
                    securityRoles,
                    keys,
                    iconBase64,
                    entitySolutions);
        }
    }
}
