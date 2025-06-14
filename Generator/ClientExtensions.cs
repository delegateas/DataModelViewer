using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;

namespace Generator;

public static class ClientExtensions
{
    public static async Task<EntityMetadata> RetrieveEntityAsync(this ServiceClient client, Guid objectId, CancellationToken token)
    {
        var resp = await client.ExecuteAsync(new RetrieveEntityRequest()
        {
            EntityFilters = EntityFilters.All,
            MetadataId = objectId,
            RetrieveAsIfPublished = true
        }, token);

        return ((RetrieveEntityResponse)resp).EntityMetadata;
    }
    public static async Task<EntityMetadata> RetrieveEntityByLogicalNameAsync(this ServiceClient client, string logicalName, CancellationToken token)
    {
        var resp = await client.ExecuteAsync(new RetrieveEntityRequest()
        {
            EntityFilters = EntityFilters.Entity,
            LogicalName = logicalName,
            RetrieveAsIfPublished = true
        }, token);

        return ((RetrieveEntityResponse)resp).EntityMetadata;
    }
}
