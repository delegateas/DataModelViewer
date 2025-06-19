using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class ExtendedEntityInformation
{
    public string Name { get; set; }
    public bool IsInSolution { get; set; }
}

internal class LookupAttribute : Attribute
{
    public IEnumerable<ExtendedEntityInformation> Targets { get; }

    public LookupAttribute(LookupAttributeMetadata metadata, Dictionary<string, ExtendedEntityInformation> logicalToSchema)
        : base(metadata)
    {
        Targets =
            metadata.Targets
            .Select(target => logicalToSchema[target]);
    }
}
