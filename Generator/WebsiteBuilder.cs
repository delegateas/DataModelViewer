using Generator.DTO;
using Generator.DTO.Warnings;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;

namespace Generator;

internal class WebsiteBuilder
{
    private readonly IConfiguration configuration;
    private readonly IEnumerable<Record> records;
    private readonly IEnumerable<SolutionWarning> warnings;
    private readonly IEnumerable<Solution> solutions;
    private readonly string OutputFolder;

    public WebsiteBuilder(IConfiguration configuration, IEnumerable<Record> records, IEnumerable<SolutionWarning> warnings, IEnumerable<Solution> components)
    {
        this.configuration = configuration;
        this.records = records;
        this.warnings = warnings;
        this.solutions = components;

        // Assuming execution in bin/xxx/net8.0
        OutputFolder = configuration["OutputFolder"] ?? Path.Combine(System.Reflection.Assembly.GetExecutingAssembly().Location, "../../../../../Website/generated");
        Directory.CreateDirectory(OutputFolder);
    }
    internal void AddData()
    {
        var sb = new StringBuilder();
        sb.AppendLine("import { GroupType, SolutionWarningType, SolutionType } from \"@/lib/Types\";");
        sb.AppendLine("");
        sb.AppendLine($"export const LastSynched: Date = new Date('{DateTimeOffset.UtcNow:yyyy-MM-ddTHH:mm:ss.fffZ}');");
        var logoUrl = configuration.GetValue<string?>("Logo", defaultValue: null);
        var jsValue = logoUrl != null ? $"\"{logoUrl}\"" : "null";
        sb.AppendLine($"export const Logo: string | null = {jsValue};");
        sb.AppendLine("");

        // ENTITIES
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

        sb.AppendLine("]");

        // WARNINGS
        sb.AppendLine("");
        sb.AppendLine("export let SolutionWarnings: SolutionWarningType[] = [");
        foreach (var warning in warnings)
        {
            sb.AppendLine($"  {JsonConvert.SerializeObject(warning)},");
        }
        sb.AppendLine("]");

        // SOLUTION COMPONENTS
        sb.AppendLine("");
        sb.AppendLine("export let Solutions: SolutionType[] = [");
        foreach (var solution in solutions)
        {
            sb.AppendLine($"  {JsonConvert.SerializeObject(solution)},");
        }
        sb.AppendLine("]");

        File.WriteAllText(Path.Combine(OutputFolder, "Data.ts"), sb.ToString());
    }
}
