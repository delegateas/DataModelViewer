namespace Generator.Services.WebResources.Models;

/// <summary>
/// Represents a reference to a Dataverse attribute found in a web resource
/// </summary>
public record AttributeReference(string EntityName, string AttributeName, string Context, string Operation);
