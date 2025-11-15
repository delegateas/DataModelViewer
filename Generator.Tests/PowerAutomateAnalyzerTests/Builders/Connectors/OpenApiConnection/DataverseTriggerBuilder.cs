using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;

/// <summary>
/// Builder for Dataverse triggers
/// </summary>
public class DataverseTriggerBuilder
{
    private const string DataverseApiId = "/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps";
    private string? _entityName;
    private string? _scope;

    public DataverseTriggerBuilder WithEntityName(string entityName)
    {
        _entityName = entityName;
        return this;
    }

    public DataverseTriggerBuilder WithScope(string scope = "Organization")
    {
        _scope = scope;
        return this;
    }

    public JObject Build()
    {
        var parameters = new JObject();

        if (_entityName != null)
            parameters["entityName"] = _entityName;

        if (_scope != null)
            parameters["scope"] = _scope;

        return new JObject
        {
            ["type"] = "OpenApiConnectionWebhook",
            ["inputs"] = new JObject
            {
                ["host"] = new JObject
                {
                    ["apiId"] = DataverseApiId,
                    ["operationId"] = "SubscribeWebhookTrigger"
                },
                ["parameters"] = parameters
            }
        };
    }
}
