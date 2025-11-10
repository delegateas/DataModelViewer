using Generator.DTO;

namespace Generator.Services.PowerAutomate.Models;

/// <summary>
/// Result of analyzing a single Power Automate action
/// </summary>
public class ActionAnalysisResult
{
    public string ActionName { get; set; } = string.Empty;
    public string? EntityName { get; set; }
    public OperationType OperationType { get; set; }
    public Dictionary<string, List<string>> FieldUsages { get; } = new();

    public void AddFieldUsage(string fieldName, string context)
    {
        if (!FieldUsages.ContainsKey(fieldName))
        {
            FieldUsages[fieldName] = new List<string>();
        }
        FieldUsages[fieldName].Add(context);
    }
}
