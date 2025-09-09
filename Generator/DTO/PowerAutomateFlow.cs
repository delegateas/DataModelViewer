namespace Generator.DTO;

public record PowerAutomateFlow(
    string Id,
    string Name,
    string ClientData) : Analyzeable();
