using Azure.Core;
using Azure.Identity;
using Generator.DTO;
using Generator.DTO.Attributes;
using Generator.DTO.Warnings;
using Generator.Queries;
using Generator.Services;
using Generator.Services.Plugins;
using Generator.Services.WebResources;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Reflection;
using Attribute = Generator.DTO.Attributes.Attribute;

namespace Generator
{
    internal class DataverseService
    {
        private readonly ServiceClient client;
        private readonly IConfiguration configuration;
        private readonly ILogger<DataverseService> logger;

        private readonly PluginAnalyzer pluginAnalyzer;
        private readonly PowerAutomateFlowAnalyzer flowAnalyzer;
        private readonly WebResourceAnalyzer webResourceAnalyzer;

        public DataverseService(IConfiguration configuration, ILogger<DataverseService> logger)
        {
            this.configuration = configuration;
            this.logger = logger;

            var cache = new MemoryCache(new MemoryCacheOptions());

            var dataverseUrl = configuration["DataverseUrl"];
            if (dataverseUrl == null)
            {
                throw new Exception("DataverseUrl is required");
            }

            client = new ServiceClient(
                instanceUrl: new Uri(dataverseUrl),
                tokenProviderFunction: url => TokenProviderFunction(url, cache, logger));

            pluginAnalyzer = new PluginAnalyzer(client);
            flowAnalyzer = new PowerAutomateFlowAnalyzer(client);
            webResourceAnalyzer = new WebResourceAnalyzer(client, configuration);
        }

