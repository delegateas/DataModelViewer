using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

internal class DecimalAttribute : Attribute
{
    public int? Precision { get; }
    public decimal MinValue { get; }
    public decimal MaxValue { get; }

    public string Type { get; }

    public DecimalAttribute(MoneyAttributeMetadata metadata)
        : base(metadata)
    {
        Precision = metadata.Precision ?? 2;
        MinValue = (decimal) (metadata.MinValue ?? double.MinValue);
        MaxValue = (decimal) (metadata.MaxValue ?? double.MaxValue);
        Type = "Money";
    }

    public DecimalAttribute(DecimalAttributeMetadata metadata) : base(metadata)
    {
        Precision = metadata.Precision ?? 2;
        MinValue = metadata.MinValue ?? decimal.MinValue;
        MaxValue = metadata.MaxValue ?? decimal.MaxValue;
        Type = "Decimal";
    }
}
