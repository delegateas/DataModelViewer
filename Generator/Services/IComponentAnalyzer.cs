using Generator.DTO;
using Microsoft.Xrm.Sdk;

namespace Generator.Services;

public interface IComponentAnalyzer
{
    public ComponentType SupportedType { get; }
    public Task AnalyzeComponentAsync(Entity component, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages);
}
