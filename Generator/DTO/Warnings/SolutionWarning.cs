namespace Generator.DTO.Warnings;

public enum SolutionWarningType
{
    Attribute,
}

public record SolutionWarning(
        SolutionWarningType Type,
        string Message
    );
