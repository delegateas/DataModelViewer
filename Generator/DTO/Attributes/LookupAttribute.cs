using Microsoft.Xrm.Sdk.Metadata;
using Newtonsoft.Json;

namespace Generator.DTO.Attributes;

internal class LookupAttribute : Attribute
{
    public IEnumerable<LookupTarget> Targets { get; }

    public LookupAttribute(LookupAttributeMetadata metadata, HashSet<string> entitiesBeingGenerated)
        : base(metadata)
    {
        Targets = metadata.Targets.Select(x => new LookupTarget(x, entitiesBeingGenerated.Contains(x)));
    }
}
