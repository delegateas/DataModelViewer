using Azure.Core;
using Azure.Identity;
using Generator.DTO;
using Generator.DTO.Attributes;
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

            this.configuration = configuration;
        }

        public async Task<IEnumerable<Record>> GetFilteredMetadata()
        {
            var (publisherPrefix, solutionIds) = await GetSolutionIds();
            var solutionComponents = await GetEntitiesAndAttributesInSolutions(solutionIds);
            var entityIdToRootBehavior = solutionComponents.Where(x => x.ComponentType == 1).ToDictionary(x => x.ObjectId, x => x.RootComponentBehavior);
            var entityMetadata = await GetEntityMetadata(entityIdToRootBehavior.Keys.ToList());
            var attributesInSolution = new HashSet<Guid>(solutionComponents.Where(x => x.ComponentType == 2).Select(x => x.ObjectId));

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
                        .ToList()
                })
                .Where(x => x.RelevantAttributes.Count > 0)
                .Where(x => x.EntityMetadata.DisplayName.UserLocalizedLabel?.Label != null)
                .ToList();

            var logicalToSchema = records.ToDictionary(x => x.EntityMetadata.LogicalName, x => x.EntityMetadata.SchemaName);

            return records
                .Select(x => MakeRecord(
                    x.EntityMetadata,
                    x.RelevantAttributes, 
                    entityIdToRootBehavior, 
                    attributesInSolution, 
                    publisherPrefix,
                    logicalToSchema));
        }

        private static Record MakeRecord(
            EntityMetadata entity,
            List<AttributeMetadata> relevantAttributes,
            Dictionary<Guid, int> entityIdToRootBehavior,
            HashSet<Guid> attributesInSolution,
            string publisherPrefix,
            Dictionary<string, string> logicalToSchema)
        {
            var attributes =
                relevantAttributes
                .Select(metadata => GetAttribute(metadata, entity, logicalToSchema))
                .Where(x => !string.IsNullOrEmpty(x.DisplayName))
                .ToList();

            var (group, description) = GetGroupAndDescription(entity);

            return new Record(
                    entity.DisplayName.UserLocalizedLabel?.Label ?? string.Empty,
                    entity.SchemaName,
                    group,
                    description?.PrettyDescription(),
                    attributes);
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

        public async Task<IEnumerable<(Guid ObjectId, int ComponentType, int RootComponentBehavior)>> GetEntitiesAndAttributesInSolutions(List<Guid> solutionIds)
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

        private static async Task<string> TokenProviderFunction(string dataverseUrl, IMemoryCache cache, ILogger logger)
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

        private static DefaultAzureCredential GetTokenCredential(ILogger logger)
        {
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
