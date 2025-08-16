using Azure.Core;
using Azure.Identity;
using Generator.DTO;
using Generator.DTO.Attributes;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System.Collections.Concurrent;
using System.Reflection;
using Attribute = Generator.DTO.Attributes.Attribute;

namespace Generator
{
    internal class DataverseService
    {
        private readonly ServiceClient client;
        private readonly IConfiguration configuration;
        private readonly ILogger<DataverseService> logger;

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
        }

        public async Task<IEnumerable<Record>> GetFilteredMetadata()
        {
            var (publisherPrefix, solutionIds) = await GetSolutionIds();
            var solutionComponents = await GetSolutionComponents(solutionIds); // (id, type, rootcomponentbehavior)

            var entitiesInSolution = solutionComponents.Where(x => x.ComponentType == 1).Select(x => x.ObjectId).ToList();
            var entityRootBehaviour = solutionComponents.Where(x => x.ComponentType == 1).ToDictionary(x => x.ObjectId, x => x.RootComponentBehavior);
            var attributesInSolution = solutionComponents.Where(x => x.ComponentType == 2).Select(x => x.ObjectId).ToHashSet();
            var rolesInSolution = solutionComponents.Where(x => x.ComponentType == 20).Select(x => x.ObjectId).ToList();
            var pluginStepsInSolution = solutionComponents.Where(x => x.ComponentType == 92).Select(x => x.ObjectId).ToList();

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
            var pluginStepAttributeMap = await GetPluginStepAttributes(logicalToSchema.Keys.ToHashSet(), pluginStepsInSolution);

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
                        .Where(r => entityLogicalNamesInSolution.Contains(r.IntersectEntityName.ToLower()))
                        .ToList(),
                })
                .Where(x => x.EntityMetadata.DisplayName.UserLocalizedLabel?.Label != null)
                .ToList();


            return records
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
                        pluginStepAttributeMap,
                        configuration);
                });
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
            Dictionary<string, Dictionary<string, HashSet<string>>> pluginStepAttributeMap,
            IConfiguration configuration)
        {
            var attributes =
                relevantAttributes
                .Select(metadata =>
                {
                    pluginStepAttributeMap.TryGetValue(entity.LogicalName, out var entityPluginAttributes);
                    var pluginTypeNames = entityPluginAttributes?.GetValueOrDefault(metadata.LogicalName) ?? new HashSet<string>();
                    var attr = GetAttribute(metadata, entity, logicalToSchema, pluginTypeNames, logger);
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
                .Select(x => new DTO.Relationship(
                    x.IsCustomRelationship ?? false,
                    x.Entity1AssociatedMenuConfiguration.Behavior == AssociatedMenuBehavior.UseLabel
                    ? x.Entity1AssociatedMenuConfiguration.Label.UserLocalizedLabel?.Label ?? x.Entity1NavigationPropertyName
                    : x.Entity1NavigationPropertyName,
                    logicalToSchema[x.Entity1LogicalName].Name,
                    "-",
                    x.SchemaName,
                    IsManyToMany: true,
                    null))
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

        private static Attribute GetAttribute(AttributeMetadata metadata, EntityMetadata entity, Dictionary<string, ExtendedEntityInformation> logicalToSchema, HashSet<string> pluginTypeNames, ILogger<DataverseService> logger)
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
            attr.PluginTypeNames = pluginTypeNames;
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

        private async Task<(string PublisherPrefix, List<Guid> SolutionIds)> GetSolutionIds()
        {
            var solutionNameArg = configuration["DataverseSolutionNames"];
            if (solutionNameArg == null)
            {
                throw new Exception("Specify one or more solutions");
            }
            var solutionNames = solutionNameArg.Split(",").Select(x => x.Trim().ToLower()).ToList();

            var resp = await client.RetrieveMultipleAsync(new QueryExpression("solution")
            {
                ColumnSet = new ColumnSet("publisherid"),
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

            return (publisher.GetAttributeValue<string>("customizationprefix"), resp.Entities.Select(e => e.GetAttributeValue<Guid>("solutionid")).ToList());
        }

        public async Task<IEnumerable<(Guid ObjectId, int ComponentType, int RootComponentBehavior)>> GetSolutionComponents(List<Guid> solutionIds)
        {
            var entityQuery = new QueryExpression("solutioncomponent")
            {
                ColumnSet = new ColumnSet("objectid", "componenttype", "rootcomponentbehavior"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("componenttype", ConditionOperator.In, new List<int>() { 1, 2, 20, 92 }), // entity, attribute, role, pluginstep (https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/solutioncomponent)
                        new ConditionExpression("solutionid", ConditionOperator.In, solutionIds)
                    }
                }
            };

            return
                (await client.RetrieveMultipleAsync(entityQuery))
                .Entities
                .Select(e => (e.GetAttributeValue<Guid>("objectid"), e.GetAttributeValue<OptionSetValue>("componenttype").Value, e.Contains("rootcomponentbehavior") ? e.GetAttributeValue<OptionSetValue>("rootcomponentbehavior").Value : -1))
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

        private async Task<Dictionary<string, Dictionary<string, HashSet<string>>>> GetPluginStepAttributes(HashSet<string> relevantLogicalNames, List<Guid> pluginStepsInSolution)
        {
            logger.LogInformation("Retrieving plugin step attributes...");
            
            var pluginStepAttributeMap = new Dictionary<string, Dictionary<string, HashSet<string>>>();

            try
            {
                // Query sdkmessageprocessingstep table for steps with filtering attributes
                var stepQuery = new QueryExpression("sdkmessageprocessingstep")
                {
                    ColumnSet = new ColumnSet("filteringattributes", "sdkmessagefilterid", "sdkmessageprocessingstepid"),
                    Criteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("filteringattributes", ConditionOperator.NotNull),
                            new ConditionExpression("filteringattributes", ConditionOperator.NotEqual, ""),
                            new ConditionExpression("statecode", ConditionOperator.Equal, 0) // Only active steps
                        }
                    },
                    LinkEntities =
                    {
                        new LinkEntity
                        {
                            LinkFromEntityName = "sdkmessageprocessingstep",
                            LinkFromAttributeName = "sdkmessagefilterid",
                            LinkToEntityName = "sdkmessagefilter",
                            LinkToAttributeName = "sdkmessagefilterid",
                            Columns = new ColumnSet("primaryobjecttypecode"),
                            EntityAlias = "filter"
                        },
                        new LinkEntity
                        {
                            LinkFromEntityName = "sdkmessageprocessingstep",
                            LinkFromAttributeName = "plugintypeid",
                            LinkToEntityName = "plugintype",
                            LinkToAttributeName = "plugintypeid",
                            Columns = new ColumnSet("name"),
                            EntityAlias = "plugintype"
                        }
                    }
                };

                // Add solution filtering if plugin steps in solution are specified
                if (pluginStepsInSolution.Count > 0)
                {
                    stepQuery.Criteria.Conditions.Add(
                        new ConditionExpression("sdkmessageprocessingstepid", ConditionOperator.In, pluginStepsInSolution));
                }

                var stepResults = await client.RetrieveMultipleAsync(stepQuery);
                
                foreach (var step in stepResults.Entities)
                {
                    var filteringAttributes = step.GetAttributeValue<string>("filteringattributes");
                    var entityLogicalName = step.GetAttributeValue<AliasedValue>("filter.primaryobjecttypecode")?.Value as string;
                    var pluginTypeName = step.GetAttributeValue<AliasedValue>("plugintype.name")?.Value as string;
                    
                    if (string.IsNullOrEmpty(filteringAttributes) || string.IsNullOrEmpty(entityLogicalName) || string.IsNullOrEmpty(pluginTypeName))
                        continue;
                    
                    // Get entity logical name from metadata mapping
                    if (!relevantLogicalNames.Contains(entityLogicalName))
                    {
                        logger.LogDebug("Unknown entity type code: {TypeCode}", entityLogicalName);
                        continue;
                    }
                    
                    if (!pluginStepAttributeMap.ContainsKey(entityLogicalName))
                        pluginStepAttributeMap[entityLogicalName] = new Dictionary<string, HashSet<string>>();
                    
                    // Parse comma-separated attribute names
                    var attributeNames = filteringAttributes.Split(',', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var attributeName in attributeNames)
                    {
                        var trimmedAttributeName = attributeName.Trim();
                        if (!pluginStepAttributeMap[entityLogicalName].ContainsKey(trimmedAttributeName))
                            pluginStepAttributeMap[entityLogicalName][trimmedAttributeName] = new HashSet<string>();
                        
                        var pluginTypeNameParts = pluginTypeName.Split('.');
                        pluginStepAttributeMap[entityLogicalName][trimmedAttributeName].Add(pluginTypeNameParts[pluginTypeNameParts.Length - 1]);
                    }
                }
                
                logger.LogInformation("Found {Count} entities with plugin step attributes.", pluginStepAttributeMap.Count);
            }
            catch (Exception ex)
            {
                logger.LogWarning("Failed to retrieve plugin step attributes: {Message}", ex.Message);
            }
            
            return pluginStepAttributeMap;
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
