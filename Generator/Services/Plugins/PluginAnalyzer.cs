using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;

namespace Generator.Services.Plugins;

public class PluginAnalyzer : BaseComponentAnalyzer
{
    public PluginAnalyzer(ServiceClient service) : base(service) { }

    public override ComponentType SupportedType => ComponentType.Plugin;

    public override async Task AnalyzeComponentAsync(Entity sdkStep, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        try
        {
            // Extract filtering attributes and plugin name
            var filteringAttributes = sdkStep.GetAttributeValue<string>("filteringattributes")?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            var pluginName = sdkStep.GetAttributeValue<string>("name");

            // Retrieve the logical name of the entity from the linked SDK Message entity
            var logicalTableName = sdkStep.GetAttributeValue<AliasedValue>("filter.primaryobjecttypecode")?.Value as string;

            // Populate the attributeUsages dictionary
            foreach (var attribute in filteringAttributes)
            {
                if (!attributeUsages.ContainsKey(logicalTableName))
                    attributeUsages[logicalTableName] = new Dictionary<string, List<AttributeUsage>>();

                if (!attributeUsages[logicalTableName].ContainsKey(attribute))
                    attributeUsages[logicalTableName][attribute] = new List<AttributeUsage>();

                // Add the usage information (assuming AttributeUsage is a defined class)
                attributeUsages[logicalTableName][attribute].Add(new AttributeUsage(pluginName, LocationType.Trigger, OperationType.Other, SupportedType));
            }
        }
        catch (Exception ex)
        {
            // Log the exception (assuming a logging mechanism is in place)
            Console.WriteLine($"Error analyzing component: {ex.Message}");
        }
    }

    private OperationType DetermineOperationTypeFromMessage(string messageName)
    {
        return messageName?.ToLower() switch
        {
            "create" => OperationType.Create,
            "update" => OperationType.Update,
            "delete" => OperationType.Delete,
            "retrieve" => OperationType.Read,
            "retrievemultiple" => OperationType.Read,
            _ => OperationType.Other
        };
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
