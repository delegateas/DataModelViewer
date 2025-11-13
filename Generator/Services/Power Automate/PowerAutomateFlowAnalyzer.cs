using Generator.DTO;
using Generator.DTO.Warnings;
using Generator.Services.PowerAutomate.Analyzers;
using Generator.Services.PowerAutomate.Extractors;
using Microsoft.PowerPlatform.Dataverse.Client;
using Newtonsoft.Json.Linq;

namespace Generator.Services.PowerAutomate;

/// <summary>
/// Analyzes Power Automate flows to detect Dataverse entity and attribute usage
/// Uses specialized analyzers and extractors for accurate parsing
/// </summary>
public class PowerAutomateFlowAnalyzer : BaseComponentAnalyzer<PowerAutomateFlow>
{
    private readonly Dictionary<string, DataverseActionAnalyzerBase> _actionAnalyzers;
    private readonly ExpressionExtractor _expressionExtractor;
    private readonly JsonExpressionExtractor _jsonExtractor;

    public PowerAutomateFlowAnalyzer(ServiceClient service) : base(service)
    {
        // Initialize specialized action analyzers
        _actionAnalyzers = new Dictionary<string, DataverseActionAnalyzerBase>(StringComparer.OrdinalIgnoreCase);

        var analyzers = new DataverseActionAnalyzerBase[]
        {
            new ListRowsAnalyzer(),
            new GetRowAnalyzer(),
            new CreateRowAnalyzer(),
            new UpdateRowAnalyzer(),
            new DeleteRowAnalyzer()
        };

        foreach (var analyzer in analyzers)
        {
            foreach (var opId in analyzer.SupportedOperationIds)
            {
                _actionAnalyzers[opId] = analyzer;
            }
        }

        _expressionExtractor = new ExpressionExtractor();
        _jsonExtractor = new JsonExpressionExtractor();
    }

    public override ComponentType SupportedType => ComponentType.PowerAutomateFlow;

