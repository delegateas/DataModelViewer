namespace Generator.DTO;

public enum ComponentType
{
    PowerAutomateFlow,
    Plugin,
    WebResource,
    WorkflowActivity,
    CustomApi
}
public enum LocationType
{
    Trigger
}

public enum OperationType
{
    Create,
    Read,
    Update,
    Delete,
    List,
    Other
}

public record AttributeUsage(
    string Name,
    LocationType LocationType,
    OperationType OperationType,
    ComponentType ComponentType
);
