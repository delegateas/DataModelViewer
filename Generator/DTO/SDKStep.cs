using Microsoft.Xrm.Sdk;

namespace Generator.DTO;

public record SDKStep(
        string Id,
        string Name,
        string FilteringAttributes,
        string PrimaryObjectTypeCode,
        string SdkMessageName,
        OptionSetValue State) : Analyzeable();
