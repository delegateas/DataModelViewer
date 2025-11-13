using Generator.DTO;
using Generator.DTO.Warnings;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;

namespace Generator.Services.Plugins;

public class PluginAnalyzer : BaseComponentAnalyzer<SDKStep>
{
    public PluginAnalyzer(ServiceClient service) : base(service) { }

    public override ComponentType SupportedType => ComponentType.Plugin;

    public override async Task AnalyzeComponentAsync(SDKStep sdkStep, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages, List<SolutionWarning> warnings)
    {
        try
        {
            // Extract filtering attributes and plugin name
            var filteringAttributes = sdkStep.FilteringAttributes?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            var pluginName = sdkStep.Name;

            // Retrieve the logical name of the entity from the linked SDK Message entity
            var logicalTableName = sdkStep.PrimaryObjectTypeCode;

            // Populate the attributeUsages dictionary
            foreach (var attribute in filteringAttributes)
                AddAttributeUsage(attributeUsages, logicalTableName, attribute, new AttributeUsage(pluginName, $"Used in filterattributes", OperationType.Other, SupportedType));

        }
        catch (Exception ex)
        {
            // Log the exception (assuming a logging mechanism is in place)
            Console.WriteLine($"Error analyzing component: {ex.Message}");
        }
    }

    private async Task AnalyzePluginCode(Entity plugin, List<AttributeUsage> attributeUsages, string componentName)
    {
        // TODO later
        // This would require access to the plugin assembly code
        // Could potentially analyze if assembly source is available or through reflection
        // For now, this is a placeholder for future implementation
        await Task.CompletedTask;
    }
}
