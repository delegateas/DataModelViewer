namespace Generator;

public static class UtilityExtensions
{
    public static string StripGuid(this string guid) => guid.Replace("{", "").Replace("}", "").ToLower();
}
