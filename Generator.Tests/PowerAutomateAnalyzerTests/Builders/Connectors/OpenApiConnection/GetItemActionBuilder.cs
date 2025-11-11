using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;

/// <summary>
/// Builder for Dataverse Get Item actions
/// </summary>
public class GetItemActionBuilder : DataverseActionBuilder
{
    public new GetItemActionBuilder WithEntityName(string entityName)
    {
        base.WithEntityName(entityName);
        return this;
    }

    public GetItemActionBuilder WithRecordId(string recordId)
    {
        Parameters["recordId"] = recordId;
        return this;
    }

    public GetItemActionBuilder WithSelect(params string[] fields)
    {
        Parameters["$select"] = string.Join(",", fields);
        return this;
    }

    public override JObject Build()
    {
        return CreateBaseAction("GetItem");
    }
}
