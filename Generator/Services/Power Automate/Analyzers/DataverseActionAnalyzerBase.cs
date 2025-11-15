using Generator.Services.PowerAutomate.Extractors;
using Generator.Services.PowerAutomate.Models;
using Newtonsoft.Json.Linq;

namespace Generator.Services.PowerAutomate.Analyzers;

/// <summary>
/// Base class for analyzing specific Dataverse action types
/// </summary>
public abstract class DataverseActionAnalyzerBase
{
    protected readonly ODataExtractor ODataExtractor;

    protected DataverseActionAnalyzerBase()
    {
        ODataExtractor = new ODataExtractor();
    }

    /// <summary>
    /// Gets the operation IDs this analyzer supports
    /// </summary>
    public abstract IEnumerable<string> SupportedOperationIds { get; }

    /// <summary>
    /// Analyzes an action and extracts field usage information
    /// </summary>
    public abstract ActionAnalysisResult Analyze(JToken action, string actionName);

    /// <summary>
    /// Extracts entity name from action inputs
    /// </summary>
    protected string? ExtractEntityName(JToken action)
    {
        // Try different paths where entity name might be stored
        var entityLogicalName = action.SelectToken("inputs.parameters.entityName")?.ToString();
        if (!string.IsNullOrEmpty(entityLogicalName)) return entityLogicalName;

        // Check for item type (used in some operations)
        var itemType = action.SelectToken("inputs.parameters.item/@odata.type")?.ToString();
        if (!string.IsNullOrEmpty(itemType))
        {
            // Format: Microsoft.Dynamics.CRM.account
            var match = System.Text.RegularExpressions.Regex.Match(itemType, @"Microsoft\.Dynamics\.CRM\.(.+)$");
            if (match.Success) return match.Groups[1].Value;
        }

        // Try host metadata
        var hostEntity = action.SelectToken("inputs.host.entity")?.ToString();
        if (!string.IsNullOrEmpty(hostEntity)) return hostEntity;

        return null;
    }

    /// <summary>
    /// Determines if a property name is likely a field name (not a system property)
    /// </summary>
    protected bool IsLikelyFieldName(string name)
    {
        if (string.IsNullOrEmpty(name)) return false;

        var systemFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "@odata.context", "@odata.etag", "@odata.id", "@odata.type", "@odata.editLink",
            "entityName", "entitySetName", "uri", "path", "method", "headers",
            "authentication", "retryPolicy", "pagination", "timeout", "recordId", "item"
        };

        if (systemFields.Contains(name)) return false;

        // Must start with a letter or underscore
        if (!char.IsLetter(name[0]) && name[0] != '_') return false;

        // Should contain only letters, numbers, and underscores
        return name.All(c => char.IsLetterOrDigit(c) || c == '_');
    }
}
