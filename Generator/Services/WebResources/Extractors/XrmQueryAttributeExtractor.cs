using Generator.Services.WebResources.Models;
using System.Text.RegularExpressions;

namespace Generator.Services.WebResources.Extractors;

/// <summary>
/// Extracts attribute references from XrmQuery library calls in TypeScript/JavaScript web resources
/// </summary>
public class XrmQueryAttributeExtractor
{
    /// <summary>
    /// Extracts all attribute references from XrmQuery method calls in the given code
    /// </summary>
    /// <param name="code">The JavaScript/TypeScript code to analyze</param>
    /// <param name="convertCollectionNameToLogicalName">Optional function to convert plural entity names to singular using metadata</param>
    public IEnumerable<AttributeReference> ExtractAttributeReferences(
        string code,
        Func<string, string>? convertCollectionNameToLogicalName = null)
    {
        if (string.IsNullOrEmpty(code)) yield break;

        // Extract from retrieve operations
        foreach (var reference in ExtractFromRetrieve(code, convertCollectionNameToLogicalName))
            yield return reference;

        foreach (var reference in ExtractFromRetrieveMultiple(code, convertCollectionNameToLogicalName))
            yield return reference;

        // Extract from CRUD operations
        foreach (var reference in ExtractFromCreate(code, convertCollectionNameToLogicalName))
            yield return reference;

        foreach (var reference in ExtractFromUpdate(code, convertCollectionNameToLogicalName))
            yield return reference;

        foreach (var reference in ExtractFromDelete(code))
            yield return reference;
    }

