using Generator.DTO;
using Generator.Services.PowerAutomate.Models;
using Newtonsoft.Json.Linq;

namespace Generator.Services.PowerAutomate.Analyzers;

/// <summary>
/// Analyzer for Create Row / Create Record operations
/// </summary>
public class CreateRowAnalyzer : DataverseActionAnalyzerBase
{
    public override IEnumerable<string> SupportedOperationIds => new[]
    {
        "CreateRow", "CreateRecord", "CreateItem", "PostItem"
    };

    public override ActionAnalysisResult Analyze(JToken action, string actionName)
    {
        var result = new ActionAnalysisResult { ActionName = actionName };
        var entityName = ExtractEntityName(action);

        if (string.IsNullOrEmpty(entityName))
            return result;

        result.EntityName = entityName;
        result.OperationType = OperationType.Create;

        // Extract fields from the item being created
        var item = action.SelectToken("inputs.parameters.item") ?? action.SelectToken("inputs.item");
        if (item is JObject itemObj)
        {
            foreach (var prop in itemObj.Properties())
            {
                if (IsLikelyFieldName(prop.Name))
                {
                    result.AddFieldUsage(prop.Name, "Create item property");
                }
            }
        }

        // Also check for item/ prefixed parameters (alternative format)
        var parameters = action.SelectToken("inputs.parameters");
        if (parameters is JObject paramsObj)
        {
            foreach (var prop in paramsObj.Properties())
            {
                if (prop.Name.StartsWith("item/"))
                {
                    var fieldName = prop.Name.Substring("item/".Length);
                    result.AddFieldUsage(fieldName, "Create parameter");
                }
            }
        }

        return result;
    }
}
