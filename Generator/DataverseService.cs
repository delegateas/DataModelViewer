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
using Attribute = Generator.DTO.Attributes.Attribute;

namespace Generator
{
    internal class DataverseService
    {
        private readonly ServiceClient client;
        private readonly IConfiguration configuration;

        public DataverseService(IConfiguration configuration)
        {
            this.configuration = configuration;

            var cache = new MemoryCache(new MemoryCacheOptions());
            var logger = new LoggerFactory().CreateLogger<DataverseService>();

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
            var solutionComponents = await GetSolutionComponents(solutionIds);
            var entityIdToRootBehavior = solutionComponents.Where(x => x.ComponentType == 1).ToDictionary(x => x.ObjectId, x => x.RootComponentBehavior);
            var entityMetadata = await GetEntityMetadata(entityIdToRootBehavior.Keys.ToList());
            var attributesInSolution = new HashSet<Guid>(solutionComponents.Where(x => x.ComponentType == 2).Select(x => x.ObjectId));
            var logicalNameToSecurityRoles = await GetSecurityRoles();

            var relevantEntities = entityMetadata.Where(e => entityIdToRootBehavior.ContainsKey(e.MetadataId!.Value)).ToList();
            var entityLogicalNamesInSolution =
                relevantEntities
                .Select(e => e.LogicalName)
                .ToHashSet();

            var records =
                relevantEntities
                .Select(x => new
                {
                    EntityMetadata = x,
                    RelevantAttributes =
                        x.GetRelevantAttributes(entityIdToRootBehavior, attributesInSolution, publisherPrefix, entityLogicalNamesInSolution)
                        .Where(x => x.DisplayName.UserLocalizedLabel?.Label != null)
                        .ToList(),
                    RelevantManyToMany =
                        x.ManyToManyRelationships
                        .Where(r => entityLogicalNamesInSolution.Contains(r.IntersectEntityName.ToLower()))
                        .ToList(),
                })
                .Where(x => x.RelevantAttributes.Count > 0)
                .Where(x => x.EntityMetadata.DisplayName.UserLocalizedLabel?.Label != null)
                .ToList();

            var logicalToSchema = records.ToDictionary(x => x.EntityMetadata.LogicalName, x => x.EntityMetadata.SchemaName);
            var attributeLogicalToSchema = records.ToDictionary(x => x.EntityMetadata.LogicalName, x => x.RelevantAttributes.ToDictionary(x => x.LogicalName, x => x.DisplayName.UserLocalizedLabel?.Label ?? x.SchemaName));

            return records
                .Select(x =>
                {
                    logicalNameToSecurityRoles.TryGetValue(x.EntityMetadata.LogicalName, out var securityRoles);

                    return MakeRecord(
                        x.EntityMetadata,
                        x.RelevantAttributes,
                        x.RelevantManyToMany,
                        entityIdToRootBehavior,
                        attributesInSolution,
                        publisherPrefix,
                        logicalToSchema,
                        attributeLogicalToSchema,
                        securityRoles ?? new List<SecurityRole>());
                });
        }

