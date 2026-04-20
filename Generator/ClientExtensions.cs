using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;

namespace Generator;

public static class ClientExtensions
{
    /// <summary>
    /// Retrieves all pages of records matching the query, automatically following Dataverse pagination.
    /// Dataverse returns at most 5000 records per page by default; this wrapper collects all pages.
    /// </summary>
    public static async Task<List<Entity>> RetrieveAllAsync(this ServiceClient client, QueryExpression query, CancellationToken cancellationToken = default)
    {
        var results = new List<Entity>();
        query.PageInfo = new PagingInfo
        {
            Count = 5000,
            PageNumber = 1,
            PagingCookie = null,
            ReturnTotalRecordCount = false
        };

        EntityCollection response;
        do
        {
            response = await client.RetrieveMultipleAsync(query, cancellationToken);
            results.AddRange(response.Entities);
            query.PageInfo.PageNumber++;
            query.PageInfo.PagingCookie = response.PagingCookie;
        } while (response.MoreRecords);

        return results;
    }

    /// <summary>
    /// Synchronous variant of RetrieveAllAsync for use in non-async contexts.
    /// </summary>
    public static List<Entity> RetrieveAll(this ServiceClient client, QueryExpression query)
    {
        var results = new List<Entity>();
        query.PageInfo = new PagingInfo
        {
            Count = 5000,
            PageNumber = 1,
            PagingCookie = null,
            ReturnTotalRecordCount = false
        };

        EntityCollection response;
        do
        {
            response = client.RetrieveMultiple(query);
            results.AddRange(response.Entities);
            query.PageInfo.PageNumber++;
            query.PageInfo.PagingCookie = response.PagingCookie;
        } while (response.MoreRecords);

        return results;
    }

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
