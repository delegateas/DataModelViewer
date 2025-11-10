using Generator.Services.PowerAutomate.Models;
using Newtonsoft.Json.Linq;
using System.Text.RegularExpressions;

namespace Generator.Services.PowerAutomate.Extractors;

/// <summary>
/// Extracts field references from OData query parameters ($select, $expand, $filter)
/// </summary>
public class ODataExtractor
{
    /// <summary>
    /// Analyzes OData parameters ($select, $expand, $filter) for field references
    /// </summary>
    public IEnumerable<FieldReference> ExtractFromODataParameters(JToken inputs, string entityName)
    {
        // $select parameter - comma-separated field list
        foreach (var field in ExtractFromSelect(inputs))
        {
            yield return new FieldReference(entityName, field, "$select");
        }

        // $expand parameter - can contain nested $select
        foreach (var field in ExtractFromExpand(inputs))
        {
            yield return new FieldReference(entityName, field, "$expand");
        }

        // $filter parameter - may contain field references
        foreach (var field in ExtractFromFilter(inputs))
        {
            yield return new FieldReference(entityName, field, "$filter");
        }
    }

    private IEnumerable<string> ExtractFromSelect(JToken inputs)
    {
        var select = inputs.SelectToken("parameters.$select")?.ToString();
        if (string.IsNullOrEmpty(select)) yield break;

        var fields = select.Split(',').Select(f => f.Trim()).Where(f => !string.IsNullOrEmpty(f));
        foreach (var field in fields)
        {
            yield return field;
        }
    }

    private IEnumerable<string> ExtractFromExpand(JToken inputs)
    {
        var expand = inputs.SelectToken("parameters.$expand")?.ToString();
        if (string.IsNullOrEmpty(expand)) yield break;

        var parts = expand.Split(',');
        foreach (var part in parts)
        {
            var trimmed = part.Trim();
            if (trimmed.Contains('('))
            {
                // Extract the field name before the parenthesis
                var fieldName = trimmed.Substring(0, trimmed.IndexOf('('));
                yield return fieldName;

                // Also extract any nested $select fields
                var match = Regex.Match(trimmed, @"\$select=([^)]+)");
                if (match.Success)
                {
                    var nestedFields = match.Groups[1].Value.Split(',').Select(f => f.Trim());
                    foreach (var nested in nestedFields)
                    {
                        yield return nested;
                    }
                }
            }
            else
            {
                yield return trimmed;
            }
        }
    }

    private IEnumerable<string> ExtractFromFilter(JToken inputs)
    {
        var filter = inputs.SelectToken("parameters.$filter")?.ToString();
        if (string.IsNullOrEmpty(filter)) yield break;

        // Simple field extraction - look for identifiers before operators
        var fieldPattern = @"\b([a-zA-Z_][a-zA-Z0-9_]*)\s+(?:eq|ne|gt|ge|lt|le|and|or)\s";
        foreach (Match match in Regex.Matches(filter, fieldPattern, RegexOptions.IgnoreCase))
        {
            var fieldName = match.Groups[1].Value;
            // Filter out OData keywords
            if (!IsODataKeyword(fieldName))
            {
                yield return fieldName;
            }
        }
    }

    private bool IsODataKeyword(string word)
    {
        var keywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "eq", "ne", "gt", "ge", "lt", "le", "and", "or", "not", "null", "true", "false"
        };
        return keywords.Contains(word);
    }
}
