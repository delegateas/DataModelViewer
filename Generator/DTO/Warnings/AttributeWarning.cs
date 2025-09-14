namespace Generator.DTO.Warnings;

public record AttributeWarning(string Message) : SolutionWarning(
        SolutionWarningType.Attribute,
        Message
    );
