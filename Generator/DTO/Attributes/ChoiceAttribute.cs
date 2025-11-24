using Generator.Extensions;
using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

public class ChoiceAttribute : Attribute
{
    public IEnumerable<Option> Options { get; }

    public string Type { get; }

    public int? DefaultValue { get; }

    public ChoiceAttribute(PicklistAttributeMetadata metadata) : base(metadata)
    {
        Options = metadata.OptionSet.Options.Select(x => new Option(
            x.Label.ToLabelString(),
            x.Value,
            x.Color,
            x.Description.ToLabelString().PrettyDescription()));
        Type = "Single";
        DefaultValue = metadata.DefaultFormValue;
    }

    public ChoiceAttribute(StateAttributeMetadata metadata) : base(metadata)
    {
        Options = metadata.OptionSet.Options.Select(x => new Option(
            x.Label.ToLabelString(),
            x.Value,
            x.Color,
            x.Description.ToLabelString().PrettyDescription()));
        Type = "Single";
        DefaultValue = metadata.DefaultFormValue;
    }

    public ChoiceAttribute(MultiSelectPicklistAttributeMetadata metadata) : base(metadata)
    {
        Options = metadata.OptionSet.Options.Select(x => new Option(
            x.Label.ToLabelString(),
            x.Value,
            x.Color,
            x.Description.ToLabelString().PrettyDescription()));
        Type = "Multi";
        DefaultValue = metadata.DefaultFormValue;
    }
}
