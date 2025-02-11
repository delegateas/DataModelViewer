using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

public abstract class Attribute
{
    public string DisplayName { get; }
    public string SchemaName { get; }
    public string Description { get; }
    public string AttributeType => GetType().Name;
    public AttributeRequiredLevel RequiredLevel { get; }
    public bool IsAuditEnabled { get; }
    public bool IsColumnSecured { get; }

    protected Attribute(AttributeMetadata metadata)
    {
        DisplayName = metadata.DisplayName.UserLocalizedLabel?.Label ?? string.Empty;
        SchemaName = metadata.SchemaName;
        Description = metadata.Description.UserLocalizedLabel?.Label.PrettyDescription() ?? string.Empty;
        RequiredLevel = metadata.RequiredLevel.Value;
        IsAuditEnabled = metadata.IsAuditEnabled.Value;
        IsColumnSecured = metadata.IsSecured ?? false;
    }
}
