using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Queries;

public static class PluginQueries
{
    public static async Task<IEnumerable<Entity>> GetSDKMessageProcessingStepsAsync(this ServiceClient service)
    {
        // Retrieve the SDK Message Processing Step entity using the componentId
        var query = new QueryExpression("sdkmessageprocessingstep")
        {
            ColumnSet = new ColumnSet("filteringattributes", "name", "sdkmessageid"),
            Criteria = new FilterExpression
            {
                Conditions =
                    {
                        new ConditionExpression("statecode", ConditionOperator.Equal, 0)
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
                    //new LinkEntity
                    //{
                    //    LinkFromEntityName = "sdkmessageprocessingstep",
                    //    LinkFromAttributeName = "plugintypeid",
                    //    LinkToEntityName = "plugintype",
                    //    LinkToAttributeName = "plugintypeid",
                    //    Columns = new ColumnSet("name"),
                    //    EntityAlias = "plugintype"
                    //}
                }
        };
        return (await service.RetrieveMultipleAsync(query)).Entities;
    }
}
