﻿namespace Generator.DTO;

public enum ComponentType
{
    PowerAutomateFlow,
    Plugin,
    WebResource,
    WorkflowActivity,
    CustomApi
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
    ComponentType ComponentType
);
