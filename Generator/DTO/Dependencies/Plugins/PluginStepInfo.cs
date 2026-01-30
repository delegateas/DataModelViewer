namespace Generator.DTO.Dependencies.Plugins;

/// <summary>
/// Represents a plugin sdk step registration extracted from a plugin class
/// </summary>
public record PluginStepInfo(
    string ClassName,
    string FullName,
    string FilePath,
    string EntityLogicalName,
    string EntityClassName,
    string EventOperation,
    string ExecutionStage,
    string ExecutionMode = "Synchronous",
    string? UsesManager = null,
    string? UsesService = null
)
{
    public List<string> FilteredAttributes { get; set; } = new();
    public List<ImageInfo> Images { get; set; } = new();
}

public record ImageInfo(
    string Name,
    string ImageType
)
{
    public List<string> Attributes { get; set; } = new();
}

