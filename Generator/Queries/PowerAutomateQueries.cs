using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Queries;
public static class PowerAutomateQueries
{
    public static async Task<IEnumerable<PowerAutomateFlow>> GetPowerAutomateFlowsAsync(this ServiceClient service, List<Guid>? solutionIds = null)
    {
        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid"),
            Criteria = new FilterExpression(LogicalOperator.And)
            {
                Conditions =
                    {
                        new ConditionExpression("solutionid", ConditionOperator.In, solutionIds),
                        new ConditionExpression("componenttype", ConditionOperator.Equal, 29)
                    }
            },
            LinkEntities =
            {
                new LinkEntity(
                    "solutioncomponent",
                    "workflow",
                    "objectid",
                    "workflowid",
                    JoinOperator.Inner)
                {
                    Columns = new ColumnSet("workflowid", "name", "clientdata"),
                    EntityAlias = "flow",
                    LinkCriteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("category", ConditionOperator.Equal, 5), // 5 = Flow
                            new ConditionExpression("statecode", ConditionOperator.Equal, 1) // 1 = Activated
                        }
                    }
                }
            }
        };

        var result = await service.RetrieveMultipleAsync(query);

        var flows = result.Entities.Select(e =>
        {
            return new PowerAutomateFlow(
                e.GetAttributeValue<AliasedValue>("flow.workflowid").Value as string,
                e.GetAttributeValue<AliasedValue>("flow.name").Value as string,
                e.GetAttributeValue<AliasedValue>("flow.clientdata").Value as string
            );
        });

        return flows;
    }
}
