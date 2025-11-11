using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;

/// <summary>
/// Builder for Dataverse Delete Record actions
/// </summary>
public class DeleteRecordActionBuilder : DataverseActionBuilder
{
    public new DeleteRecordActionBuilder WithEntityName(string entityName)
    {
        base.WithEntityName(entityName);
        return this;
    }

    public DeleteRecordActionBuilder WithRecordId(string recordId)
    {
        Parameters["recordId"] = recordId;
        return this;
    }

    public override JObject Build()
    {
        return CreateBaseAction("DeleteRecord");
    }
}
