using Generator.Services.PowerAutomate;
using Generator.Services.PowerAutomate.Analyzers;
using Generator.Services.PowerAutomate.Extractors;

namespace Generator.Tests.PowerAutomateAnalyzerTests;

/// <summary>
/// Base class for Power Automate analyzer tests providing shared instances
/// </summary>
public abstract class TestBase
{
    protected readonly PowerAutomateFlowAnalyzer FlowAnalyzer;
    protected readonly ListRowsAnalyzer ListRowsAnalyzer;
    protected readonly GetRowAnalyzer GetRowAnalyzer;
    protected readonly CreateRowAnalyzer CreateRowAnalyzer;
    protected readonly UpdateRowAnalyzer UpdateRowAnalyzer;
    protected readonly DeleteRowAnalyzer DeleteRowAnalyzer;
    protected readonly ODataExtractor ODataExtractor;
    protected readonly ExpressionExtractor ExpressionExtractor;

    protected TestBase()
    {
        // Initialize analyzers once per test class
        FlowAnalyzer = new PowerAutomateFlowAnalyzer(null!);
        ListRowsAnalyzer = new ListRowsAnalyzer();
        GetRowAnalyzer = new GetRowAnalyzer();
        CreateRowAnalyzer = new CreateRowAnalyzer();
        UpdateRowAnalyzer = new UpdateRowAnalyzer();
        DeleteRowAnalyzer = new DeleteRowAnalyzer();
        ODataExtractor = new ODataExtractor();
        ExpressionExtractor = new ExpressionExtractor();
    }
}
