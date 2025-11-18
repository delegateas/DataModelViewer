using Generator.DTO;
using Generator.DTO.Attributes;
using Generator.DTO.Warnings;
using Generator.Queries;
using Generator.Services;
using Generator.Services.Plugins;
using Generator.Services.PowerAutomate;
using Generator.Services.WebResources;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Metadata;
using System.Diagnostics;

namespace Generator
{
    internal class DataverseService
    {
        private readonly ServiceClient client;
        private readonly IConfiguration configuration;
        private readonly ILogger<DataverseService> logger;
        private readonly EntityMetadataService entityMetadataService;
        private readonly SolutionService solutionService;
        private readonly SecurityRoleService securityRoleService;
        private readonly EntityIconService entityIconService;
        private readonly RecordMappingService recordMappingService;

        private readonly List<IAnalyzerRegistration> analyzerRegistrations;

        public DataverseService(
            ServiceClient client,
            IConfiguration configuration,
            ILogger<DataverseService> logger,
            EntityMetadataService entityMetadataService,
            SolutionService solutionService,
            SecurityRoleService securityRoleService,
            EntityIconService entityIconService,
            RecordMappingService recordMappingService)
        {
            this.client = client;
            this.configuration = configuration;
            this.logger = logger;
            this.entityMetadataService = entityMetadataService;
            this.solutionService = solutionService;
            this.securityRoleService = securityRoleService;
            this.entityIconService = entityIconService;
            this.recordMappingService = recordMappingService;

            // Register all analyzers with their query functions
            analyzerRegistrations = new List<IAnalyzerRegistration>
            {
                new AnalyzerRegistration<SDKStep>(
                    new PluginAnalyzer(client),
                    solutionIds => client.GetSDKMessageProcessingStepsAsync(solutionIds),
                    "Plugins"),
                new AnalyzerRegistration<PowerAutomateFlow>(
                    new PowerAutomateFlowAnalyzer(client),
                    solutionIds => client.GetPowerAutomateFlowsAsync(solutionIds),
                    "Power Automate Flows"),
                new AnalyzerRegistration<WebResource>(
                    new WebResourceAnalyzer(client),
                    solutionIds => client.GetWebResourcesAsync(solutionIds),
                    "WebResources")
            };
        }

