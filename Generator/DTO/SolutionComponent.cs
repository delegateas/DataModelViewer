namespace Generator.DTO;

public enum SolutionComponentType
{
    Entity = 1,
    Attribute = 2,
    Relationship = 3,
}

public record SolutionComponent(
    string Name,
    string SchemaName,
    string Description,
    SolutionComponentType ComponentType);