        private static Record MakeRecord(
            EntityMetadata entity,
            List<AttributeMetadata> relevantAttributes,
            List<ManyToManyRelationshipMetadata> relevantManyToMany,
            Dictionary<Guid, int> entityIdToRootBehavior,
            HashSet<Guid> attributesInSolution,
            string publisherPrefix,
            Dictionary<string, string> logicalToSchema,
            Dictionary<string, Dictionary<string, string>> attributeLogicalToSchema,
            List<SecurityRole> securityRoles)
        {
            var attributes =
                relevantAttributes
                .Select(metadata => GetAttribute(metadata, entity, logicalToSchema))
                .Where(x => !string.IsNullOrEmpty(x.DisplayName))
                .ToList();

            var oneToMany = (entity.OneToManyRelationships ?? Enumerable.Empty<OneToManyRelationshipMetadata>())
                .Where(x => logicalToSchema.ContainsKey(x.ReferencingEntity) && attributeLogicalToSchema[x.ReferencingEntity].ContainsKey(x.ReferencingAttribute))
                .Select(x => new DTO.Relationship(
                    x.ReferencingEntityNavigationPropertyName,
                    logicalToSchema[x.ReferencingEntity],
                    attributeLogicalToSchema[x.ReferencingEntity][x.ReferencingAttribute],
                    x.SchemaName,
                    IsManyToMany: false,
                    x.CascadeConfiguration))
                .ToList();

            var manyToMany = relevantManyToMany
                .Where(x => logicalToSchema.ContainsKey(x.Entity1LogicalName))
                .Select(x => new DTO.Relationship(
                    x.Entity1AssociatedMenuConfiguration.Behavior == AssociatedMenuBehavior.UseLabel
                    ? x.Entity1AssociatedMenuConfiguration.Label.UserLocalizedLabel?.Label ?? x.Entity1NavigationPropertyName
                    : x.Entity1NavigationPropertyName,
                    logicalToSchema[x.Entity1LogicalName],
                    "-",
                    x.SchemaName,
                    IsManyToMany: true,
                    null))
                .ToList();

            var (group, description) = GetGroupAndDescription(entity);

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
                    securityRoles);
        }

        private static Attribute GetAttribute(AttributeMetadata metadata, EntityMetadata entity, Dictionary<string, string> logicalToSchema)
        {
            return metadata switch
            {
                PicklistAttributeMetadata picklist => new ChoiceAttribute(picklist),
                MultiSelectPicklistAttributeMetadata multiSelect => new ChoiceAttribute(multiSelect),
                LookupAttributeMetadata lookup => new LookupAttribute(lookup, logicalToSchema),
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
        }

        private static (string? Group, string? Description) GetGroupAndDescription(EntityMetadata entity)
        {
            var description = entity.Description.UserLocalizedLabel?.Label ?? string.Empty;
            if (!description.StartsWith("#"))
                return (null, description);

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
                        new ConditionExpression("componenttype", ConditionOperator.In, new List<int>() { 1, 2 }),
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

        private async Task<Dictionary<string, List<SecurityRole>>> GetSecurityRoles()
        {
            var query = new QueryExpression("role")
            {
                ColumnSet = new ColumnSet("name"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("name", ConditionOperator.BeginsWith, "LF")
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
                    objectTypeCode = objectTypeCode ?? string.Empty,
                };
            });

            return privileges
                .GroupBy(x => x.objectTypeCode)
                .ToDictionary(byLogicalName => byLogicalName.Key, byLogicalName =>
                    byLogicalName
                    .GroupBy(x => x.name)
                    .Select(byRole =>
                    {
                        var accessrightToDepth = byRole.GroupBy(x => x.accessRight).ToDictionary(x => x.Key, x => x.First().depth);
                        return new SecurityRole(
                            byRole.Key,
                            byLogicalName.Key,
                            accessrightToDepth.GetValueOrDefault(AccessRights.CreateAccess),
                            accessrightToDepth.GetValueOrDefault(AccessRights.ReadAccess),
                            accessrightToDepth.GetValueOrDefault(AccessRights.WriteAccess),
                            accessrightToDepth.GetValueOrDefault(AccessRights.DeleteAccess),
                            accessrightToDepth.GetValueOrDefault(AccessRights.AppendAccess),
                            accessrightToDepth.GetValueOrDefault(AccessRights.AppendToAccess),
                            accessrightToDepth.GetValueOrDefault(AccessRights.AssignAccess)
                        );
                    })
                    .ToList());
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
           
            if(configuration["DataverseClientId"] != null && configuration["DataverseClientSecret"] != null)
                return new ClientSecretCredential(configuration["TenantId"], configuration["DataverseClientId"], configuration["DataverseClientSecret"]);

            logger.LogTrace("Using Default Managed Identity");

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
