using Microsoft.Extensions.Logging;
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

    public LookupAttribute(LookupAttributeMetadata metadata, Dictionary<string, ExtendedEntityInformation> logicalToSchema, ILogger<DataverseService> logger)
        : base(metadata)
    {
        foreach (var target in metadata.Targets) { if (!logicalToSchema.ContainsKey(target)) logger.LogError($"Missing logicalname in logicalToSchema {target}, on entity {metadata.EntityLogicalName}."); }

        Targets =
            metadata.Targets
            .Where(logicalToSchema.ContainsKey)
            .Select(target => logicalToSchema[target]);
    }
}
