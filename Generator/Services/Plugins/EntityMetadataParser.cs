using Generator.DTO.Dependencies.Plugins;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Security.Cryptography;
using System.Text.Json;

namespace Generator.Services.Plugins;

/// <summary>
/// Parses XrmContext.cs to extract entity and attribute metadata.
/// Supports caching to avoid re-parsing the large file on every run.
/// </summary>
public class EntityMetadataParser
{
    private readonly bool _verbose;
    private Dictionary<string, EntityInfo>? _entityByClassName;
    private Dictionary<string, EntityInfo>? _entityByLogicalName;

    public EntityMetadataParser(bool verbose = false)
    {
        _verbose = verbose;
    }

    /// <summary>
    /// Gets entity info by C# class name (e.g., "Account")
    /// </summary>
    public EntityInfo? GetEntityByClassName(string className)
    {
        if (_entityByClassName == null)
            throw new InvalidOperationException("Must call ParseAsync before accessing entities");
        return _entityByClassName.TryGetValue(className, out var entity) ? entity : null;
    }

    /// <summary>
    /// Gets entity info by Dataverse logical name (e.g., "account")
    /// </summary>
    public EntityInfo? GetEntityByLogicalName(string logicalName)
    {
        if (_entityByLogicalName == null)
            throw new InvalidOperationException("Must call ParseAsync before accessing entities");
        return _entityByLogicalName.TryGetValue(logicalName, out var entity) ? entity : null;
    }

    /// <summary>
    /// Gets all parsed entities
    /// </summary>
    public IReadOnlyCollection<EntityInfo> GetAllEntities()
    {
        if (_entityByClassName == null)
            throw new InvalidOperationException("Must call ParseAsync before accessing entities");
        return _entityByClassName.Values;
    }

    /// <summary>
    /// Maps a property name to its logical name for a given entity class
    /// </summary>
    public string? GetAttributeLogicalName(string entityClassName, string propertyName)
    {
        var entity = GetEntityByClassName(entityClassName);
        if (entity == null) return null;

        if (entity.Attributes.TryGetValue(propertyName, out var attr))
            return attr.LogicalName;

        // Check relationships too
        if (entity.Relationships.TryGetValue(propertyName, out var rel))
            return rel.SchemaName;

        return null;
    }

    /// <summary>
    /// Parses the XrmContext.cs file and builds the metadata dictionaries.
    /// Uses caching to avoid re-parsing if the file hasn't changed.
    /// </summary>
    public async Task ParseAsync(string xrmContextPath, string? cachePath = null)
    {
        if (!File.Exists(xrmContextPath))
            throw new FileNotFoundException($"XrmContext.cs not found at: {xrmContextPath}");

        // Try to use cache
        cachePath ??= Path.Combine(Path.GetDirectoryName(xrmContextPath)!, ".xrmcontext-metadata.cache");
        var fileHash = ComputeFileHash(xrmContextPath);

        if (File.Exists(cachePath))
        {
            try
            {
                var cacheContent = await File.ReadAllTextAsync(cachePath);
                var cache = JsonSerializer.Deserialize<MetadataCache>(cacheContent);
                if (cache != null && cache.FileHash == fileHash)
                {
                    if (_verbose) Console.WriteLine($"Using cached metadata from {cachePath}");
                    _entityByClassName = cache.Entities.ToDictionary(e => e.ClassName);
                    _entityByLogicalName = cache.Entities.ToDictionary(e => e.LogicalName);
                    return;
                }
            }
            catch (Exception ex)
            {
                if (_verbose) Console.WriteLine($"Cache read failed, will re-parse: {ex.Message}");
            }
        }

        // Parse the file
        if (_verbose) Console.WriteLine($"Parsing XrmContext.cs ({new FileInfo(xrmContextPath).Length / 1024 / 1024}MB)...");

        var sourceText = await File.ReadAllTextAsync(xrmContextPath);
        var syntaxTree = CSharpSyntaxTree.ParseText(sourceText);
        var root = await syntaxTree.GetRootAsync();

        var entities = new List<EntityInfo>();

        // Find all classes with [EntityLogicalName] attribute
        var classDeclarations = root.DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Where(HasEntityLogicalNameAttribute);

        foreach (var classDecl in classDeclarations)
        {
            var entity = ParseEntityClass(classDecl);
            if (entity != null)
            {
                entities.Add(entity);
            }
        }

        _entityByClassName = entities.ToDictionary(e => e.ClassName);
        _entityByLogicalName = entities.ToDictionary(e => e.LogicalName);

        if (_verbose) Console.WriteLine($"Parsed {entities.Count} entities");

        // Save cache
        try
        {
            var cache = new MetadataCache
            {
                FileHash = fileHash,
                Entities = entities
            };
            var cacheJson = JsonSerializer.Serialize(cache, new JsonSerializerOptions { WriteIndented = false });
            await File.WriteAllTextAsync(cachePath, cacheJson);
            if (_verbose) Console.WriteLine($"Saved metadata cache to {cachePath}");
        }
        catch (Exception ex)
        {
            if (_verbose) Console.WriteLine($"Failed to save cache: {ex.Message}");
        }
    }

