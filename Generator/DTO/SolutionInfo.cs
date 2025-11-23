namespace Generator.DTO;

/// <summary>
/// Represents solution membership information for a component (entity, attribute, or relationship)
/// </summary>
public record SolutionInfo(
    Guid Id,
    string Name);
