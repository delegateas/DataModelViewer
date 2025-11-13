using Generator.Services.WebResources;
using Generator.Services.WebResources.Extractors;

namespace Generator.Tests.WebResourceAnalyzerTests;

/// <summary>
/// Base class for Web Resource analyzer tests providing shared instances
/// </summary>
public abstract class TestBase
{
    protected readonly WebResourceAnalyzer WebResourceAnalyzer;
    protected readonly WebApiAttributeExtractor WebApiExtractor;
    protected readonly XrmQueryAttributeExtractor XrmQueryExtractor;

    protected TestBase()
    {
        // Initialize analyzers once per test class
        WebResourceAnalyzer = new WebResourceAnalyzer(null!);
        WebApiExtractor = new WebApiAttributeExtractor();
        XrmQueryExtractor = new XrmQueryAttributeExtractor();
    }
}
