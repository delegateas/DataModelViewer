using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class FileAttribute : Attribute
{
    public int? MaxSize { get; }

    public FileAttribute(FileAttributeMetadata metadata)
        : base(metadata)
    {
        MaxSize = metadata.MaxSizeInKB;
    }
}
