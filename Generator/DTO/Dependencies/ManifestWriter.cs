using Generator.DTO.Dependencies.Plugins;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Generator.DTO.Dependencies;


/// <summary>
/// Generates the JSON manifest from analyzed plugin and business logic data.
/// </summary>
public class ManifestWriter
{
    private readonly JsonSerializerOptions _jsonOptions;

    public ManifestWriter()
    {
        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters = { new JsonStringEnumConverter() }
        };
    }

    /// <summary>
    /// Creates a DependencyManifest from the analyzed data
    /// </summary>
    public DependencyManifest CreateManifest(
        List<PluginStepInfo> plugins,
        List<BusinessLogicInfo> businessLogic,
        string? assemblyName = null)
    {
        var manifest = new DependencyManifest(AssemblyName: assemblyName)
        {
            GeneratedAt = DateTime.UtcNow
        };

        var allUsages = new List<(string entityLogicalName, AttributeUsageManifest usage)>();

        // Convert plugin filtered attributes and images to AttributeUsage format
        foreach (var plugin in plugins)
        {
            var componentType = plugin.ClassName.Contains("CustomAPI") ? ComponentType.CustomAPI : ComponentType.Plugin;

            // Determine operation type from plugin event
            var pluginOpType = plugin.EventOperation.ToLower() switch
            {
                "create" => OperationType.Create,
                "update" => OperationType.Update,
                "delete" => OperationType.Delete,
                "retrieve" => OperationType.Read,
                "retrievemultiple" => OperationType.List,
                _ => OperationType.Other
            };

            // Add filtered attributes
            foreach (var attr in plugin.FilteredAttributes)
            {
                allUsages.Add((plugin.EntityLogicalName, new AttributeUsageManifest(
                    Name: attr,
                    Usage: $"Filtered ({plugin.EventOperation})",
                    OperationType: pluginOpType,
                    ComponentType: componentType,
                    IsFromDependencyAnalysis: true,
                    ComponentName: plugin.ClassName
                )));
            }

            // Add image attributes
            foreach (var image in plugin.Images)
            {
                foreach (var attr in image.Attributes)
                {
                    allUsages.Add((plugin.EntityLogicalName, new AttributeUsageManifest(
                        Name: attr,
                        Usage: $"{image.ImageType} Image",
                        OperationType: OperationType.Read,
                        ComponentType: componentType,
                        IsFromDependencyAnalysis: true,
                        ComponentName: plugin.ClassName
                    )));
                }
            }
        }

        // Convert business logic attribute accesses
        foreach (var bl in businessLogic)
        {
            var mapped = bl.AttributeAccesses.SelectMany(e => e.Value.Select(attr => new AttributeUsageManifest(
                Name: attr.Name,
                Usage: attr.Usage,
                OperationType: attr.OperationType,
                ComponentType: attr.ComponentType,
                IsFromDependencyAnalysis: true,
                ComponentName: bl.ClassName
            )).Select(x => (e.Key, x)));
            allUsages.Concat(mapped);
        }

        // Group by entity
        manifest.AttributeUsages = allUsages
            .GroupBy(u => u.entityLogicalName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.usage).ToList()
            );

        return manifest;
    }


    /// <summary>
    /// Writes the manifest to a file
    /// </summary>
    public async Task WriteToFileAsync(DependencyManifest manifest, string outputPath)
    {
        var json = JsonSerializer.Serialize(manifest, _jsonOptions);
        await File.WriteAllTextAsync(outputPath, json);
    }

    /// <summary>
    /// Writes the manifest to stdout
    /// </summary>
    public void WriteToConsole(DependencyManifest manifest)
    {
        var json = JsonSerializer.Serialize(manifest, _jsonOptions);
        Console.WriteLine(json);
    }

    /// <summary>
    /// Gets the manifest as a JSON string
    /// </summary>
    public string ToJson(DependencyManifest manifest)
    {
        return JsonSerializer.Serialize(manifest, _jsonOptions);
    }
}
