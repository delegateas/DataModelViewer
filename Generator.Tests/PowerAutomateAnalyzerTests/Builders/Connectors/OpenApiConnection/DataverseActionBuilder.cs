using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;

/// <summary>
/// Base builder for Dataverse (Common Data Service) actions
/// </summary>
public abstract class DataverseActionBuilder
{
    protected const string DataverseApiId = "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps";
    protected string? EntityName;
    protected readonly JObject Parameters;

    protected DataverseActionBuilder()
    {
        Parameters = new JObject();
    }

    /// <summary>
    /// Sets the entity name for the action
    /// </summary>
    public DataverseActionBuilder WithEntityName(string entityName)
    {
        EntityName = entityName;
        Parameters["entityName"] = entityName;
        return this;
    }

    /// <summary>
    /// Builds the action definition
    /// </summary>
    public abstract JObject Build();

    /// <summary>
    /// Creates the base OpenApiConnection structure
    /// </summary>
    protected JObject CreateBaseAction(string operationId)
    {
        return new JObject
        {
            ["type"] = "OpenApiConnection",
            ["inputs"] = new JObject
            {
                ["host"] = new JObject
                {
                    ["apiId"] = DataverseApiId,
                    ["operationId"] = operationId
                },
                ["parameters"] = Parameters
            }
        };
    }
}
