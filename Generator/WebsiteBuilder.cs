using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Generator;

internal class WebsiteBuilder
{

    internal static void AddList(IEnumerable<(EntityMetadata Entity, int RootComponentBehavior, List<AttributeMetadata> Attributes)> entities)
    {
        var sb = new StringBuilder();
        sb.AppendLine("import Section from \"../components/Section\"");
        sb.AppendLine("import SectionRow from \"../components/SectionRow\"");
        sb.AppendLine(@"function List() {");
        sb.AppendLine(@"    return <>");

        foreach (var entity in entities.OrderBy(x => x.Entity.DisplayName.UserLocalizedLabel.Label))
        {
            sb.AppendLine($"        <Section displayName=\"{entity.Entity.DisplayName.UserLocalizedLabel?.Label}\" schemaName=\"{entity.Entity.SchemaName}\">");
            var attributes =
                entity.Attributes
                .Where(x => x.DisplayName.UserLocalizedLabel != null && x.Description.UserLocalizedLabel != null)
                .OrderBy(x => x.DisplayName.UserLocalizedLabel.Label);

            foreach (var attr in attributes)
            {
                sb.AppendLine($"            <SectionRow displayName=\"{attr.DisplayName.UserLocalizedLabel.Label}\" schemaName=\"{attr.SchemaName}\" type=\"{GetType(attr)}\" description={{\"{attr.Description.UserLocalizedLabel.Label.Replace("\"","\\\"").Replace("\n","\\n")}\"}} />");
            }
            sb.AppendLine(@"</Section>");
        }

        sb.AppendLine(@"    </>");
        sb.AppendLine(@"}");
        sb.AppendLine(@"");
        sb.AppendLine(@"export default List");

        File.WriteAllText("../../../../Website/generated/List.tsx", sb.ToString());
    }

    internal static void AddNav(IEnumerable<(EntityMetadata Entity, int RootComponentBehavior, List<AttributeMetadata> Attributes)> entities)
    {
        var sb = new StringBuilder();
        sb.AppendLine("import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';");
        sb.AppendLine("import { Link } from 'lucide-react';");
        sb.AppendLine(@"function NavItems() {");
        sb.AppendLine(@"    return <SidebarGroup>");
        sb.AppendLine("        <SidebarGroupLabel>Ungrouped</SidebarGroupLabel>");
        sb.AppendLine("        <SidebarGroupContent className=\"flex flex-col\">");
        sb.AppendLine("            <SidebarMenu>");

        foreach (var entity in entities.OrderBy(x => x.Entity.DisplayName.UserLocalizedLabel.Label))
        {
            sb.AppendLine($"                <SidebarMenuItem key=\"{entity.Entity.SchemaName}\">");
            sb.AppendLine("                    <SidebarMenuButton asChild>");
            sb.AppendLine($"                        <a href=\"#{entity.Entity.SchemaName}\"><Link /><span>{entity.Entity.DisplayName.UserLocalizedLabel.Label}</span></a>");
            sb.AppendLine(@"                    </SidebarMenuButton>");
            sb.AppendLine(@"                </SidebarMenuItem>");
        }

        sb.AppendLine(@"            </SidebarMenu>");
        sb.AppendLine(@"        </SidebarGroupContent>");
        sb.AppendLine(@"    </SidebarGroup>");
        sb.AppendLine(@"}");
        sb.AppendLine(@"");
        sb.AppendLine(@"export default NavItems");

        File.WriteAllText("../../../../Website/generated/NavItems.tsx", sb.ToString());
    }

    private static string GetType(AttributeMetadata attribute)
    {
        return attribute.AttributeTypeName.Value;
    }
}