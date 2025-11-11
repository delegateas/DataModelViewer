namespace Generator.DTO;

public record Solution(
    string Name,
    string PublisherName,
    string PublisherPrefix,
    IEnumerable<SolutionComponent> Components);
