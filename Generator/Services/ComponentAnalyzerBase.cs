using Generator.DTO;
using Generator.DTO.Warnings;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Metadata;
using System.Text.RegularExpressions;

namespace Generator.Services;

public abstract class BaseComponentAnalyzer<T>(ServiceClient service) : IComponentAnalyzer<T> where T : Analyzeable
{
    protected readonly ServiceClient _service = service;

    public abstract ComponentType SupportedType { get; }
    public abstract Task AnalyzeComponentAsync(
        T component,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
        List<SolutionWarning> warnings,
        List<EntityMetadata>? entityMetadata = null);

    protected void AddAttributeUsage(Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
        string entityName, string attributeName, AttributeUsage usage)
    {
        if (!attributeUsages.ContainsKey(entityName))
        {
            attributeUsages[entityName] = new Dictionary<string, List<AttributeUsage>>();
        }

        if (!attributeUsages[entityName].ContainsKey(attributeName))
        {
            attributeUsages[entityName][attributeName] = new List<AttributeUsage>();
        }

        attributeUsages[entityName][attributeName].Add(usage);
    }

    protected List<string> ExtractFieldsFromODataFilter(string filter)
    {
        var fields = new List<string>();

        var fieldPattern = @"(\w+)\s+(?:eq|ne|gt|ge|lt|le|contains|startswith|endswith)";
        var matches = Regex.Matches(filter, fieldPattern, RegexOptions.IgnoreCase);

        foreach (Match match in matches)
        {
            fields.Add(match.Groups[1].Value);
        }

        return fields.Distinct().ToList();
    }
}
