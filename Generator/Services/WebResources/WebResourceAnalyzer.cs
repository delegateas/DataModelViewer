using Generator.DTO;
using Generator.DTO.Warnings;
using Generator.Services.WebResources.Extractors;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Metadata;
using System.Text.RegularExpressions;

namespace Generator.Services.WebResources;

public class WebResourceAnalyzer : BaseComponentAnalyzer<WebResource>
{
    private record AttributeCall(string AttributeName, string Type, OperationType Operation);

    private readonly WebApiAttributeExtractor _webApiExtractor;
    private readonly XrmQueryAttributeExtractor _xrmQueryExtractor;

    public WebResourceAnalyzer(ServiceClient service) : base(service)
    {
        _webApiExtractor = new WebApiAttributeExtractor();
        _xrmQueryExtractor = new XrmQueryAttributeExtractor();
    }

    public override ComponentType SupportedType => ComponentType.WebResource;

    public override async Task AnalyzeComponentAsync(
        WebResource webResource,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
        List<SolutionWarning> warnings,
        List<EntityMetadata>? entityMetadata = null)
    {
        try
        {
            if (string.IsNullOrEmpty(webResource.Content))
                return;

            // Analyze JavaScript content for onChange event handlers and getAttribute calls
            await AnalyzeOnChangeHandlersAsync(webResource, attributeUsages, warnings, entityMetadata);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error analyzing web resource {webResource.Name}: {ex.Message}");
        }
    }

    private async Task AnalyzeOnChangeHandlersAsync(
        WebResource webResource,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
        List<SolutionWarning> warnings,
        List<EntityMetadata>? entityMetadata)
    {
        var content = webResource.Content;

        // Extract entity name from description field
        string? entityName = ExtractEntityFromDescription(webResource.Description);

        // Legacy attribute extraction methods (getAttribute, getControl)
        var attributeNames = new List<AttributeCall>();
        ExtractGetAttributeCalls(content, attributeNames);
        ExtractGetControlCalls(content, attributeNames);
        var webApiReferences = _webApiExtractor.ExtractAttributeReferences(content);
        var entityMapping = BuildEntityMapping(entityMetadata);
        var xrmQueryReferences = _xrmQueryExtractor.ExtractAttributeReferences(content, collectionName =>
        {
            if (entityMapping.TryGetValue(collectionName.ToLower(), out var logicalName))
                return logicalName;
            // Entity not found in solution - return the collection name as-is, will be warned about
            return collectionName.ToLower();
        });

        // Build set of valid entity names in solution
        var validEntityNames = entityMapping.Values.ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Process legacy getAttribute/getControl calls
        // These require the entity name from description
        if (!string.IsNullOrWhiteSpace(entityName))
        {
            foreach (var attributeName in attributeNames)
            {
                AddAttributeUsage(attributeUsages, entityName.ToLower(), attributeName.AttributeName, new AttributeUsage(
                    webResource.Name,
                    attributeName.Type,
                    attributeName.Operation,
                    SupportedType,
                    false
                ));
            }
        }
        else if (attributeNames.Count > 0)
        {
            // Warn if we found getAttribute/getControl calls but no entity in description
            warnings.Add(new SolutionWarning(SolutionWarningType.Webresource,
                $"getAttribute/getControl calls found but ENTITY not specified in WebResource description: {webResource.Name}"));
        }

        // Process WebApi references (these include their own entity names)
        foreach (var reference in webApiReferences)
        {
            var entityNameLower = reference.EntityName.ToLower();

            // Warn if entity not found in solution
            if (!validEntityNames.Contains(entityNameLower))
            {
                warnings.Add(new SolutionWarning(SolutionWarningType.Webresource,
                    $"Entity '{reference.EntityName}' not found in solution. Used in {webResource.Name} with attribute '{reference.AttributeName}' ({reference.Context})"));
            }

            AddAttributeUsage(attributeUsages, entityNameLower, reference.AttributeName, new AttributeUsage(
                webResource.Name,
                reference.Context,
                ConvertOperationString(reference.Operation),
                SupportedType,
                false
            ));
        }

        // Process XrmQuery references (these include their own entity names)
        foreach (var reference in xrmQueryReferences)
        {
            var entityNameLower = reference.EntityName.ToLower();

            // Warn if entity not found in solution
            if (!validEntityNames.Contains(entityNameLower))
            {
                warnings.Add(new SolutionWarning(SolutionWarningType.Webresource,
                    $"Entity '{reference.EntityName}' not found in solution. Used in {webResource.Name} with attribute '{reference.AttributeName}' ({reference.Context})"));
            }

            AddAttributeUsage(attributeUsages, entityNameLower, reference.AttributeName, new AttributeUsage(
                webResource.Name,
                reference.Context,
                ConvertOperationString(reference.Operation),
                SupportedType,
                false
            ));
        }
    }

