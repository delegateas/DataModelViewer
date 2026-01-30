namespace Generator.DTO.Dependencies.Plugins;

/// <summary>
/// Represents metadata about a Dataverse entity extracted from XrmContext.cs
/// </summary>
public record EntityInfo(
    string ClassName,
    string LogicalName,
    int? EntityTypeCode = null
)
{
    public Dictionary<string, AttributeInfo> Attributes { get; set; } = new();
    public Dictionary<string, RelationshipInfo> Relationships { get; set; } = new();
}

public record AttributeInfo(
    string PropertyName,
    string LogicalName,
    string? Type = null,
    string? DisplayName = null
);

public record RelationshipInfo(
    string PropertyName,
    string SchemaName,
    string? RelatedEntityClassName = null,
    string? EntityRole = null,
    bool IsCollection = false
);
