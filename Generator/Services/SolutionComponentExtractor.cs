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
    /// Maps component type codes to their Dataverse table, name column, and primary key column for name resolution.
    /// Primary key is optional - if null, defaults to tablename + "id".
    /// </summary>
    private static readonly Dictionary<int, (string TableName, string NameColumn, string? PrimaryKey)> ComponentTableMap = new()
    {
        { 20, ("role", "name", null) },
        { 26, ("savedquery", "name", null) },
        { 29, ("workflow", "name", null) },
        { 50, ("ribboncustomization", "entity", null) },
        { 59, ("savedqueryvisualization", "name", null) },
        { 60, ("systemform", "name", "formid") },  // systemform uses formid, not systemformid
        { 61, ("webresource", "name", null) },
        { 62, ("sitemap", "sitemapname", null) },
        { 63, ("connectionrole", "name", null) },
        { 65, ("hierarchyrule", "name", null) },
        { 66, ("customcontrol", "name", null) },
        { 70, ("fieldsecurityprofile", "name", null) },
        { 80, ("appmodule", "name", "appmoduleid") },  // appmodule uses appmoduleid
        { 91, ("pluginassembly", "name", null) },
        { 92, ("sdkmessageprocessingstep", "name", null) },
        { 300, ("canvasapp", "name", null) },
        { 372, ("connectionreference", "connectionreferencedisplayname", null) },
        { 380, ("environmentvariabledefinition", "displayname", null) },
        { 381, ("environmentvariablevalue", "schemaname", null) },
        { 418, ("workflow", "name", null) }, // Dataflows are stored in workflow table with category=6
    };

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
        Dictionary<Guid, string>? relationshipNameLookup = null)
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
        var nameCache = await BuildNameCacheAsync(rawComponents, entityNameLookup, attributeNameLookup, relationshipNameLookup);

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
                    IsExplicit: c.IsExplicit))
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

    private async Task<Dictionary<(int ComponentType, Guid ObjectId), (string Name, string SchemaName)>> BuildNameCacheAsync(
        List<RawComponentInfo> components,
        Dictionary<Guid, string>? entityNameLookup,
        Dictionary<Guid, string>? attributeNameLookup,
        Dictionary<Guid, string>? relationshipNameLookup)
    {
        var cache = new Dictionary<(int, Guid), (string Name, string SchemaName)>();

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
                        cache[(componentType, objectId)] = (name, name);
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
                        cache[(componentType, objectId)] = (name, name);
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
                        cache[(componentType, objectId)] = (name, name);
                    }
                }
                continue;
            }

            // Skip types that need metadata API (9=OptionSet, 14=EntityKey) - use ObjectId as fallback
            if (componentType == 9 || componentType == 14)
            {
                foreach (var objectId in objectIds)
                {
                    cache[(componentType, objectId)] = (objectId.ToString(), objectId.ToString());
                }
                continue;
            }

            // Query Dataverse tables for other types
            if (ComponentTableMap.TryGetValue(componentType, out var tableInfo))
            {
                var primaryKey = tableInfo.PrimaryKey ?? tableInfo.TableName + "id";
                var names = await QueryComponentNamesAsync(tableInfo.TableName, tableInfo.NameColumn, primaryKey, objectIds);
                foreach (var (objectId, name) in names)
                {
                    cache[(componentType, objectId)] = (name, name);
                }
            }
        }

        return cache;
    }

    private async Task<Dictionary<Guid, string>> QueryComponentNamesAsync(string tableName, string nameColumn, string primaryKey, List<Guid> objectIds)
    {
        var result = new Dictionary<Guid, string>();

        if (!objectIds.Any())
            return result;

        try
        {
            var query = new QueryExpression(tableName)
            {
                ColumnSet = new ColumnSet(primaryKey, nameColumn),
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
                result[id] = name;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Failed to query names from {tableName}. Using ObjectId as fallback.");
            // Return empty - fallback will use ObjectId
        }

        return result;
    }

    private string ResolveComponentName(RawComponentInfo component, Dictionary<(int, Guid), (string Name, string SchemaName)> cache)
    {
        if (cache.TryGetValue((component.ComponentType, component.ObjectId), out var names))
        {
            return names.Name;
        }
        return component.ObjectId.ToString();
    }

    private string ResolveComponentSchemaName(RawComponentInfo component, Dictionary<(int, Guid), (string Name, string SchemaName)> cache)
    {
        if (cache.TryGetValue((component.ComponentType, component.ObjectId), out var names))
        {
            return names.SchemaName;
        }
        return component.ObjectId.ToString();
    }

    private record RawComponentInfo(int ComponentType, Guid ObjectId, Guid SolutionId, bool IsExplicit);
}
