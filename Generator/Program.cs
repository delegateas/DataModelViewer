using Generator;
using System;
using System.Text;

var dataverseService = new DataverseService();
var entities = (await dataverseService.GetFilteredMetadata()).ToList();

WebsiteBuilder.AddList(entities);

