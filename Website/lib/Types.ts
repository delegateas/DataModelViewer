export type SolutionWarningType = {
    Type: WarningType,
    Message: string,
}

export enum WarningType {
    Attribute,
    WebResource
}

export type GroupType = {
    Name: string,
    Entities: EntityType[]
}

export const enum OwnershipType {
    None = 0,
    UserOwned = 1,
    TeamOwned = 2,
    BusinessOwned = 4,
    OrganizationOwned = 8,
    BusinessParented = 16
}

export type SolutionInfoType = {
    Id: string,
    Name: string,
}

export type EntityType = {
    DisplayName: string,
    SchemaName: string,
    Description: string | null,
    Group: string | null,
    IsAuditEnabled: boolean,
    IsActivity: boolean,
    IsNotesEnabled: boolean,
    IsCustom: boolean,
    Ownership: OwnershipType,
    Attributes: AttributeType[],
    Relationships: RelationshipType[],
    SecurityRoles: SecurityRole[],
    Keys: Key[],
    IconBase64: string | null,
    visibleAttributeSchemaNames?: string[],
    PublisherName?: string,
    PublisherPrefix?: string,
    Solutions: SolutionInfoType[],

}

/// Solution component types matching Dataverse codes
/// See: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/solutioncomponent
export const enum SolutionComponentTypeEnum {
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
    RequirementResourcePreference = 10019,
    RequirementStatus = 10020,
    SchedulingParameter = 10025,
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

/// Solution component data for insights view
export type SolutionComponentDataType = {
    Name: string;
    SchemaName: string;
    ComponentType: SolutionComponentTypeEnum;
    ObjectId: string;
    IsExplicit: boolean;
    RelatedTable?: string | null;
}

/// Collection of solution components grouped by solution
export type SolutionComponentCollectionType = {
    SolutionId: string;
    SolutionName: string;
    Components: SolutionComponentDataType[];
}

/// Component type categories for UI grouping
export const ComponentTypeCategories: Record<string, SolutionComponentTypeEnum[]> = {
    'Data Model': [
        SolutionComponentTypeEnum.Entity,
        SolutionComponentTypeEnum.Attribute,
        SolutionComponentTypeEnum.Relationship,
        SolutionComponentTypeEnum.OptionSet,
        SolutionComponentTypeEnum.EntityKey,
        SolutionComponentTypeEnum.HierarchyRule,
        SolutionComponentTypeEnum.Dataflow,
        SolutionComponentTypeEnum.DVFileSearch,
        SolutionComponentTypeEnum.DVFileSearchAttribute,
        SolutionComponentTypeEnum.DVFileSearchEntity,
    ],
    'User Interface': [
        SolutionComponentTypeEnum.SystemForm,
        SolutionComponentTypeEnum.SavedQuery,
        SolutionComponentTypeEnum.SavedQueryVisualization,
        SolutionComponentTypeEnum.SiteMap,
        SolutionComponentTypeEnum.CustomControl,
        SolutionComponentTypeEnum.RibbonCustomization,
    ],
    'Apps': [
        SolutionComponentTypeEnum.ModelDrivenApp,
        SolutionComponentTypeEnum.CanvasApp,
        SolutionComponentTypeEnum.AppAction,
        SolutionComponentTypeEnum.AppActionRule,
    ],
    'Code': [
        SolutionComponentTypeEnum.Workflow,
        SolutionComponentTypeEnum.PluginAssembly,
        SolutionComponentTypeEnum.SDKMessageProcessingStep,
        SolutionComponentTypeEnum.WebResource,
        SolutionComponentTypeEnum.CustomAPI,
        SolutionComponentTypeEnum.CustomAPIRequestParameter,
        SolutionComponentTypeEnum.CustomAPIResponseProperty,
        SolutionComponentTypeEnum.PluginPackage,
        SolutionComponentTypeEnum.FxExpression,
    ],
    'Security': [
        SolutionComponentTypeEnum.SecurityRole,
        SolutionComponentTypeEnum.FieldSecurityProfile,
    ],
    'Configuration': [
        SolutionComponentTypeEnum.EnvironmentVariableDefinition,
        SolutionComponentTypeEnum.EnvironmentVariableValue,
        SolutionComponentTypeEnum.ConnectionReference,
        SolutionComponentTypeEnum.ConnectionRole,
        SolutionComponentTypeEnum.ConnectionRoleObjectTypeCode,
        SolutionComponentTypeEnum.OrganizationSetting,
        SolutionComponentTypeEnum.AISkillConfig,
    ],
    'Scheduling': [
        SolutionComponentTypeEnum.RequirementResourcePreference,
        SolutionComponentTypeEnum.RequirementStatus,
        SolutionComponentTypeEnum.SchedulingParameter,
    ],
};

/// Human-readable labels for component types
export const ComponentTypeLabels: Record<SolutionComponentTypeEnum, string> = {
    [SolutionComponentTypeEnum.Entity]: 'Table',
    [SolutionComponentTypeEnum.Attribute]: 'Column',
    [SolutionComponentTypeEnum.OptionSet]: 'Choice',
    [SolutionComponentTypeEnum.Relationship]: 'Relationship',
    [SolutionComponentTypeEnum.EntityKey]: 'Key',
    [SolutionComponentTypeEnum.SecurityRole]: 'Security Role',
    [SolutionComponentTypeEnum.SavedQuery]: 'View',
    [SolutionComponentTypeEnum.Workflow]: 'Cloud Flow',
    [SolutionComponentTypeEnum.RibbonCustomization]: 'Ribbon',
    [SolutionComponentTypeEnum.SavedQueryVisualization]: 'Chart',
    [SolutionComponentTypeEnum.SystemForm]: 'Form',
    [SolutionComponentTypeEnum.WebResource]: 'Web Resource',
    [SolutionComponentTypeEnum.SiteMap]: 'Site Map',
    [SolutionComponentTypeEnum.ConnectionRole]: 'Connection Role',
    [SolutionComponentTypeEnum.HierarchyRule]: 'Hierarchy Rule',
    [SolutionComponentTypeEnum.CustomControl]: 'Custom Control',
    [SolutionComponentTypeEnum.FieldSecurityProfile]: 'Field Security',
    [SolutionComponentTypeEnum.ModelDrivenApp]: 'Model-driven App',
    [SolutionComponentTypeEnum.PluginAssembly]: 'Plugin Assembly',
    [SolutionComponentTypeEnum.SDKMessageProcessingStep]: 'Plugin Step',
    [SolutionComponentTypeEnum.CanvasApp]: 'Canvas App',
    [SolutionComponentTypeEnum.ConnectionReference]: 'Connection Reference',
    [SolutionComponentTypeEnum.EnvironmentVariableDefinition]: 'Environment Variable',
    [SolutionComponentTypeEnum.EnvironmentVariableValue]: 'Env Variable Value',
    [SolutionComponentTypeEnum.Dataflow]: 'Dataflow',
    [SolutionComponentTypeEnum.ConnectionRoleObjectTypeCode]: 'Connection Role Type',
    [SolutionComponentTypeEnum.CustomAPI]: 'Custom API',
    [SolutionComponentTypeEnum.CustomAPIRequestParameter]: 'Custom API Parameter',
    [SolutionComponentTypeEnum.CustomAPIResponseProperty]: 'Custom API Response',
    [SolutionComponentTypeEnum.PluginPackage]: 'Plugin Package',
    [SolutionComponentTypeEnum.OrganizationSetting]: 'Org Setting',
    [SolutionComponentTypeEnum.AppAction]: 'App Action',
    [SolutionComponentTypeEnum.AppActionRule]: 'App Action Rule',
    [SolutionComponentTypeEnum.FxExpression]: 'Fx Expression',
    [SolutionComponentTypeEnum.DVFileSearch]: 'DV File Search',
    [SolutionComponentTypeEnum.DVFileSearchAttribute]: 'DV File Search Attr',
    [SolutionComponentTypeEnum.DVFileSearchEntity]: 'DV File Search Entity',
    [SolutionComponentTypeEnum.AISkillConfig]: 'AI Skill Config',
    [SolutionComponentTypeEnum.RequirementResourcePreference]: 'Resource Preference',
    [SolutionComponentTypeEnum.RequirementStatus]: 'Requirement Status',
    [SolutionComponentTypeEnum.SchedulingParameter]: 'Scheduling Parameter',
};

export const enum RequiredLevel {
    None = 0,
    SystemRequired = 1,
    ApplicationRequired = 2,
    Recommended = 3
}

export const enum CalculationMethods {
    Calculated = 0,
    Rollup = 1,
}

export enum ComponentType {
    PowerAutomateFlow,
    Plugin,
    WebResource,
    WorkflowActivity,
    CustomApi,
    BusinessRule,
    ClassicWorkflow
}

export enum OperationType {
    Create,
    Read,
    Update,
    Delete,
    List,
    Other
}

export type UsageType = {
    Name: string,
    ComponentType: ComponentType,
    Usage: string,
    OperationType: OperationType,
    IsFromDependencyAnalysis: boolean
}

export type BaseAttribute = {
    AttributeUsages: UsageType[];
    IsPrimaryId: boolean;
    IsPrimaryName: boolean;
    IsCustomAttribute: boolean;
    IsStandardFieldModified: boolean;
    DisplayName: string;
    SchemaName: string;
    Description: string | null;
    RequiredLevel: RequiredLevel;
    IsAuditEnabled: boolean;
    IsColumnSecured: boolean;
    CalculationMethod: CalculationMethods | null;
    IsExplicit: boolean;
    PublisherName?: string,
    PublisherPrefix?: string,
    Solutions: SolutionInfoType[],
}

export type ChoiceAttributeType = BaseAttribute & {
    AttributeType: "ChoiceAttribute",
    Type: "Single" | "Multi",
    DefaultValue: number | null,
    GlobalOptionSetName: string | null,
    Options: {
        Name: string,
        Value: number,
        Color: string | null,
        Description: string | null
    }[]
}

export type DateTimeAttributeType = BaseAttribute & {
    AttributeType: "DateTimeAttribute",
    Format: string,
    Behavior: string,
}

export type GenericAttributeType = BaseAttribute & {
    AttributeType: "GenericAttribute",
    Type: string,
}

export type IntegerAttributeType = BaseAttribute & {
    AttributeType: "IntegerAttribute",
    Format: string,
    MinValue: number,
    MaxValue: number,
}

export type ExtendedEntityInformationType = {
    Name: string;
    IsInSolution: boolean;
}

export type LookupAttributeType = BaseAttribute & {
    AttributeType: "LookupAttribute",
    Targets: ExtendedEntityInformationType[],
}

export type DecimalAttributeType = BaseAttribute & {
    AttributeType: "DecimalAttribute",
    Precision: number,
    MinValue: number,
    MaxValue: number,
    Type: "Money" | "Decimal",
}

export type StatusOption = {
    Name: string,
    Value: number,
    State: string
}
export type StatusAttributeType = BaseAttribute & {
    AttributeType: "StatusAttribute",
    Options: StatusOption[]
}

export type StringAttributeType = BaseAttribute & {
    AttributeType: "StringAttribute",
    Format: string,
    MaxLength: number,
}

export type BooleanAttributeType = BaseAttribute & {
    AttributeType: "BooleanAttribute",
    TrueLabel: string,
    FalseLabel: string,
    DefaultValue: boolean,
}

export type FileAttributeType = BaseAttribute & {
    AttributeType: "FileAttribute",
    MaxSize: number,
}

export type AttributeType =
    | ChoiceAttributeType
    | DateTimeAttributeType
    | GenericAttributeType
    | IntegerAttributeType
    | LookupAttributeType
    | DecimalAttributeType
    | StatusAttributeType
    | StringAttributeType
    | BooleanAttributeType
    | FileAttributeType

export enum CascadeType {
    None = 0,
    Cascade = 1,
    Active = 2,
    UserOwned = 3,
    RemoveLink = 4,
    Restrict = 5,
}

export type CascadeConfigurationType = {
    Assign: CascadeType,
    Delete: CascadeType,
    Archive: CascadeType,
    Merge: CascadeType,
    Reparent: CascadeType,
    Share: CascadeType,
    Unshare: CascadeType,
    RollupView: CascadeType,
}

export type RelationshipType = {
    IsCustom: boolean,
    Name: string,
    TableSchema: string,
    LookupDisplayName: string,
    RelationshipSchema: string,
    IntersectEntitySchemaName: string | null,
    IsExplicit: boolean,
    RelationshipType: "N:N" | "1:N" | "N:1",
    CascadeConfiguration: CascadeConfigurationType | null,
    PublisherName?: string,
    PublisherPrefix?: string,
    Solutions: SolutionInfoType[],
}

export enum PrivilegeDepth {
    None = 0,
    Basic = 1,
    Local = 2,
    Deep = 4,
    Global = 8,
}

export type SecurityRole = {
    Name: string,
    LogicalName: string,
    Create: PrivilegeDepth | null,
    Read: PrivilegeDepth | null,
    Write: PrivilegeDepth | null,
    Delete: PrivilegeDepth | null,
    Append: PrivilegeDepth | null,
    AppendTo: PrivilegeDepth | null,
    Assign: PrivilegeDepth | null,
    Share: PrivilegeDepth | null
}

export type Key = {
    Name: string,
    LogicalName: string,
    KeyAttributes: string[]
}
