using Generator.DTO;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Xml.Linq;

namespace Generator.Queries;

public static class WebResourceQueries
{

    public static async Task<IEnumerable<WebResource>> GetWebResourcesAsync(this ServiceClient service, List<Guid>? solutionIds = null)
    {
        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid"),
            Criteria = new FilterExpression(LogicalOperator.And)
            {
                Conditions =
                {
                    new ConditionExpression("solutionid", ConditionOperator.In, solutionIds),
                    new ConditionExpression("componenttype", ConditionOperator.Equal, 61) // 61 = Web Resource
                }
            },
            LinkEntities =
            {
                new LinkEntity(
                    "solutioncomponent",
                    "webresource",
                    "objectid",
                    "webresourceid",
                    JoinOperator.Inner)
                {
                    Columns = new ColumnSet("webresourceid", "name", "content", "webresourcetype", "description"),
                    EntityAlias = "webresource",
                    LinkCriteria = new FilterExpression
                    {
                        Conditions =
                        {
                            new ConditionExpression("webresourcetype", ConditionOperator.Equal, 3) // JS Resources
                        }
                    }
                }
            }
        };

        var results = (await service.RetrieveMultipleAsync(query)).Entities;
        var formsDependencies = await service.GetDependentForms(solutionIds);

        var webResources = results.Select(e =>
        {
            var content = "";
            var contentValue = e.GetAttributeValue<AliasedValue>("webresource.content")?.Value;
            var webresourceId = e.GetAttributeValue<AliasedValue>("webresource.webresourceid").Value?.ToString() ?? "";
            var webresourceName = e.GetAttributeValue<AliasedValue>("webresource.name").Value?.ToString();
            var dependencies = formsDependencies.GetValueOrDefault(webresourceName, Enumerable.Empty<Form>());
            if (contentValue != null)
            {
                // Content is base64 encoded, decode it
                var base64Content = contentValue.ToString();
                if (!string.IsNullOrEmpty(base64Content))
                {
                    try
                    {
                        var bytes = Convert.FromBase64String(base64Content);
                        content = System.Text.Encoding.UTF8.GetString(bytes);
                    }
                    catch
                    {
                        // If decoding fails, keep the base64 content
                        content = base64Content;
                    }
                }
            }

            return new WebResource(
                dependencies,
                webresourceId,
                webresourceName,
                content,
                (OptionSetValue)e.GetAttributeValue<AliasedValue>("webresource.webresourcetype").Value,
                e.GetAttributeValue<AliasedValue>("webresource.description")?.Value?.ToString()
            );
        });

        return webResources;
    }

    /// <summary>
    /// Retrieve all forms in the solutions and return the dependencies to webresources.
    /// </summary>
    /// <param name="service"></param>
    /// <param name="solutionIds"></param>
    /// <returns>A dictionary where the key is the weresource id and the value is a list of forms depending on this weresource.</returns>
    private static async Task<Dictionary<string, IEnumerable<Form>>> GetDependentForms(this ServiceClient service, List<Guid>? solutionIds = null)
    {
        var query = new QueryExpression("solutioncomponent")
        {
            ColumnSet = new ColumnSet("objectid"),
            Criteria = new FilterExpression(LogicalOperator.And)
            {
                Conditions =
                {
                    new ConditionExpression("solutionid", ConditionOperator.In, solutionIds),
                    new ConditionExpression("componenttype", ConditionOperator.Equal, 60) // 60 = System Form OBS not 24 = Form
                }
            },
            LinkEntities =
            {
                new LinkEntity(
                    "solutioncomponent",
                    "systemform",
                    "objectid",
                    "formid",
                    JoinOperator.Inner)
                {
                    EntityAlias = "form",
                    Columns = new ColumnSet("formid", "name", "objecttypecode", "formxml"),
                }
            }
        };

        var forms = await service.RetrieveMultipleAsync(query);

        var webresources = forms.Entities.SelectMany(form =>
        {
            var content = form.GetAttributeValue<AliasedValue>("form.formxml").Value.ToString() ?? "";
            var formid = form.GetAttributeValue<AliasedValue>("form.formid").Value.ToString();
            var formname = form.GetAttributeValue<AliasedValue>("form.name").Value.ToString();
            var entityname = form.GetAttributeValue<AliasedValue>("form.objecttypecode").Value.ToString();

            var doc = XDocument.Parse(content, LoadOptions.PreserveWhitespace);

            var libraries = doc.Descendants("formLibraries")
               .Descendants("Library")
               .Select(lib => new
               {
                   Name = lib.Attribute("name")?.Value,
                   Form = formid,
                   FormName = formname,
                   FormEntity = entityname
               });

            return libraries;
        });

        return webresources
            .Where(x => !string.IsNullOrWhiteSpace(x.Name))
            .GroupBy(x => x.Name!)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => new Form(x.Form, x.FormName, x.FormEntity))
                      .Distinct()
            );
    }
}
