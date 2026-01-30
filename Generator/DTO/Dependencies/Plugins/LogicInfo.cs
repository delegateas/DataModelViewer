namespace Generator.DTO.Dependencies.Plugins;


/// <summary>
/// Represents a Manager or Service class and its entity/attribute dependencies
/// </summary>
public record BusinessLogicInfo(
    string ClassName,
    string FullName,
    string FilePath
)
{
    public Dictionary<string, List<AttributeUsage>> AttributeAccesses { get; set; } = new();
}

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
