#!/usr/bin/dotnet run
#:package Microsoft.PowerPlatform.Dataverse.Client@1.2.*
#:package Azure.Identity@1.13.*
#:package System.Text.RegularExpressions@*

using System.Text.RegularExpressions;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Azure.Core;
using Azure.Identity;

// Validate command-line arguments
if (args.Length == 0)
{
    Console.WriteLine("Error: Please provide a folder path as argument.");
    Console.WriteLine("Usage: dotnet run addWebResourceDescription.cs <folder-path> [dataverse-url]");
    Console.WriteLine("  folder-path: Path to TypeScript project folder");
    Console.WriteLine("  dataverse-url: (Optional) Dataverse URL, or set DATAVERSE_URL environment variable");
    return 1;
}

string folderPath = args[0];
string? dataverseUrl = args.Length > 1 ? args[1] : Environment.GetEnvironmentVariable("DATAVERSE_URL");

if (!Directory.Exists(folderPath))
{
    Console.WriteLine($"Error: Directory '{folderPath}' does not exist.");
    return 1;
}

if (string.IsNullOrEmpty(dataverseUrl))
{
    Console.WriteLine("Error: Dataverse URL not provided.");
    Console.WriteLine("Either pass as second argument or set DATAVERSE_URL environment variable.");
    Console.WriteLine("Example: https://yourorg.crm.dynamics.com");
    return 1;
}

Console.WriteLine($"Scanning TypeScript files in: {folderPath}");
Console.WriteLine("=" .PadRight(80, '='));

// Find all TypeScript files recursively
var tsFiles = Directory.GetFiles(folderPath, "*.ts", SearchOption.AllDirectories);
Console.WriteLine($"Found {tsFiles.Length} TypeScript files.\n");

// Dictionary to store file -> entity schema name mapping
var fileEntityMap = new Dictionary<string, string>();
var filesWithoutEntity = new List<string>();

// Regex patterns
// Pattern 1: Match exported onLoad function
var onLoadPattern = @"export\s+(?:async\s+)?function\s+onLoad\s*\([\s\S]*?\)\s*\{([\s\S]*?)\n\}";

// Pattern 2: Match getFormContext() with angle bracket cast: <Form.Entity.Type.Name>x.getFormContext()
var castAngleBracketPattern = @"<(Form\.[^>]+)>\s*\w+\.getFormContext\(\)";

// Pattern 3: Match getFormContext() with 'as' cast: x.getFormContext() as Form.Entity.Type.Name
var castAsPattern = @"\w+\.getFormContext\(\)\s+as\s+(Form\.\S+)";

// Pattern 4: Extract entity schema name from Form.<entity>.<formtype>.<formname>
var formTypePattern = @"Form\.(\w+)\.(?:Main|QuickCreate|QuickView|Card)\.";

foreach (var tsFile in tsFiles)
{
    var relativePath = Path.GetRelativePath(folderPath, tsFile);
    var content = File.ReadAllText(tsFile);

    // Find exported onLoad function
    var onLoadMatch = Regex.Match(content, onLoadPattern, RegexOptions.Multiline);

    if (!onLoadMatch.Success)
    {
        continue; // Skip files without exported onLoad
    }

    var onLoadBody = onLoadMatch.Groups[1].Value;

    // Look for getFormContext() with casts
    string? formType = null;

    // Try angle bracket cast first
    var angleBracketMatch = Regex.Match(onLoadBody, castAngleBracketPattern);
    if (angleBracketMatch.Success)
    {
        formType = angleBracketMatch.Groups[1].Value;
    }
    else
    {
        // Try 'as' cast
        var asMatch = Regex.Match(onLoadBody, castAsPattern);
        if (asMatch.Success)
        {
            formType = asMatch.Groups[1].Value;
        }
    }

    if (formType == null)
    {
        filesWithoutEntity.Add(relativePath);
        Console.WriteLine($"⚠️  {relativePath}");
        Console.WriteLine($"    Warning: Could not find getFormContext() cast in onLoad function.\n");
        continue;
    }

    // Extract entity schema name from Form.<entity>.<formtype>.<formname>
    var entityMatch = Regex.Match(formType, formTypePattern);
    if (!entityMatch.Success)
    {
        filesWithoutEntity.Add(relativePath);
        Console.WriteLine($"⚠️  {relativePath}");
        Console.WriteLine($"    Warning: Could not parse entity from form type: {formType}\n");
        continue;
    }

    string entitySchemaName = entityMatch.Groups[1].Value;
    fileEntityMap[relativePath] = entitySchemaName;

    Console.WriteLine($"✓  {relativePath}");
    Console.WriteLine($"    Entity: {entitySchemaName} (from {formType})\n");
}

Console.WriteLine("=" .PadRight(80, '='));
Console.WriteLine($"Summary: {fileEntityMap.Count} files with entity mapping, {filesWithoutEntity.Count} warnings.\n");

if (fileEntityMap.Count == 0)
{
    Console.WriteLine("No files to update. Exiting.");
    return 0;
}

