using Generator.DTO;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;

namespace Generator;

internal class WebsiteBuilder
{
    private readonly IConfiguration configuration;
    private readonly List<Record> records;
    private readonly DTO.SolutionOverview solutionOverview;
    private readonly string OutputFolder;

    public WebsiteBuilder(IConfiguration configuration, List<Record> records, DTO.SolutionOverview solutionOverview)
    {
        this.configuration = configuration;
        this.records = records;
        this.solutionOverview = solutionOverview;

        // Assuming execution in bin/xxx/net8.0
        OutputFolder = configuration["OutputFolder"] ?? Path.Combine(System.Reflection.Assembly.GetExecutingAssembly().Location, "../../../../../Website/generated");
        Directory.CreateDirectory(OutputFolder);
    }
    internal void AddData()
    {
        var sb = new StringBuilder();
        sb.AppendLine("import { GroupType, SolutionOverviewType } from \"@/lib/Types\";");
        sb.AppendLine("");
        sb.AppendLine($"export const LastSynched: Date = new Date('{DateTimeOffset.UtcNow:yyyy-MM-ddTHH:mm:ss.fffZ}');");
        var logoUrl = configuration.GetValue<string?>("Logo", defaultValue: null);
        var jsValue = logoUrl != null ? $"\"{logoUrl}\"" : "null";
        sb.AppendLine($"export const Logo: string | null = {jsValue};");
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
            }
            sb.AppendLine("    ]");
            sb.AppendLine("  },");
        }

        sb.AppendLine("];");
        sb.AppendLine("");
        sb.AppendLine($"export const SolutionOverview: SolutionOverviewType = {JsonConvert.SerializeObject(solutionOverview)};");

        File.WriteAllText(Path.Combine(OutputFolder, "Data.ts"), sb.ToString());
    }
}
