using Generator.DTO;
using Microsoft.Extensions.Logging;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Services;

/// <summary>
/// Extracts all solution components for the insights visualization.
/// This is separate from SolutionComponentService which filters entity metadata extraction.
/// </summary>
public class SolutionComponentExtractor
{
    private readonly ServiceClient _client;
    private readonly ILogger<SolutionComponentExtractor> _logger;

    /// <summary>
    /// All component types we want to extract for insights.
    /// </summary>
    private static readonly int[] SupportedComponentTypes = new[]
    {
        1,    // Entity
        2,    // Attribute
        9,    // OptionSet
        10,   // Relationship
        14,   // EntityKey
        20,   // SecurityRole
        26,   // SavedQuery
        29,   // Workflow
        50,   // RibbonCustomization
        59,   // SavedQueryVisualization
        60,   // SystemForm
        61,   // WebResource
        62,   // SiteMap
        63,   // ConnectionRole
        65,   // HierarchyRule
        66,   // CustomControl
        70,   // FieldSecurityProfile
        80,   // ModelDrivenApp
        91,   // PluginAssembly
        92,   // SDKMessageProcessingStep
        300,  // CanvasApp
        372,  // ConnectionReference
        380,  // EnvironmentVariableDefinition
        381,  // EnvironmentVariableValue
        418,  // Dataflow
    };

    /// <summary>
    /// Maps component type codes to their Dataverse table, name column, primary key column, and optional entity column for name resolution.
    /// Primary key is optional - if null, defaults to tablename + "id".
    /// EntityColumn is used to get the related table for components like forms and views.
    /// </summary>
    private static readonly Dictionary<int, (string TableName, string NameColumn, string? PrimaryKey, string? EntityColumn)> ComponentTableMap = new()
    {
        { 20, ("role", "name", null, null) },
        { 26, ("savedquery", "name", null, "returnedtypecode") },  // Views have returnedtypecode for the entity
        { 29, ("workflow", "name", null, null) },
        { 50, ("ribboncustomization", "entity", null, null) },
        { 59, ("savedqueryvisualization", "name", null, null) },
        { 60, ("systemform", "name", "formid", "objecttypecode") },  // Forms have objecttypecode for the entity
        { 61, ("webresource", "name", null, null) },
        { 62, ("sitemap", "sitemapname", null, null) },
        { 63, ("connectionrole", "name", null, null) },
        { 65, ("hierarchyrule", "name", null, null) },
        { 66, ("customcontrol", "name", null, null) },
        { 70, ("fieldsecurityprofile", "name", null, null) },
        { 80, ("appmodule", "name", "appmoduleid", null) },  // appmodule uses appmoduleid
        { 91, ("pluginassembly", "name", null, null) },
        { 92, ("sdkmessageprocessingstep", "name", null, null) },
        { 300, ("canvasapp", "name", null, null) },
        { 372, ("connectionreference", "connectionreferencedisplayname", null, null) },
        { 380, ("environmentvariabledefinition", "displayname", null, null) },
        { 381, ("environmentvariablevalue", "schemaname", null, null) },
        { 418, ("workflow", "name", null, null) }, // Dataflows are stored in workflow table with category=6
    };

    /// <summary>
    /// Component types that should have a related table displayed.
    /// </summary>
    private static readonly HashSet<int> ComponentTypesWithRelatedTable = new() { 2, 10, 14, 26, 60 };  // Attribute, Relationship, EntityKey, SavedQuery (View), SystemForm

    public SolutionComponentExtractor(ServiceClient client, ILogger<SolutionComponentExtractor> logger)
    {
        _client = client;
        _logger = logger;
    }

