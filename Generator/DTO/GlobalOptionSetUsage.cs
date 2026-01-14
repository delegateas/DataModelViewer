namespace Generator.DTO;

internal record GlobalOptionSetUsageReference(
    string EntitySchemaName,
    string EntityDisplayName,
    string AttributeSchemaName,
    string AttributeDisplayName);

internal record GlobalOptionSetUsage(
    string Name,
    string DisplayName,
    List<GlobalOptionSetUsageReference> Usages);
