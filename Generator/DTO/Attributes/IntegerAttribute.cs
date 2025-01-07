using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class IntegerAttribute : Attribute
{
    public string Format { get; }
    public int MinValue { get; }
    public int MaxValue { get; }

    public IntegerAttribute(IntegerAttributeMetadata metadata)
        : base(metadata)
    {
        Format = metadata.Format switch
        {
            IntegerFormat.None => "Integer",
            IntegerFormat.Duration => "Duration",
            IntegerFormat.TimeZone => "TimeZone",
            IntegerFormat.Language => "Language",
            IntegerFormat.Locale => "Locale",
            _ => "Unknown"
        };
        MinValue = metadata.MinValue ?? int.MinValue;
        MaxValue = metadata.MaxValue ?? int.MaxValue;
    }
}
