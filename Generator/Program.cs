using Generator;
using Microsoft.Extensions.Configuration;

var configuration = 
    new ConfigurationBuilder()
    .AddEnvironmentVariables()
    .AddJsonFile("appsettings.local.json", optional: true)
    .Build();

var dataverseService = new DataverseService(configuration);
var entities = (await dataverseService.GetFilteredMetadata()).ToList();


var websiteBuilder = new WebsiteBuilder(configuration, entities);
websiteBuilder.AddData();

