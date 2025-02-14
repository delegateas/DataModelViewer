using Microsoft.Crm.Sdk.Messages;

namespace Generator.DTO;

public record SecurityRole(
    string Name, 
    string LogicalName,
    PrivilegeDepth? Create,
    PrivilegeDepth? Read,
    PrivilegeDepth? Write,
    PrivilegeDepth? Delete,
    PrivilegeDepth? Append,
    PrivilegeDepth? AppendTo,
    PrivilegeDepth? Assign);
