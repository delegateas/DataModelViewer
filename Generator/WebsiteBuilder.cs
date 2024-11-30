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
        sb.AppendLine(@"function List() {");
        sb.AppendLine(@"    return <>");

        foreach (var entity in entities)
        {
            sb.AppendLine($"<Section name=\"{entity.Entity.SchemaName}\">");
            foreach (var attr in entity.Attributes)
            {
                sb.AppendLine($"        <p  className=\"py-2 border-b-2\">{attr.DisplayName.UserLocalizedLabel.Label}</p>");
                sb.AppendLine($"        <p  className=\"py-2 border-b-2\">{attr.SchemaName}</p>");
                sb.AppendLine($"        <p  className=\"py-2 border-b-2\">{GetType(attr)}</p>");
                sb.AppendLine($"        <p  className=\"py-2 border-b-2\">{attr.Description.UserLocalizedLabel.Label}</p>");
            }
            sb.AppendLine(@"</Section>");
        }

        sb.AppendLine(@"    </>");
        sb.AppendLine(@"}");
        sb.AppendLine(@"");
        sb.AppendLine(@"export default List");

        File.WriteAllText("C:\\git\\DataModelViewer\\DataModelViewer\\Website\\src\\List.tsx", sb.ToString());
    }

    private static string GetType(AttributeMetadata attribute)
    {
        return attribute.AttributeTypeName.Value;
    }
}