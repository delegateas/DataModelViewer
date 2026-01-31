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

                // Parse attributes used in the Execute method logic
                var usedAttributesInLogic = ParseExecuteMethodAttributeUsage(
                    registerCall, classDecl, baseInfo.Value.entityClassName);

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
                    Images = images,
                    UsedAttributesInLogic = usedAttributesInLogic
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

    /// <summary>
    /// Analyzes the Execute method (or lambda) to find attribute accesses on entity variables.
    /// Tracks variables from GetTargetEntity&lt;T&gt;, GetPreImage&lt;T&gt;, GetPostImage&lt;T&gt; calls.
    /// </summary>
    private List<string> ParseExecuteMethodAttributeUsage(
        InvocationExpressionSyntax registerCall,
        ClassDeclarationSyntax classDecl,
        string entityClassName)
    {
        var usedAttributes = new HashSet<string>();

        // Get the third argument (the Action/method reference)
        var args = registerCall.ArgumentList.Arguments.ToList();
        if (args.Count < 3)
        {
            if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] Less than 3 args, skipping");
            return new List<string>();
        }

        var executeArg = args[2].Expression;
        if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] Arg type: {executeArg.GetType().Name}");

        // Find the method body to analyze
        SyntaxNode? methodBody = null;
        string? methodName = null;

        if (executeArg is IdentifierNameSyntax methodRef)
        {
            // Direct method reference: Execute
            methodName = methodRef.Identifier.Text;
            var method = classDecl.DescendantNodes()
                .OfType<MethodDeclarationSyntax>()
                .FirstOrDefault(m => m.Identifier.Text == methodName);

            if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] Looking for method '{methodName}', found: {method != null}");

            methodBody = method?.Body ?? (SyntaxNode?)method?.ExpressionBody;
        }
        else if (executeArg is SimpleLambdaExpressionSyntax simpleLambda)
        {
            // Lambda: context => ...
            methodBody = simpleLambda.Body;
            if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] Found SimpleLambda");
        }
        else if (executeArg is ParenthesizedLambdaExpressionSyntax parenLambda)
        {
            // Lambda: (context) => ...
            methodBody = parenLambda.Body;
            if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] Found ParenthesizedLambda");
        }

        if (methodBody == null)
        {
            if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] No method body found");
            return new List<string>();
        }

        // Build a map of variable names to entity types
        // from GetTargetEntity<T>(), GetPreImage<T>(), GetPostImage<T>() calls
        var entityVariables = BuildEntityVariableMap(methodBody, entityClassName);

        if (_verbose)
        {
            Console.WriteLine($"  [ExecuteAnalysis] Entity variables found: {entityVariables.Count}");
            foreach (var kv in entityVariables)
                Console.WriteLine($"    - {kv.Key} -> {kv.Value}");
        }

        // Find all member access expressions and check if they access entity properties
        var memberAccesses = methodBody.DescendantNodes()
            .OfType<MemberAccessExpressionSyntax>()
            .ToList();

        if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] Member accesses found: {memberAccesses.Count}");

        foreach (var memberAccess in memberAccesses)
        {
            var entityType = GetEntityTypeFromExpression(memberAccess.Expression, entityVariables);
            if (entityType != null)
            {
                var propertyName = memberAccess.Name.Identifier.Text;
                var logicalName = _metadataParser.GetAttributeLogicalName(entityType, propertyName);

                if (_verbose) Console.WriteLine($"    - {memberAccess.Expression}.{propertyName} -> entity: {entityType}, logical: {logicalName}");

                if (logicalName != null)
                {
                    usedAttributes.Add(logicalName);
                }
            }
        }

        if (_verbose) Console.WriteLine($"  [ExecuteAnalysis] Used attributes: {string.Join(", ", usedAttributes)}");

        return usedAttributes.ToList();
    }

    /// <summary>
    /// Builds a map of variable names to entity class names by finding
    /// GetTargetEntity&lt;T&gt;, GetPreImage&lt;T&gt;, GetPostImage&lt;T&gt; calls.
    /// </summary>
    private Dictionary<string, string> BuildEntityVariableMap(SyntaxNode methodBody, string defaultEntityType)
    {
        var map = new Dictionary<string, string>();

        // Find variable declarations with GetTargetEntity<T>, GetPreImage<T>, GetPostImage<T>
        var variableDeclarations = methodBody.DescendantNodes()
            .OfType<VariableDeclarationSyntax>()
            .ToList();

        if (_verbose) Console.WriteLine($"    [VarMap] Variable declarations found: {variableDeclarations.Count}");

        foreach (var varDecl in variableDeclarations)
        {
            foreach (var variable in varDecl.Variables)
            {
                var varName = variable.Identifier.Text;
                var initializer = variable.Initializer?.Value;

                if (_verbose) Console.WriteLine($"    [VarMap] Var '{varName}', initializer type: {initializer?.GetType().Name ?? "null"}");

                if (initializer == null) continue;

                // Check for GetTargetEntity<T>(), GetPreImage<T>(), GetPostImage<T>()
                var entityType = ExtractEntityTypeFromGetterCall(initializer);
                if (entityType != null)
                {
                    if (_verbose) Console.WriteLine($"    [VarMap] Found getter call: {varName} -> {entityType}");
                    map[varName] = entityType;
                    continue;
                }

                // Check for type cast patterns: (EntityType)something or something as EntityType
                entityType = ExtractEntityTypeFromCast(initializer);
                if (entityType != null)
                {
                    if (_verbose) Console.WriteLine($"    [VarMap] Found cast: {varName} -> {entityType}");
                    map[varName] = entityType;
                }
            }
        }

        // Also check assignment expressions (for variables declared earlier)
        var assignments = methodBody.DescendantNodes()
            .OfType<AssignmentExpressionSyntax>();

        foreach (var assignment in assignments)
        {
            if (assignment.Left is IdentifierNameSyntax identifier)
            {
                var varName = identifier.Identifier.Text;
                var entityType = ExtractEntityTypeFromGetterCall(assignment.Right);
                if (entityType != null)
                {
                    map[varName] = entityType;
                    continue;
                }

                entityType = ExtractEntityTypeFromCast(assignment.Right);
                if (entityType != null)
                {
                    map[varName] = entityType;
                }
            }
        }

        // Fallback: use common variable naming patterns with the registered entity type
        var commonTargetNames = new[] { "target", "targetEntity", "entity", "Target" };
        var commonPreImageNames = new[] { "preImage", "preimage", "pre", "PreImage" };
        var commonPostImageNames = new[] { "postImage", "postimage", "post", "PostImage" };

        foreach (var name in commonTargetNames.Concat(commonPreImageNames).Concat(commonPostImageNames))
        {
            if (!map.ContainsKey(name))
            {
                // Check if this variable is used in the method
                var usedInMethod = methodBody.DescendantNodes()
                    .OfType<IdentifierNameSyntax>()
                    .Any(id => id.Identifier.Text == name);

                if (usedInMethod)
                {
                    if (_verbose) Console.WriteLine($"    [VarMap] Fallback: {name} -> {defaultEntityType}");
                    map[name] = defaultEntityType;
                }
            }
        }

        return map;
    }

    /// <summary>
    /// Extracts entity type from GetTargetEntity&lt;T&gt;(), GetPreImage&lt;T&gt;(), GetPostImage&lt;T&gt;() calls.
    /// </summary>
    private string? ExtractEntityTypeFromGetterCall(ExpressionSyntax expression)
    {
        // Handle invocation: GetTargetEntity<Account>()
        if (expression is InvocationExpressionSyntax invocation)
        {
            if (_verbose) Console.WriteLine($"      [GetterCall] Invocation expr type: {invocation.Expression.GetType().Name}, text: {invocation.Expression}");

            GenericNameSyntax? genericName = null;

            if (invocation.Expression is GenericNameSyntax directGeneric)
            {
                genericName = directGeneric;
            }
            else if (invocation.Expression is MemberAccessExpressionSyntax memberAccess &&
                     memberAccess.Name is GenericNameSyntax memberGeneric)
            {
                genericName = memberGeneric;
            }

            if (genericName != null)
            {
                var methodName = genericName.Identifier.Text;
                if (_verbose) Console.WriteLine($"      [GetterCall] Method name: {methodName}");

                if (methodName is "GetTargetEntity" or "GetPreImage" or "GetPostImage" or
                    "GetTarget" or "GetPreImageEntity" or "GetPostImageEntity")
                {
                    var entityType = genericName.TypeArgumentList.Arguments.FirstOrDefault()?.ToString();
                    if (_verbose) Console.WriteLine($"      [GetterCall] Matched! Entity type: {entityType}");
                    return entityType;
                }
            }
        }

        return null;
    }

    /// <summary>
    /// Extracts entity type from cast expressions: (Account)expr or expr as Account
    /// </summary>
    private string? ExtractEntityTypeFromCast(ExpressionSyntax expression)
    {
        // (Account)expression
        if (expression is CastExpressionSyntax cast)
        {
            var typeName = cast.Type.ToString();
            if (_metadataParser.GetEntityByClassName(typeName) != null)
            {
                return typeName;
            }
        }

        // expression as Account
        if (expression is BinaryExpressionSyntax binary &&
            binary.IsKind(SyntaxKind.AsExpression))
        {
            var typeName = binary.Right.ToString();
            if (_metadataParser.GetEntityByClassName(typeName) != null)
            {
                return typeName;
            }
        }

        return null;
    }

    /// <summary>
    /// Gets the entity type for an expression by checking if it's a known entity variable.
    /// </summary>
    private static string? GetEntityTypeFromExpression(
        ExpressionSyntax expression,
        Dictionary<string, string> entityVariables)
    {
        if (expression is IdentifierNameSyntax identifier)
        {
            var name = identifier.Identifier.Text;
            if (entityVariables.TryGetValue(name, out var entityType))
            {
                return entityType;
            }
        }

        return null;
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
