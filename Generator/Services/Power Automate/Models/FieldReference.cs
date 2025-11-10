namespace Generator.Services.PowerAutomate.Models;

/// <summary>
/// Represents a reference to a Dataverse field found in a flow
/// </summary>
public record FieldReference(string EntityName, string FieldName, string Context);
