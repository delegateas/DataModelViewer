using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class BooleanAttribute : Attribute
{
    public string TrueLabel { get; }
    public string FalseLabel { get; }

    public bool? DefaultValue { get; }

    public BooleanAttribute(BooleanAttributeMetadata metadata)
        : base(metadata)
    {
        TrueLabel = metadata.OptionSet.TrueOption.Label.UserLocalizedLabel?.Label ?? string.Empty;
        FalseLabel = metadata.OptionSet.FalseOption.Label.UserLocalizedLabel?.Label ?? string.Empty;
        DefaultValue = metadata.DefaultValue;
    }
}