    /// <summary>
    /// Extracts all solution components grouped by solution for the insights view.
    /// </summary>
    public async Task<List<SolutionComponentCollection>> ExtractSolutionComponentsAsync(
        List<Guid> solutionIds,
        Dictionary<Guid, string> solutionNameLookup,
        Dictionary<Guid, string>? entityNameLookup = null,
        Dictionary<Guid, string>? attributeNameLookup = null,
        Dictionary<Guid, string>? relationshipNameLookup = null,
        Dictionary<Guid, string>? attributeEntityLookup = null,
        Dictionary<Guid, string>? relationshipEntityLookup = null,
        Dictionary<Guid, string>? keyEntityLookup = null)
    {
        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Extracting solution components for {solutionIds.Count} solutions");

        if (solutionIds == null || !solutionIds.Any())
        {
            _logger.LogWarning("No solution IDs provided for component extraction");
            return new List<SolutionComponentCollection>();
        }

        // Query all solution components
        var rawComponents = await QuerySolutionComponentsAsync(solutionIds);
        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Found {rawComponents.Count} raw solution components");

        // Group by solution
        var componentsBySolution = rawComponents
            .GroupBy(c => c.SolutionId)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Resolve names for each component type
        var nameCache = await BuildNameCacheAsync(rawComponents, entityNameLookup, attributeNameLookup, relationshipNameLookup, attributeEntityLookup, relationshipEntityLookup, keyEntityLookup);

        // Build the result collections
        var result = new List<SolutionComponentCollection>();
        foreach (var solutionId in solutionIds)
        {
            var solutionName = solutionNameLookup.GetValueOrDefault(solutionId, solutionId.ToString());

            if (!componentsBySolution.TryGetValue(solutionId, out var components))
            {
                result.Add(new SolutionComponentCollection(solutionId, solutionName, new List<SolutionComponentData>()));
                continue;
            }

            var componentDataList = components
                .Select(c => new SolutionComponentData(
                    Name: ResolveComponentName(c, nameCache),
                    SchemaName: ResolveComponentSchemaName(c, nameCache),
                    ComponentType: (SolutionComponentType)c.ComponentType,
                    ObjectId: c.ObjectId,
                    IsExplicit: c.IsExplicit,
                    RelatedTable: ResolveRelatedTable(c, nameCache)))
                .OrderBy(c => c.ComponentType)
                .ThenBy(c => c.Name)
                .ToList();

            result.Add(new SolutionComponentCollection(solutionId, solutionName, componentDataList));
            _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Solution '{solutionName}': {componentDataList.Count} components");
        }

        return result;
    }

    private async Task<List<RawComponentInfo>> QuerySolutionComponentsAsync(List<Guid> solutionIds)
    {
        var results = new List<RawComponentInfo>();

        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid", "componenttype", "solutionid", "rootcomponentbehavior"),
            Criteria = new FilterExpression(LogicalOperator.And)
            {
                Conditions =
                {
                    new ConditionExpression("componenttype", ConditionOperator.In, SupportedComponentTypes),
                    new ConditionExpression("solutionid", ConditionOperator.In, solutionIds)
                }
            }
        };

        try
        {
            var response = await _client.RetrieveMultipleAsync(query);
            foreach (var entity in response.Entities)
            {
                var componentType = entity.GetAttributeValue<OptionSetValue>("componenttype")?.Value ?? 0;
                var objectId = entity.GetAttributeValue<Guid>("objectid");
                var solutionId = entity.GetAttributeValue<EntityReference>("solutionid")?.Id ?? Guid.Empty;
                var rootBehavior = entity.Contains("rootcomponentbehavior")
                    ? entity.GetAttributeValue<OptionSetValue>("rootcomponentbehavior")?.Value ?? -1
                    : -1;

                // RootComponentBehaviour: 0, 1, 2 = explicit, other = implicit
                var isExplicit = rootBehavior >= 0 && rootBehavior <= 2;

                results.Add(new RawComponentInfo(componentType, objectId, solutionId, isExplicit));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to query solution components");
        }

        return results;
    }