    public override async Task AnalyzeComponentAsync(
        PowerAutomateFlow flow,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
        List<SolutionWarning> solutionWarnings,
        List<Microsoft.Xrm.Sdk.Metadata.EntityMetadata>? entityMetadata = null)
    {
        try
        {
            var clientData = flow.ClientData;
            if (string.IsNullOrEmpty(clientData)) return;

            var flowDefinition = JObject.Parse(clientData);

            await AnalyzeFlowDefinitionAsync(flowDefinition, flow, attributeUsages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error analyzing flow {flow.Name}: {ex.Message}");
        }
    }

    private async Task AnalyzeFlowDefinitionAsync(
        JObject flowDefinition,
        PowerAutomateFlow flow,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        var flowName = flow.Name ?? "Unknown Flow";

        // Build action-to-entity mapping for expression analysis
        var actionToEntityMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        // Extract all actions from the flow
        var actions = ExtractActions(flowDefinition).ToList();

        // First pass: identify all Dataverse actions and their entities
        foreach (var action in actions)
        {
            var actionName = ExtractActionName(action);
            var operationId = ExtractOperationId(action);

            if (!string.IsNullOrEmpty(operationId) && _actionAnalyzers.ContainsKey(operationId))
            {
                var analyzer = _actionAnalyzers[operationId];
                var result = analyzer.Analyze(action, actionName);

                if (!string.IsNullOrEmpty(result.EntityName))
                {
                    actionToEntityMap[actionName] = result.EntityName;

                    // Record field usages from this action
                    foreach (var (fieldName, contexts) in result.FieldUsages)
                    {
                        foreach (var context in contexts)
                        {
                            AddAttributeUsage(
                                attributeUsages,
                                result.EntityName,
                                fieldName,
                                new AttributeUsage(
                                    flowName,
                                    $"{context} in action '{actionName}'",
                                    result.OperationType,
                                    SupportedType));
                        }
                    }
                }
            }
        }

        // Add trigger to entity map if it's a Dataverse trigger
        var trigger = flowDefinition.SelectToken("$.properties.definition.triggers")?.First as JProperty;
        if (trigger != null)
        {
            var triggerEntity = ExtractTriggerEntity(trigger.Value);
            if (!string.IsNullOrEmpty(triggerEntity))
            {
                actionToEntityMap["trigger"] = triggerEntity;
            }
        }

        // Second pass: analyze dynamic content and expressions across all actions
        await AnalyzeDynamicContentAsync(flowDefinition, flow, attributeUsages, actionToEntityMap);
    }

    /// <summary>
    /// Extracts all actions from the flow definition, including nested actions
    /// </summary>
    private IEnumerable<JToken> ExtractActions(JObject flowDefinition)
    {
        var actions = new List<JToken>();

        // Top-level actions
        var definitionActions = flowDefinition.SelectTokens("$.properties.definition.actions.*");
        actions.AddRange(definitionActions);

        // Nested actions in conditions, loops, scopes, etc.
        var nestedActions = flowDefinition.SelectTokens("$..actions.*");
        actions.AddRange(nestedActions);

        // Return distinct actions (some may be found by both queries)
        return actions.Distinct(new JTokenComparer());
    }

    /// <summary>
    /// Extracts the action name from a JToken
    /// </summary>
    private string ExtractActionName(JToken action)
    {
        // The action name is typically the last segment of the JSON path
        var path = action.Path;
        var segments = path.Split('.');
        return segments.LastOrDefault(s => s != "actions") ?? "Unknown";
    }

    /// <summary>
    /// Extracts the operation ID from an action
    /// </summary>
    private string? ExtractOperationId(JToken action)
    {
        // Check for OpenApiConnection actions
        var actionType = action.SelectToken("type")?.ToString();

        if (actionType == "OpenApiConnection" || actionType == "OpenApiConnectionWebhook")
        {
            // Operation ID is in host.operationId
            var operationId = action.SelectToken("inputs.host.operationId")?.ToString();
            if (!string.IsNullOrEmpty(operationId))
            {
                return operationId;
            }
        }

        // For non-OpenApiConnection actions, the type might be the operation
        return actionType;
    }

    /// <summary>
    /// Extracts entity name from a trigger
    /// </summary>
    private string? ExtractTriggerEntity(JToken trigger)
    {
        // Check for Dataverse triggers
        var triggerType = trigger.SelectToken("type")?.ToString();

        if (triggerType == "OpenApiConnectionWebhook" || triggerType == "OpenApiConnection")
        {
            // Check if it's a Dataverse connector
            var apiId = trigger.SelectToken("inputs.host.apiId")?.ToString();
            if (apiId?.Contains("commondataservice", StringComparison.OrdinalIgnoreCase) == true ||
                apiId?.Contains("commondataserviceforapps", StringComparison.OrdinalIgnoreCase) == true)
            {
                // Extract entity from parameters
                var entityName = trigger.SelectToken("inputs.parameters.entityName")?.ToString();
                return entityName;
            }
        }

        return null;
    }

    /// <summary>
    /// Analyzes dynamic content and expressions throughout the flow
    /// </summary>
    private async Task AnalyzeDynamicContentAsync(
        JObject flowDefinition,
        PowerAutomateFlow flow,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
        Dictionary<string, string> actionToEntityMap)
    {
        var flowName = flow.Name ?? "Unknown Flow";

        // Extract all expressions from the flow
        var expressions = _jsonExtractor.ExtractExpressionsFromJson(flowDefinition).ToList();

        foreach (var expression in expressions)
        {
            // Analyze each expression for field references
            var fieldReferences = _expressionExtractor.ExtractFromExpression(expression, actionToEntityMap);

            foreach (var fieldRef in fieldReferences)
            {
                AddAttributeUsage(
                    attributeUsages,
                    fieldRef.EntityName,
                    fieldRef.FieldName,
                    new AttributeUsage(
                        flowName,
                        $"Dynamic content: {fieldRef.Context}",
                        OperationType.Read,
                        SupportedType));
            }
        }
    }
}

/// <summary>
/// Custom comparer for JToken to support Distinct() operation
/// </summary>
internal class JTokenComparer : IEqualityComparer<JToken>
{
    public bool Equals(JToken? x, JToken? y)
    {
        if (x == null && y == null) return true;
        if (x == null || y == null) return false;
        return x.Path == y.Path;
    }

    public int GetHashCode(JToken obj)
    {
        return obj.Path.GetHashCode();
    }
}
