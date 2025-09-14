using Microsoft.Xrm.Sdk;

namespace Generator.DTO;

public record Form(string Id, string Name, string EntityName);

public record WebResource(
    IEnumerable<Form> dependencies,
    string Id,
    string Name,
    string Content,
    OptionSetValue WebResourceType,
    string? Description = null) : Analyzeable();
