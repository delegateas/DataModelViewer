namespace Generator.DTO.Warnings;

public enum SolutionWarningType
{
    Attribute,
    Webresource,
}

public record SolutionWarning(
        SolutionWarningType Type,
        string Message
    );
