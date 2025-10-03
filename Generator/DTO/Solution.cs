namespace Generator.DTO;

public record Solution(
    string Name,
    IEnumerable<SolutionComponent> Components);
