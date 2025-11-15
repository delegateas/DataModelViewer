using Generator.DTO;
using Generator.Services.PowerAutomate.Models;
using Newtonsoft.Json.Linq;

namespace Generator.Services.PowerAutomate.Analyzers;

/// <summary>
/// Analyzer for Delete Row / Delete Record operations
/// </summary>
public class DeleteRowAnalyzer : DataverseActionAnalyzerBase
{
    public override IEnumerable<string> SupportedOperationIds => new[]
    {
        "DeleteRow", "DeleteRecord", "DeleteItem"
    };

    public override ActionAnalysisResult Analyze(JToken action, string actionName)
    {
        var result = new ActionAnalysisResult { ActionName = actionName };
        var entityName = ExtractEntityName(action);

        if (string.IsNullOrEmpty(entityName))
            return result;

        result.EntityName = entityName;
        result.OperationType = OperationType.Delete;

        // Delete operations typically don't expose field usage directly
        // But we track that the entity was accessed

        return result;
    }
}
