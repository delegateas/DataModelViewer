export type GroupType = {
    Name: string,
    Entities: EntityType[]
}

export type EntityType = {
    DisplayName: string,
    SchemaName: string,
    Description: string | null,
    Attributes: AttributeType[]
}

export type BaseAttribute = {
    DisplayName: string,
    SchemaName: string,
    Description: string | null,
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

export type LookupAttributeType = BaseAttribute & {
    AttributeType: "LookupAttribute",
    Targets: {
        Name: string,
        ShouldLink: boolean,
    }[],
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