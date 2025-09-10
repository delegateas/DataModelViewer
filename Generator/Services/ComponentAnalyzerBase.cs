using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using System.Text.RegularExpressions;

namespace Generator.Services;

public abstract class BaseComponentAnalyzer<T>(ServiceClient service) : IComponentAnalyzer<T> where T : Analyzeable
{
    protected readonly ServiceClient _service = service;

    public abstract ComponentType SupportedType { get; }
    public abstract Task AnalyzeComponentAsync(T component, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages);

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