        public async Task<(IEnumerable<Record>, IEnumerable<SolutionWarning>, IEnumerable<Solution>)> GetFilteredMetadata()
        {
            var warnings = new List<SolutionWarning>(); // used to collect warnings for the insights dashboard
            var (publisherPrefix, solutionIds, solutionEntities) = await GetSolutionIds();
            var solutionComponents = await GetSolutionComponents(solutionIds); // (id, type, rootcomponentbehavior, solutionid)

            var entitiesInSolution = solutionComponents.Where(x => x.ComponentType == 1).Select(x => x.ObjectId).Distinct().ToList();
            var entityRootBehaviour = solutionComponents
                .Where(x => x.ComponentType == 1)
                .GroupBy(x => x.ObjectId)
                .ToDictionary(g => g.Key, g => {
                    // If any solution includes all attributes (0), use that, otherwise use the first occurrence
                    var behaviors = g.Select(x => x.RootComponentBehavior).ToList();
                    return behaviors.Contains(0) ? 0 : behaviors.First();
                });
            var attributesInSolution = solutionComponents.Where(x => x.ComponentType == 2).Select(x => x.ObjectId).ToHashSet();
            var rolesInSolution = solutionComponents.Where(x => x.ComponentType == 20).Select(x => x.ObjectId).Distinct().ToList();

            var entitiesInSolutionMetadata = await GetEntityMetadata(entitiesInSolution);

            var logicalNameToKeys = entitiesInSolutionMetadata.ToDictionary(
                entity => entity.LogicalName,
                entity => entity.Keys.Select(key => new Key(
                    key.DisplayName.UserLocalizedLabel?.Label ?? key.DisplayName.LocalizedLabels.First().Label,
                    key.LogicalName,
                    key.KeyAttributes)
                ).ToList());

            var logicalNameToSecurityRoles = await GetSecurityRoles(rolesInSolution, entitiesInSolutionMetadata.ToDictionary(x => x.LogicalName, x => x.Privileges));
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
            var referencedEntityMetadata = await GetEntityMetadataByLogicalName(relatedEntityLogicalNames.ToList());

            var allEntityMetadata = entitiesInSolutionMetadata.Concat(referencedEntityMetadata).ToList();
            var logicalToSchema = allEntityMetadata.ToDictionary(x => x.LogicalName, x => new ExtendedEntityInformation { Name = x.SchemaName, IsInSolution = entitiesInSolutionMetadata.Any(e => e.LogicalName == x.LogicalName) });
            var attributeLogicalToSchema = allEntityMetadata.ToDictionary(x => x.LogicalName, x => x.Attributes?.ToDictionary(attr => attr.LogicalName, attr => attr.DisplayName.UserLocalizedLabel?.Label ?? attr.SchemaName) ?? []);

            var entityIconMap = await GetEntityIconMap(allEntityMetadata);
            // Processes analysis
            var attributeUsages = new Dictionary<string, Dictionary<string, List<AttributeUsage>>>();
            // Plugins
            var pluginStopWatch = new Stopwatch();
            pluginStopWatch.Start();
            var pluginCollection = await client.GetSDKMessageProcessingStepsAsync(solutionIds);
            logger.LogInformation($"There are {pluginCollection.Count()} plugin sdk steps in the environment.");
            foreach (var plugin in pluginCollection)
                await pluginAnalyzer.AnalyzeComponentAsync(plugin, attributeUsages);
            pluginStopWatch.Stop();
            logger.LogInformation($"Plugin analysis took {pluginStopWatch.ElapsedMilliseconds} ms.");
            // Flows
            var flowStopWatch = new Stopwatch();
            flowStopWatch.Start();
            var flowCollection = await client.GetPowerAutomateFlowsAsync(solutionIds);
            logger.LogInformation($"There are {flowCollection.Count()} Power Automate flows in the environment.");
            foreach (var flow in flowCollection)
                await flowAnalyzer.AnalyzeComponentAsync(flow, attributeUsages);
            flowStopWatch.Stop();
            logger.LogInformation($"Power Automate flow analysis took {flowStopWatch.ElapsedMilliseconds} ms.");
            // WebResources
            var resourceStopWatch = new Stopwatch();
            resourceStopWatch.Start();
            var webresourceCollection = await client.GetWebResourcesAsync(solutionIds);
            logger.LogInformation($"There are {webresourceCollection.Count()} WebResources in the environment.");
            foreach (var resource in webresourceCollection)
                await webResourceAnalyzer.AnalyzeComponentAsync(resource, attributeUsages);
            resourceStopWatch.Stop();
            logger.LogInformation($"WebResource analysis took {resourceStopWatch.ElapsedMilliseconds} ms.");

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
            var solutions = await CreateSolutions(solutionEntities, solutionComponents, allEntityMetadata);

            return (records
                .Select(x =>
                {
                    logicalNameToSecurityRoles.TryGetValue(x.EntityMetadata.LogicalName, out var securityRoles);
                    logicalNameToKeys.TryGetValue(x.EntityMetadata.LogicalName, out var keys);

                    return MakeRecord(
                        logger,
                        x.EntityMetadata,
                        x.RelevantAttributes,
                        x.RelevantManyToMany,
                        logicalToSchema,
                        attributeLogicalToSchema,
                        securityRoles ?? [],
                        keys ?? [],
                        entityIconMap,
                        attributeUsages,
                        configuration);
                }),
                warnings,
                solutions);
        }

        private Task<IEnumerable<Solution>> CreateSolutions(
            List<Entity> solutionEntities,
            IEnumerable<(Guid ObjectId, int ComponentType, int RootComponentBehavior, EntityReference SolutionId)> solutionComponents,
            List<EntityMetadata> allEntityMetadata)
        {
            var solutions = new List<Solution>();

            // Create lookup dictionaries for faster access
            var entityLookup = allEntityMetadata.ToDictionary(e => e.MetadataId ?? Guid.Empty, e => e);

            // Group components by solution
            var componentsBySolution = solutionComponents.GroupBy(c => c.SolutionId);

            foreach (var solutionGroup in componentsBySolution)
            {
                var solutionId = solutionGroup.Key;
                var solutionEntity = solutionEntities.FirstOrDefault(s => s.GetAttributeValue<Guid>("solutionid") == solutionId.Id);

                if (solutionEntity == null) continue;

                var solutionName = solutionEntity.GetAttributeValue<string>("friendlyname") ??
                                  solutionEntity.GetAttributeValue<string>("uniquename") ??
                                  "Unknown Solution";

                var components = new List<SolutionComponent>();

                foreach (var component in solutionGroup)
                {
                    var solutionComponent = CreateSolutionComponent(component, entityLookup, allEntityMetadata);
                    if (solutionComponent != null)
                    {
                        components.Add(solutionComponent);
                    }
                }

                solutions.Add(new Solution(solutionName, components));
            }

            return Task.FromResult(solutions.AsEnumerable());
        }

