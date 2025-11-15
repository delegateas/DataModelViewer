using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Data;

namespace Generator.Queries;

public static class PluginQueries
{
    public static async Task<IEnumerable<SDKStep>> GetSDKMessageProcessingStepsAsync(this ServiceClient service, List<Guid>? solutionIds = null)
    {
        // Retrieve the SDK Message Processing Step entity using the componentId
        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid"),
            Criteria = new FilterExpression(LogicalOperator.And)
            {
                Conditions =
                    {
                        new ConditionExpression("solutionid", ConditionOperator.In, solutionIds),
                        new ConditionExpression("componenttype", ConditionOperator.Equal, 92)
                    }
            },
            LinkEntities =
            {
                new LinkEntity(
                    "solutioncomponent",
                    "sdkmessageprocessingstep",
                    "objectid",
                    "sdkmessageprocessingstepid",
                    JoinOperator.Inner)
                {
                    Columns = new ColumnSet("sdkmessageprocessingstepid", "name", "filteringattributes", "sdkmessageid", "statecode"),
                    EntityAlias = "step",
                    LinkEntities =
                    {
                        new LinkEntity(
                            "sdkmessageprocessingstep",
                            "sdkmessagefilter",
                            "sdkmessagefilterid",
                            "sdkmessagefilterid",
                            JoinOperator.LeftOuter)
                        {
                            Columns = new ColumnSet("primaryobjecttypecode"),
                            EntityAlias = "filter"
                        }
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
                }
            }
        };


        //if (solutionIds is not null) query.Criteria.Conditions.Add(new ConditionExpression("solutionid", ConditionOperator.In, solutionIds));
        var result = await service.RetrieveMultipleAsync(query);

        var steps = result.Entities.Select(e =>
        {
            var sdkMessageId = e.GetAttributeValue<AliasedValue>("step.sdkmessageid")?.Value as EntityReference;
            var sdkMessageName = e.GetAttributeValue<AliasedValue>("step.name")?.Value as string;
            var sdkFilterAttributes = e.GetAttributeValue<AliasedValue>("step.filteringattributes")?.Value as string;
            var sdkState = e.GetAttributeValue<AliasedValue>("step.statecode")?.Value as OptionSetValue;
            var filterTypeCode = e.GetAttributeValue<AliasedValue>("filter.primaryobjecttypecode")?.Value as string;

            return new SDKStep(
                sdkMessageId.Id.ToString(),
                sdkMessageName ?? "Unknown Name",
                sdkFilterAttributes ?? "",
                filterTypeCode,
                sdkState
            );
        });

        return steps;
    }
}
