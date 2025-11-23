using Microsoft.Crm.Sdk.Messages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Services;

public class ComponentInfo
{
    public int ComponentType { get; set; }
    public Guid ObjectId { get; set; }
    public Guid? SolutionComponentId { get; set; }
    public bool IsExplicit { get; set; }
    public int RootComponentBehaviour { get; set; }
    public Guid SolutionId { get; set; }

    public override bool Equals(object? obj)
    {
        return obj is ComponentInfo info &&
               ComponentType == info.ComponentType &&
               ObjectId == info.ObjectId;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(ComponentType, ObjectId);
    }
}

public record SolutionComponentInfo(
    Guid ObjectId,
    Guid SolutionComponentId,
    int ComponentType,
    int RootComponentBehaviour,
    EntityReference SolutionId
    );

public record DependencyInfo(
    Guid DependencyId,
    int DependencyType,
    Guid DependentComponentNodeId,
    Guid RequiredComponentNodeId
    );

public record ComponentNodeInfo(
    Guid NodeId,
    int ComponentType,
    Guid ObjectId,
    EntityReference SolutionId
    );

public class SolutionComponentService
{
    private readonly ServiceClient _client;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SolutionComponentService> _logger;

    public SolutionComponentService(ServiceClient client, IConfiguration configuration, ILogger<SolutionComponentService> logger)
    {
        _client = client;
        _configuration = configuration;
        _logger = logger;
    }

    public IEnumerable<ComponentInfo> GetAllSolutionComponents(List<Guid> solutionIds)
    {
        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Getting all solution components for solutions: {string.Join(", ", solutionIds)}");
        var allComponents = new HashSet<ComponentInfo>();

        // Get explicit components from solution
        IEnumerable<SolutionComponentInfo> explicitComponents;
        try
        {
            explicitComponents = GetExplicitComponents(solutionIds);
            _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Found {explicitComponents.Count()} explicit components");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Failed to get explicit components");
            throw;
        }

        // Add explicit components - determine if explicit or implicit based on RootComponentBehaviour
        foreach (var comp in explicitComponents)
        {
            // RootComponentBehaviour:
            // 0 (IncludeSubcomponents) = Explicitly added with all subcomponents
            // 1 (DoNotIncludeSubcomponents) = Explicitly added without subcomponents
            // 2 (IncludeAsShellOnly) = Only shell/definition included
            // If not present or other values, treat as implicit
            var isExplicitlyAdded = comp.RootComponentBehaviour == 0 || comp.RootComponentBehaviour == 1 || comp.RootComponentBehaviour == 2;

            allComponents.Add(new ComponentInfo
            {
                ComponentType = comp.ComponentType,
                ObjectId = comp.ObjectId,
                SolutionComponentId = comp.SolutionComponentId,
                RootComponentBehaviour = comp.RootComponentBehaviour,
                IsExplicit = isExplicitlyAdded,
                SolutionId = comp.SolutionId.Id
            });
        }

