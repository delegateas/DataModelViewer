using System.Text.Json.Serialization;

namespace Generator.DTO.Dependencies;

public record DependencyManifest(
    string Version = "1.0",
    string? AssemblyName = null
)
{
    /// <summary>
    /// When the manifest was generated
    /// </summary>
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// All attribute usages found, grouped by entity
    /// </summary>
    public Dictionary<string, List<AttributeUsageManifest>> AttributeUsages { get; set; } = new();
}

public record AttributeUsageManifest(
    string Name,
    string Usage,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    OperationType OperationType,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    ComponentType ComponentType,
    bool IsFromDependencyAnalysis = true,
    string? ComponentName = null
);