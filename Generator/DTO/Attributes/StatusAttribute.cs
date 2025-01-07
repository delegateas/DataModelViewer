using Microsoft.Xrm.Sdk.Metadata;
using Newtonsoft.Json;

namespace Generator.DTO.Attributes;

internal class StatusAttribute : Attribute
{
    public IEnumerable<StatusOption> Options { get; set; }

    public StatusAttribute(StatusAttributeMetadata metadata, StateAttributeMetadata stateAttribute)
        : base(metadata)
    {
        var stateToName =
            stateAttribute.OptionSet.Options
            .Where(x => x.Value != null)
            .ToDictionary(x => x.Value!.Value, x => x.Label.UserLocalizedLabel?.Label ?? string.Empty);

        Options = metadata.OptionSet.Options
            .Select(x => (StatusOptionMetadata)x)
            .Select(x => new StatusOption(
                x.Label.UserLocalizedLabel?.Label ?? string.Empty,
                x.Value,
                x.State == null ? "Unknown State" : stateToName[x.State.Value]));
    }
}