// Connect to Dataverse using Azure Default Credentials
Console.WriteLine("Connecting to Dataverse...");
Console.WriteLine($"Target URL: {dataverseUrl}");
Console.WriteLine("Authentication: Azure DefaultAzureCredential (Azure CLI, Managed Identity, etc.)\n");

try
{
    // Token provider function using DefaultAzureCredential
    var credential = new DefaultAzureCredential();

    string TokenProviderFunction(string url)
    {
        var scope = $"{GetCoreUrl(url)}/.default";
        var tokenRequestContext = new TokenRequestContext([scope]);
        var token = credential.GetToken(tokenRequestContext, CancellationToken.None);
        return token.Token;
    }

    using var serviceClient = new ServiceClient(
        instanceUrl: new Uri(dataverseUrl),
        tokenProviderFunction: url => TokenProviderFunction(url));

    if (!serviceClient.IsReady)
    {
        Console.WriteLine($"Error: Failed to connect to Dataverse.");
        Console.WriteLine($"Details: {serviceClient.LastError}");
        Console.WriteLine("\nTroubleshooting:");
        Console.WriteLine("  - Run 'az login' to authenticate with Azure CLI");
        Console.WriteLine("  - Verify you have access to the Dataverse environment");
        Console.WriteLine("  - Check the Dataverse URL is correct");
        return 1;
    }

    Console.WriteLine($"✓ Connected to: {serviceClient.ConnectedOrgFriendlyName}");
    Console.WriteLine($"  Organization ID: {serviceClient.ConnectedOrgId}\n");

    // Extract root folder name from file location
    string rootFolderName = new DirectoryInfo(folderPath).Name;
    Console.WriteLine($"Root folder: {rootFolderName}");
    Console.WriteLine($"Querying all webresources starting with: {rootFolderName}/\n");

    // Query all webresources that start with the root folder name
    var query = new QueryExpression("webresource")
    {
        ColumnSet = new ColumnSet("webresourceid", "name", "description"),
        Criteria = new FilterExpression
        {
            Conditions =
            {
                new ConditionExpression("name", ConditionOperator.BeginsWith, rootFolderName)
            }
        }
    };

    var allWebResources = serviceClient.RetrieveMultiple(query);
    Console.WriteLine($"Found {allWebResources.Entities.Count} webresources in Dataverse.\n");

    // Create dictionary of webresources by name for fast lookup
    var webResourceDict = allWebResources.Entities
        .ToDictionary(
            wr => wr.GetAttributeValue<string>("name"),
            wr => wr,
            StringComparer.OrdinalIgnoreCase);

    // Update webresources
    int updatedCount = 0;
    int notFoundCount = 0;
    int alreadyTaggedCount = 0;

    foreach (var kvp in fileEntityMap)
    {
        var relativePath = kvp.Key;
        var entitySchemaName = kvp.Value;

        // Convert file path to webresource name (replace backslashes with forward slashes, .ts -> .js)
        string webResourceName = $"{rootFolderName}/{relativePath.Replace('\\', '/').Replace(".ts", ".js")}";

        // Try to find the webresource in our dictionary
        if (!webResourceDict.TryGetValue(webResourceName, out var webResource))
        {
            // Try without root folder prefix (in case files already include it)
            string alternativeName = relativePath.Replace('\\', '/').Replace(".ts", ".js");
            if (!webResourceDict.TryGetValue(alternativeName, out webResource))
            {
                Console.WriteLine($"⚠️  Webresource not found: {webResourceName}");
                notFoundCount++;
                continue;
            }
            else
            {
                webResourceName = alternativeName; // Use the alternative name for display
            }
        }

        var currentDescription = webResource.GetAttributeValue<string>("description") ?? "";

        // Check if ENTITY tag already exists
        string entityTag = $"ENTITY:{entitySchemaName}";
        if (currentDescription.Contains(entityTag))
        {
            Console.WriteLine($"ℹ️  Already tagged: {webResourceName}");
            alreadyTaggedCount++;
            continue;
        }

        // Append entity tag to description
        string newDescription = string.IsNullOrWhiteSpace(currentDescription)
            ? entityTag
            : $"{currentDescription}\n{entityTag}";

        webResource["description"] = newDescription;

        serviceClient.Update(webResource);
        updatedCount++;

        Console.WriteLine($"✓  Updated: {webResourceName} -> {entityTag}");
    }

    Console.WriteLine("\n" + "=".PadRight(80, '='));
    Console.WriteLine($"Update complete:");
    Console.WriteLine($"  {updatedCount} updated");
    Console.WriteLine($"  {alreadyTaggedCount} already tagged");
    Console.WriteLine($"  {notFoundCount} not found");
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
    return 1;
}

return 0;

// Helper function to extract core URL from Dataverse URL
static string GetCoreUrl(string dataverseUrl)
{
    var uri = new Uri(dataverseUrl);
    return $"{uri.Scheme}://{uri.Host}";
}
