using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;

namespace Generator.Services;

public class PowerAutomateFlowAnalyzer : BaseComponentAnalyzer
{
    private readonly HttpClient _httpClient;
    private readonly string _environmentUrl;

    public PowerAutomateFlowAnalyzer(ServiceClient service, HttpClient httpClient, string environmentUrl)
        : base(service)
    {
        _httpClient = httpClient;
        _environmentUrl = environmentUrl;
    }

    public override ComponentType SupportedType => ComponentType.PowerAutomateFlow;

    public override async Task AnalyzeComponentAsync(Entity flow, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
    }
}
