using Microsoft.Xrm.Sdk.Metadata;
using Attribute = Generator.DTO.Attributes.Attribute;

namespace Generator.DTO;

internal record Record(
    string DisplayName, 
    string SchemaName,
    string? Group,
    string? Description,
    bool IsAuditEnabled,
    bool IsActivity,
    OwnershipTypes Ownership,
    bool IsNotesEnabled,
    List<Attribute> Attributes);

