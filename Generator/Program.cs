using Generator;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

var configuration =
    new ConfigurationBuilder()
    .AddEnvironmentVariables()
    .AddJsonFile("appsettings.local.json", optional: true)
    .Build();
var verbose = configuration.GetValue("Verbosity", LogLevel.Information);

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .SetMinimumLevel(verbose)
        .AddConsole();
});
var logger = loggerFactory.CreateLogger<DataverseService>();

var dataverseService = new DataverseService(configuration, logger);
var entities = (await dataverseService.GetFilteredMetadata()).ToList();
var solutionOverview = await dataverseService.GetSolutionOverview();

var websiteBuilder = new WebsiteBuilder(configuration, entities, solutionOverview);
websiteBuilder.AddData();

