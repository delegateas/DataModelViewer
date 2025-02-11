using Generator.DTO;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;

namespace Generator;

internal class WebsiteBuilder
{
    private readonly IConfiguration configuration;
    private readonly List<Record> records;
    private readonly string OutputFolder;

    public WebsiteBuilder(IConfiguration configuration, List<Record> records)
    {
        this.configuration = configuration;
        this.records = records;

        // Assuming execution in bin/xxx/net8.0
        OutputFolder = configuration["OutputFolder"] ?? Path.Combine(System.Reflection.Assembly.GetExecutingAssembly().Location, "../../../../../Website/generated");
        Directory.CreateDirectory(OutputFolder);
    }
    internal void AddData()
    {
        var sb = new StringBuilder();
        sb.AppendLine("import { GroupType } from \"@/lib/Types\";");
        sb.AppendLine("");
        sb.AppendLine("export let Groups: GroupType[] = [");
        var groups = records.GroupBy(x => x.Group).OrderBy(x => x.Key);
        foreach (var group in groups)
        {
            var groupName = group.Key ?? "Ungrouped";

            sb.AppendLine("  {");
            sb.AppendLine($"    \"Name\":\"{groupName}\",");

            sb.AppendLine("    \"Entities\":[");
            foreach (var entity in group.OrderBy(x => x.DisplayName))
            {
                sb.AppendLine($"      {JsonConvert.SerializeObject(entity)},");
                //sb.AppendLine("      {");
                //sb.AppendLine($"        \"DisplayName\":\"{entity.DisplayName}\",");
                //sb.AppendLine($"        \"SchemaName\":\"{entity.SchemaName}\",");
                //sb.AppendLine($"        \"Description\":\"{entity.Description}\",");
                //sb.AppendLine("        \"Attributes\":[");

                //var attributes =
                //    entity.Attributes
                //    .OrderBy(x => x.DisplayName);

                //foreach (var attr in attributes)
                //{
                //    sb.AppendLine($"          {JsonConvert.SerializeObject(attr)},");
                //}
                //sb.AppendLine("        ]");
                //sb.AppendLine("      },");
            }
            sb.AppendLine("    ]");
            sb.AppendLine("  },");
        }

        sb.AppendLine("]");

        File.WriteAllText(Path.Combine(OutputFolder, "Data.ts"), sb.ToString());
    }
}