using Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;
using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders;

/// <summary>
/// Builder for creating Power Automate flow definitions for testing
/// </summary>
public class PowerAutomateFlowBuilder
{
    private readonly JObject _flowDefinition;
    private readonly JObject _actions;
    private readonly JObject _triggers;

    public PowerAutomateFlowBuilder()
    {
        _actions = new JObject();
        _triggers = new JObject();

        _flowDefinition = new JObject
        {
            ["properties"] = new JObject
            {
                ["definition"] = new JObject
                {
                    ["actions"] = _actions,
                    ["triggers"] = _triggers
                }
            }
        };
    }

    /// <summary>
    /// Adds an action to the flow
    /// </summary>
    public PowerAutomateFlowBuilder AddAction(string actionName, JObject actionDefinition)
    {
        _actions[actionName] = actionDefinition;
        return this;
    }

    /// <summary>
    /// Adds a trigger to the flow
    /// </summary>
    public PowerAutomateFlowBuilder AddTrigger(string triggerName, JObject triggerDefinition)
    {
        _triggers[triggerName] = triggerDefinition;
        return this;
    }

    /// <summary>
    /// Adds a Dataverse List Records action
    /// </summary>
    public PowerAutomateFlowBuilder AddListRecords(string actionName, Action<ListRecordsActionBuilder> configure)
    {
        var builder = new ListRecordsActionBuilder();
        configure(builder);
        return AddAction(actionName, builder.Build());
    }

    /// <summary>
    /// Adds a Dataverse Get Item action
    /// </summary>
    public PowerAutomateFlowBuilder AddGetItem(string actionName, Action<GetItemActionBuilder> configure)
    {
        var builder = new GetItemActionBuilder();
        configure(builder);
        return AddAction(actionName, builder.Build());
    }

    /// <summary>
    /// Adds a Dataverse Create Record action
    /// </summary>
    public PowerAutomateFlowBuilder AddCreateRecord(string actionName, Action<CreateRecordActionBuilder> configure)
    {
        var builder = new CreateRecordActionBuilder();
        configure(builder);
        return AddAction(actionName, builder.Build());
    }

    /// <summary>
    /// Adds a Dataverse Update Record action
    /// </summary>
    public PowerAutomateFlowBuilder AddUpdateRecord(string actionName, Action<UpdateRecordActionBuilder> configure)
    {
        var builder = new UpdateRecordActionBuilder();
        configure(builder);
        return AddAction(actionName, builder.Build());
    }

    /// <summary>
    /// Adds a Dataverse Delete Record action
    /// </summary>
    public PowerAutomateFlowBuilder AddDeleteRecord(string actionName, Action<DeleteRecordActionBuilder> configure)
    {
        var builder = new DeleteRecordActionBuilder();
        configure(builder);
        return AddAction(actionName, builder.Build());
    }

    /// <summary>
    /// Adds a Dataverse trigger
    /// </summary>
    public PowerAutomateFlowBuilder AddDataverseTrigger(string triggerName, Action<DataverseTriggerBuilder> configure)
    {
        var builder = new DataverseTriggerBuilder();
        configure(builder);
        return AddTrigger(triggerName, builder.Build());
    }

    /// <summary>
    /// Builds the flow definition as a JSON string
    /// </summary>
    public string BuildAsJson()
    {
        return _flowDefinition.ToString(Newtonsoft.Json.Formatting.None);
    }

    /// <summary>
    /// Builds the flow definition as a JObject
    /// </summary>
    public JObject Build()
    {
        return _flowDefinition;
    }
}
