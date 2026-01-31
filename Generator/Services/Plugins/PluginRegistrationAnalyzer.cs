using Generator.DTO.Dependencies.Plugins;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Generator.Services.Plugins;

public class PluginRegistrationAnalyzer
{
    private readonly EntityMetadataParser _metadataParser;
    private readonly bool _verbose;

    public PluginRegistrationAnalyzer(EntityMetadataParser metadataParser, bool verbose = false)
    {
        _metadataParser = metadataParser;
        _verbose = verbose;
    }

    /// <summary>
    /// Analyzes all plugin files in a directory
    /// </summary>
    public async Task<List<PluginStepInfo>> AnalyzeDirectoryAsync(string pluginsDirectory)
    {
        var results = new List<PluginStepInfo>();

        var root = Path.GetFullPath(pluginsDirectory);

        var csFiles = Directory.GetFiles(root, "*.cs", SearchOption.AllDirectories)
            .Where(f => !f.Split(Path.DirectorySeparatorChar).Contains("obj")
                     && !f.Split(Path.DirectorySeparatorChar).Contains("bin"));

        foreach (var file in csFiles)
        {
            try
            {
                var pluginSteps = await AnalyzeFileAsync(file);
                results.AddRange(pluginSteps);
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
    /// Analyzes a single plugin file
    /// </summary>
    public async Task<List<PluginStepInfo>> AnalyzeFileAsync(string filePath)
    {
        var results = new List<PluginStepInfo>();

        var sourceText = await File.ReadAllTextAsync(filePath);
        var syntaxTree = CSharpSyntaxTree.ParseText(sourceText);
        var root = await syntaxTree.GetRootAsync();

        // Find all class declarations that might be plugins
        var classDeclarations = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Where(IsPluginClass);

        foreach (var classDecl in classDeclarations)
        {
            var pluginSteps = AnalyzePluginClass(classDecl, filePath, root);
            results.AddRange(pluginSteps);
        }

        return results;
    }

    private static bool IsPluginClass(ClassDeclarationSyntax classDecl)
    {
        // Check if the class inherits from Plugin or CustomAPI
        var baseList = classDecl.BaseList?.Types
            .Select(t => t.Type.ToString())
            .ToList() ?? new List<string>();

        return baseList.Contains("Plugin") || baseList.Contains("CustomAPI");
    }

    private List<PluginStepInfo> AnalyzePluginClass(ClassDeclarationSyntax classDecl, string filePath, SyntaxNode root)
    {
        var results = new List<PluginStepInfo>();

        var className = classDecl.Identifier.Text;
        var fullName = SyntaxHelpers.GetFullTypeName(classDecl);

        // Find Manager/Service usage for the entire class (shared across all steps)
        var (usesManager, usesService) = ParseManagerServiceUsage(classDecl);

        // Find RegisterPluginStep invocations
        var registerCalls = classDecl.DescendantNodes()
            .OfType<InvocationExpressionSyntax>()
            .Where(IsRegisterPluginStepCall);

        foreach (var registerCall in registerCalls)
        {
            var baseInfo = ParseRegisterPluginStepBase(registerCall, className, fullName, filePath);
            if (baseInfo != null)
            {
                // Parse fluent builder chain for additional info
                var (executionMode, filteredAttributes, images) = ParseFluentBuilderChain(registerCall, baseInfo.Value.entityClassName);

                // Create the final record with all values
                var stepInfo = new PluginStepInfo(
                    ClassName: className,
                    FullName: fullName,
                    FilePath: filePath,
                    EntityClassName: baseInfo.Value.entityClassName,
                    EntityLogicalName: baseInfo.Value.entityLogicalName,
                    EventOperation: baseInfo.Value.eventOperation,
                    ExecutionStage: baseInfo.Value.executionStage,
                    ExecutionMode: executionMode,
                    UsesManager: usesManager,
                    UsesService: usesService
                )
                {
                    FilteredAttributes = filteredAttributes,
                    Images = images
                };

                results.Add(stepInfo);
            }
        }

        return results;
    }

    private static bool IsRegisterPluginStepCall(InvocationExpressionSyntax invocation)
    {
        // Check for RegisterPluginStep<T>(...) pattern
        if (invocation.Expression is MemberAccessExpressionSyntax memberAccess)
        {
            var memberName = memberAccess.Name;
            if (memberName is GenericNameSyntax genericName)
            {
                return genericName.Identifier.Text == "RegisterPluginStep";
            }
        }

        // Check for direct RegisterPluginStep<T>(...) call (from 'this')
        if (invocation.Expression is GenericNameSyntax directGenericName)
        {
            return directGenericName.Identifier.Text == "RegisterPluginStep";
        }

        return false;
    }

    private (string entityClassName, string entityLogicalName, string eventOperation, string executionStage)?
        ParseRegisterPluginStepBase(InvocationExpressionSyntax invocation,
            string className, string fullName, string filePath)
    {
        // Extract the generic type argument (entity type)
        GenericNameSyntax? genericName = null;

        if (invocation.Expression is MemberAccessExpressionSyntax memberAccess)
        {
            genericName = memberAccess.Name as GenericNameSyntax;
        }
        else if (invocation.Expression is GenericNameSyntax directGeneric)
        {
            genericName = directGeneric;
        }

        if (genericName == null) return null;

        var entityClassName = genericName.TypeArgumentList.Arguments.FirstOrDefault()?.ToString();
        if (entityClassName == null) return null;

        // Get entity logical name from metadata
        var entity = _metadataParser.GetEntityByClassName(entityClassName);
        var entityLogicalName = entity?.LogicalName ?? entityClassName.ToLowerInvariant();

        // Parse arguments: EventOperation, ExecutionStage, Action
        var args = invocation.ArgumentList.Arguments.ToList();
        if (args.Count < 3) return null;

        var eventOperation = ExtractEnumValue(args[0].Expression);
        var executionStage = ExtractEnumValue(args[1].Expression);

        return (
            entityClassName,
            entityLogicalName,
            eventOperation ?? "Unknown",
            executionStage ?? "Unknown"
        );
    }

    private (string executionMode, List<string> filteredAttributes, List<ImageInfo> images)
        ParseFluentBuilderChain(InvocationExpressionSyntax registerCall, string entityClassName)
    {
        var executionMode = "Synchronous";
        var filteredAttributes = new List<string>();
        var images = new List<ImageInfo>();

        // Walk up the syntax tree to find chained method calls
        var current = registerCall.Parent;

        while (current != null)
        {
            if (current is MemberAccessExpressionSyntax memberAccess &&
                memberAccess.Parent is InvocationExpressionSyntax chainedInvocation)
            {
                var methodName = memberAccess.Name.Identifier.Text;

                switch (methodName)
                {
                    case "AddFilteredAttributes":
                        ParseFilteredAttributes(chainedInvocation, entityClassName, filteredAttributes);
                        break;

                    case "AddImage":
                        ParseImage(chainedInvocation, entityClassName, images);
                        break;

                    case "SetExecutionMode":
                        var mode = ExtractEnumValue(chainedInvocation.ArgumentList.Arguments.FirstOrDefault()?.Expression);
                        if (mode != null)
                            executionMode = mode;
                        break;
                }

                current = chainedInvocation.Parent;
            }
            else
            {
                current = current.Parent;
            }
        }

        return (executionMode, filteredAttributes, images);
    }

    private void ParseFilteredAttributes(InvocationExpressionSyntax invocation, string entityClassName, List<string> filteredAttributes)
    {
        foreach (var arg in invocation.ArgumentList.Arguments)
        {
            // Handle collection expression: [ent => ent.Prop1, ent => ent.Prop2, ...]
            if (arg.Expression is CollectionExpressionSyntax collectionExpr)
            {
                foreach (var element in collectionExpr.Elements)
                {
                    if (element is ExpressionElementSyntax exprElement &&
                        exprElement.Expression is SimpleLambdaExpressionSyntax lambda)
                    {
                        AddAttributeFromLambda(lambda, entityClassName, filteredAttributes);
                    }
                }
            }
            // Handle direct lambda expressions: x => x.PropertyName
            else if (arg.Expression is SimpleLambdaExpressionSyntax lambda)
            {
                AddAttributeFromLambda(lambda, entityClassName, filteredAttributes);
            }
        }
    }

    private void AddAttributeFromLambda(SimpleLambdaExpressionSyntax lambda, string entityClassName, List<string> attributes)
    {
        var propertyName = ExtractPropertyFromLambda(lambda);
        if (propertyName != null)
        {
            var logicalName = _metadataParser.GetAttributeLogicalName(entityClassName, propertyName);
            if (logicalName != null)
                attributes.Add(logicalName);
        }
    }

    private void ParseImage(InvocationExpressionSyntax invocation, string entityClassName, List<ImageInfo> images)
    {
        var args = invocation.ArgumentList.Arguments.ToList();
        if (args.Count == 0) return;

        // First argument is ImageType enum
        var imageType = ExtractEnumValue(args[0].Expression) ?? "PreImage";

        var imageInfo = new ImageInfo(
            Name: imageType,
            ImageType: imageType
        );

        // Remaining arguments might be attribute lambdas or a collection of lambdas
        for (int i = 1; i < args.Count; i++)
        {
            // Handle collection expression: [ent => ent.Prop1, ent => ent.Prop2, ...]
            if (args[i].Expression is CollectionExpressionSyntax collectionExpr)
            {
                foreach (var element in collectionExpr.Elements)
                {
                    if (element is ExpressionElementSyntax exprElement &&
                        exprElement.Expression is SimpleLambdaExpressionSyntax lambda)
                    {
                        AddAttributeFromLambda(lambda, entityClassName, imageInfo.Attributes);
                    }
                }
            }
            // Handle direct lambda expression
            else if (args[i].Expression is SimpleLambdaExpressionSyntax lambda)
            {
                AddAttributeFromLambda(lambda, entityClassName, imageInfo.Attributes);
            }
        }

        images.Add(imageInfo);
    }

    private (string? usesManager, string? usesService) ParseManagerServiceUsage(ClassDeclarationSyntax classDecl)
    {
        string? usesManager = null;
        string? usesService = null;

        // Look for CreatePluginManager<T>() or CreatePluginManagerWithManagedIdentity<T>()
        var createManagerCalls = classDecl.DescendantNodes()
            .OfType<InvocationExpressionSyntax>()
            .Where(i => i.Expression.ToString().Contains("CreatePluginManager"));

        foreach (var call in createManagerCalls)
        {
            GenericNameSyntax? genericName = null;

            if (call.Expression is MemberAccessExpressionSyntax ma &&
                ma.Name is GenericNameSyntax g1)
            {
                genericName = g1;
            }
            else if (call.Expression is GenericNameSyntax g2)
            {
                genericName = g2;
            }

            if (genericName != null)
            {
                var managerType = genericName.TypeArgumentList.Arguments.FirstOrDefault()?.ToString();
                if (managerType != null)
                {
                    usesManager = managerType;
                    break;
                }
            }
        }

        // Look for GetRequiredService<T>() calls
        var serviceCalls = classDecl.DescendantNodes()
            .OfType<InvocationExpressionSyntax>()
            .Where(i => i.Expression.ToString().Contains("GetRequiredService"));

        foreach (var call in serviceCalls)
        {
            GenericNameSyntax? genericName = null;

            if (call.Expression is MemberAccessExpressionSyntax ma &&
                ma.Name is GenericNameSyntax g1)
            {
                genericName = g1;
            }

            if (genericName != null)
            {
                var serviceType = genericName.TypeArgumentList.Arguments.FirstOrDefault()?.ToString();
                if (serviceType != null && serviceType.EndsWith("Service"))
                {
                    usesService = serviceType;
                    break;
                }
            }
        }

        return (usesManager, usesService);
    }

    private static string? ExtractPropertyFromLambda(SimpleLambdaExpressionSyntax lambda)
    {
        // x => x.PropertyName
        if (lambda.Body is MemberAccessExpressionSyntax memberAccess)
        {
            return memberAccess.Name.Identifier.Text;
        }

        return null;
    }

    private static string? ExtractEnumValue(ExpressionSyntax? expression)
    {
        if (expression == null) return null;

        // EventOperation.Update -> "Update"
        if (expression is MemberAccessExpressionSyntax memberAccess)
        {
            return memberAccess.Name.Identifier.Text;
        }

        return expression.ToString();
    }

}
