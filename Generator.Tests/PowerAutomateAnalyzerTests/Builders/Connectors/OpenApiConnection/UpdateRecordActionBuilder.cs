using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;

/// <summary>
/// Builder for Dataverse Update Record actions
/// </summary>
public class UpdateRecordActionBuilder : DataverseActionBuilder
{
    private readonly JObject _item;

    public UpdateRecordActionBuilder()
    {
        _item = new JObject();
    }

    public new UpdateRecordActionBuilder WithEntityName(string entityName)
    {
        base.WithEntityName(entityName);
        return this;
    }

    public UpdateRecordActionBuilder WithRecordId(string recordId)
    {
        Parameters["recordId"] = recordId;
        return this;
    }

    public UpdateRecordActionBuilder WithField(string fieldName, object value)
    {
        _item[fieldName] = JToken.FromObject(value);
        return this;
    }

    public UpdateRecordActionBuilder WithFields(params (string name, object value)[] fields)
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
        return CreateBaseAction("UpdateRecord");
    }
}