    /// <summary>
    /// Extracts references from XrmQuery.retrieve calls
    /// Pattern: XrmQuery.retrieve(x => x.entityname, id)
    /// Transpiled: XrmQuery.retrieve(function (x) { return x.entityname; }, id)
    /// Often chained with .select() and .filter()
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromRetrieve(string code, Func<string, string>? convertCollectionNameToLogicalName)
    {
        // Extract entity name from retrieve calls
        var arrowPattern = @"XrmQuery\s*\.\s*retrieve\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*=>\s*(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)";
        var transpiledPattern = @"XrmQuery\s*\.\s*retrieve\s*\(\s*function\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*\)\s*\{\s*return\s+(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)\s*;?\s*\}";

        foreach (var pattern in new[] { arrowPattern, transpiledPattern })
        {
            foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline))
            {
                var entityNamePlural = match.Groups["entity"].Value;
                var startPos = match.Index;

                // Try to find the chained select/filter calls
                var chainedCode = ExtractChainedMethodCalls(code, startPos);

                // Extract entity name (XrmQuery typically uses plural forms)
                var entityName = convertCollectionNameToLogicalName?.Invoke(entityNamePlural) ?? ConvertPluralToSingular(entityNamePlural);

                // Extract from .select() calls
                foreach (var attr in ExtractFromSelectChain(chainedCode))
                {
                    yield return new AttributeReference(entityName, attr, "XrmQuery.retrieve .select()", "Read");
                }

                // Extract from .filter() calls
                foreach (var attr in ExtractFromFilterChain(chainedCode))
                {
                    yield return new AttributeReference(entityName, attr, "XrmQuery.retrieve .filter()", "Read");
                }
            }
        }
    }

    /// <summary>
    /// Extracts references from XrmQuery.retrieveMultiple calls
    /// Pattern: XrmQuery.retrieveMultiple(x => x.entityname)
    /// Transpiled: XrmQuery.retrieveMultiple(function (x) { return x.entityname; })
    /// Often chained with .select() and .filter()
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromRetrieveMultiple(string code, Func<string, string>? convertCollectionNameToLogicalName)
    {
        // Pattern to match both arrow functions and transpiled function expressions
        var arrowPattern = @"XrmQuery\s*\.\s*retrieveMultiple\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*=>\s*(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)";
        var transpiledPattern = @"XrmQuery\s*\.\s*retrieveMultiple\s*\(\s*function\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*\)\s*\{\s*return\s+(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)\s*;?\s*\}";

        foreach (var pattern in new[] { arrowPattern, transpiledPattern })
        {
            foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline))
            {
                var entityNamePlural = match.Groups["entity"].Value;
                var startPos = match.Index;

                // Try to find the chained select/filter calls
                var chainedCode = ExtractChainedMethodCalls(code, startPos);

                // Extract entity name
                var entityName = convertCollectionNameToLogicalName?.Invoke(entityNamePlural) ?? ConvertPluralToSingular(entityNamePlural);

                // Extract from .select() calls
                foreach (var attr in ExtractFromSelectChain(chainedCode))
                {
                    yield return new AttributeReference(entityName, attr, "XrmQuery.retrieveMultiple .select()", "Read");
                }

                // Extract from .filter() calls
                foreach (var attr in ExtractFromFilterChain(chainedCode))
                {
                    yield return new AttributeReference(entityName, attr, "XrmQuery.retrieveMultiple .filter()", "Read");
                }
            }
        }
    }

    /// <summary>
    /// Extracts references from XrmQuery.create calls
    /// Pattern: XrmQuery.create(x => x.entityname, recordData)
    /// Transpiled: XrmQuery.create(function (x) { return x.entityname; }, recordData)
    /// Limitations: Assumes data object is a simple literal and does not handle complex expressions or variables
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromCreate(string code, Func<string, string>? convertCollectionNameToLogicalName)
    {
        // Pattern to match both arrow functions and transpiled function expressions
        var arrowPattern = @"XrmQuery\s*\.\s*create\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*=>\s*(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)\s*,\s*(?<data>\{[^}]*\})";
        var transpiledPattern = @"XrmQuery\s*\.\s*create\s*\(\s*function\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*\)\s*\{\s*return\s+(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)\s*;?\s*\}\s*,\s*(?<data>\{[^}]*\})";

        foreach (var pattern in new[] { arrowPattern, transpiledPattern })
        {
            foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline))
            {
                var entityNamePlural = match.Groups["entity"].Value;
                var entityName = convertCollectionNameToLogicalName?.Invoke(entityNamePlural) ?? ConvertPluralToSingular(entityNamePlural);
                var dataObject = match.Groups["data"].Value;

                // Extract property names from the data object
                foreach (var attr in ExtractAttributesFromDataObject(dataObject))
                {
                    yield return new AttributeReference(entityName, attr, "XrmQuery.create data", "Create");
                }
            }
        }
    }

    /// <summary>
    /// Extracts references from XrmQuery.update calls
    /// Pattern: XrmQuery.update(x => x.entityname, id, recordData)
    /// Transpiled: XrmQuery.update(function (x) { return x.entityname; }, id, recordData)
    /// Limitations: Assumes data object is a simple literal and does not handle complex expressions or variables
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromUpdate(string code, Func<string, string>? convertCollectionNameToLogicalName)
    {
        // Pattern to match both arrow functions and transpiled function expressions
        var arrowPattern = @"XrmQuery\s*\.\s*update\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*=>\s*(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)\s*,\s*[^,]+\s*,\s*(?<data>\{[^}]*\})";
        var transpiledPattern = @"XrmQuery\s*\.\s*update\s*\(\s*function\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*\)\s*\{\s*return\s+(?:[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)\s*;?\s*\}\s*,\s*[^,]+\s*,\s*(?<data>\{[^}]*\})";

        foreach (var pattern in new[] { arrowPattern, transpiledPattern })
        {
            foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline))
            {
                var entityNamePlural = match.Groups["entity"].Value;
                var entityName = convertCollectionNameToLogicalName?.Invoke(entityNamePlural) ?? ConvertPluralToSingular(entityNamePlural);
                var dataObject = match.Groups["data"].Value;

                // Extract property names from the data object
                foreach (var attr in ExtractAttributesFromDataObject(dataObject))
                {
                    yield return new AttributeReference(entityName, attr, "XrmQuery.update data", "Update");
                }
            }
        }
    }

    /// <summary>
    /// Extracts references from XrmQuery.deleteRecord calls
    /// Pattern: XrmQuery.deleteRecord(x => x.entityname, id)
    /// Note: Delete operations don't typically reference specific attributes
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromDelete(string code)
    {
        // deleteRecord doesn't reference specific attributes
        yield break;
    }

    /// <summary>
    /// Extracts chained method calls starting from a position in the code
    /// Handles multi-line chaining like:
    /// XrmQuery.retrieve(...)
    ///   .select(...)
    ///   .filter(...)
    ///   .execute(...)
    /// </summary>
    private static string ExtractChainedMethodCalls(string code, int startPos)
    {
        if (string.IsNullOrEmpty(code))
            return string.Empty;

        // Find the opening '(' of the XrmQuery.retrieve(...) call
        int openParen = code.IndexOf('(', startPos);
        if (openParen == -1)
            return string.Empty;

        // 1. Balance parentheses for XrmQuery.retrieve(...)
        int depth = 0;
        int i = openParen;

        for (; i < code.Length; i++)
        {
            char c = code[i];

            if (c == '(')
            {
                depth++;
            }
            else if (c == ')')
            {
                depth--;
                if (depth == 0)
                {
                    i++; // move past the closing ')' of retrieve(...)
                    break;
                }
            }
        }

        // If we never returned to depth 0, the call is unbalanced
        if (depth != 0 || i >= code.Length)
            return string.Empty;

        // 2. From just after retrieve(...), collect the chained calls
        //    until we hit a top-level ';' or ']'.
        int end = i;
        int chainDepth = 0;

        for (; end < code.Length; end++)
        {
            char c = code[end];

            // Track overall parentheses depth for the chain
            if (c == '(')
            {
                chainDepth++;
            }
            else if (c == ')')
            {
                chainDepth--;
            }

            // Only treat ';' or ']' as terminators when we're NOT
            // inside any parentheses of chained calls.
            if (chainDepth == 0 && (c == ';' || c == ']'))
            {
                break;
            }
        }

        // Return everything from "XrmQuery.retrieve" through the full chain,
        // excluding the final ';' or ']'.
        return code.Substring(startPos, end - startPos);
    }

    /// <summary>
    /// Extracts attribute names from .select() method chains
    /// Pattern: .select(x => [x.firstname, x.lastname, x.telephone1])
    /// Transpiled: .select(function (x) { return [x.firstname, x.lastname, x.telephone1]; })
    /// </summary>
    private IEnumerable<string> ExtractFromSelectChain(string code)
    {
        // Pattern to match .select() with array of properties (arrow function)
        var arrowPattern = @"\.select\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*=>\s*\[(.+?)\]";
        // Pattern to match transpiled function
        var transpiledPattern = @"\.select\s*\(\s*function\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*\)\s*\{\s*return\s+\[(.+?)\]\s*;?\s*\}";

        foreach (var pattern in new[] { arrowPattern, transpiledPattern })
        {
            var matches = Regex.Matches(code, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            Console.WriteLine($"DEBUG Select pattern '{pattern.Substring(0, 30)}...' matches: {matches.Count}");

            foreach (Match match in matches)
            {
                var selectContent = match.Groups[1].Value;  // Group 1 is the content inside brackets

                // Extract individual property accesses: x.propertyname
                var propPattern = @"(?:[a-zA-Z_]\w*)\.([a-zA-Z_]\w+)";
                foreach (Match propMatch in Regex.Matches(selectContent, propPattern))
                {
                    var attributeName = propMatch.Groups[1].Value;
                    yield return attributeName;
                }
            }
        }
    }

    /// <summary>
    /// Extracts attribute names from .filter() method chains
    /// Pattern: .filter(x => Filter.equals(x.attributename, value))
    /// Transpiled: .filter(function (x) { return Filter.equals(x.attributename, value); })
    /// </summary>
    private IEnumerable<string> ExtractFromFilterChain(string code)
    {
        if (string.IsNullOrEmpty(code))
            yield break;

        // Pattern to match .filter() with Filter operations (arrow function)
        // Example: .filter(x => Filter.equals(x.statecode, 0))
        var arrowPattern =
            @"\.filter\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*=>\s*([\s\S]+?)\)(?=\s*\.|;|$)";

        // Pattern to match transpiled function
        // Example: .filter(function (x) { return Filter.equals(x.statecode, 0); })
        var transpiledPattern =
            @"\.filter\s*\(\s*function\s*\(\s*(?<param>[a-zA-Z_]\w*)\s*\)\s*\{\s*return\s+([\s\S]+?)\s*;?\s*\}\s*\)";

        foreach (var pattern in new[] { arrowPattern, transpiledPattern })
        {
            foreach (Match match in Regex.Matches(code, pattern,
                         RegexOptions.IgnoreCase | RegexOptions.Singleline))
            {
                // Group "param" is the lambda parameter name (e.g., "x")
                var paramName = match.Groups["param"].Value;

                // Group 2 is the filter body expression (e.g., "Filter.equals(x.statecode, 0)")
                var filterContent = match.Groups[1].Value;

                // Extract property accesses from filter expressions: param.propertyName
                var propPattern = $@"\b{Regex.Escape(paramName)}\.([a-zA-Z_]\w+)";

                foreach (Match propMatch in Regex.Matches(filterContent, propPattern))
                {
                    var attributeName = propMatch.Groups[1].Value;

                    // Filter out Filter class methods (equals, notEquals, etc.)
                    if (!IsFilterMethod(attributeName))
                        yield return attributeName;
                }
            }
        }
    }

    /// <summary>
    /// Extracts property names from JavaScript/TypeScript object literals
    /// Example: {firstname: "John", lastname: "Doe"} -> ["firstname", "lastname"]
    /// </summary>
    private IEnumerable<string> ExtractAttributesFromDataObject(string dataObject)
    {
        if (string.IsNullOrEmpty(dataObject)) yield break;

        // Pattern to match object property names (both quoted and unquoted)
        var propertyPattern = @"(?:[""'])?([a-zA-Z_@][a-zA-Z0-9_@]*)(?:[""'])?\s*:";

        foreach (Match match in Regex.Matches(dataObject, propertyPattern))
        {
            var propertyName = match.Groups[1].Value;

            // Filter out special properties
            if (!IsSpecialProperty(propertyName))
            {
                yield return propertyName;
            }
        }
    }

    /// <summary>
    /// Converts plural entity names to singular form (basic rules)
    /// XrmQuery typically uses plural forms (e.g., x.accounts, x.contacts)
    /// This is a simple implementation - may need enhancement for irregular plurals
    /// </summary>
    private string ConvertPluralToSingular(string plural)
    {
        // Handle common patterns
        if (plural.EndsWith("ies", StringComparison.OrdinalIgnoreCase))
        {
            // activities -> activity
            return plural.Substring(0, plural.Length - 3) + "y";
        }
        else if (plural.EndsWith("ses", StringComparison.OrdinalIgnoreCase))
        {
            // addresses -> address
            return plural.Substring(0, plural.Length - 2);
        }
        else if (plural.EndsWith("s", StringComparison.OrdinalIgnoreCase))
        {
            // accounts -> account, contacts -> contact
            return plural.Substring(0, plural.Length - 1);
        }

        // If no plural pattern detected, return as-is
        return plural;
    }

    /// <summary>
    /// Checks if a property name is a Filter class method
    /// </summary>
    private bool IsFilterMethod(string name)
    {
        var filterMethods = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "equals", "notEquals", "greaterThan", "greaterThanOrEqual", "lessThan", "lessThanOrEqual",
            "and", "or", "not", "ands", "ors", "startsWith", "contains", "endsWith", "makeGuid"
        };
        return filterMethods.Contains(name);
    }

    /// <summary>
    /// Checks if a property name is a special binding or metadata property
    /// </summary>
    private bool IsSpecialProperty(string propertyName)
    {
        return propertyName.Contains("@odata") ||
               propertyName.StartsWith("_") && propertyName.EndsWith("_value") ||
               propertyName.Equals("getMetadata", StringComparison.OrdinalIgnoreCase);
    }
}
