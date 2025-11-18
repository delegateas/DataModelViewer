using Generator.DTO;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.PowerPlatform.Dataverse.Client;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;

namespace Generator.Services
{
    /// <summary>
    /// Service responsible for querying and mapping security roles
    /// </summary>
    internal class SecurityRoleService
    {
        private readonly ServiceClient client;

        public SecurityRoleService(ServiceClient client)
        {
            this.client = client;
        }

        /// <summary>
        /// Retrieves and maps security roles with their privileges
        /// </summary>
        public async Task<Dictionary<string, List<SecurityRole>>> GetSecurityRoles(
            List<Guid> rolesInSolution,
            Dictionary<string, SecurityPrivilegeMetadata[]> privileges)
        {
            if (rolesInSolution.Count == 0) return [];

            var query = new QueryExpression("role")
            {
                ColumnSet = new ColumnSet("name"),
                Criteria = new FilterExpression(LogicalOperator.And)
                {
                    Conditions =
                    {
                        new ConditionExpression("roleid", ConditionOperator.In, rolesInSolution)
                    }
                },
                LinkEntities =
                {
                    new LinkEntity("role", "roleprivileges", "roleid", "roleid", JoinOperator.Inner)
                    {
                        EntityAlias = "rolepriv",
                        Columns = new ColumnSet("privilegedepthmask"),
                        LinkEntities =
                        {
                            new LinkEntity("roleprivileges", "privilege", "privilegeid", "privilegeid", JoinOperator.Inner)
                            {
                                EntityAlias = "priv",
                                Columns = new ColumnSet("accessright"),
                                LinkEntities =
                                {
                                    new LinkEntity("privilege", "privilegeobjecttypecodes", "privilegeid", "privilegeid", JoinOperator.Inner)
                                    {
                                        EntityAlias = "privotc",
                                        Columns = new ColumnSet("objecttypecode")
                                    }
                                }
                            }
                        }
                    }
                }
            };

            var roles = await client.RetrieveMultipleAsync(query);

            var rolePrivileges = roles.Entities.Select(e =>
            {
                var name = e.GetAttributeValue<string>("name");
                var depth = (PrivilegeDepth)e.GetAttributeValue<AliasedValue>("rolepriv.privilegedepthmask").Value;
                var accessRight = (AccessRights)e.GetAttributeValue<AliasedValue>("priv.accessright").Value;
                var objectTypeCode = e.GetAttributeValue<AliasedValue>("privotc.objecttypecode").Value as string;

                return new
                {
                    name,
                    depth,
                    accessRight,
                    objectTypeCode = objectTypeCode ?? string.Empty
                };
            });

            static PrivilegeDepth? GetDepth(Dictionary<AccessRights, PrivilegeDepth> dict, AccessRights right, SecurityPrivilegeMetadata? meta)
            {
                if (!dict.TryGetValue(right, out var value))
                    return meta?.CanBeGlobal ?? false ? 0 : null;
                return value;
            }

            return rolePrivileges
                .GroupBy(x => x.objectTypeCode)
                .ToDictionary(byLogicalName => byLogicalName.Key, byLogicalName =>
                    byLogicalName
                    .GroupBy(x => x.name)
                    .Select(byRole =>
                    {
                        var accessRights = byRole
                            .GroupBy(x => x.accessRight)
                            .ToDictionary(x => x.Key, x => x.First().depth);

                        var privilegeMetadata = privileges.GetValueOrDefault(byLogicalName.Key) ?? [];

                        return new SecurityRole(
                            byRole.Key,
                            byLogicalName.Key,
                            GetDepth(accessRights, AccessRights.CreateAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Create)),
                            GetDepth(accessRights, AccessRights.ReadAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Read)),
                            GetDepth(accessRights, AccessRights.WriteAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Write)),
                            GetDepth(accessRights, AccessRights.DeleteAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Delete)),
                            GetDepth(accessRights, AccessRights.AppendAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Append)),
                            GetDepth(accessRights, AccessRights.AppendToAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.AppendTo)),
                            GetDepth(accessRights, AccessRights.AssignAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Assign)),
                            GetDepth(accessRights, AccessRights.ShareAccess, privilegeMetadata.FirstOrDefault(p => p.PrivilegeType == PrivilegeType.Share))
                        );
                    })
                    .ToList());
        }
    }
}
