namespace Generator.DTO;

/// <summary>
/// Solution component types from Dataverse.
/// See: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/solutioncomponent
/// </summary>
public enum SolutionComponentType
{
    Entity = 1,
    Attribute = 2,
    OptionSet = 9,
    Relationship = 10,
    EntityKey = 14,
    SecurityRole = 20,
    SavedQuery = 26,
    Workflow = 29,
    RibbonCustomization = 50,
    SavedQueryVisualization = 59,
    SystemForm = 60,
    WebResource = 61,
    SiteMap = 62,
    ConnectionRole = 63,
    HierarchyRule = 65,
    CustomControl = 66,
    FieldSecurityProfile = 70,
    ModelDrivenApp = 80,
    PluginAssembly = 91,
    SDKMessageProcessingStep = 92,
    CanvasApp = 300,
    ConnectionReference = 372,
    EnvironmentVariableDefinition = 380,
    EnvironmentVariableValue = 381,
    Dataflow = 418,
    ConnectionRoleObjectTypeCode = 3233,
    CustomAPI = 10240,
    CustomAPIRequestParameter = 10241,
    CustomAPIResponseProperty = 10242,
    PluginPackage = 10639,
    OrganizationSetting = 10563,
    AppAction = 10645,
    AppActionRule = 10948,
    FxExpression = 11492,
    DVFileSearch = 11723,
    DVFileSearchAttribute = 11724,
    DVFileSearchEntity = 11725,
    AISkillConfig = 12075,
}

public record SolutionComponent(
    string Name,
    string SchemaName,
    string Description,
    SolutionComponentType ComponentType,
    string PublisherName,
    string PublisherPrefix);

/// <summary>
/// Represents a solution component with its solution membership info for the insights view.
/// </summary>
public record SolutionComponentData(
    string Name,
    string SchemaName,
    SolutionComponentType ComponentType,
    Guid ObjectId,
    bool IsExplicit,
    string? RelatedTable = null);

/// <summary>
/// Collection of solution components grouped by solution.
/// </summary>
public record SolutionComponentCollection(
    Guid SolutionId,
    string SolutionName,
    List<SolutionComponentData> Components);
