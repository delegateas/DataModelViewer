'use client'

import { SecurityRole, PrivilegeDepth } from "@/lib/Types";
import { Ban, User, Users, Boxes, Building2 } from "lucide-react";
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from "../ui/hybridtooltop";

export function SecurityRoles({ roles }: { roles: SecurityRole[] }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {roles.map(role => (
                <SecurityRoleRow key={role.Name} role={role} />
            ))}
        </div>
    );
}

function SecurityRoleRow({ role }: { role: SecurityRole }) {
    return (
        <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg p-4 border border-gray-100 w-full">
            <p className="font-bold text-base text-wrap">{role.Name}</p>
            <div className="flex gap-2 align-bottom">
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
        <div className="flex flex-col items-center min-w-[60px]">
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
            icon = <Ban className="h-4 w-4 text-red-600" />;
            tooltip = "None";
            break;
        case PrivilegeDepth.Basic:
            icon = <User className="h-4 w-4 text-gray-600" />;
            tooltip = "User";
            break;
        case PrivilegeDepth.Local:
            icon = <Users className="h-4 w-4 text-gray-600" />;
            tooltip = "Business Unit";
            break;
        case PrivilegeDepth.Deep:
            icon = <Boxes className="h-4 w-4 text-sky-600" />;
            tooltip = "Parent: Child Business Units";
            break;
        case PrivilegeDepth.Global:
            icon = <Building2 className="h-4 w-4 text-green-600" />;
            tooltip = "Organization";
            break;
        default:
            return null;
    }

    return (
        <HybridTooltip>
            <HybridTooltipTrigger asChild>{icon}</HybridTooltipTrigger>
            <HybridTooltipContent>{tooltip}</HybridTooltipContent>
        </HybridTooltip>
    );
}