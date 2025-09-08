namespace Generator.DTO;

internal record Solution(
    Guid SolutionId,
    string UniqueName,
    string DisplayName,
    List<SolutionComponent> Components);

internal record SolutionComponent(
    Guid ObjectId,
    int ComponentType,
    int RootComponentBehavior,
    string? ComponentTypeName,
    string? ComponentDisplayName);

internal record SolutionOverview(
    List<Solution> Solutions,
    List<ComponentOverlap> Overlaps);

internal record ComponentOverlap(
    List<string> SolutionNames,
    List<SolutionComponent> SharedComponents,
    int ComponentCount);