using Generator.DTO.Dependencies;
using Generator.DTO.Dependencies.Plugins;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Generator.Services.Plugins;

/// <summary>
/// A Roslyn syntax walker that detects all patterns of entity attribute access
/// and determines the operation type (Create, Read, Update, Delete, List).
/// </summary>
public class AttributeAccessVisitor : CSharpSyntaxWalker
{
    private readonly EntityMetadataParser _metadataParser;
    private readonly HashSet<string> _entityClassNames;
    private Dictionary<string, Dictionary<string, List<AttributeUsage>>> _attributeUsages = new();
    private ComponentType _componentType = ComponentType.Plugin;
    private string _componentName = "";

    // Track lambda parameters to know which variables represent entities
    private readonly Dictionary<string, string> _lambdaParameterTypes = new();

    public AttributeAccessVisitor(EntityMetadataParser metadataParser)
    {
        _metadataParser = metadataParser;
        _entityClassNames = metadataParser.GetAllEntities()
            .Select(e => e.ClassName)
            .ToHashSet();
    }

    /// <summary>
    /// Sets the component type for all accesses found in subsequent analysis
    /// </summary>
    public void SetComponentType(ComponentType componentType)
    {
        _componentType = componentType;
    }

    /// <summary>
    /// Analyzes a syntax tree and adds all detected attribute accesses directly to the provided dictionary.
    /// </summary>
    public void Analyze(SyntaxTree syntaxTree, string componentName, Dictionary<string, Dictionary<string, List<AttributeUsage>>> attributeUsages)
    {
        _lambdaParameterTypes.Clear();
        _componentName = componentName;
        _attributeUsages = attributeUsages;
        Visit(syntaxTree.GetRoot());
    }

    /// <summary>
    /// Visit lambda expressions to track parameter types
    /// </summary>
    public override void VisitSimpleLambdaExpression(SimpleLambdaExpressionSyntax node)
    {
        var parameterName = node.Parameter.Identifier.Text;
        var inferredType = InferLambdaParameterType(node);

        if (inferredType != null && _entityClassNames.Contains(inferredType))
        {
            _lambdaParameterTypes[parameterName] = inferredType;
        }

        base.VisitSimpleLambdaExpression(node);
        _lambdaParameterTypes.Remove(parameterName);
    }

    public override void VisitParenthesizedLambdaExpression(ParenthesizedLambdaExpressionSyntax node)
    {
        foreach (var param in node.ParameterList.Parameters)
        {
            var parameterName = param.Identifier.Text;
            string? inferredType = param.Type?.ToString();

            if (inferredType != null && _entityClassNames.Contains(inferredType))
            {
                _lambdaParameterTypes[parameterName] = inferredType;
            }
        }

        base.VisitParenthesizedLambdaExpression(node);

        foreach (var param in node.ParameterList.Parameters)
        {
            _lambdaParameterTypes.Remove(param.Identifier.Text);
        }
    }

    /// <summary>
    /// Visit assignment expressions to detect writes: entity.Name = value
    /// </summary>
    public override void VisitAssignmentExpression(AssignmentExpressionSyntax node)
    {
        // Check if left side is a member access on an entity
        if (node.Left is MemberAccessExpressionSyntax memberAccess)
        {
            var propertyName = memberAccess.Name.Identifier.Text;
            var entityType = GetExpressionEntityType(memberAccess.Expression);

            if (entityType != null)
            {
                var entity = _metadataParser.GetEntityByClassName(entityType);
                var logicalName = _metadataParser.GetAttributeLogicalName(entityType, propertyName);

                if (entity != null && logicalName != null)
                {
                    // Determine if this is Create or Update based on context
                    var operationType = DetermineWriteOperationType(node);
                    RecordAccess(entity.LogicalName, logicalName, AccessPatternType.PropertyWrite,
                        operationType, "Property Write", node.GetLocation());
                }
            }
        }

        base.VisitAssignmentExpression(node);
    }

    /// <summary>
    /// Visit member access expressions (entity.PropertyName)
    /// </summary>
    public override void VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
    {
        // Skip if this is the left side of an assignment (handled by VisitAssignmentExpression)
        if (node.Parent is AssignmentExpressionSyntax assignment && assignment.Left == node)
        {
            base.VisitMemberAccessExpression(node);
            return;
        }

        TryRecordAttributeAccess(node);
        base.VisitMemberAccessExpression(node);
    }

