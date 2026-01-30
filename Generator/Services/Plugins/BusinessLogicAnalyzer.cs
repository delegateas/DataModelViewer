using Generator.DTO.Dependencies;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Generator.Services.Plugins;

/// <summary>
/// Analyzes Manager and Service classes in BusinessLogic folder to find entity/attribute usage.
/// </summary>
public class BusinessLogicAnalyzer
{
    private readonly EntityMetadataParser _metadataParser;

    public BusinessLogicAnalyzer(EntityMetadataParser metadataParser)
    {
        _metadataParser = metadataParser;
    }

    /// <summary>
    /// Analyzes all business logic files in a directory and adds usages directly to attributeUsages.
    /// Returns the number of files analyzed.
    /// </summary>
    public async Task<int> AnalyzeDirectoryAsync(
        string businessLogicDirectory,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        var csFiles = Directory.GetFiles(businessLogicDirectory, "*.cs", SearchOption.AllDirectories)
            .Where(f => !f.Contains("obj") && !f.Contains("bin"));

        int count = 0;
        foreach (var file in csFiles)
        {
            if (await AnalyzeFileAsync(file, attributeUsages))
                count++;
        }

        return count;
    }

    /// <summary>
    /// Analyzes a single business logic file and adds usages directly to attributeUsages.
    /// Returns true if the file contained a class that was analyzed.
    /// </summary>
    public async Task<bool> AnalyzeFileAsync(
        string filePath,
        Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        var sourceText = await File.ReadAllTextAsync(filePath);
        var syntaxTree = CSharpSyntaxTree.ParseText(sourceText);
        var root = await syntaxTree.GetRootAsync();

        // Get the class name from the file
        var classDecl = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .FirstOrDefault();

        if (classDecl == null) return false;

        var className = classDecl.Identifier.Text;

        // Use AttributeAccessVisitor to find all attribute accesses and add directly to attributeUsages
        var visitor = new AttributeAccessVisitor(_metadataParser);
        visitor.SetComponentType(ComponentType.Plugin);
        visitor.Analyze(syntaxTree, className, attributeUsages);

        return true;
    }
}
