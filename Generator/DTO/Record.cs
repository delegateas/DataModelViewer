using Attribute = Generator.DTO.Attributes.Attribute;

namespace Generator.DTO;

internal record Record(
    string DisplayName, 
    string SchemaName,
    string? Group,
    string? Description,
    List<Attribute> Attributes);

