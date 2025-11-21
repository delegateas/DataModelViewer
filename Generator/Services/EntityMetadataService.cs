using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Metadata;
using System.Collections.Concurrent;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for retrieving entity metadata from Dataverse
    /// </summary>
    internal class EntityMetadataService
    {
        private readonly ServiceClient client;

        public EntityMetadataService(ServiceClient client)
        {
            this.client = client;
        }

        /// <summary>
        /// Retrieves entity metadata by object IDs
        /// </summary>
        public async Task<IEnumerable<EntityMetadata>> GetEntityMetadataByObjectIds(IEnumerable<Guid> entityObjectIds)
        {
            ConcurrentBag<EntityMetadata> metadata = new();
            ConcurrentBag<Guid> failedIds = new();

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
                    try
                    {
                        metadata.Add(await client.RetrieveEntityAsync(objectId, token));
                    }
                    catch (Exception ex)
                    {
                        // Entity doesn't exist or cannot be retrieved - log and continue
                        Console.WriteLine($"Warning: Failed to retrieve entity with ID {objectId}: {ex.Message}");
                        failedIds.Add(objectId);
                    }
                });

            if (failedIds.Any())
            {
                Console.WriteLine($"Warning: Failed to retrieve {failedIds.Count} entities out of {entityObjectIds.Count()}. IDs: {string.Join(", ", failedIds)}");
            }

            return metadata;
        }

        /// <summary>
        /// Retrieves entity metadata by logical names
        /// </summary>
        public async Task<IEnumerable<EntityMetadata>> GetEntityMetadataByLogicalNames(List<string> entityLogicalNames)
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
    }
}
