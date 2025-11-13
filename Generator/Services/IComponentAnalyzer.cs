using Generator.DTO;
using Generator.DTO.Warnings;

namespace Generator.Services;

public interface IComponentAnalyzer<T> where T : Analyzeable
{
    ComponentType SupportedType { get; }
    Task AnalyzeComponentAsync(T component, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages, List<SolutionWarning> warnings);
}
