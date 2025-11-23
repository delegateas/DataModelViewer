using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for querying workflow details (business rules and classic workflows)
    /// </summary>
    internal class WorkflowService
    {
        private readonly ServiceClient client;

        public WorkflowService(ServiceClient client)
        {
            this.client = client;
        }

        /// <summary>
        /// Retrieves workflow details for specified workflow IDs
        /// </summary>
        /// <param name="workflowIds">List of workflow IDs to query</param>
        /// <returns>Dictionary mapping workflow ID to WorkflowInfo</returns>
        public async Task<Dictionary<Guid, WorkflowInfo>> GetWorkflows(List<Guid> workflowIds)
        {
            if (workflowIds.Count == 0)
                return [];

            var query = new QueryExpression("workflow")
            {
                ColumnSet = new ColumnSet("workflowid", "name", "category", "type"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("workflowid", ConditionOperator.In, workflowIds)
                    }
                }
            };

            var results = await client.RetrieveMultipleAsync(query);

            return results.Entities.ToDictionary(
                e => e.Id,
                e => new WorkflowInfo(
                    e.Id,
                    e.GetAttributeValue<string>("name"),
                    e.GetAttributeValue<int>("category"),
                    e.GetAttributeValue<int>("type")
                )
            );
        }
    }

    /// <summary>
    /// Represents workflow information
    /// </summary>
    /// <param name="WorkflowId">Unique identifier of the workflow</param>
    /// <param name="Name">Display name of the workflow</param>
    /// <param name="Category">Workflow category (2 = Business Rule, 0 = Workflow, etc.)</param>
    /// <param name="Type">Workflow type (1 = Definition, 2 = Activation, etc.)</param>
    public record WorkflowInfo(
        Guid WorkflowId,
        string Name,
        int Category,
        int Type
    );
}
