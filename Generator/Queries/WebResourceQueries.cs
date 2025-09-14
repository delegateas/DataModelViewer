using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Queries;

public static class WebResourceQueries
{

    public static async Task<IEnumerable<WebResource>> GetWebResourcesAsync(this ServiceClient service, List<Guid>? solutionIds = null)
    {
        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid"),
            Criteria = new FilterExpression(LogicalOperator.And)
            {
                Conditions =
                {
                    new ConditionExpression("solutionid", ConditionOperator.In, solutionIds),
                    new ConditionExpression("componenttype", ConditionOperator.Equal, 61) // 61 = Web Resource
                }
            },
            LinkEntities =
            {
                new LinkEntity(
                    "solutioncomponent",
                    "webresource",
                    "objectid",
                    "webresourceid",
                    JoinOperator.Inner)
                {
                    Columns = new ColumnSet("webresourceid", "name", "content", "webresourcetype", "description"),
                    EntityAlias = "webresource",
                    LinkCriteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("webresourcetype", ConditionOperator.Equal, 3) // JS Resources
                        }
                    }
                }
            }
        };

        var results = (await service.RetrieveMultipleAsync(query)).Entities;

        var webResources = results.Select(e =>
        {
            var content = "";
            var contentValue = e.GetAttributeValue<AliasedValue>("webresource.content")?.Value;
            var webresourceId = e.GetAttributeValue<AliasedValue>("webresource.webresourceid").Value?.ToString() ?? "";
            var webresourceName = e.GetAttributeValue<AliasedValue>("webresource.name").Value?.ToString();
            if (contentValue != null)
            {
                // Content is base64 encoded, decode it
                var base64Content = contentValue.ToString();
                if (!string.IsNullOrEmpty(base64Content))
                {
                    try
                    {
                        var bytes = Convert.FromBase64String(base64Content);
                        content = System.Text.Encoding.UTF8.GetString(bytes);
                    }
                    catch
                    {
                        // If decoding fails, keep the base64 content
                        content = base64Content;
                    }
                }
            }

            return new WebResource(
                webresourceId,
                webresourceName,
                content,
                (OptionSetValue)e.GetAttributeValue<AliasedValue>("webresource.webresourcetype").Value,
                e.GetAttributeValue<AliasedValue>("webresource.description")?.Value?.ToString()
            );
        });

        return webResources;
    }
}
