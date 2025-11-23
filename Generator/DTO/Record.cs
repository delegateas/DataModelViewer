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
    bool IsCustom,
    string PublisherName,
    string PublisherPrefix,
    OwnershipTypes Ownership,
    bool IsNotesEnabled,
    List<Attribute> Attributes,
    List<Relationship> Relationships,
    List<SecurityRole> SecurityRoles,
    List<Key> Keys,
    string? IconBase64);

