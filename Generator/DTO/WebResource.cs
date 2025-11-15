using Microsoft.Xrm.Sdk;

namespace Generator.DTO;

public record WebResource(
    string Id,
    string Name,
    string Content,
    OptionSetValue WebResourceType,
    string Description) : Analyzeable();
