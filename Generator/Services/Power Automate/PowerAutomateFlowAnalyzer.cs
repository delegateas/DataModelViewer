using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using Newtonsoft.Json.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Generator.Services;

public class PowerAutomateFlowAnalyzer : BaseComponentAnalyzer<PowerAutomateFlow>
{
    // Common Dataverse connector identifiers
    private static readonly HashSet<string> ValidPowerAutomateConnectors = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "OpenApiConnection"
    };

    public PowerAutomateFlowAnalyzer(ServiceClient service) : base(service) { }

    public override ComponentType SupportedType => ComponentType.PowerAutomateFlow;

    public override async Task AnalyzeComponentAsync(PowerAutomateFlow flow, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        try
        {
            // Get the flow definition from clientdata attribute
            var clientData = flow.ClientData;
            if (string.IsNullOrEmpty(clientData)) return;

            // Parse the JSON
            var flowDefinition = JObject.Parse(clientData);

            // Analyze the flow definition
            await AnalyzeFlowDefinition(flowDefinition, flow, attributeUsages);
        }
        catch (JsonException ex) { Console.WriteLine($"Error parsing flow definition for {flow.Name}: {ex.Message}"); }
        catch (Exception ex) { Console.WriteLine($"Error analyzing flow {flow.Name}: {ex.Message}"); }
    }

    private async Task AnalyzeFlowDefinition(JObject flowDefinition, PowerAutomateFlow flow, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        // Look for actions in the flow definition
        var actions = ExtractActions(flowDefinition);

        foreach (var action in actions)
            await AnalyzeAction(action, flow, attributeUsages);

        // Also check for dynamic content references that might reference Dataverse fields
        AnalyzeDynamicContent(flowDefinition, flow, attributeUsages);
    }

    private IEnumerable<JToken> ExtractActions(JObject flowDefinition)
    {
        var actions = new List<JToken>();

        // Actions can be nested in different places in the flow definition
        // Check properties.definition.actions
        var definitionActions = flowDefinition.SelectTokens("$.properties.definition.actions.*");
        actions.AddRange(definitionActions);

        // Check for triggers
        var triggers = flowDefinition.SelectTokens("$.properties.definition.triggers.*");
        actions.AddRange(triggers);

        // Check for nested actions in conditions, loops, etc.
        var nestedActions = flowDefinition.SelectTokens("$..actions.*");
        actions.AddRange(nestedActions);

        return actions.Distinct();
    }

    private async Task AnalyzeAction(JToken action, PowerAutomateFlow flow, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        try
        {
            var actionType = action.SelectToken("type")?.ToString();

            // Check if this is a Dataverse/CDS action
            if (IsDataverseAction(actionType))
                await AnalyzeDataverseAction(action, flow, attributeUsages);
        }
        catch (Exception ex) { Console.WriteLine($"Error analyzing action: {ex.Message}"); }
    }
    private string ExtractConnectorId(JToken action)
    {
        // Try different paths where connector ID might be stored
        var connectorId = action.SelectToken("metadata.apiDefinitionUrl")?.ToString();
        if (!string.IsNullOrEmpty(connectorId))
        {
            // Extract connector name from API definition URL
            var match = Regex.Match(connectorId, @"/providers/Microsoft\.PowerApps/apis/([^/]+)");
            if (match.Success)
                return match.Groups[1].Value;

        }

        // Try alternative paths
        connectorId = action.SelectToken("metadata.connectionReference.connectionName")?.ToString();
        if (!string.IsNullOrEmpty(connectorId))
        {
            return connectorId;
        }

        // Check for direct connector reference
        var operationId = action.SelectToken("metadata.operationMetadataId")?.ToString();
        if (!string.IsNullOrEmpty(operationId))
        {
            return operationId;
        }

        return string.Empty;
    }

    private bool IsDataverseAction(string actionType)
    {
        return ValidPowerAutomateConnectors.Contains(actionType ?? string.Empty);
    }

    private async Task AnalyzeDataverseAction(JToken action, PowerAutomateFlow flow, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        var flowName = flow.Name ?? "Unknown Flow";

        var actionName = action.Parent.Path.Split('.').Last();

        // Extract entity name
        var entityName = ExtractEntityName(action);
        if (string.IsNullOrEmpty(entityName)) return;

        // Extract field references from inputs
        var inputs = action.SelectToken("inputs");
        if (inputs != null)
        {
            ExtractAttributeUsagesFromInputs(inputs, entityName, flowName, actionName, attributeUsages);
        }

        // Extract field references from outputs/dynamic content
        var outputs = action.SelectToken("outputs");
        if (outputs != null)
        {
            ExtractAttributeUsagesFromOutputs(outputs, entityName, flowName, actionName, attributeUsages);
        }
    }

    private string ExtractEntityName(JToken action)
    {
        // Try different paths where entity name might be stored

        // Check inputs for entity name
        var entityLogicalName = action.SelectToken("inputs.parameters.entityName")?.ToString();
        if (!string.IsNullOrEmpty(entityLogicalName)) return entityLogicalName;


        // Check for entity set name
        var entitySetName = action.SelectToken("inputs.parameters.entitySetName")?.ToString();
        if (!string.IsNullOrEmpty(entitySetName)) return entitySetName;

        // Try to extract from URL path
        var url = action.SelectToken("inputs.uri")?.ToString() ?? action.SelectToken("inputs.path")?.ToString();
        if (!string.IsNullOrEmpty(url))
        {
            var match = Regex.Match(url, @"\/([a-zA-Z_][a-zA-Z0-9_]*)\(");
            if (match.Success)
            {
                return match.Groups[1].Value;
            }
        }

        return string.Empty;
    }

    private void ExtractAttributeUsagesFromInputs(JToken inputs, string entityName, string flowName, string actionName, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        // Look for field mappings in the inputs
        var item = inputs.SelectToken("item") ?? inputs.SelectToken("parameters.item");
        if (item != null)
        {
            ExtractFieldsFromObject(item, entityName, flowName, actionName, "Input", attributeUsages);
        }

        // Look for individual field parameters
        var parameters = inputs.SelectToken("parameters");
        if (parameters is JObject paramsObj)
        {
            foreach (var prop in paramsObj.Properties())
            {
                // CDS Updates
                if (prop.Name.StartsWith("item/") && prop.Value.Type == JTokenType.String)
                {
                    var fieldName = prop.Name.Substring("item/".Length);
                    AddAttributeUsage(attributeUsages, entityName, fieldName, new AttributeUsage(flowName, $"Input parameter in action '{actionName}'", DetermineOperationTypeFromAction(actionName), SupportedType));
                }

                if (IsLikelyFieldName(prop.Name) && !IsSystemParameter(prop.Name))
                {
                    AddAttributeUsage(attributeUsages, entityName, prop.Name, new AttributeUsage(flowName, $"Input parameter in action '{actionName}'", DetermineOperationTypeFromAction(actionName), SupportedType));
                }
            }
        }

        // Look for OData select/expand parameters
        ExtractODataParameters(inputs, entityName, flowName, actionName, attributeUsages);
    }

    private void ExtractAttributeUsagesFromOutputs(JToken outputs, string entityName, string flowName, string actionName, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        // Outputs typically define the schema of returned data
        var schema = outputs.SelectToken("schema");
        if (schema != null)
        {
            ExtractFieldsFromSchema(schema, entityName, flowName, actionName, attributeUsages);
        }
    }

    private void ExtractFieldsFromObject(JToken obj, string entityName, string flowName, string actionName, string context, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        if (obj is JObject jObj)
        {
            foreach (var prop in jObj.Properties())
            {
                if (IsLikelyFieldName(prop.Name))
                {
                    AddAttributeUsage(attributeUsages, entityName, prop.Name, new AttributeUsage(flowName, $"{context} in action '{actionName}'", DetermineOperationTypeFromAction(actionName), SupportedType));
                }
            }
        }
    }

    private void ExtractFieldsFromSchema(JToken schema, string entityName, string flowName, string actionName, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        var properties = schema.SelectToken("properties");
        if (properties is JObject propsObj)
        {
            foreach (var prop in propsObj.Properties())
            {
                if (IsLikelyFieldName(prop.Name))
                {
                    AddAttributeUsage(attributeUsages, entityName, prop.Name, new AttributeUsage(flowName, $"Output schema in action '{actionName}'", DetermineOperationTypeFromAction(actionName), SupportedType));
                }
            }
        }
    }

    private void ExtractODataParameters(JToken inputs, string entityName, string flowName, string actionName, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        // Check for $select parameter
        var select = inputs.SelectToken("parameters.$select")?.ToString();
        if (!string.IsNullOrEmpty(select))
        {
            var fields = select.Split(',').Select(f => f.Trim()).Where(f => !string.IsNullOrEmpty(f));
            foreach (var field in fields)
            {
                AddAttributeUsage(attributeUsages, entityName, field, new AttributeUsage(flowName, $"OData $select in action '{actionName}'", DetermineOperationTypeFromAction(actionName), SupportedType));
            }
        }

        // Check for $expand parameter (might contain field references)
        var expand = inputs.SelectToken("parameters.$expand")?.ToString();
        if (!string.IsNullOrEmpty(expand))
        {
            // Parse expand expressions like "field1,field2($select=subfield1,subfield2)"
            var expandFields = ParseExpandParameter(expand);
            foreach (var field in expandFields)
            {
                AddAttributeUsage(attributeUsages, entityName, field, new AttributeUsage(flowName, $"OData $expand in action '{actionName}'", OperationType.Read, SupportedType));
            }
        }
    }

    private void AnalyzeDynamicContent(JObject flowDefinition, PowerAutomateFlow flow, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        var flowName = flow.Name ?? "Unknown Flow";

        // Look for dynamic content expressions that reference Dataverse fields
        // These typically look like @{outputs('Get_record')?['body/fieldname']}
        var dynamicExpressions = ExtractDynamicExpressions(flowDefinition);

        foreach (var expression in dynamicExpressions)
        {
            var fieldReferences = ParseDynamicExpression(expression);
            foreach (var (entityName, fieldName) in fieldReferences)
            {
                if (!string.IsNullOrEmpty(entityName) && !string.IsNullOrEmpty(fieldName))
                {
                    AddAttributeUsage(attributeUsages, entityName, fieldName, new AttributeUsage(flowName, $"Dynamic content reference: {expression}", OperationType.Read, SupportedType));
                }
            }
        }
    }

    private IEnumerable<string> ExtractDynamicExpressions(JToken token)
    {
        var expressions = new List<string>();

        if (token is JValue value && value.Type == JTokenType.String)
        {
            var stringValue = value.ToString();
            if (stringValue.Contains("@{") || stringValue.Contains("outputs("))
            {
                expressions.Add(stringValue);
            }
        }
        else if (token is JContainer container)
        {
            foreach (var child in container)
            {
                expressions.AddRange(ExtractDynamicExpressions(child));
            }
        }

        return expressions;
    }

    private IEnumerable<(string entityName, string fieldName)> ParseDynamicExpression(string expression)
    {
        var results = new List<(string, string)>();

        // Look for patterns like outputs('Action_name')?['body/fieldname']
        var matches = Regex.Matches(expression, @"outputs\('([^']+)'\)\?\['body/([^']+)'\]", RegexOptions.IgnoreCase);
        foreach (Match match in matches)
        {
            var actionName = match.Groups[1].Value;
            var fieldName = match.Groups[2].Value;

            // Try to infer entity name from action name or use a placeholder
            var entityName = InferEntityNameFromActionName(actionName);
            results.Add((entityName, fieldName));
        }

        // Look for other patterns like body('action')?['fieldname']
        matches = Regex.Matches(expression, @"body\('([^']+)'\)\?\['([^']+)'\]", RegexOptions.IgnoreCase);
        foreach (Match match in matches)
        {
            var actionName = match.Groups[1].Value;
            var fieldName = match.Groups[2].Value;

            var entityName = InferEntityNameFromActionName(actionName);
            results.Add((entityName, fieldName));
        }

        return results;
    }

    private string InferEntityNameFromActionName(string actionName)
    {
        // Try to extract entity name from action names like "Get_contact_record" or "Create_account"
        var cleanName = actionName.Replace("_", "").ToLower();

        // Common patterns
        if (cleanName.Contains("contact")) return "contact";
        if (cleanName.Contains("account")) return "account";
        if (cleanName.Contains("lead")) return "lead";
        if (cleanName.Contains("opportunity")) return "opportunity";
        if (cleanName.Contains("case") || cleanName.Contains("incident")) return "incident";

        // Return a placeholder if we can't determine the entity
        return "unknown_entity";
    }

    private IEnumerable<string> ParseExpandParameter(string expand)
    {
        var fields = new List<string>();

        // Simple comma-separated fields
        var parts = expand.Split(',');
        foreach (var part in parts)
        {
            var trimmed = part.Trim();
            if (trimmed.Contains('('))
            {
                // Extract the field name before the parenthesis
                var fieldName = trimmed.Substring(0, trimmed.IndexOf('('));
                fields.Add(fieldName);

                // Also extract any nested $select fields
                var match = Regex.Match(trimmed, @"\$select=([^)]+)");
                if (match.Success)
                {
                    var nestedFields = match.Groups[1].Value.Split(',').Select(f => f.Trim());
                    fields.AddRange(nestedFields);
                }
            }
            else
            {
                fields.Add(trimmed);
            }
        }

        return fields.Where(f => !string.IsNullOrEmpty(f) && IsLikelyFieldName(f));
    }

    private bool IsLikelyFieldName(string name)
    {
        if (string.IsNullOrEmpty(name)) return false;

        // Exclude common system parameters and metadata fields
        var systemFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "@odata.context", "@odata.etag", "@odata.id", "@odata.type",
            "entityName", "entitySetName", "uri", "path", "method", "headers",
            "authentication", "retryPolicy", "pagination", "timeout"
        };

        if (systemFields.Contains(name)) return false;

        // Must start with a letter or underscore
        if (!char.IsLetter(name[0]) && name[0] != '_') return false;

        // Should contain only letters, numbers, and underscores
        return name.All(c => char.IsLetterOrDigit(c) || c == '_');
    }

    private bool IsSystemParameter(string name)
    {
        var systemParams = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "entityName", "entitySetName", "$select", "$expand", "$filter", "$orderby", "$top", "$skip"
        };

        return systemParams.Contains(name);
    }

    private OperationType DetermineOperationTypeFromAction(string actionName)
    {
        if (string.IsNullOrEmpty(actionName))
            return OperationType.Other;

        var lowerActionName = actionName.ToLowerInvariant();

        // Create operations
        if (lowerActionName.Contains("create") || lowerActionName.Contains("add") || lowerActionName.Contains("insert"))
            return OperationType.Create;

        // Update operations
        if (lowerActionName.Contains("update") || lowerActionName.Contains("modify") || lowerActionName.Contains("patch"))
            return OperationType.Update;

        // Delete operations
        if (lowerActionName.Contains("delete") || lowerActionName.Contains("remove"))
            return OperationType.Delete;

        // List operations (multiple records)
        if (lowerActionName.Contains("list") || lowerActionName.Contains("getitems") || lowerActionName.Contains("listrecords"))
            return OperationType.List;

        // Read operations (single record)
        if (lowerActionName.Contains("get") || lowerActionName.Contains("retrieve") || lowerActionName.Contains("read"))
            return OperationType.Read;

        // Default to Other for unknown actions
        return OperationType.Other;
    }
}
