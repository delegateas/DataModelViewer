using Generator.DTO;
using Generator.Services.PowerAutomate.Models;
using Newtonsoft.Json.Linq;

namespace Generator.Services.PowerAutomate.Analyzers;

/// <summary>
/// Analyzer for Get Row / Get Record operations
/// </summary>
public class GetRowAnalyzer : DataverseActionAnalyzerBase
{
    public override IEnumerable<string> SupportedOperationIds => new[]
    {
        "GetRow", "GetRecord", "GetItem"
    };

    public override ActionAnalysisResult Analyze(JToken action, string actionName)
    {
        var result = new ActionAnalysisResult { ActionName = actionName };
        var entityName = ExtractEntityName(action);

        if (string.IsNullOrEmpty(entityName))
            return result;

        result.EntityName = entityName;
        result.OperationType = OperationType.Read;

        // Extract from OData parameters
        var inputs = action.SelectToken("inputs");
        if (inputs != null)
        {
            var oDataFields = ODataExtractor.ExtractFromODataParameters(inputs, entityName);
            foreach (var field in oDataFields)
            {
                result.AddFieldUsage(field.FieldName, field.Context);
            }
        }

        return result;
    }
}
