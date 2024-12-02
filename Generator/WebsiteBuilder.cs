using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Generator;

internal class WebsiteBuilder
{

    internal static void AddList(IEnumerable<(EntityMetadata Entity, List<AttributeMetadata> Attributes)> entities)
    {
        var sb = new StringBuilder();
        sb.AppendLine("import Section from \"./Section\"");
        sb.AppendLine("import SectionRow from \"./SectionRow\"");
        sb.AppendLine(@"function List() {");
        sb.AppendLine(@"    return <>");

        foreach (var entity in entities)
        {
            sb.AppendLine($"<Section name=\"{entity.Entity.SchemaName}\">");
            foreach (var attr in entity.Attributes)
            {
                sb.AppendLine($"<SectionRow displayName=\"{attr.DisplayName.UserLocalizedLabel.Label}\" schemaName=\"{attr.SchemaName}\" type=\"{GetType(attr)}\" description={{\"{attr.Description.UserLocalizedLabel.Label.Replace("\"","\\\"")}\"}} />");
            }
            sb.AppendLine(@"</Section>");
        }

        sb.AppendLine(@"    </>");
        sb.AppendLine(@"}");
        sb.AppendLine(@"");
        sb.AppendLine(@"export default List");

        File.WriteAllText("../../../../Website/app/List.tsx", sb.ToString());
    }

    private static string GetType(AttributeMetadata attribute)
    {
        return attribute.AttributeTypeName.Value;
    }
}