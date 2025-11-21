using Generator.DTO;
using Generator.DTO.Attributes;
using Microsoft.Extensions.Logging;
using Microsoft.Xrm.Sdk.Metadata;
using Attribute = Generator.DTO.Attributes.Attribute;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for mapping Dataverse AttributeMetadata to DTO Attribute objects
    /// </summary>
    internal class AttributeMappingService
    {
        private readonly ILogger<AttributeMappingService> logger;

        public AttributeMappingService(ILogger<AttributeMappingService> logger)
        {
            this.logger = logger;
        }

        /// <summary>
        /// Maps AttributeMetadata to the appropriate DTO Attribute type
        /// </summary>
        public Attribute MapAttribute(
            AttributeMetadata metadata,
            EntityMetadata entity,
            Dictionary<string, ExtendedEntityInformation> logicalToSchema,
            Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages,
            Dictionary<Guid, ComponentInclusionType> inclusionMap)
        {
            Attribute attr = metadata switch
            {
                PicklistAttributeMetadata picklist => new ChoiceAttribute(picklist),
                MultiSelectPicklistAttributeMetadata multiSelect => new ChoiceAttribute(multiSelect),
                LookupAttributeMetadata lookup => new LookupAttribute(lookup, logicalToSchema),
                StateAttributeMetadata state => new ChoiceAttribute(state),
                StatusAttributeMetadata status => new StatusAttribute(status, (StateAttributeMetadata)entity.Attributes.First(x => x is StateAttributeMetadata)),
                StringAttributeMetadata stringMetadata => new StringAttribute(stringMetadata),
                IntegerAttributeMetadata integer => new IntegerAttribute(integer),
                DateTimeAttributeMetadata dateTimeAttributeMetadata => new DateTimeAttribute(dateTimeAttributeMetadata),
                MoneyAttributeMetadata money => new DecimalAttribute(money),
                DecimalAttributeMetadata decimalAttribute => new DecimalAttribute(decimalAttribute),
                MemoAttributeMetadata memo => new StringAttribute(memo),
                BooleanAttributeMetadata booleanAttribute => new BooleanAttribute(booleanAttribute),
                FileAttributeMetadata fileAttribute => new FileAttribute(fileAttribute),
                _ => new GenericAttribute(metadata)
            };

            var schemaname = attributeUsages.GetValueOrDefault(entity.LogicalName)?.GetValueOrDefault(metadata.LogicalName) ?? [];
            // also check the plural name, as some workflows like Power Automate use collectionname
            var pluralname = attributeUsages.GetValueOrDefault(entity.LogicalCollectionName)?.GetValueOrDefault(metadata.LogicalName) ?? [];

            attr.AttributeUsages = [.. schemaname, .. pluralname];
            attr.InclusionType = inclusionMap.GetValueOrDefault(metadata.MetadataId!.Value, ComponentInclusionType.Implicit);
            attr.IsStandardFieldModified = MetadataExtensions.StandardFieldHasChanged(metadata, entity.DisplayName.UserLocalizedLabel?.Label ?? string.Empty, entity.IsCustomEntity ?? false);

            return attr;
        }
    }
}
