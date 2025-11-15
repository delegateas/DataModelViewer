using Generator.DTO;
using Generator.Services.PowerAutomate.Models;
using Newtonsoft.Json.Linq;

namespace Generator.Services.PowerAutomate.Analyzers;

/// <summary>
/// Analyzer for List Rows / List Records operations
/// </summary>
public class ListRowsAnalyzer : DataverseActionAnalyzerBase
{
    public override IEnumerable<string> SupportedOperationIds => new[]
    {
        "ListRows", "ListRecords", "GetItems", "ListItems"
    };

    public override ActionAnalysisResult Analyze(JToken action, string actionName)
    {
        var result = new ActionAnalysisResult { ActionName = actionName };
        var entityName = ExtractEntityName(action);

        if (string.IsNullOrEmpty(entityName))
            return result;

        result.EntityName = entityName;
        result.OperationType = OperationType.List;

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
