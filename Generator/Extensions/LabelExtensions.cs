using Microsoft.Xrm.Sdk;

namespace Generator.Extensions;

public static class LabelExtensions
{
    public static string ToLabelString(this Label label) => label?.UserLocalizedLabel?.Label ?? label?.LocalizedLabels.FirstOrDefault()?.Label ?? "(no name)";
}
