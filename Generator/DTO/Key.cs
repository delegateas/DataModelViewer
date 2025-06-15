namespace Generator.DTO;

public record Key(
    string Name,
    string LogicalName,
    string[] KeyAttributes);