        public async Task<(IEnumerable<Record>, IEnumerable<SolutionWarning>, IEnumerable<Solution>)> GetFilteredMetadata()
        {
            var warnings = new List<SolutionWarning>(); // used to collect warnings for the insights dashboard
            var (solutionIds, solutionEntities) = await solutionService.GetSolutionIds();
            var solutionComponents = await solutionService.GetSolutionComponents(solutionIds); // (id, type, rootcomponentbehavior, solutionid)

            var entitiesInSolution = solutionComponents.Where(x => x.ComponentType == 1).Select(x => x.ObjectId).Distinct().ToList();
            var entityRootBehaviour = solutionComponents
                .Where(x => x.ComponentType == 1)
                .GroupBy(x => x.ObjectId)
                .ToDictionary(g => g.Key, g =>
                {
                    // If any solution includes all attributes (0), use that, otherwise use the first occurrence
                    var behaviors = g.Select(x => x.RootComponentBehavior).ToList();
                    return behaviors.Contains(0) ? 0 : behaviors.First();
                });
            var attributesInSolution = solutionComponents.Where(x => x.ComponentType == 2).Select(x => x.ObjectId).ToHashSet();
            var rolesInSolution = solutionComponents.Where(x => x.ComponentType == 20).Select(x => x.ObjectId).Distinct().ToList();

            var entitiesInSolutionMetadata = await entityMetadataService.GetEntityMetadataByObjectIds(entitiesInSolution);

            var logicalNameToKeys = entitiesInSolutionMetadata.ToDictionary(
                entity => entity.LogicalName,
                entity => entity.Keys.Select(key => new Key(
                    key.DisplayName.UserLocalizedLabel?.Label ?? key.DisplayName.LocalizedLabels.First().Label,
                    key.LogicalName,
                    key.KeyAttributes)
                ).ToList());

            var logicalNameToSecurityRoles = await securityRoleService.GetSecurityRoles(rolesInSolution, entitiesInSolutionMetadata.ToDictionary(x => x.LogicalName, x => x.Privileges));
            var entityLogicalNamesInSolution = entitiesInSolutionMetadata.Select(e => e.LogicalName).ToHashSet();

            logger.LogInformation("There are {Count} entities in the solution.", entityLogicalNamesInSolution.Count);
            // Collect all referenced entities from attributes and add (needed for lookup attributes)
            var relatedEntityLogicalNames = new HashSet<string>();
            foreach (var entity in entitiesInSolutionMetadata)
            {
                var entityLogicalNamesOutsideSolution = entity.Attributes
                    .OfType<LookupAttributeMetadata>()
                    .SelectMany(attr => attr.Targets)
                    .Distinct()
                    .Where(target => !entityLogicalNamesInSolution.Contains(target));
                foreach (var target in entityLogicalNamesOutsideSolution) relatedEntityLogicalNames.Add(target);
            }
            logger.LogInformation("There are {Count} entities referenced outside the solution.", relatedEntityLogicalNames.Count);
            var referencedEntityMetadata = await entityMetadataService.GetEntityMetadataByLogicalNames(relatedEntityLogicalNames.ToList());

            var allEntityMetadata = entitiesInSolutionMetadata.Concat(referencedEntityMetadata).ToList();
            var logicalToSchema = allEntityMetadata.ToDictionary(x => x.LogicalName, x => new ExtendedEntityInformation { Name = x.SchemaName, IsInSolution = entitiesInSolutionMetadata.Any(e => e.LogicalName == x.LogicalName) });
            var attributeLogicalToSchema = allEntityMetadata.ToDictionary(x => x.LogicalName, x => x.Attributes?.ToDictionary(attr => attr.LogicalName, attr => attr.DisplayName.UserLocalizedLabel?.Label ?? attr.SchemaName) ?? []);

            var entityIconMap = await entityIconService.GetEntityIconMap(allEntityMetadata);
            // Processes analysis
            var attributeUsages = new Dictionary<string, Dictionary<string, List<AttributeUsage>>>();

            // Run all registered analyzers, passing entity metadata
            foreach (var registration in analyzerRegistrations)
            {
                await registration.RunAnalysisAsync(solutionIds, attributeUsages, warnings, logger, entitiesInSolutionMetadata.ToList());
            }

            var records =
                entitiesInSolutionMetadata
                .Select(x => new
                {
                    EntityMetadata = x,
                    RelevantAttributes =
                        x.GetRelevantAttributes(attributesInSolution, entityRootBehaviour)
                        .Where(x => x.DisplayName.UserLocalizedLabel?.Label != null)
                        .ToList(),
                    RelevantManyToMany =
                        x.ManyToManyRelationships
                        .Where(r => entityLogicalNamesInSolution.Contains(r.Entity1LogicalName) && entityLogicalNamesInSolution.Contains(r.Entity2LogicalName))
                        .ToList(),
                })
                .Where(x => x.EntityMetadata.DisplayName.UserLocalizedLabel?.Label != null)
                .ToList();

            // Warn about attributes that were used in processes, but the entity could not be resolved from e.g. JavaScript file name or similar
            var hash = entitiesInSolutionMetadata.SelectMany<EntityMetadata, string>(r => [r.LogicalCollectionName?.ToLower() ?? "", r.LogicalName.ToLower()]).ToHashSet();
            warnings.AddRange(attributeUsages.Keys
                .Where(k => !hash.Contains(k.ToLower()))
                .SelectMany(entityKey => attributeUsages.GetValueOrDefault(entityKey)!
                    .SelectMany(attributeDict => attributeDict.Value
                        .Select(usage =>
                            new AttributeWarning($"{attributeDict.Key} was used inside a {usage.ComponentType} component [{usage.Name}]. However, the entity {entityKey} could not be resolved in the provided solutions.")))));

            // Create solutions with their components
            var solutions = await solutionService.CreateSolutions(solutionEntities, solutionComponents, allEntityMetadata);

            return (records
                .Select(x =>
                {
                    logicalNameToSecurityRoles.TryGetValue(x.EntityMetadata.LogicalName, out var securityRoles);
                    logicalNameToKeys.TryGetValue(x.EntityMetadata.LogicalName, out var keys);

                    return recordMappingService.CreateRecord(
                        x.EntityMetadata,
                        x.RelevantAttributes,
                        x.RelevantManyToMany,
                        logicalToSchema,
                        attributeLogicalToSchema,
                        securityRoles ?? [],
                        keys ?? [],
                        entityIconMap,
                        attributeUsages);
                }),
                warnings,
                solutions);
        }
    }

    /// <summary>
    /// Interface for analyzer registrations to enable polymorphic execution
    /// </summary>
    internal interface IAnalyzerRegistration
    {
        Task RunAnalysisAsync(
            List<Guid> solutionIds,
            Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
            List<SolutionWarning> warnings,
            ILogger logger,
            List<EntityMetadata> entityMetadata);
    }

    /// <summary>
    /// Generic analyzer registration that pairs an analyzer with its query function
    /// </summary>
    internal class AnalyzerRegistration<T> : IAnalyzerRegistration where T : Analyzeable
    {
        private readonly IComponentAnalyzer<T> analyzer;
        private readonly Func<List<Guid>, Task<IEnumerable<T>>> queryFunc;
        private readonly string componentTypeName;

        public AnalyzerRegistration(
            IComponentAnalyzer<T> analyzer,
            Func<List<Guid>, Task<IEnumerable<T>>> queryFunc,
            string componentTypeName)
        {
            this.analyzer = analyzer;
            this.queryFunc = queryFunc;
            this.componentTypeName = componentTypeName;
        }

        public async Task RunAnalysisAsync(
            List<Guid> solutionIds,
            Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
            List<SolutionWarning> warnings,
            ILogger logger,
            List<EntityMetadata> entityMetadata)
        {
            var stopwatch = Stopwatch.StartNew();

            var components = await queryFunc(solutionIds);
            var componentList = components.ToList();

            logger.LogInformation($"There are {componentList.Count} {componentTypeName} in the environment.");

            foreach (var component in componentList)
            {
                await analyzer.AnalyzeComponentAsync(component, attributeUsages, warnings, entityMetadata);
            }

            stopwatch.Stop();
            logger.LogInformation($"{componentTypeName} analysis took {stopwatch.ElapsedMilliseconds} ms.");
        }
    }
}
