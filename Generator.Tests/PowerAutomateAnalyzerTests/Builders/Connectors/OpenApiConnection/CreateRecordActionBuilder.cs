using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;

/// <summary>
/// Builder for Dataverse Create Record actions
/// </summary>
public class CreateRecordActionBuilder : DataverseActionBuilder
{
    private readonly JObject _item;

    public CreateRecordActionBuilder()
    {
        _item = new JObject();
    }

    public new CreateRecordActionBuilder WithEntityName(string entityName)
    {
        base.WithEntityName(entityName);
        return this;
    }

    public CreateRecordActionBuilder WithField(string fieldName, object value)
    {
        _item[fieldName] = JToken.FromObject(value);
        return this;
    }

    public CreateRecordActionBuilder WithFields(params (string name, object value)[] fields)
    {
        foreach (var (name, value) in fields)
        {
            _item[name] = JToken.FromObject(value);
        }
        return this;
    }

    public override JObject Build()
    {
        Parameters["item"] = _item;
        return CreateBaseAction("CreateRecord");
    }
}
