using Generator.Services.PowerAutomate.Models;
using System.Text.RegularExpressions;

namespace Generator.Services.PowerAutomate.Extractors;

/// <summary>
/// Extracts Dataverse field references from Power Automate expressions
/// </summary>
public class ExpressionExtractor
{
    /// <summary>
    /// Analyzes an expression string to find Dataverse field references
    /// Handles patterns like: outputs('Get_row')?['body/fieldname'], body('action')?['field'], etc.
    /// </summary>
    public IEnumerable<FieldReference> ExtractFromExpression(string expression, Dictionary<string, string> actionToEntityMap)
    {
        if (string.IsNullOrEmpty(expression)) yield break;

        // Pattern 1: outputs('Action_name')?['body/fieldname'] or outputs('Action_name')['body/fieldname']
        foreach (var fieldRef in ExtractOutputsPattern(expression, actionToEntityMap))
        {
            yield return fieldRef;
        }

        // Pattern 2: body('action')?['fieldname'] or body('action')['fieldname']
        foreach (var fieldRef in ExtractBodyPattern(expression, actionToEntityMap))
        {
            yield return fieldRef;
        }

        // Pattern 3: items('Apply_to_each')?['fieldname'] - for loop items
        foreach (var fieldRef in ExtractItemsPattern(expression, actionToEntityMap))
        {
            yield return fieldRef;
        }

        // Pattern 4: triggerOutputs()?['body/fieldname'] - for triggers
        foreach (var fieldRef in ExtractTriggerPattern(expression, actionToEntityMap))
        {
            yield return fieldRef;
        }
    }

    private IEnumerable<FieldReference> ExtractOutputsPattern(string expression, Dictionary<string, string> actionToEntityMap)
    {
        var pattern = @"outputs\(['""]([^'""]+)['""]\)\??\[['""]body/([^'""]+)['""]\]";
        foreach (Match match in Regex.Matches(expression, pattern, RegexOptions.IgnoreCase))
        {
            var actionName = match.Groups[1].Value;
            var fieldName = match.Groups[2].Value;

            if (actionToEntityMap.TryGetValue(actionName, out var entityName))
            {
                yield return new FieldReference(entityName, fieldName, $"outputs('{actionName}')?['body/{fieldName}']");
            }
        }
    }

    private IEnumerable<FieldReference> ExtractBodyPattern(string expression, Dictionary<string, string> actionToEntityMap)
    {
        var pattern = @"body\(['""]([^'""]+)['""]\)\??\[['""]([^'""]+)['""]\]";
        foreach (Match match in Regex.Matches(expression, pattern, RegexOptions.IgnoreCase))
        {
            var actionName = match.Groups[1].Value;
            var fieldName = match.Groups[2].Value;

            // Skip if it's a nested body/ reference (already caught by outputs pattern)
            if (fieldName.StartsWith("body/")) continue;

            if (actionToEntityMap.TryGetValue(actionName, out var entityName))
            {
                yield return new FieldReference(entityName, fieldName, $"body('{actionName}')?['{fieldName}']");
            }
        }
    }

    private IEnumerable<FieldReference> ExtractItemsPattern(string expression, Dictionary<string, string> actionToEntityMap)
    {
        var pattern = @"items\(['""]([^'""]+)['""]\)\??\[['""]([^'""]+)['""]\]";
        foreach (Match match in Regex.Matches(expression, pattern, RegexOptions.IgnoreCase))
        {
            var loopName = match.Groups[1].Value;
            var fieldName = match.Groups[2].Value;

            if (actionToEntityMap.TryGetValue(loopName, out var entityName))
            {
                yield return new FieldReference(entityName, fieldName, $"items('{loopName}')?['{fieldName}']");
            }
        }
    }

    private IEnumerable<FieldReference> ExtractTriggerPattern(string expression, Dictionary<string, string> actionToEntityMap)
    {
        var pattern = @"triggerOutputs\(\)\??\[['""]body/([^'""]+)['""]\]";
        foreach (Match match in Regex.Matches(expression, pattern, RegexOptions.IgnoreCase))
        {
            var fieldName = match.Groups[1].Value;

            if (actionToEntityMap.TryGetValue("trigger", out var entityName))
            {
                yield return new FieldReference(entityName, fieldName, $"triggerOutputs()?['body/{fieldName}']");
            }
        }
    }
}
