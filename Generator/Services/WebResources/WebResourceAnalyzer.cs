using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using System.Text.RegularExpressions;

namespace Generator.Services.WebResources;

public class WebResourceAnalyzer : BaseComponentAnalyzer<WebResource>
{
    public WebResourceAnalyzer(ServiceClient service) : base(service) { }

    public override ComponentType SupportedType => ComponentType.WebResource;

    public override async Task AnalyzeComponentAsync(WebResource webResource, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        try
        {
            if (string.IsNullOrEmpty(webResource.Content))
                return;

            // Analyze JavaScript content for onChange event handlers and getAttribute calls
            AnalyzeOnChangeHandlers(webResource, attributeUsages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error analyzing web resource {webResource.Name}: {ex.Message}");
        }

        await Task.CompletedTask;
    }

    private void AnalyzeOnChangeHandlers(WebResource webResource, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        var content = webResource.Content;

        var attributeNames = ExtractGetAttributeCalls(content);
        foreach (var attributeName in attributeNames)
            foreach (var form in webResource.dependencies)
                AddAttributeUsage(attributeUsages, form.EntityName, attributeName, new AttributeUsage(
                    webResource.Name,
                    $"getAttribute call",
                    OperationType.Read,
                    SupportedType
                ));
    }

    // TODO get attributes used in XrmApi or XrmQuery calls

    // TODO get attributes from getControl

    private List<string> ExtractGetAttributeCalls(string code)
    {
        var attributes = new List<string>();

        if (string.IsNullOrEmpty(code))
            return attributes;

        // Examples:
        // formContext.getAttribute("firstname")
        // Xrm.Page.getAttribute("lastname") 
        // executionContext.getFormContext().getAttribute("email")
        // context.getAttribute("phonenumber")
        // this.getAttribute("address1_city")
        var getAttributePattern = @"(\w+(?:\.\w+)*\.getAttribute)\([""']([^""']+)[""']\)";
        var matches = Regex.Matches(code, getAttributePattern, RegexOptions.IgnoreCase);

        foreach (Match match in matches)
        {
            var attributeName = match.Groups[2].Value;
            attributes.Add(attributeName);
        }

        return attributes.Distinct().ToList();
    }
}
