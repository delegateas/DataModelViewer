using System.Text.RegularExpressions;

var code = @"
    var accounts = await XrmQuery.retrieveMultiple(x => x.accounts)
        .select(x => [x.name, x.accountnumber, x.revenue])
        .promise();
";

// Test retrieveMultiple pattern
var arrowPattern = @"XrmQuery\.retrieveMultiple\s*\(\s*(?<param>x|[a-zA-Z_]\w*)\s*=>\s*(?<paramRef>x|[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)";
var match = Regex.Match(code, arrowPattern, RegexOptions.IgnoreCase);
Console.WriteLine($"retrieveMultiple match: {match.Success}");
if (match.Success)
{
    Console.WriteLine($"Entity: {match.Groups["entity"].Value}");
    Console.WriteLine($"StartPos: {match.Index}");

    // Extract chained code
    var startPos = match.Index;
    var maxLength = Math.Min(500, code.Length - startPos);
    var segment = code.Substring(startPos, maxLength);
    Console.WriteLine($"Chained segment:\n{segment}");

    // Test select pattern
    var selectPattern = @"\.select\s*\(\s*(?<param>x|[a-zA-Z_]\w*)\s*=>\s*\[([^\]]+)\]";
    var selectMatch = Regex.Match(segment, selectPattern, RegexOptions.IgnoreCase);
    Console.WriteLine($"\nselect match: {selectMatch.Success}");
    if (selectMatch.Success)
    {
        Console.WriteLine($"Select content: {selectMatch.Groups[2].Value}");
    }
}