    /// <summary>
    /// Visit method invocations to detect GetAttributeValue/SetAttributeValue calls
    /// </summary>
    public override void VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        if (node.Expression is MemberAccessExpressionSyntax memberAccess)
        {
            var methodName = memberAccess.Name.Identifier.Text;

            if (methodName == "GetAttributeValue")
            {
                HandleGetSetAttributeValue(node, memberAccess, isGet: true);
            }
            else if (methodName == "SetAttributeValue")
            {
                HandleGetSetAttributeValue(node, memberAccess, isGet: false);
            }
        }

        base.VisitInvocationExpression(node);
    }

    private void HandleGetSetAttributeValue(InvocationExpressionSyntax node,
        MemberAccessExpressionSyntax memberAccess, bool isGet)
    {
        var entityType = GetExpressionEntityType(memberAccess.Expression);
        if (entityType != null && node.ArgumentList.Arguments.Count > 0)
        {
            var firstArg = node.ArgumentList.Arguments[0].Expression;
            if (firstArg is LiteralExpressionSyntax literal &&
                literal.IsKind(SyntaxKind.StringLiteralExpression))
            {
                var attributeLogicalName = literal.Token.ValueText;
                var entity = _metadataParser.GetEntityByClassName(entityType);
                if (entity != null)
                {
                    var pattern = isGet ? AccessPatternType.GetAttributeValue : AccessPatternType.SetAttributeValue;
                    var operationType = isGet ? OperationType.Read : DetermineWriteOperationType(node);
                    var usage = isGet ? "GetAttributeValue" : "SetAttributeValue";

                    RecordAccess(entity.LogicalName, attributeLogicalName, pattern,
                        operationType, usage, node.GetLocation());
                }
            }
        }
    }

    /// <summary>
    /// Visit anonymous object creations: new { x.Id, x.Name }
    /// </summary>
    public override void VisitAnonymousObjectCreationExpression(AnonymousObjectCreationExpressionSyntax node)
    {
        foreach (var initializer in node.Initializers)
        {
            if (initializer.Expression is MemberAccessExpressionSyntax memberAccess)
            {
                TryRecordAttributeAccess(memberAccess, AccessPatternType.AnonymousObject,
                    OperationType.Read, "Anonymous Select");
            }
        }

        base.VisitAnonymousObjectCreationExpression(node);
    }

    /// <summary>
    /// Visit object initializers: new Account { Name = value }
    /// </summary>
    public override void VisitInitializerExpression(InitializerExpressionSyntax node)
    {
        if (node.IsKind(SyntaxKind.ObjectInitializerExpression))
        {
            var objectCreation = node.Parent as ObjectCreationExpressionSyntax;
            var typeName = objectCreation?.Type.ToString();

            if (typeName != null && _entityClassNames.Contains(typeName))
            {
                var entity = _metadataParser.GetEntityByClassName(typeName);
                if (entity != null)
                {
                    // Determine if this is a Create or Update context
                    var operationType = DetermineObjectInitializerOperationType(node);

                    foreach (var expression in node.Expressions)
                    {
                        if (expression is AssignmentExpressionSyntax assignment)
                        {
                            var propertyName = (assignment.Left as IdentifierNameSyntax)?.Identifier.Text;
                            if (propertyName != null)
                            {
                                var logicalName = _metadataParser.GetAttributeLogicalName(typeName, propertyName);
                                if (logicalName != null)
                                {
                                    var usage = operationType == OperationType.Create ? "Object Init (Create)" : "Object Init (Update)";
                                    RecordAccess(entity.LogicalName, logicalName,
                                        AccessPatternType.ObjectInitializerWrite, operationType, usage,
                                        assignment.GetLocation());
                                }
                            }

                            // Also check if the right side is a member access on an entity (read)
                            if (assignment.Right is MemberAccessExpressionSyntax rightMemberAccess)
                            {
                                TryRecordAttributeAccess(rightMemberAccess, AccessPatternType.ObjectInitializerRead,
                                    OperationType.Read, "Object Init Read");
                            }
                        }
                    }
                }
            }
        }

        base.VisitInitializerExpression(node);
    }

    private void TryRecordAttributeAccess(MemberAccessExpressionSyntax memberAccess,
        AccessPatternType? overridePattern = null, OperationType? overrideOperation = null,
        string? overrideUsage = null)
    {
        var propertyName = memberAccess.Name.Identifier.Text;
        var entityType = GetExpressionEntityType(memberAccess.Expression);

        if (entityType != null)
        {
            var entity = _metadataParser.GetEntityByClassName(entityType);
            var logicalName = _metadataParser.GetAttributeLogicalName(entityType, propertyName);

            if (entity != null && logicalName != null)
            {
                var (pattern, operation, usage) = DetermineAccessInfo(memberAccess);
                pattern = overridePattern ?? pattern;
                operation = overrideOperation ?? operation;
                usage = overrideUsage ?? usage;

                RecordAccess(entity.LogicalName, logicalName, pattern, operation, usage, memberAccess.GetLocation());
            }
        }
    }

    private (AccessPatternType pattern, OperationType operation, string usage) DetermineAccessInfo(
        MemberAccessExpressionSyntax memberAccess)
    {
        // Check if we're inside a lambda
        var isInLambda = memberAccess.Ancestors().OfType<LambdaExpressionSyntax>().Any();

        if (isInLambda)
        {
            // Check if it's part of a LINQ method
            var invocation = memberAccess.Ancestors()
                .OfType<InvocationExpressionSyntax>()
                .FirstOrDefault();

            if (invocation?.Expression is MemberAccessExpressionSyntax methodAccess)
            {
                var methodName = methodAccess.Name.Identifier.Text;
                return methodName switch
                {
                    "Where" => (AccessPatternType.LinqWhere, OperationType.List, "LINQ Where"),
                    "Any" => (AccessPatternType.LinqWhere, OperationType.List, "LINQ Any"),
                    "All" => (AccessPatternType.LinqWhere, OperationType.List, "LINQ All"),
                    "FirstOrDefault" => (AccessPatternType.LinqWhere, OperationType.Read, "LINQ FirstOrDefault"),
                    "First" => (AccessPatternType.LinqWhere, OperationType.Read, "LINQ First"),
                    "SingleOrDefault" => (AccessPatternType.LinqWhere, OperationType.Read, "LINQ SingleOrDefault"),
                    "Single" => (AccessPatternType.LinqWhere, OperationType.Read, "LINQ Single"),
                    "Select" => (AccessPatternType.LinqSelect, OperationType.Read, "LINQ Select"),
                    "SelectMany" => (AccessPatternType.LinqSelect, OperationType.Read, "LINQ SelectMany"),
                    "OrderBy" => (AccessPatternType.LinqSelect, OperationType.List, "LINQ OrderBy"),
                    "OrderByDescending" => (AccessPatternType.LinqSelect, OperationType.List, "LINQ OrderByDesc"),
                    "GroupBy" => (AccessPatternType.LinqSelect, OperationType.List, "LINQ GroupBy"),
                    "Count" => (AccessPatternType.LinqWhere, OperationType.List, "LINQ Count"),
                    "Sum" => (AccessPatternType.LinqSelect, OperationType.List, "LINQ Sum"),
                    _ => (AccessPatternType.PropertyRead, OperationType.Read, "Lambda Read")
                };
            }

            return (AccessPatternType.PropertyRead, OperationType.Read, "Lambda Read");
        }

        return (AccessPatternType.PropertyRead, OperationType.Read, "Property Read");
    }

    private OperationType DetermineWriteOperationType(SyntaxNode node)
    {
        // Look for context clues about whether this is Create or Update
        var ancestors = node.Ancestors().ToList();

        // Check if inside a method with "Create" in the name
        var method = ancestors.OfType<MethodDeclarationSyntax>().FirstOrDefault();
        if (method != null)
        {
            var methodName = method.Identifier.Text.ToLower();
            if (methodName.Contains("create") || methodName.Contains("insert") || methodName.Contains("add"))
                return OperationType.Create;
            if (methodName.Contains("update") || methodName.Contains("modify") || methodName.Contains("set"))
                return OperationType.Update;
            if (methodName.Contains("delete") || methodName.Contains("remove"))
                return OperationType.Delete;
        }

        // Check if the object was just created (new Entity)
        var objectCreation = ancestors.OfType<ObjectCreationExpressionSyntax>().FirstOrDefault();
        if (objectCreation != null)
        {
            // Check if the constructor has an ID parameter (likely Update)
            if (objectCreation.ArgumentList?.Arguments.Count > 0)
                return OperationType.Update;
            return OperationType.Create;
        }

        // Default to Update for property writes
        return OperationType.Update;
    }

    private OperationType DetermineObjectInitializerOperationType(InitializerExpressionSyntax node)
    {
        var objectCreation = node.Parent as ObjectCreationExpressionSyntax;
        if (objectCreation == null)
            return OperationType.Other;

        // If the constructor has arguments (like an ID), it's likely an Update
        if (objectCreation.ArgumentList?.Arguments.Count > 0)
            return OperationType.Update;

        // Check the variable declaration or usage context
        var ancestors = node.Ancestors().ToList();
        var method = ancestors.OfType<MethodDeclarationSyntax>().FirstOrDefault();
        if (method != null)
        {
            var methodName = method.Identifier.Text.ToLower();
            if (methodName.Contains("create") || methodName.Contains("insert"))
                return OperationType.Create;
            if (methodName.Contains("update") || methodName.Contains("modify"))
                return OperationType.Update;
        }

        // Default to Create for new objects without ID
        return OperationType.Create;
    }

    private string? GetExpressionEntityType(ExpressionSyntax expression)
    {
        if (expression is IdentifierNameSyntax identifier)
        {
            var name = identifier.Identifier.Text;

            if (_lambdaParameterTypes.TryGetValue(name, out var lambdaType))
                return lambdaType;

            if (_entityClassNames.Contains(name))
                return name;
        }

        if (expression is MemberAccessExpressionSyntax nestedMemberAccess)
        {
            var memberName = nestedMemberAccess.Name.Identifier.Text;
            var parentType = GetExpressionEntityType(nestedMemberAccess.Expression);

            if (parentType != null)
            {
                var parentEntity = _metadataParser.GetEntityByClassName(parentType);
                if (parentEntity?.Relationships.TryGetValue(memberName, out var relationship) == true)
                {
                    return relationship.RelatedEntityClassName;
                }
            }
        }

        return null;
    }

    private string? InferLambdaParameterType(SimpleLambdaExpressionSyntax lambda)
    {
        var parent = lambda.Parent;

        while (parent != null)
        {
            if (parent is InvocationExpressionSyntax invocation)
            {
                if (invocation.Expression is MemberAccessExpressionSyntax methodAccess)
                {
                    var methodName = methodAccess.Name.Identifier.Text;
                    if (IsLinqMethod(methodName))
                    {
                        var targetExpr = methodAccess.Expression;
                        var entityType = InferEntityTypeFromExpression(targetExpr);
                        if (entityType != null)
                            return entityType;
                    }
                }
            }
            parent = parent.Parent;
        }

        return null;
    }

    private string? InferEntityTypeFromExpression(ExpressionSyntax expression)
    {
        if (expression is MemberAccessExpressionSyntax memberAccess)
        {
            var memberName = memberAccess.Name.Identifier.Text;

            if (memberName.EndsWith("Set"))
            {
                var entityName = memberName.Substring(0, memberName.Length - 3);
                if (_entityClassNames.Contains(entityName))
                    return entityName;
            }

            return InferEntityTypeFromExpression(memberAccess.Expression);
        }

        if (expression is InvocationExpressionSyntax invocation)
        {
            if (invocation.Expression is MemberAccessExpressionSyntax invokedMethod)
            {
                return InferEntityTypeFromExpression(invokedMethod.Expression);
            }
        }

        return null;
    }

    private static bool IsLinqMethod(string methodName)
    {
        return methodName switch
        {
            "Where" or "Select" or "SelectMany" or "OrderBy" or "OrderByDescending" or
            "ThenBy" or "ThenByDescending" or "GroupBy" or "Join" or "Any" or "All" or
            "First" or "FirstOrDefault" or "Single" or "SingleOrDefault" or "Last" or
            "LastOrDefault" or "Count" or "Sum" or "Average" or "Min" or "Max" => true,
            _ => false
        };
    }

    private void RecordAccess(string entityLogicalName, string attributeLogicalName,
        AccessPatternType pattern, OperationType operationType, string usage, Location location)
    {
        if (!_attributeUsages.ContainsKey(entityLogicalName))
        {
            _attributeUsages[entityLogicalName] = new Dictionary<string, List<AttributeUsage>>();
        }

        if (!_attributeUsages[entityLogicalName].ContainsKey(attributeLogicalName))
        {
            _attributeUsages[entityLogicalName][attributeLogicalName] = new List<AttributeUsage>();
        }

        _attributeUsages[entityLogicalName][attributeLogicalName].Add(new AttributeUsage(
            Name: _componentName,
            Usage: $"{_componentName}: {usage}",
            OperationType: operationType,
            ComponentType: _componentType,
            IsFromDependencyAnalysis: true
        ));
    }
}
