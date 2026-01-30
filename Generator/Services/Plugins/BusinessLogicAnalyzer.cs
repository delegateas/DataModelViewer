using Generator.DTO.Dependencies;
using Generator.DTO.Dependencies.Plugins;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Generator.Services.Plugins;

/// <summary>
/// Analyzes Manager and Service classes in BusinessLogic folder to find entity/attribute usage.
/// </summary>
public class BusinessLogicAnalyzer
{
    private readonly EntityMetadataParser _metadataParser;
    private readonly bool _verbose;

    public BusinessLogicAnalyzer(EntityMetadataParser metadataParser, bool verbose = false)
    {
        _metadataParser = metadataParser;
        _verbose = verbose;
    }

    /// <summary>
    /// Analyzes all business logic files in a directory
    /// </summary>
    public async Task<List<BusinessLogicInfo>> AnalyzeDirectoryAsync(string businessLogicDirectory)
    {
        var results = new List<BusinessLogicInfo>();

        var csFiles = Directory.GetFiles(businessLogicDirectory, "*.cs", SearchOption.AllDirectories)
            .Where(f => !f.Contains("obj") && !f.Contains("bin"));

        foreach (var file in csFiles)
        {
            try
            {
                var businessLogicInfo = await AnalyzeFileAsync(file);
                if (businessLogicInfo != null)
                {
                    results.Add(businessLogicInfo);
                }
            }
            catch (Exception ex)
            {
                if (_verbose)
                    Console.WriteLine($"Error analyzing {file}: {ex.Message}");
            }
        }

        return results;
    }

    /// <summary>
    /// Analyzes a single business logic file
    /// </summary>
    public async Task<BusinessLogicInfo?> AnalyzeFileAsync(string filePath)
    {
        var sourceText = await File.ReadAllTextAsync(filePath);
        var syntaxTree = CSharpSyntaxTree.ParseText(sourceText);
        var root = await syntaxTree.GetRootAsync();

        // Get the class name from the file
        var classDecl = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .FirstOrDefault();

        if (classDecl == null) return null;

        var className = classDecl.Identifier.Text;
        var fullName = SyntaxHelpers.GetFullTypeName(classDecl);

        // Use AttributeAccessVisitor to find all attribute accesses
        var visitor = new AttributeAccessVisitor(_metadataParser, _verbose);

        visitor.SetComponentType(ComponentType.Plugin);

        var accesses = visitor.Analyze(syntaxTree);

        var info = new BusinessLogicInfo(
            ClassName: className,
            FullName: fullName,
            FilePath: filePath
        )
        {
            AttributeAccesses = accesses
        };

        return info;
    }
}
