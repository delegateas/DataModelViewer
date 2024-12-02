using Azure.Core;
using Azure.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.PowerPlatform.Dataverse.Client.Extensions;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Generator
{
    internal class DataverseService
    {
        private readonly ServiceClient client;

        public DataverseService()
        {
            var dataverseUrl = new Uri("https://msys.crm4.dynamics.com");
            var cache = new MemoryCache(new MemoryCacheOptions());
            var logger = new LoggerFactory().CreateLogger<DataverseService>();

            client = new ServiceClient(
                instanceUrl: dataverseUrl,
                tokenProviderFunction: url => TokenProviderFunction(url, cache, logger));
        }

        public async Task<IEnumerable<(EntityMetadata Entity, int RootComponentBehavior, List<AttributeMetadata> Attributes)>> GetFilteredMetadata()
        {
            var entities = await GetEntityMetadata();
            var solutionComponents = await GetEntitiesAndAttributesInSolutions();
            var entitiesInSolution = solutionComponents.Where(x => x.ComponentType == 1).ToDictionary(x => x.ObjectId, x => x.RootComponentBehavior);
            var attributesInSolution = new HashSet<Guid>(solutionComponents.Where(x => x.ComponentType == 2).Select(x => x.ObjectId));

            var relevantEntities = entities.Where(e => entitiesInSolution.ContainsKey(e.MetadataId!.Value));
            var entitiesWithFilteredAttributes =
                relevantEntities.Select(e => (e, entitiesInSolution[e.MetadataId!.Value], entitiesInSolution[e.MetadataId!.Value] == 0 ? e.Attributes.Where(x => x.SchemaName.StartsWith("msys_")).ToList() : e.Attributes.Where(x => x.MetadataId != null).Where(a => attributesInSolution.Contains(a.MetadataId!.Value)).ToList()));
            return entitiesWithFilteredAttributes.Where(x => x.Item3.Count > 0);

        }

        public async Task<IEnumerable<EntityMetadata>> GetEntityMetadata()
        {
            var metadata = client.GetAllEntityMetadata(true, EntityFilters.Attributes);
            return metadata;
        }

        private async Task<IEnumerable<Guid>> GetSolutionIds()
        {
            var solutionNames = new List<string>() { "medlemssystem" };

            var resp = await client.RetrieveMultipleAsync(new QueryExpression("solution")
            {
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("uniquename", ConditionOperator.In, solutionNames)
                    }
                }
            });

            return resp.Entities.Select(e => e.GetAttributeValue<Guid>("solutionid"));
        }

        public async Task<IEnumerable<(Guid ObjectId, int ComponentType, int RootComponentBehavior)>> GetEntitiesAndAttributesInSolutions()
        {
            var solutionIds = await GetSolutionIds();

            var entityQuery = new QueryExpression("solutioncomponent")
            {
                ColumnSet = new ColumnSet("objectid", "componenttype", "rootcomponentbehavior"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("componenttype", ConditionOperator.In, new List<int>() { 1, 2 }),
                        new ConditionExpression("solutionid", ConditionOperator.In, solutionIds.ToArray())
                    }
                }
            };

            return
                client.RetrieveMultiple(entityQuery)
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
