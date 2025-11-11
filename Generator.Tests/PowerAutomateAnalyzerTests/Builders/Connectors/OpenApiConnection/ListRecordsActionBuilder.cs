using Newtonsoft.Json.Linq;

namespace Generator.Tests.PowerAutomateAnalyzerTests.Builders.Connectors.OpenApiConnection;

/// <summary>
/// Builder for Dataverse List Records actions
/// </summary>
public class ListRecordsActionBuilder : DataverseActionBuilder
{
    public new ListRecordsActionBuilder WithEntityName(string entityName)
    {
        base.WithEntityName(entityName);
        return this;
    }

    public ListRecordsActionBuilder WithSelect(params string[] fields)
    {
        Parameters["$select"] = string.Join(",", fields);
        return this;
    }

    public ListRecordsActionBuilder WithFilter(string filterExpression)
    {
        Parameters["$filter"] = filterExpression;
        return this;
    }

    public ListRecordsActionBuilder WithExpand(string expandExpression)
    {
        Parameters["$expand"] = expandExpression;
        return this;
    }

    public override JObject Build()
    {
        return CreateBaseAction("ListRecords");
    }
}
