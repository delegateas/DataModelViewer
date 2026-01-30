namespace Generator.DTO.Dependencies.Plugins;

public enum AccessPatternType
{
    PropertyRead,
    PropertyWrite,
    LinqWhere,
    LinqSelect,
    GetAttributeValue,
    SetAttributeValue,
    AnonymousObject,
    ObjectInitializerWrite,
    ObjectInitializerRead,
    FilteredAttribute,
    ImageAttribute
}
