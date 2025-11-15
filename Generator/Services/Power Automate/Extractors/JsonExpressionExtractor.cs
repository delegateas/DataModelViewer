using Newtonsoft.Json.Linq;

namespace Generator.Services.PowerAutomate.Extractors;

/// <summary>
/// Recursively extracts expression strings from JSON tokens
/// </summary>
public class JsonExpressionExtractor
{
    /// <summary>
    /// Recursively extracts expressions from JSON tokens
    /// </summary>
    public IEnumerable<string> ExtractExpressionsFromJson(JToken token)
    {
        switch (token)
        {
            case JValue value when value.Type == JTokenType.String:
            {
                var stringValue = value.ToString();
                // Look for @{...} or @ expressions
                if (stringValue.Contains("@{") || stringValue.Contains("@"))
                {
                    yield return stringValue;
                }
                break;
            }
            case JObject obj:
            {
                foreach (var prop in obj.Properties())
                {
                    foreach (var expr in ExtractExpressionsFromJson(prop.Value))
                    {
                        yield return expr;
                    }
                }
                break;
            }
            case JArray array:
            {
                foreach (var item in array)
                {
                    foreach (var expr in ExtractExpressionsFromJson(item))
                    {
                        yield return expr;
                    }
                }
                break;
            }
        }
    }
}
