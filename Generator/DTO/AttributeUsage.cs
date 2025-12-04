namespace Generator.DTO;

public enum ComponentType
{
    PowerAutomateFlow,
    Plugin,
    WebResource,
    WorkflowActivity,
    CustomApi,
    BusinessRule,
    ClassicWorkflow
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
    string Usage,
    OperationType OperationType,
    ComponentType ComponentType,
    bool IsFromDependencyAnalysis
)
{
    public static OperationType MapSdkMessageToOperationType(string sdkMessageName)
    {
        return sdkMessageName?.ToLowerInvariant() switch
        {
            "create" => OperationType.Create,
            "update" => OperationType.Update,
            "delete" => OperationType.Delete,
            "retrieve" => OperationType.Read,
            "retrievemultiple" => OperationType.List,
            "upsert" => OperationType.Update,
            "merge" => OperationType.Update,
            _ => OperationType.Other
        };
    }
};
