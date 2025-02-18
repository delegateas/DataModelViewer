'use client'

import { SecurityRole, PrivilegeDepth } from "@/lib/Types";
import { Ban, User, Users, Boxes, Building2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SecurityRoles({ roles }: { roles: SecurityRole[] }) {
    return (
        <div className="w-full lg:w-auto flex flex-col justify-center lg:border-l-2 lg:pl-5 gap-2">
            {roles.map(role => (
                <SecurityRoleRow key={role.Name} role={role} />
            ))}
        </div>
    );
}

function SecurityRoleRow({ role }: { role: SecurityRole }) {
    return (
        <div className="flex flex-col lg:flex-row justify-start lg:justify-end items-start lg:items-center gap-2">
            <p className="font-bold lg:pr-3 lg:w-max">{role.Name}</p>
            <div className="grid grid-cols-4 lg:flex lg:flex-row gap-2">
                <PrivilegeIcon name="Create" depth={role.Create} />
                <PrivilegeIcon name="Read" depth={role.Read} />
                <PrivilegeIcon name="Write" depth={role.Write} />
                <PrivilegeIcon name="Delete" depth={role.Delete} />
                <PrivilegeIcon name="Append" depth={role.Append} />
                <PrivilegeIcon name="Append To" depth={role.AppendTo} />
                <PrivilegeIcon name="Assign" depth={role.Assign} />
            </div>
        </div>
    );
}

function PrivilegeIcon({ name, depth }: { name: string, depth: PrivilegeDepth | null }) {
    return (
        <div className="flex flex-col items-center">
            <p className="w-max text-sm">{name}</p>
            <GetDepthIcon depth={depth} />
        </div>
    );
}

function GetDepthIcon({ depth }: { depth: PrivilegeDepth | null }) {
    if (depth === null || depth === undefined) return null;

    let icon = null;
    let tooltip = "";

    switch (depth) {
        case PrivilegeDepth.None:
            icon = <Ban className="h-4 w-4" />;
            tooltip = "None";
            break;
        case PrivilegeDepth.Basic:
            icon = <User className="h-4 w-4" />;
            tooltip = "User";
            break;
        case PrivilegeDepth.Local:
            icon = <Users className="h-4 w-4" />;
            tooltip = "Business Unit";
            break;
        case PrivilegeDepth.Deep:
            icon = <Boxes className="h-4 w-4" />;
            tooltip = "Parent: Child Business Units";
            break;
        case PrivilegeDepth.Global:
            icon = <Building2 className="h-4 w-4" />;
            tooltip = "Organization";
            break;
        default:
            return null;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{icon}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}