        private SolutionComponent? CreateSolutionComponent(
            (Guid ObjectId, int ComponentType, int RootComponentBehavior, EntityReference SolutionId) component,
            Dictionary<Guid, EntityMetadata> entityLookup,
            List<EntityMetadata> allEntityMetadata)
        {
            try
            {
                switch (component.ComponentType)
                {
                    case 1: // Entity
                        // Try to find entity by MetadataId first, then by searching all entities
                        if (entityLookup.TryGetValue(component.ObjectId, out var entityMetadata))
                        {
                            return new SolutionComponent(
                                entityMetadata.DisplayName?.UserLocalizedLabel?.Label ?? entityMetadata.SchemaName,
                                entityMetadata.SchemaName,
                                entityMetadata.Description?.UserLocalizedLabel?.Label ?? string.Empty,
                                SolutionComponentType.Entity);
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
                                return new SolutionComponent(
                                    attribute.DisplayName?.UserLocalizedLabel?.Label ?? attribute.SchemaName,
                                    attribute.SchemaName,
                                    attribute.Description?.UserLocalizedLabel?.Label ?? string.Empty,
                                    SolutionComponentType.Attribute);
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
                                return new SolutionComponent(
                                    oneToMany.SchemaName,
                                    oneToMany.SchemaName,
                                    $"One-to-Many: {entity.SchemaName} -> {oneToMany.ReferencingEntity}",
                                    SolutionComponentType.Relationship);
                            }

                            // Check many-to-one relationships
                            var manyToOne = entity.ManyToOneRelationships?.FirstOrDefault(r => r.MetadataId == component.ObjectId);
                            if (manyToOne != null)
                            {
                                return new SolutionComponent(
                                    manyToOne.SchemaName,
                                    manyToOne.SchemaName,
                                    $"Many-to-One: {entity.SchemaName} -> {manyToOne.ReferencedEntity}",
                                    SolutionComponentType.Relationship);
                            }

                            // Check many-to-many relationships
                            var manyToMany = entity.ManyToManyRelationships?.FirstOrDefault(r => r.MetadataId == component.ObjectId);
                            if (manyToMany != null)
                            {
                                return new SolutionComponent(
                                    manyToMany.SchemaName,
                                    manyToMany.SchemaName,
                                    $"Many-to-Many: {manyToMany.Entity1LogicalName} <-> {manyToMany.Entity2LogicalName}",
                                    SolutionComponentType.Relationship);
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

        private static Record MakeRecord(
            ILogger<DataverseService> logger,
            EntityMetadata entity,
            List<AttributeMetadata> relevantAttributes,
            List<ManyToManyRelationshipMetadata> relevantManyToMany,
            Dictionary<string, ExtendedEntityInformation> logicalToSchema,
            Dictionary<string, Dictionary<string, string>> attributeLogicalToSchema,
            List<SecurityRole> securityRoles,
            List<Key> keys,
            Dictionary<string, string> entityIconMap,
            Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
            IConfiguration configuration)
        {
            var attributes =
                relevantAttributes
                .Select(metadata =>
                {
                    var attr = GetAttribute(metadata, entity, logicalToSchema, attributeUsages, logger);
                    attr.IsStandardFieldModified = MetadataExtensions.StandardFieldHasChanged(metadata, entity.DisplayName.UserLocalizedLabel?.Label ?? string.Empty);
                    return attr;
                })
                .Where(x => !string.IsNullOrEmpty(x.DisplayName))
                .ToList();

            var oneToMany = (entity.OneToManyRelationships ?? Enumerable.Empty<OneToManyRelationshipMetadata>())
                .Where(x => logicalToSchema.ContainsKey(x.ReferencingEntity) && logicalToSchema[x.ReferencingEntity].IsInSolution && attributeLogicalToSchema[x.ReferencingEntity].ContainsKey(x.ReferencingAttribute))
                .Select(x => new DTO.Relationship(
                    x.IsCustomRelationship ?? false,
                    x.ReferencingEntityNavigationPropertyName,
                    logicalToSchema[x.ReferencingEntity].Name,
                    attributeLogicalToSchema[x.ReferencingEntity][x.ReferencingAttribute],
                    x.SchemaName,
                    IsManyToMany: false,
                    x.CascadeConfiguration))
                .ToList();

            var manyToMany = relevantManyToMany
                .Where(x => logicalToSchema.ContainsKey(x.Entity1LogicalName) && logicalToSchema[x.Entity1LogicalName].IsInSolution)
                .Select(x =>
                {
                    var useEntity1 = x.Entity1LogicalName == entity.LogicalName;

                    var label = !useEntity1
                        ? x.Entity1AssociatedMenuConfiguration.Label.UserLocalizedLabel?.Label ?? x.Entity1NavigationPropertyName
                        : x.Entity2AssociatedMenuConfiguration.Label.UserLocalizedLabel?.Label ?? x.Entity2NavigationPropertyName;

                    return new DTO.Relationship(
                        x.IsCustomRelationship ?? false,
                        label,
                        logicalToSchema[!useEntity1 ? x.Entity1LogicalName : x.Entity2LogicalName].Name,
                        "-",
                        x.SchemaName,
                        IsManyToMany: true,
                        null
                    );
                })
                .ToList();

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
            var (group, description) = GetGroupAndDescription(entity, tablegroups);

            entityIconMap.TryGetValue(entity.LogicalName, out string? iconBase64);

            return new Record(
                    entity.DisplayName.UserLocalizedLabel?.Label ?? string.Empty,
                    entity.SchemaName,
                    group,
                    description?.PrettyDescription(),
                    entity.IsAuditEnabled.Value,
                    entity.IsActivity ?? false,
                    entity.OwnershipType ?? OwnershipTypes.UserOwned,
                    entity.HasNotes ?? false,
                    attributes,
                    oneToMany.Concat(manyToMany).ToList(),
                    securityRoles,
                    keys,
                    iconBase64);
        }

        private static Attribute GetAttribute(AttributeMetadata metadata, EntityMetadata entity, Dictionary<string, ExtendedEntityInformation> logicalToSchema, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages, ILogger<DataverseService> logger)
        {
            Attribute attr = metadata switch
            {
                PicklistAttributeMetadata picklist => new ChoiceAttribute(picklist),
                MultiSelectPicklistAttributeMetadata multiSelect => new ChoiceAttribute(multiSelect),
                LookupAttributeMetadata lookup => new LookupAttribute(lookup, logicalToSchema, logger),
                StateAttributeMetadata state => new ChoiceAttribute(state),
                StatusAttributeMetadata status => new StatusAttribute(status, (StateAttributeMetadata)entity.Attributes.First(x => x is StateAttributeMetadata)),
                StringAttributeMetadata stringMetadata => new StringAttribute(stringMetadata),
                IntegerAttributeMetadata integer => new IntegerAttribute(integer),
                DateTimeAttributeMetadata dateTimeAttributeMetadata => new DateTimeAttribute(dateTimeAttributeMetadata),
                MoneyAttributeMetadata money => new DecimalAttribute(money),
                DecimalAttributeMetadata decimalAttribute => new DecimalAttribute(decimalAttribute),
                MemoAttributeMetadata memo => new StringAttribute(memo),
                BooleanAttributeMetadata booleanAttribute => new BooleanAttribute(booleanAttribute),
                FileAttributeMetadata fileAttribute => new FileAttribute(fileAttribute),
                _ => new GenericAttribute(metadata)
            };

            var schemaname = attributeUsages.GetValueOrDefault(entity.LogicalName)?.GetValueOrDefault(metadata.LogicalName) ?? [];
            // also check the plural name, as some workflows like Power Automate use collectionname
            var pluralname = attributeUsages.GetValueOrDefault(entity.LogicalCollectionName)?.GetValueOrDefault(metadata.LogicalName) ?? [];

            attr.AttributeUsages = [.. schemaname, .. pluralname];
            return attr;
        }

        private static (string? Group, string? Description) GetGroupAndDescription(EntityMetadata entity, IDictionary<string, string> tableGroups)
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

        public async Task<IEnumerable<EntityMetadata>> GetEntityMetadata(List<Guid> entityObjectIds)
        {
            ConcurrentBag<EntityMetadata> metadata = new();

            // Disable affinity cookie
            client.EnableAffinityCookie = false;

            var parallelOptions = new ParallelOptions()
            {
                MaxDegreeOfParallelism = client.RecommendedDegreesOfParallelism
            };

            await Parallel.ForEachAsync(
                source: entityObjectIds,
                parallelOptions: parallelOptions,
                async (objectId, token) =>
                {
                    metadata.Add(await client.RetrieveEntityAsync(objectId, token));
                });

            return metadata;
        }
        public async Task<IEnumerable<EntityMetadata>> GetEntityMetadataByLogicalName(List<string> entityLogicalNames)
        {
            ConcurrentBag<EntityMetadata> metadata = new();

            // Disable affinity cookie
            client.EnableAffinityCookie = false;

            var parallelOptions = new ParallelOptions()
            {
                MaxDegreeOfParallelism = client.RecommendedDegreesOfParallelism
            };

            await Parallel.ForEachAsync(
                source: entityLogicalNames,
                parallelOptions: parallelOptions,
                async (logicalName, token) =>
                {
                    metadata.Add(await client.RetrieveEntityByLogicalNameAsync(logicalName, token));
                });

            return metadata;
        }

        private async Task<(string PublisherPrefix, List<Guid> SolutionIds, List<Entity> SolutionEntities)> GetSolutionIds()
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

            var solutions = resp.Entities;
            var publisherIds = solutions.Select(e => e.GetAttributeValue<EntityReference>("publisherid").Id).Distinct().ToList();
            if (publisherIds.Count != 1)
            {
                throw new Exception("Multiple publishers found. Ensure solutions have the same publisher");
            }

            var publisher = await client.RetrieveAsync("publisher", publisherIds[0], new ColumnSet("customizationprefix"));

            return (publisher.GetAttributeValue<string>("customizationprefix"), resp.Entities.Select(e => e.GetAttributeValue<Guid>("solutionid")).ToList(), resp.Entities.ToList());
        }

        public async Task<IEnumerable<(Guid ObjectId, int ComponentType, int RootComponentBehavior, EntityReference SolutionId)>> GetSolutionComponents(List<Guid> solutionIds)
        {
            var entityQuery = new QueryExpression("solutioncomponent")
            {
                ColumnSet = new ColumnSet("objectid", "componenttype", "rootcomponentbehavior", "solutionid"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("componenttype", ConditionOperator.In, new List<int>() { 1, 2, 20, 92 }), // entity, attribute, role, sdkpluginstep (https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/solutioncomponent)
                        new ConditionExpression("solutionid", ConditionOperator.In, solutionIds)
                    }
                }
            };

            return
                (await client.RetrieveMultipleAsync(entityQuery))
                .Entities
                .Select(e => (e.GetAttributeValue<Guid>("objectid"), e.GetAttributeValue<OptionSetValue>("componenttype").Value, e.Contains("rootcomponentbehavior") ? e.GetAttributeValue<OptionSetValue>("rootcomponentbehavior").Value : -1, e.GetAttributeValue<EntityReference>("solutionid")))
                .ToList();
        }

        private async Task<Dictionary<string, List<SecurityRole>>> GetSecurityRoles(List<Guid> rolesInSolution, Dictionary<string, SecurityPrivilegeMetadata[]> priviledges)
        {
            if (rolesInSolution.Count == 0) return [];

            var query = new QueryExpression("role")
            {
                ColumnSet = new ColumnSet("name"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("roleid", ConditionOperator.In, rolesInSolution)
                    }
                },
                LinkEntities =
                {
                    new LinkEntity("role", "roleprivileges", "roleid", "roleid", JoinOperator.Inner)
                    {
                        EntityAlias = "rolepriv",
                        Columns = new ColumnSet("privilegedepthmask"),
                        LinkEntities =
                        {
                            new LinkEntity("roleprivileges", "privilege", "privilegeid", "privilegeid", JoinOperator.Inner)
                            {
                                EntityAlias = "priv",
                                Columns = new ColumnSet("accessright"),
                                LinkEntities =
                                {
                                    new LinkEntity("privilege", "privilegeobjecttypecodes", "privilegeid", "privilegeid", JoinOperator.Inner)
                                    {
                                        EntityAlias = "privotc",
                                        Columns = new ColumnSet("objecttypecode")
                                    }
                                }
                            }
                        }
                    }
                }
            };

            var roles = await client.RetrieveMultipleAsync(query);

            var privileges = roles.Entities.Select(e =>
            {
                var name = e.GetAttributeValue<string>("name");
                var depth = (PrivilegeDepth)e.GetAttributeValue<AliasedValue>("rolepriv.privilegedepthmask").Value;
                var accessRight = (AccessRights)e.GetAttributeValue<AliasedValue>("priv.accessright").Value;
                var objectTypeCode = e.GetAttributeValue<AliasedValue>("privotc.objecttypecode").Value as string;

                return new
                {
                    name,
                    depth,
                    accessRight,
                    objectTypeCode = objectTypeCode ?? string.Empty
                };
            });

            static PrivilegeDepth? GetDepth(Dictionary<AccessRights, PrivilegeDepth> dict, AccessRights right, SecurityPrivilegeMetadata? meta)
            {
                if (!dict.TryGetValue(right, out var value))
                    return meta?.CanBeGlobal ?? false ? 0 : null;
                return value;
            }

            return privileges
                .GroupBy(x => x.objectTypeCode)
                .ToDictionary(byLogicalName => byLogicalName.Key, byLogicalName =>
                    byLogicalName
                    .GroupBy(x => x.name)
                    .Select(byRole =>
                    {
                        var accessRights = byRole
                            .GroupBy(x => x.accessRight)
                            .ToDictionary(x => x.Key, x => x.First().depth);

                        var priviledgeMetadata = priviledges.GetValueOrDefault(byLogicalName.Key) ?? [];

                        return new SecurityRole(
                            byRole.Key,
                            byLogicalName.Key,
                            GetDepth(accessRights, AccessRights.CreateAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Create)),
                            GetDepth(accessRights, AccessRights.ReadAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Read)),
                            GetDepth(accessRights, AccessRights.WriteAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Write)),
                            GetDepth(accessRights, AccessRights.DeleteAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Delete)),
                            GetDepth(accessRights, AccessRights.AppendAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Append)),
                            GetDepth(accessRights, AccessRights.AppendToAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.AppendTo)),
                            GetDepth(accessRights, AccessRights.AssignAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Assign)),
                            GetDepth(accessRights, AccessRights.ShareAccess, priviledgeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Share))
                        );
                    })
                    .ToList());
        }

        private async Task<Dictionary<string, string>> GetEntityIconMap(IEnumerable<EntityMetadata> entities)
        {
            var logicalNameToIconName =
                entities
                .Where(x => x.IconVectorName != null)
                .ToDictionary(x => x.LogicalName, x => x.IconVectorName);

            var query = new QueryExpression("webresource")
            {
                ColumnSet = new ColumnSet("content", "name"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("name", ConditionOperator.In, logicalNameToIconName.Values.ToList())
                    }
                }
            };

            var webresources = await client.RetrieveMultipleAsync(query);
            var iconNameToSvg = webresources.Entities.ToDictionary(x => x.GetAttributeValue<string>("name"), x => x.GetAttributeValue<string>("content"));

            var logicalNameToSvg =
                logicalNameToIconName
                .Where(x => iconNameToSvg.ContainsKey(x.Value) && !string.IsNullOrEmpty(iconNameToSvg[x.Value]))
                .ToDictionary(x => x.Key, x => iconNameToSvg.GetValueOrDefault(x.Value) ?? string.Empty);

            var sourceDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var iconDirectory = Path.Combine(sourceDirectory ?? string.Empty, "../../../entityicons");

            var iconFiles = Directory.GetFiles(iconDirectory).ToDictionary(x => Path.GetFileNameWithoutExtension(x), x => x);

            foreach (var entity in entities)
            {
                if (logicalNameToSvg.ContainsKey(entity.LogicalName))
                {
                    continue;
                }

                var iconKey = $"svg_{entity.ObjectTypeCode}";
                if (iconFiles.ContainsKey(iconKey))
                {
                    logicalNameToSvg[entity.LogicalName] = Convert.ToBase64String(File.ReadAllBytes(iconFiles[iconKey]));
                }
            }

            return logicalNameToSvg;
        }

        private async Task<string> TokenProviderFunction(string dataverseUrl, IMemoryCache cache, ILogger logger)
        {
            var cacheKey = $"AccessToken_{dataverseUrl}";

            logger.LogTrace($"Attempting to retrieve access token for {dataverseUrl}");

            return (await cache.GetOrCreateAsync(cacheKey, async cacheEntry =>
            {
                cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(50);
                var credential = GetTokenCredential(logger);
                var scope = BuildScopeString(dataverseUrl);

                return await FetchAccessToken(credential, scope, logger);
            })).Token;
        }

        private TokenCredential GetTokenCredential(ILogger logger)
        {

            if (configuration["DataverseClientId"] != null && configuration["DataverseClientSecret"] != null)
                return new ClientSecretCredential(configuration["TenantId"], configuration["DataverseClientId"], configuration["DataverseClientSecret"]);

            return new DefaultAzureCredential();  // in azure this will be managed identity, locally this depends... se midway of this post for the how local identity is chosen: https://dreamingincrm.com/2021/11/16/connecting-to-dataverse-from-function-app-using-managed-identity/
        }

        private static string BuildScopeString(string dataverseUrl)
        {
            return $"{GetCoreUrl(dataverseUrl)}/.default";
        }

        private static string GetCoreUrl(string url)
        {
            var uri = new Uri(url);
            return $"{uri.Scheme}://{uri.Host}";
        }

        private static async Task<AccessToken> FetchAccessToken(TokenCredential credential, string scope, ILogger logger)
        {
            var tokenRequestContext = new TokenRequestContext(new[] { scope });

            try
            {
                logger.LogTrace("Requesting access token...");
                var accessToken = await credential.GetTokenAsync(tokenRequestContext, CancellationToken.None);
                logger.LogTrace("Access token successfully retrieved.");
                return accessToken;
            }
            catch (Exception ex)
            {
                logger.LogError($"Failed to retrieve access token: {ex.Message}");
                throw;
            }
        }
    }
}
