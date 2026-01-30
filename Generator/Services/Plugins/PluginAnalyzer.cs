using Generator.DTO;
using Generator.DTO.Dependencies;
using Generator.DTO.Warnings;
using Microsoft.PowerPlatform.Dataverse.Client;

namespace Generator.Services.Plugins;

public class PluginAnalyzer : BaseComponentAnalyzer<SDKStep>
{
    public PluginAnalyzer(ServiceClient service) : base(service) { }

    public override ComponentType SupportedType => ComponentType.Plugin;

    public override async Task AnalyzeComponentAsync(SDKStep sdkStep, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages, List<SolutionWarning> warnings, List<Microsoft.Xrm.Sdk.Metadata.EntityMetadata>? entityMetadata = null)
    {
        try
        {
            // Extract filtering attributes and plugin name
            var filteringAttributes = sdkStep.FilteringAttributes?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            var pluginName = sdkStep.Name;

            // Retrieve the logical name of the entity from the linked SDK Message entity
            var logicalTableName = sdkStep.PrimaryObjectTypeCode;

            // Map SDK message name to operation type
            var operationType = AttributeUsage.MapSdkMessageToOperationType(sdkStep.SdkMessageName);

            // Populate the attributeUsages dictionary
            foreach (var attribute in filteringAttributes)
                AddAttributeUsage(attributeUsages, logicalTableName, attribute, new AttributeUsage(pluginName, $"Used in filterattributes", operationType, SupportedType, false));

        }
        catch (Exception ex)
        {
            // Log the exception (assuming a logging mechanism is in place)
            Console.WriteLine($"Error analyzing component: {ex.Message}");
        }
    }
}
