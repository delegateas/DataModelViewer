using Generator.DTO;

namespace Generator.Services;

public interface IComponentAnalyzer<T> where T : Analyzeable
{
    public ComponentType SupportedType { get; }
    public Task AnalyzeComponentAsync(T component, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages);
}