    private static bool HasEntityLogicalNameAttribute(ClassDeclarationSyntax classDecl)
    {
        return classDecl.AttributeLists
            .SelectMany(al => al.Attributes)
            .Any(a => a.Name.ToString().Contains("EntityLogicalName"));
    }

    private EntityInfo? ParseEntityClass(ClassDeclarationSyntax classDecl)
    {
        var entityLogicalName = ExtractAttributeStringValue(classDecl.AttributeLists, "EntityLogicalName");
        if (entityLogicalName == null) return null;

        // Extract EntityTypeCode constant if present
        int? entityTypeCode = null;
        var typeCodeField = classDecl.Members
            .OfType<FieldDeclarationSyntax>()
            .SelectMany(f => f.Declaration.Variables)
            .FirstOrDefault(v => v.Identifier.Text == "EntityTypeCode");

        if (typeCodeField?.Initializer?.Value is LiteralExpressionSyntax literal &&
            int.TryParse(literal.Token.ValueText, out var typeCode))
        {
            entityTypeCode = typeCode;
        }

        var entity = new EntityInfo(
            ClassName: classDecl.Identifier.Text,
            LogicalName: entityLogicalName,
            EntityTypeCode: entityTypeCode
        );

        // Parse properties
        foreach (var property in classDecl.Members.OfType<PropertyDeclarationSyntax>())
        {
            // Check for AttributeLogicalName
            var attrLogicalName = ExtractAttributeStringValue(property.AttributeLists, "AttributeLogicalName");
            if (attrLogicalName != null)
            {
                var attrInfo = new AttributeInfo(
                    PropertyName: property.Identifier.Text,
                    LogicalName: attrLogicalName,
                    Type: property.Type.ToString(),
                    DisplayName: ExtractAttributeStringValue(property.AttributeLists, "DisplayName")
                );
                entity.Attributes[property.Identifier.Text] = attrInfo;
            }

            // Check for RelationshipSchemaName
            var relSchemaName = ExtractRelationshipInfo(property);
            if (relSchemaName != null)
            {
                entity.Relationships[property.Identifier.Text] = relSchemaName;
            }
        }

        return entity;
    }

    private static string? ExtractAttributeStringValue(SyntaxList<AttributeListSyntax> attributeLists, string attributeName)
    {
        var attribute = attributeLists
            .SelectMany(al => al.Attributes)
            .FirstOrDefault(a => a.Name.ToString().Contains(attributeName));

        if (attribute == null) return null;

        var argument = attribute.ArgumentList?.Arguments.FirstOrDefault();
        if (argument?.Expression is LiteralExpressionSyntax literalExpr)
        {
            return literalExpr.Token.ValueText;
        }

        return null;
    }

    private RelationshipInfo? ExtractRelationshipInfo(PropertyDeclarationSyntax property)
    {
        var relAttribute = property.AttributeLists
            .SelectMany(al => al.Attributes)
            .FirstOrDefault(a => a.Name.ToString().Contains("RelationshipSchemaName"));

        if (relAttribute == null) return null;

        var args = relAttribute.ArgumentList?.Arguments.ToList();
        if (args == null || args.Count == 0) return null;

        var schemaName = (args[0].Expression as LiteralExpressionSyntax)?.Token.ValueText;
        if (schemaName == null) return null;

        string? entityRole = null;
        if (args.Count > 1)
        {
            entityRole = args[1].Expression.ToString();
            // Extract just the enum value (e.g., "EntityRole.Referenced" -> "Referenced")
            if (entityRole.Contains("."))
                entityRole = entityRole.Split('.').Last();
        }

        // Determine if it's a collection or single entity
        var typeString = property.Type.ToString();
        var isCollection = typeString.StartsWith("IEnumerable<");

        // Extract the related entity type
        string? relatedEntityType = null;
        if (property.Type is GenericNameSyntax genericType)
        {
            relatedEntityType = genericType.TypeArgumentList.Arguments.FirstOrDefault()?.ToString();
        }

        return new RelationshipInfo(
            PropertyName: property.Identifier.Text,
            SchemaName: schemaName,
            RelatedEntityClassName: relatedEntityType,
            EntityRole: entityRole,
            IsCollection: isCollection
        );
    }

    private static string ComputeFileHash(string filePath)
    {
        using var stream = File.OpenRead(filePath);
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(stream);
        return Convert.ToBase64String(hashBytes);
    }

    private class MetadataCache
    {
        public string FileHash { get; set; } = "";
        public List<EntityInfo> Entities { get; set; } = new();
    }
}
