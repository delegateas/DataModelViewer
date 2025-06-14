'use client'

import { SecurityRole, PrivilegeDepth } from "@/lib/Types";
import { Ban, User, Users, Boxes, Building2, Minus } from "lucide-react";
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from "../ui/hybridtooltop";

export function SecurityRoles({ roles }: { roles: SecurityRole[] }) {
    return (
        <div className="flex flex-col gap-2 xl:items-end w-fit">
            {roles.map(role => (
                <SecurityRoleRow key={role.Name} role={role} />
            ))}
        </div>
    );
}

function SecurityRoleRow({ role }: { role: SecurityRole }) {
    return (
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
            <p className="font-bold xl:pr-3 xl:w-max">{role.Name}</p>
            <div className="flex flex-row gap-2">
                <PrivilegeIcon name="Create" depth={role.Create} />
                <PrivilegeIcon name="Read" depth={role.Read} />
                <PrivilegeIcon name="Write" depth={role.Write} />
                <PrivilegeIcon name="Delete" depth={role.Delete} />
                <PrivilegeIcon name="Append" depth={role.Append} />
                <PrivilegeIcon name="Append To" depth={role.AppendTo} />
                <PrivilegeIcon name="Assign" depth={role.Assign} />
                <PrivilegeIcon name="Share" depth={role.Share} />
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

    let icon = null;
    let tooltip = "";

    if (depth === null || depth === undefined) {
        icon = <Minus className="h-4 w-4" />;
        tooltip = "Unavailable";
    } else {
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
    }

    return (
        <HybridTooltip>
            <HybridTooltipTrigger asChild>{icon}</HybridTooltipTrigger>
            <HybridTooltipContent>{tooltip}</HybridTooltipContent>
        </HybridTooltip>
    );
}