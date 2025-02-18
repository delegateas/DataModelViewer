export const TABLE_COLUMN_WIDTHS = {
    DISPLAY_NAME: "w-[15%]",
    SCHEMA_NAME: "w-[15%]",
    TYPE: "w-[40%]",
    DETAILS: "w-[5%]",
    DESCRIPTION: "w-[25%]",
} as const;

export const CELL_MAX_WIDTHS = {
    DEFAULT: "max-w-[200px]",
    DESCRIPTION: "max-w-[300px]",
} as const;

export const ICONS = {
    SIZE: {
        DEFAULT: "h-4 w-4",
    },
} as const;

export const PRIVILEGE_TOOLTIPS = {
    NONE: "None",
    BASIC: "User",
    LOCAL: "Business Unit",
    DEEP: "Parent: Child Business Units",
    GLOBAL: "Organization",
} as const;

export const ATTRIBUTE_TOOLTIPS = {
    REQUIRED: "Required",
    RECOMMENDED: "Recommended",
    AUDIT: "Audit Enabled",
    FIELD_SECURITY: "Field Security",
} as const;