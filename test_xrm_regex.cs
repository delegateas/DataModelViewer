using System;
using System.Text.RegularExpressions;

var code = @"
    var contact = await XrmQuery.retrieve(x => x.contacts, id)
        .select(x => [x.firstname, x.lastname, x.emailaddress1])
        .promise();
";

Console.WriteLine("Testing XrmQuery regex patterns...");
Console.WriteLine($"Code length: {code.Length}");
Console.WriteLine($"Code:\n{code}\n");

var arrowPattern = @"XrmQuery\.retrieve\s*\(\s*(?<param>x|[a-zA-Z_]\w*)\s*=>\s*(?<paramRef>x|[a-zA-Z_]\w*)\.(?<entity>[a-zA-Z_]\w*)";

var matches = Regex.Matches(code, arrowPattern, RegexOptions.IgnoreCase);
Console.WriteLine($"\nArrow pattern matches: {matches.Count}");

foreach (Match match in matches)
{
    Console.WriteLine($"  Match: '{match.Value}'");
    Console.WriteLine($"  Entity: '{match.Groups["entity"].Value}'");
}

// Test select pattern
var selectPattern = @"\.select\s*\(\s*(?<param>x|[a-zA-Z_]\w*)\s*=>\s*\[([^\]]+)\]";
var selectMatches = Regex.Matches(code, selectPattern, RegexOptions.IgnoreCase);
Console.WriteLine($"\nSelect pattern matches: {selectMatches.Count}");

foreach (Match match in selectMatches)
{
    Console.WriteLine($"  Match: '{match.Value}'");
    Console.WriteLine($"  Content: '{match.Groups[2].Value}'");
}
