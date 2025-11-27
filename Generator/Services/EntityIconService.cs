using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System.Reflection;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for retrieving entity icons from Dataverse and local files
    /// </summary>
    internal class EntityIconService
    {
        private readonly ServiceClient client;

        public EntityIconService(ServiceClient client)
        {
            this.client = client;
        }

        /// <summary>
        /// Retrieves entity icons, first from Dataverse webresources, then from local entityicons directory
        /// </summary>
        public async Task<Dictionary<string, string>> GetEntityIconMap(IEnumerable<EntityMetadata> entities)
        {
            var logicalNameToIconName =
                entities
                .Where(x => x.IconVectorName != null)
                .ToDictionary(x => x.LogicalName, x => x.IconVectorName);

            var query = new QueryExpression("webresource")
            {
                ColumnSet = new ColumnSet("content", "name"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("name", ConditionOperator.In, logicalNameToIconName.Values.ToList())
                    }
                }
            };

            var webresources = await client.RetrieveMultipleAsync(query);
            var iconNameToSvg = webresources.Entities.ToDictionary(x => x.GetAttributeValue<string>("name"), x => x.GetAttributeValue<string>("content"));

            var logicalNameToSvg =
                logicalNameToIconName
                .Where(x => iconNameToSvg.ContainsKey(x.Value) && !string.IsNullOrEmpty(iconNameToSvg[x.Value]))
                .ToDictionary(x => x.Key, x => iconNameToSvg.GetValueOrDefault(x.Value) ?? string.Empty);

            var sourceDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var iconDirectory = Path.Combine(sourceDirectory ?? string.Empty, "../../../entityicons");

            var iconFiles = Directory.GetFiles(iconDirectory).ToDictionary(x => Path.GetFileNameWithoutExtension(x), x => x);

            foreach (var entity in entities)
            {
                if (logicalNameToSvg.ContainsKey(entity.LogicalName))
                {
                    continue;
                }

                var iconKey = $"svg_{entity.ObjectTypeCode}";
                if (iconFiles.ContainsKey(iconKey))
                {
                    logicalNameToSvg[entity.LogicalName] = Convert.ToBase64String(File.ReadAllBytes(iconFiles[iconKey]));
                }
            }

            return logicalNameToSvg;
        }
    }
}
