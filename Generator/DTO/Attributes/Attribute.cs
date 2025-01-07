using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

public abstract class Attribute
{
    public string DisplayName { get; }
    public string SchemaName { get; }
    public string Description { get; }
    public string AttributeType => GetType().Name;

    protected Attribute(string displayName, string schemaName, string? description)
    {
        DisplayName = displayName;
        SchemaName = schemaName;
        Description = description;
    }

    protected Attribute(AttributeMetadata metadata) : this(
        metadata.DisplayName.UserLocalizedLabel?.Label ?? string.Empty,
        metadata.SchemaName,
        metadata.Description.UserLocalizedLabel?.Label.PrettyDescription() ?? string.Empty)
    {
    }
}