    /// <summary>
    /// Converts operation string from extractors to OperationType enum
    /// </summary>
    private OperationType ConvertOperationString(string operation)
    {
        return operation.ToLower() switch
        {
            "read" => OperationType.Read,
            "create" => OperationType.Create,
            "update" => OperationType.Update,
            "delete" => OperationType.Delete,
            _ => OperationType.Read
        };
    }

    private static string? ExtractEntityFromDescription(string? description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return null;

        // Look for pattern: ENTITY:<entityschemaname>
        var match = Regex.Match(description, @"ENTITY:(\w+)", RegexOptions.IgnoreCase | RegexOptions.Multiline);

        if (match.Success)
        {
            return match.Groups[1].Value;
        }

        return null;
    }

    private void ExtractGetAttributeCalls(string code, List<AttributeCall> attributes)
    {
        if (string.IsNullOrEmpty(code))
            return;

        // Examples:
        // formContext.getAttribute("firstname").setValue("some value")
        // Xrm.Page.getAttribute("lastname").getValue()
        // executionContext.getFormContext().getAttribute("email")
        // context.getAttribute("phonenumber")
        // this.getAttribute("address1_city")
        var getAttributePattern = @"(?<recv>\b\w+(?:\.\w+)*\.getAttribute)\(\s*[""'](?<attr>[^""']+)[""']\s*\)(?:\s*\.\s*(?<op>getValue|setValue)\s*\((?<args>[^)]*)\))?";
        var matches = Regex.Matches(code, getAttributePattern, RegexOptions.IgnoreCase);

        foreach (Match match in matches)
        {
            var attributeName = match.Groups["attr"].Value;
            var operation = match.Groups["op"].Value.StartsWith("get") ? OperationType.Read : OperationType.Update;
            attributes.Add(new AttributeCall(attributeName, $"getAttribute call, {operation}", operation));
        }
        return;
    }

    // getControl calls also return tabs, subgrids etc. which is a bit problematic
    private void ExtractGetControlCalls(string code, List<AttributeCall> attributes)
    {
        if (string.IsNullOrEmpty(code))
            return;

        // Examples:
        // formContext.getControl("firstname")
        // Xrm.Page.getControl("lastname") 
        // executionContext.getFormContext().getControl("email")
        // context.getControl("phonenumber")
        // this.getControl("address1_city")
        var getAttributePattern = @"(?<recv>\b\w+(?:\.\w+)*\.getControl)\(\s*[""'](?<attr>[^""']+)[""']?";
        var matches = Regex.Matches(code, getAttributePattern, RegexOptions.IgnoreCase);

        foreach (Match match in matches)
        {
            var attributeName = match.Groups["attr"].Value;
            attributes.Add(new AttributeCall(attributeName, "getControl call", OperationType.Read));
        }
        return;
    }

    /// <summary>
    /// Builds entity mapping from LogicalCollectionName to LogicalName using the provided entity metadata
    /// </summary>
    private Dictionary<string, string> BuildEntityMapping(List<EntityMetadata>? entityMetadata)
    {
        if (entityMetadata == null || entityMetadata.Count == 0)
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        return entityMetadata
            .Where(e => !string.IsNullOrEmpty(e.LogicalCollectionName))
            .ToDictionary(
                e => e.LogicalCollectionName!.ToLower(),
                e => e.LogicalName.ToLower(),
                StringComparer.OrdinalIgnoreCase);
    }
}
