using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class DateTimeAttribute : Attribute
{
    public string Format { get; }
    public string Behavior { get; }

    public DateTimeAttribute(DateTimeAttributeMetadata metadata)
        : base(metadata)
    {
        Format = GetFormat(metadata.Format);
        Behavior = metadata.DateTimeBehavior.Value;
    }

    private string GetFormat(DateTimeFormat? format) => format switch
    {
        DateTimeFormat.DateOnly => "Date",
        DateTimeFormat.DateAndTime => "Date & Time",
        _ => "Unknown"
    };
}
