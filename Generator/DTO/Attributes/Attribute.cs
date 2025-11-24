using Generator.Extensions;
using Microsoft.Xrm.Sdk.Metadata;

namespace Generator.DTO.Attributes;

public abstract class Attribute
{
    public bool IsStandardFieldModified { get; set; }
    public bool IsCustomAttribute { get; set; }
    public bool IsPrimaryId { get; set; }
    public bool IsPrimaryName { get; set; }
    public List<AttributeUsage> AttributeUsages { get; set; } = new List<AttributeUsage>();
    public bool IsExplicit { get; set; }
    public string PublisherName { get; set; }
    public string PublisherPrefix { get; set; }
    public List<SolutionInfo> Solutions { get; set; } = new List<SolutionInfo>();
    public string DisplayName { get; }
    public string SchemaName { get; }
    public string Description { get; }
    public string AttributeType => GetType().Name;
    public AttributeRequiredLevel RequiredLevel { get; }
    public bool IsAuditEnabled { get; }
    public bool IsColumnSecured { get; }
    public CalculationMethods? CalculationMethod { get; }

    protected Attribute(AttributeMetadata metadata)
    {
        IsPrimaryId = metadata.IsPrimaryId ?? false;
        IsPrimaryName = metadata.IsPrimaryName ?? false;
        IsCustomAttribute = metadata.IsCustomAttribute ?? false;
        DisplayName = metadata.DisplayName.ToLabelString();
        SchemaName = metadata.SchemaName;
        Description = metadata.Description.ToLabelString().PrettyDescription() ?? string.Empty;
        RequiredLevel = metadata.RequiredLevel.Value;
        IsAuditEnabled = metadata.IsAuditEnabled.Value;
        IsColumnSecured = metadata.IsSecured ?? false;
        CalculationMethod = GetCalculationMethod(metadata);
    }

    private CalculationMethods? GetCalculationMethod(AttributeMetadata metadata)
    {
        var definition = metadata switch
        {
            BooleanAttributeMetadata booleanAttribute => booleanAttribute.FormulaDefinition,
            DateTimeAttributeMetadata dateTimeAttribute => dateTimeAttribute.FormulaDefinition,
            DecimalAttributeMetadata decimalAttribute => decimalAttribute.FormulaDefinition,
            DoubleAttributeMetadata doubleAttribute => doubleAttribute.FormulaDefinition,
            IntegerAttributeMetadata integerAttribute => integerAttribute.FormulaDefinition,
            MoneyAttributeMetadata moneyAttribute => moneyAttribute.FormulaDefinition,
            PicklistAttributeMetadata picklistAttribute => picklistAttribute.FormulaDefinition,
            StringAttributeMetadata stringAttribute => stringAttribute.FormulaDefinition,
            _ => string.Empty
        };

        if (string.IsNullOrEmpty(definition))
            return null;

        return definition.Contains("RollupRuleStep")
            ? CalculationMethods.Rollup
            : CalculationMethods.Calculated;
    }
}
