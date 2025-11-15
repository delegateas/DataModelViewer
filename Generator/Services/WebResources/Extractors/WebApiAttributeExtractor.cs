using Generator.Services.WebResources.Models;
using System.Text.RegularExpressions;

namespace Generator.Services.WebResources.Extractors;

/// <summary>
/// Extracts attribute references from Xrm.WebApi calls in JavaScript web resources
/// </summary>
public class WebApiAttributeExtractor
{
    /// <summary>
    /// Extracts all attribute references from Xrm.WebApi method calls in the given code
    /// </summary>
    public IEnumerable<AttributeReference> ExtractAttributeReferences(string code)
    {
        if (string.IsNullOrEmpty(code)) yield break;

        // Extract from all WebApi method types
        foreach (var reference in ExtractFromRetrieveRecord(code))
            yield return reference;

        foreach (var reference in ExtractFromRetrieveMultipleRecords(code))
            yield return reference;

        foreach (var reference in ExtractFromCreateRecord(code))
            yield return reference;

        foreach (var reference in ExtractFromUpdateRecord(code))
            yield return reference;

        foreach (var reference in ExtractFromDeleteRecord(code))
            yield return reference;
    }

    /// <summary>
    /// Extracts references from Xrm.WebApi.retrieveRecord calls
    /// Pattern: Xrm.WebApi.retrieveRecord(entityLogicalName, id, options)
    /// Example: Xrm.WebApi.retrieveRecord("contact", id, "?$select=firstname,lastname")
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromRetrieveRecord(string code)
    {
        // Pattern to match retrieveRecord calls with entity name and options
        var pattern = @"Xrm\.WebApi\.retrieveRecord\s*\(\s*[""'](?<entity>[^""']+)[""']\s*,\s*[^,]+\s*,\s*[""'](?<options>[^""']+)[""']";

        foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase))
        {
            var entityName = match.Groups["entity"].Value;
            var options = match.Groups["options"].Value;

            // Extract attributes from $select
            foreach (var attr in ExtractAttributesFromSelect(options))
            {
                yield return new AttributeReference(entityName, attr, "Xrm.WebApi.retrieveRecord $select", "Read");
            }

            // Extract attributes from $filter
            foreach (var attr in ExtractAttributesFromFilter(options))
            {
                yield return new AttributeReference(entityName, attr, "Xrm.WebApi.retrieveRecord $filter", "Read");
            }
        }
    }

    /// <summary>
    /// Extracts references from Xrm.WebApi.retrieveMultipleRecords calls
    /// Pattern: Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, options, maxPageSize)
    /// Example: Xrm.WebApi.retrieveMultipleRecords("account", "?$select=name,revenue&$filter=revenue gt 100000")
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromRetrieveMultipleRecords(string code)
    {
        // Pattern to match retrieveMultipleRecords calls
        var pattern = @"Xrm\.WebApi\.retrieveMultipleRecords\s*\(\s*[""'](?<entity>[^""']+)[""']\s*,\s*[""'](?<options>[^""']+)[""']";

        foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase))
        {
            var entityName = match.Groups["entity"].Value;
            var options = match.Groups["options"].Value;

            // Extract attributes from $select
            foreach (var attr in ExtractAttributesFromSelect(options))
            {
                yield return new AttributeReference(entityName, attr, "Xrm.WebApi.retrieveMultipleRecords $select", "Read");
            }

            // Extract attributes from $filter
            foreach (var attr in ExtractAttributesFromFilter(options))
            {
                yield return new AttributeReference(entityName, attr, "Xrm.WebApi.retrieveMultipleRecords $filter", "Read");
            }

            // Extract attributes from $orderby
            foreach (var attr in ExtractAttributesFromOrderBy(options))
            {
                yield return new AttributeReference(entityName, attr, "Xrm.WebApi.retrieveMultipleRecords $orderby", "Read");
            }
        }
    }

    /// <summary>
    /// Extracts references from Xrm.WebApi.createRecord calls
    /// Pattern: Xrm.WebApi.createRecord(entityLogicalName, data)
    /// Example: Xrm.WebApi.createRecord("contact", {firstname: "John", lastname: "Doe"})
    /// Limitations: Assumes data object is a simple literal and does not handle complex expressions or variables
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromCreateRecord(string code)
    {
        // Pattern to match createRecord calls - we need to find the entity name and then the data object
        var pattern = @"Xrm\.WebApi\.createRecord\s*\(\s*[""'](?<entity>[^""']+)[""']\s*,\s*(?<data>\{[^}]*\})";

        foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline))
        {
            var entityName = match.Groups["entity"].Value;
            var dataObject = match.Groups["data"].Value;

            // Extract property names from the data object
            foreach (var attr in ExtractAttributesFromDataObject(dataObject))
            {
                yield return new AttributeReference(entityName, attr, "Xrm.WebApi.createRecord data", "Create");
            }
        }
    }

    /// <summary>
    /// Extracts references from Xrm.WebApi.updateRecord calls
    /// Pattern: Xrm.WebApi.updateRecord(entityLogicalName, id, data)
    /// Example: Xrm.WebApi.updateRecord("contact", id, {firstname: "Jane", telephone1: "555-1234"})
    /// Limitations: Assumes data object is a simple literal and does not handle complex expressions or variables
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromUpdateRecord(string code)
    {
        // Pattern to match updateRecord calls
        var pattern = @"Xrm\.WebApi\.updateRecord\s*\(\s*[""'](?<entity>[^""']+)[""']\s*,\s*[^,]+\s*,\s*(?<data>\{[^}]*\})";

        foreach (Match match in Regex.Matches(code, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline))
        {
            var entityName = match.Groups["entity"].Value;
            var dataObject = match.Groups["data"].Value;

            // Extract property names from the data object
            foreach (var attr in ExtractAttributesFromDataObject(dataObject))
            {
                yield return new AttributeReference(entityName, attr, "Xrm.WebApi.updateRecord data", "Update");
            }
        }
    }

    /// <summary>
    /// Extracts references from Xrm.WebApi.deleteRecord calls
    /// Pattern: Xrm.WebApi.deleteRecord(entityLogicalName, id)
    /// Note: Delete operations don't typically reference specific attributes
    /// </summary>
    private IEnumerable<AttributeReference> ExtractFromDeleteRecord(string code)
    {
        // deleteRecord doesn't reference specific attributes, just the entity
        // Could be useful for tracking entity usage but not attribute usage
        yield break;
    }

    /// <summary>
    /// Extracts attribute names from OData $select parameter
    /// Example: "?$select=firstname,lastname,telephone1" -> ["firstname", "lastname", "telephone1"]
    /// </summary>
    private IEnumerable<string> ExtractAttributesFromSelect(string queryString)
    {
        if (string.IsNullOrEmpty(queryString)) yield break;

        var selectMatch = Regex.Match(queryString, @"\$select=([^&]+)", RegexOptions.IgnoreCase);
        if (!selectMatch.Success) yield break;

        var selectValue = selectMatch.Groups[1].Value;
        var attributes = selectValue.Split(',').Select(a => a.Trim()).Where(a => !string.IsNullOrEmpty(a));

        foreach (var attr in attributes)
        {
            yield return attr;
        }
    }

    /// <summary>
    /// Extracts attribute names from OData $filter parameter
    /// Example: "$filter=firstname eq 'John' and revenue gt 100000" -> ["firstname", "revenue"]
    /// </summary>
    private IEnumerable<string> ExtractAttributesFromFilter(string queryString)
    {
        if (string.IsNullOrEmpty(queryString)) yield break;

        var filterMatch = Regex.Match(queryString, @"\$filter=([^&]+)", RegexOptions.IgnoreCase);
        if (!filterMatch.Success) yield break;

        var filterValue = filterMatch.Groups[1].Value;

        // Pattern to find field names before operators
        var fieldPattern = @"\b([a-zA-Z_][a-zA-Z0-9_]*)\s+(?:eq|ne|gt|ge|lt|le|and|or|not|contains|startswith|endswith)\s";

        foreach (Match match in Regex.Matches(filterValue, fieldPattern, RegexOptions.IgnoreCase))
        {
            var fieldName = match.Groups[1].Value;
            if (!IsODataKeyword(fieldName))
            {
                yield return fieldName;
            }
        }
    }

    /// <summary>
    /// Extracts attribute names from OData $orderby parameter
    /// Example: "$orderby=lastname asc,createdon desc" -> ["lastname", "createdon"]
    /// </summary>
    private IEnumerable<string> ExtractAttributesFromOrderBy(string queryString)
    {
        if (string.IsNullOrEmpty(queryString)) yield break;

        var orderByMatch = Regex.Match(queryString, @"\$orderby=([^&]+)", RegexOptions.IgnoreCase);
        if (!orderByMatch.Success) yield break;

        var orderByValue = orderByMatch.Groups[1].Value;

        // Split by comma and extract field names (removing asc/desc)
        var parts = orderByValue.Split(',');
        foreach (var part in parts)
        {
            var trimmed = part.Trim();
            // Remove 'asc' or 'desc' if present
            var fieldName = Regex.Replace(trimmed, @"\s+(asc|desc)\s*$", "", RegexOptions.IgnoreCase).Trim();
            if (!string.IsNullOrEmpty(fieldName))
            {
                yield return fieldName;
            }
        }
    }

    /// <summary>
    /// Extracts property names from JavaScript object literals
    /// Example: {firstname: "John", lastname: "Doe", telephone1: value} -> ["firstname", "lastname", "telephone1"]
    /// </summary>
    private IEnumerable<string> ExtractAttributesFromDataObject(string dataObject)
    {
        if (string.IsNullOrEmpty(dataObject)) yield break;

        // Pattern to match object property names (both quoted and unquoted)
        // Matches: propertyName:, "propertyName":, 'propertyName':
        var propertyPattern = @"(?:[""'])?([a-zA-Z_@][a-zA-Z0-9_@]*)(?:[""'])?\s*:";

        foreach (Match match in Regex.Matches(dataObject, propertyPattern))
        {
            var propertyName = match.Groups[1].Value;

            // Filter out special bindings and common non-attribute properties
            if (!IsSpecialProperty(propertyName))
            {
                yield return propertyName;
            }
        }
    }

    /// <summary>
    /// Checks if a word is an OData keyword that should be filtered out
    /// </summary>
    private bool IsODataKeyword(string word)
    {
        var keywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "eq", "ne", "gt", "ge", "lt", "le", "and", "or", "not", "null", "true", "false",
            "contains", "startswith", "endswith", "length", "indexof", "substring"
        };
        return keywords.Contains(word);
    }

    /// <summary>
    /// Checks if a property name is a special binding or metadata property that shouldn't be tracked
    /// </summary>
    private bool IsSpecialProperty(string propertyName)
    {
        // Filter out OData bind properties and common metadata
        return propertyName.Contains("@odata") ||
               propertyName.StartsWith("_") && propertyName.EndsWith("_value") ||
               propertyName.Equals("getMetadata", StringComparison.OrdinalIgnoreCase);
    }
}