        // Get required dependencies for attributes only (component type 2)
        try
        {
            var attributeComponents = explicitComponents.Where(c => c.ComponentType == 2).ToList();
            if (attributeComponents.Any())
            {
                var dependencies = GetRequiredComponents(attributeComponents);
                _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Found {dependencies.Count} dependency relationships for attributes");

                // Get unique component node IDs
                var requiredNodeIds = dependencies.Select(d => d.RequiredComponentNodeId).Distinct().ToList();
                _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Retrieving component information for {requiredNodeIds.Count} dependency nodes");

                // Retrieve component node information
                var componentNodes = GetComponentNodes(requiredNodeIds);
                _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Retrieved {componentNodes.Count} component nodes");

                // Add required components as implicit
                foreach (var node in componentNodes)
                {
                    var componentInfo = new ComponentInfo
                    {
                        ComponentType = node.ComponentType,
                        ObjectId = node.ObjectId,
                        SolutionComponentId = null,
                        RootComponentBehaviour = -1,
                        IsExplicit = false, // Required dependencies are implicitly included
                        SolutionId = node.SolutionId.Id
                    };

                    // Only add if not already present as explicit component
                    if (!allComponents.Contains(componentInfo))
                    {
                        allComponents.Add(componentInfo);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Failed to get required components, continuing without them");
        }

        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Total components found: {allComponents.Count} (Explicit: {allComponents.Count(c => c.IsExplicit)}, Implicit: {allComponents.Count(c => !c.IsExplicit)})");
        return allComponents;
    }

    private IEnumerable<SolutionComponentInfo> GetExplicitComponents(List<Guid> solutionIds)
    {
        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid", "componenttype", "solutioncomponentid", "rootcomponentbehavior", "solutionid"),
            Criteria = new FilterExpression(LogicalOperator.And)
            {
                Conditions =
                    {
                        new ConditionExpression("componenttype", ConditionOperator.In, new List<int>() { 1, 2, 10, 20 }), // entity, attribute, 1:N relationship, role, workflow/flow, N:N relationship, sdkpluginstep (https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/solutioncomponent)
                        new ConditionExpression("solutionid", ConditionOperator.In, solutionIds)
                    }
            }
        };

        return _client.RetrieveMultiple(query).Entities
                .Select(e => new SolutionComponentInfo(
                    e.GetAttributeValue<Guid>("objectid"),
                    e.GetAttributeValue<Guid>("solutioncomponentid"),
                    e.GetAttributeValue<OptionSetValue>("componenttype").Value,
                    e.Contains("rootcomponentbehavior") ? e.GetAttributeValue<OptionSetValue>("rootcomponentbehavior").Value : -1,
                    e.GetAttributeValue<EntityReference>("solutionid")));
    }

    private List<ComponentNodeInfo> GetComponentNodes(List<Guid> nodeIds)
    {
        if (!nodeIds.Any())
        {
            return new List<ComponentNodeInfo>();
        }

        var results = new List<ComponentNodeInfo>();
        const int batchSize = 500; // Query in batches to avoid URL length limits

        for (int i = 0; i < nodeIds.Count; i += batchSize)
        {
            var batch = nodeIds.Skip(i).Take(batchSize).ToList();

            var query = new QueryExpression("dependencynode")
            {
                ColumnSet = new ColumnSet("dependencynodeid", "componenttype", "objectid", "solutionid"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("dependencynodeid", ConditionOperator.In, batch.Cast<object>().ToArray())
                    }
                }
            };

            try
            {
                var response = _client.RetrieveMultiple(query);
                foreach (var entity in response.Entities)
                {
                    results.Add(new ComponentNodeInfo(
                        entity.GetAttributeValue<Guid>("dependencynodeid"),
                        entity.GetAttributeValue<OptionSetValue>("componenttype").Value,
                        entity.GetAttributeValue<Guid>("objectid"),
                        entity.GetAttributeValue<EntityReference>("solutionid")
                    ));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Failed to retrieve component nodes for batch starting at index {i}");
            }
        }

        return results;
    }

    private HashSet<DependencyInfo> GetDependentComponents(IEnumerable<SolutionComponentInfo> components)
    {
        var results = new HashSet<DependencyInfo>();
        var componentsList = components.ToList();
        int totalCount = componentsList.Count;
        int processedCount = 0;
        int errorCount = 0;
        const int batchSize = 100; // Dataverse recommends batches of 100-1000

        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Retrieving dependent components for {totalCount} components in batches of {batchSize}");

        for (int i = 0; i < totalCount; i += batchSize)
        {
            var batch = componentsList.Skip(i).Take(batchSize).ToList();
            var batchNum = (i / batchSize) + 1;
            var totalBatches = (int)Math.Ceiling((double)totalCount / batchSize);

            _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Processing batch {batchNum}/{totalBatches} ({batch.Count} components)");

            var executeMultiple = new ExecuteMultipleRequest
            {
                Settings = new ExecuteMultipleSettings
                {
                    ContinueOnError = true,
                    ReturnResponses = true
                },
                Requests = new OrganizationRequestCollection()
            };

            foreach (var component in batch)
            {
                executeMultiple.Requests.Add(new RetrieveDependentComponentsRequest
                {
                    ComponentType = component.ComponentType,
                    ObjectId = component.ObjectId
                });
            }

            try
            {
                var response = (ExecuteMultipleResponse)_client.Execute(executeMultiple);

                for (int j = 0; j < response.Responses.Count; j++)
                {
                    var item = response.Responses[j];

                    if (item.Fault != null)
                    {
                        errorCount++;
                        var component = batch[j];
                        _logger.LogWarning($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Failed to retrieve dependents for component type {component.ComponentType}, ObjectId {component.ObjectId}: {item.Fault.Message}");
                        continue;
                    }

                    var dependentResponse = (RetrieveDependentComponentsResponse)item.Response;
                    foreach (var dep in dependentResponse.EntityCollection.Entities)
                    {
                        results.Add(new DependencyInfo(
                            dep.GetAttributeValue<Guid>("dependencyid"),
                            dep.GetAttributeValue<OptionSetValue>("dependencytype").Value,
                            dep.GetAttributeValue<EntityReference>("dependentcomponentnodeid").Id,
                            dep.GetAttributeValue<EntityReference>("requiredcomponentnodeid").Id));
                    }
                    processedCount++;
                }
            }
            catch (Exception ex)
            {
                errorCount += batch.Count;
                _logger.LogError(ex, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Failed to execute batch {batchNum}. Continuing...");
            }
        }

        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Dependent components: Processed {processedCount}/{totalCount} components, {errorCount} errors, {results.Count} dependencies found");
        return results;
    }

    private HashSet<DependencyInfo> GetRequiredComponents(IEnumerable<SolutionComponentInfo> components)
    {
        var results = new HashSet<DependencyInfo>();
        var componentsList = components.ToList();
        int totalCount = componentsList.Count;
        int processedCount = 0;
        int errorCount = 0;
        const int batchSize = 100; // Dataverse recommends batches of 100-1000

        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Retrieving required components for {totalCount} components in batches of {batchSize}");

        for (int i = 0; i < totalCount; i += batchSize)
        {
            var batch = componentsList.Skip(i).Take(batchSize).ToList();
            var batchNum = (i / batchSize) + 1;
            var totalBatches = (int)Math.Ceiling((double)totalCount / batchSize);

            var executeMultiple = new ExecuteMultipleRequest
            {
                Settings = new ExecuteMultipleSettings
                {
                    ContinueOnError = true,
                    ReturnResponses = true
                },
                Requests = new OrganizationRequestCollection()
            };

            foreach (var component in batch)
            {
                executeMultiple.Requests.Add(new RetrieveRequiredComponentsRequest
                {
                    ComponentType = component.ComponentType,
                    ObjectId = component.ObjectId
                });
            }

            try
            {
                var response = (ExecuteMultipleResponse)_client.Execute(executeMultiple);

                for (int j = 0; j < response.Responses.Count; j++)
                {
                    var item = response.Responses[j];

                    if (item.Fault != null)
                    {
                        errorCount++;
                        var component = batch[j];
                        _logger.LogWarning($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Failed to retrieve required components for component type {component.ComponentType}, ObjectId {component.ObjectId}: {item.Fault.Message}");
                        continue;
                    }

                    var requiredResponse = (RetrieveRequiredComponentsResponse)item.Response;
                    foreach (var dep in requiredResponse.EntityCollection.Entities)
                    {
                        results.Add(new DependencyInfo(
                            dep.GetAttributeValue<Guid>("dependencyid"),
                            dep.GetAttributeValue<OptionSetValue>("dependencytype").Value,
                            dep.GetAttributeValue<EntityReference>("dependentcomponentnodeid").Id,
                            dep.GetAttributeValue<EntityReference>("requiredcomponentnodeid").Id));
                    }
                    processedCount++;
                }
            }
            catch (Exception ex)
            {
                errorCount += batch.Count;
                _logger.LogError(ex, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Failed to execute batch {batchNum}. Continuing...");
            }
        }

        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Required components: Processed {processedCount}/{totalCount} components, {errorCount} errors, {results.Count} dependencies found");
        return results;
    }

    /// <summary>
    /// Gets workflow dependencies for attributes by finding workflows (type 29) that depend on specified attributes
    /// </summary>
    /// <param name="attributeComponents">List of attribute components to check for dependencies</param>
    /// <returns>Dictionary mapping attribute ObjectId to list of workflow ObjectIds that depend on it</returns>
    public Dictionary<Guid, List<Guid>> GetWorkflowDependenciesForAttributes(IEnumerable<SolutionComponentInfo> attributeComponents)
    {
        var workflowDependencies = new Dictionary<Guid, List<Guid>>();

        // Filter to only attributes (component type 2)
        var attributes = attributeComponents.Where(c => c.ComponentType == 2).ToList();

        if (!attributes.Any())
        {
            _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] No attributes to check for workflow dependencies");
            return workflowDependencies;
        }

        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Checking {attributes.Count} attributes for workflow dependencies");

        // Get all dependent components for attributes
        var dependencies = GetDependentComponents(attributes);
        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Found {dependencies.Count} total dependencies for attributes");

        // Get unique dependent component node IDs
        var dependentNodeIds = dependencies.Select(d => d.DependentComponentNodeId).Distinct().ToList();
        if (!dependentNodeIds.Any())
        {
            return workflowDependencies;
        }

        // Retrieve component node information for all dependents
        var dependentNodes = GetComponentNodes(dependentNodeIds);

        // Filter to only workflow components (type 29)
        var workflowNodes = dependentNodes.Where(n => n.ComponentType == 29).ToList();
        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Found {workflowNodes.Count} workflow dependencies");

        // Build mapping: attribute ObjectId -> list of workflow ObjectIds
        foreach (var dependency in dependencies)
        {
            var workflowNode = workflowNodes.FirstOrDefault(n => n.NodeId == dependency.DependentComponentNodeId);
            if (workflowNode != null)
            {
                // Find the attribute this dependency is for
                var requiredNode = dependentNodes.FirstOrDefault(n => n.NodeId == dependency.RequiredComponentNodeId);
                if (requiredNode != null && requiredNode.ComponentType == 2) // Ensure it's an attribute
                {
                    if (!workflowDependencies.ContainsKey(requiredNode.ObjectId))
                    {
                        workflowDependencies[requiredNode.ObjectId] = new List<Guid>();
                    }
                    workflowDependencies[requiredNode.ObjectId].Add(workflowNode.ObjectId);
                }
            }
        }

        _logger.LogInformation($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] Mapped workflow dependencies to {workflowDependencies.Count} attributes");
        return workflowDependencies;
    }
}