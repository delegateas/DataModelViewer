using Microsoft.Xrm.Sdk.Metadata;

namespace Generator;

public static class MetadataExtensions
{
    public static IEnumerable<AttributeMetadata> GetRelevantAttributes(this EntityMetadata entity, HashSet<Guid> attributesInSolution, Dictionary<Guid, int> rootComponentBehaviour)
    {
        // If rootcomponentbehaviour is 0 that means all attributes are included in the solution and we cannot find them via solutioncomponents, even if they are there.
        var attributesToFilter =
            rootComponentBehaviour[entity.MetadataId!.Value] == 0
                ? entity.Attributes.ToList()
                : entity.Attributes.Where(a => a.MetadataId != null && attributesInSolution.Contains(a.MetadataId!.Value)).ToList();

        return attributesToFilter;
    }

    internal static string PrettyDescription(this string description) =>
        description
            .Replace("\"", @"”")
            .Replace("\n", " ");
}