    private async Task<Dictionary<(int ComponentType, Guid ObjectId), (string Name, string SchemaName, string? RelatedTable)>> BuildNameCacheAsync(
        List<RawComponentInfo> components,
        Dictionary<Guid, string>? entityNameLookup,
        Dictionary<Guid, string>? attributeNameLookup,
        Dictionary<Guid, string>? relationshipNameLookup,
        Dictionary<Guid, string>? attributeEntityLookup,
        Dictionary<Guid, string>? relationshipEntityLookup,
        Dictionary<Guid, string>? keyEntityLookup)
    {
        var cache = new Dictionary<(int, Guid), (string Name, string SchemaName, string? RelatedTable)>();

        // Group components by type for batch queries
        var componentsByType = components
            .GroupBy(c => c.ComponentType)
            .ToDictionary(g => g.Key, g => g.Select(c => c.ObjectId).Distinct().ToList());

        foreach (var (componentType, objectIds) in componentsByType)
        {
            // Use provided lookups for metadata-based types
            if (componentType == 1 && entityNameLookup != null) // Entity
            {
                foreach (var objectId in objectIds)
                {
                    if (entityNameLookup.TryGetValue(objectId, out var name))
                    {
                        cache[(componentType, objectId)] = (name, name, null);
                    }
                }
                continue;
            }

            if (componentType == 2 && attributeNameLookup != null) // Attribute
            {
                foreach (var objectId in objectIds)
                {
                    if (attributeNameLookup.TryGetValue(objectId, out var name))
                    {
                        var relatedTable = attributeEntityLookup?.GetValueOrDefault(objectId);
                        cache[(componentType, objectId)] = (name, name, relatedTable);
                    }
                }
                continue;
            }

            if (componentType == 10 && relationshipNameLookup != null) // Relationship
            {
                foreach (var objectId in objectIds)
                {
                    if (relationshipNameLookup.TryGetValue(objectId, out var name))
                    {
                        var relatedTable = relationshipEntityLookup?.GetValueOrDefault(objectId);
                        cache[(componentType, objectId)] = (name, name, relatedTable);
                    }
                }
                continue;
            }

            // EntityKey - use keyEntityLookup for related table
            if (componentType == 14)
            {
                foreach (var objectId in objectIds)
                {
                    var relatedTable = keyEntityLookup?.GetValueOrDefault(objectId);
                    cache[(componentType, objectId)] = (objectId.ToString(), objectId.ToString(), relatedTable);
                }
                continue;
            }

            // Skip OptionSet - use ObjectId as fallback, no related table
            if (componentType == 9)
            {
                foreach (var objectId in objectIds)
                {
                    cache[(componentType, objectId)] = (objectId.ToString(), objectId.ToString(), null);
                }
                continue;
            }

            // Query Dataverse tables for other types
            if (ComponentTableMap.TryGetValue(componentType, out var tableInfo))
            {
                var primaryKey = tableInfo.PrimaryKey ?? tableInfo.TableName + "id";
                var namesAndEntities = await QueryComponentNamesWithEntityAsync(tableInfo.TableName, tableInfo.NameColumn, primaryKey, tableInfo.EntityColumn, objectIds);
                foreach (var (objectId, name, relatedTable) in namesAndEntities)
                {
                    cache[(componentType, objectId)] = (name, name, relatedTable);
                }
            }
        }

        return cache;
    }

    private async Task<List<(Guid ObjectId, string Name, string? RelatedTable)>> QueryComponentNamesWithEntityAsync(
        string tableName, string nameColumn, string primaryKey, string? entityColumn, List<Guid> objectIds)
    {
        var result = new List<(Guid, string, string?)>();

        if (!objectIds.Any())
            return result;

        try
        {
            var columns = new List<string> { primaryKey, nameColumn };
            if (!string.IsNullOrEmpty(entityColumn))
            {
                columns.Add(entityColumn);
            }

            var query = new QueryExpression(tableName)
            {
                ColumnSet = new ColumnSet(columns.ToArray()),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression(primaryKey, ConditionOperator.In, objectIds)
                    }
                }
            };

            var response = await _client.RetrieveMultipleAsync(query);
            foreach (var entity in response.Entities)
            {
                var id = entity.GetAttributeValue<Guid>(primaryKey);
                var name = entity.GetAttributeValue<string>(nameColumn) ?? id.ToString();
                string? relatedTable = null;

                if (!string.IsNullOrEmpty(entityColumn) && entity.Contains(entityColumn))
                {
                    // The entity column can be a string (logical name) or an int (object type code)
                    var entityValue = entity[entityColumn];
                    if (entityValue is string strValue)
                    {
                        relatedTable = strValue;
                    }
                    else if (entityValue is int intValue)
                    {
                        // Object type code - we'd need entity metadata to resolve this
                        // For now, just store the numeric value as string
                        relatedTable = intValue.ToString();
                    }
                }

                result.Add((id, name, relatedTable));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Failed to query names from {tableName}. Using ObjectId as fallback.");
            // Return empty - fallback will use ObjectId
        }

        return result;
    }

    private string ResolveComponentName(RawComponentInfo component, Dictionary<(int, Guid), (string Name, string SchemaName, string? RelatedTable)> cache)
    {
        if (cache.TryGetValue((component.ComponentType, component.ObjectId), out var names))
        {
            return names.Name;
        }
        return component.ObjectId.ToString();
    }

    private string ResolveComponentSchemaName(RawComponentInfo component, Dictionary<(int, Guid), (string Name, string SchemaName, string? RelatedTable)> cache)
    {
        if (cache.TryGetValue((component.ComponentType, component.ObjectId), out var names))
        {
            return names.SchemaName;
        }
        return component.ObjectId.ToString();
    }

    private string? ResolveRelatedTable(RawComponentInfo component, Dictionary<(int, Guid), (string Name, string SchemaName, string? RelatedTable)> cache)
    {
        if (!ComponentTypesWithRelatedTable.Contains(component.ComponentType))
        {
            return null;
        }

        if (cache.TryGetValue((component.ComponentType, component.ObjectId), out var names))
        {
            return names.RelatedTable;
        }
        return null;
    }

    private record RawComponentInfo(int ComponentType, Guid ObjectId, Guid SolutionId, bool IsExplicit);
}
