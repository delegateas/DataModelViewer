using Microsoft.Xrm.Sdk.Metadata;

namespace Generator;

public static class MetadataExtensions
{
    public static IEnumerable<AttributeMetadata> GetRelevantAttributes(this EntityMetadata entity, HashSet<Guid> attributesInSolution) =>
        entity.Attributes
        //.Where(attr => attr.MetadataId.HasValue && attributesInSolution.TryGetValue(attr.MetadataId.Value, out _)) // solutioncomponents for attributes (attributesInSolution) dont seem to return all relevant attributes? Maybe something to do with solution layering or idk tbh
        .Where(IsCustomOrModifiedStandardField);

    private static readonly Func<AttributeMetadata, bool> IsCustomOrModifiedStandardField = (AttributeMetadata attribute) =>
    {
        bool isCustomField = attribute.IsCustomAttribute.HasValue && attribute.IsCustomAttribute.Value;
        bool hasBeenModified = attribute.ModifiedOn.HasValue && attribute.CreatedOn.HasValue && attribute.ModifiedOn != attribute.CreatedOn;

        return (isCustomField || hasBeenModified);
    };

    internal static string PrettyDescription(this string description) =>
        description
            .Replace("\"", @"”")
            .Replace("\n", " ");
}
