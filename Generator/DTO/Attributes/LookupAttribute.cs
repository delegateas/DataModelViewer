using Microsoft.Xrm.Sdk.Metadata;
using Newtonsoft.Json;

namespace Generator.DTO.Attributes;

internal class LookupAttribute : Attribute
{
    public IEnumerable<string> Targets { get; }

    public LookupAttribute(LookupAttributeMetadata metadata, Dictionary<string, string> logicalToSchema)
        : base(metadata)
    {
        Targets = 
            metadata.Targets
            .Where(x => logicalToSchema.ContainsKey(x))
            .Select(x => logicalToSchema[x]);
    }
}
