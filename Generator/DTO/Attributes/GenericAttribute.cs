using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class GenericAttribute : Attribute
{
    public string Type { get; }

    public GenericAttribute(AttributeMetadata metadata)
        : base(metadata)
    {
        Type = metadata.AttributeType?.ToString() ?? "Unknown type";
    }
}
