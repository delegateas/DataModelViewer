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
}

export const enum SolutionComponentTypeEnum {
    Entity = 1,
    Attribute = 2,
    Relationship = 3,
}

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
}

export type ChoiceAttributeType = BaseAttribute & {
    AttributeType: "ChoiceAttribute",
    Type: "Single" | "Multi",
    DefaultValue: number | null,
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
    IsExplicit: boolean,
    IsManyToMany: boolean,
    CascadeConfiguration: CascadeConfigurationType | null,
    PublisherName?: string,
    PublisherPrefix?: string,
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
