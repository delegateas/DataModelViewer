using Microsoft.Xrm.Sdk.Metadata;

namespace Generator;

public static class MetadataExtensions
{
    public static IEnumerable<AttributeMetadata> GetRelevantAttributes(this EntityMetadata entity) => entity.Attributes.Where(IsCustomOrModifiedStandardField);

    private static readonly Func<AttributeMetadata, bool> IsCustomOrModifiedStandardField = (AttributeMetadata attribute) =>
    {
        bool isCustomField = attribute.IsCustomAttribute.HasValue && attribute.IsCustomAttribute.Value;
        bool hasBeenModified = attribute.ModifiedOn.HasValue && attribute.CreatedOn.HasValue && attribute.ModifiedOn != attribute.CreatedOn;

        return isCustomField || hasBeenModified;
    };

    internal static string PrettyDescription(this string description) =>
        description
            .Replace("\"", @"”")
            .Replace("\n", " ");
}
