using Generator.DTO;
using Microsoft.Extensions.Configuration;
using Microsoft.PowerPlatform.Dataverse.Client;
using System.Linq.Dynamic.Core;
using System.Text.RegularExpressions;

namespace Generator.Services.WebResources;

public class WebResourceAnalyzer : BaseComponentAnalyzer<WebResource>
{
    private record AttributeCall(string AttributeName, string Type, OperationType Operation);

    private readonly Func<string, string> webresourceNamingFunc;
    public WebResourceAnalyzer(ServiceClient service, IConfiguration configuration) : base(service)
    {
        var lambda = configuration.GetValue<string>("WebResourceNameFunc") ?? "name.Split('.').First()";
        webresourceNamingFunc = DynamicExpressionParser.ParseLambda<string, string>(
            new ParsingConfig { ResolveTypesBySimpleName = true },
            false,
            "name => " + lambda
        ).Compile();
    }

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

        var attributeNames = new List<AttributeCall>();
        ExtractGetAttributeCalls(content, attributeNames);
        ExtractGetControlCalls(content, attributeNames);
        // TODO get attributes used in XrmApi or XrmQuery calls

        foreach (var attributeName in attributeNames)
        {
            string entityName;
            try
            {
                entityName = webresourceNamingFunc(webResource.Name);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Naming function failed for web resource '{webResource.Name}': {ex.Message}");
                continue;
            }
            if (string.IsNullOrWhiteSpace(entityName))
            {
                Console.WriteLine($"Warning: Naming function returned an invalid value for web resource '{webResource.Name}'. Skipping attribute usage.");
                continue;
            }
            AddAttributeUsage(attributeUsages, entityName.ToLower(), attributeName.AttributeName, new AttributeUsage(
                webResource.Name,
                attributeName.Type,
                attributeName.Operation,
                SupportedType
            ));
        }
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
}
