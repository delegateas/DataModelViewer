using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class StringAttribute : Attribute
{
    public string Format { get; }
    public int? MaxLength { get; }

    public StringAttribute(StringAttributeMetadata metadata)
        : base(metadata)
    {
        Format = metadata.Format?.ToString() ?? "Unknown Format";
        MaxLength = metadata.MaxLength;
    }

    public StringAttribute(MemoAttributeMetadata metadata) : base(metadata)
    {
        Format = metadata.Format?.ToString() ?? "Unknown Format";
        MaxLength = metadata.MaxLength;
    }
}
