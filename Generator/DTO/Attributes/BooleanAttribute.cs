using Generator.Extensions;
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
        TrueLabel = metadata.OptionSet.TrueOption.Label.ToLabelString();
        FalseLabel = metadata.OptionSet.FalseOption.Label.ToLabelString();
        DefaultValue = metadata.DefaultValue;
    }
}
