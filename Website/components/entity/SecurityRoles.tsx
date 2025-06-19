'use client'

import { SecurityRole, PrivilegeDepth } from "@/lib/Types";
import { Ban, User, Users, Boxes, Building2, Minus } from "lucide-react";
import { HybridTooltip, HybridTooltipContent, HybridTooltipTrigger } from "../ui/hybridtooltop";

export function SecurityRoles({ roles }: { roles: SecurityRole[] }) {
    return (
        <div className="flex flex-col gap-2 w-full overflow-x-auto">
            {roles.map(role => (
                <SecurityRoleRow key={role.Name} role={role} />
            ))}
        </div>
    );
}

function SecurityRoleRow({ role }: { role: SecurityRole }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50 rounded-lg p-4 border border-gray-100 w-full min-w-[320px]">
            <p className="font-bold text-base text-wrap truncate max-w-full sm:max-w-[180px] md:max-w-[240px]">{role.Name}</p>
            <div className="flex flex-wrap sm:flex-nowrap gap-2 align-bottom overflow-x-auto">
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
        <div className="flex flex-col items-center min-w-[60px] max-w-[80px]">
            <p className="w-max text-xs sm:text-sm truncate">{name}</p>
            <GetDepthIcon depth={depth} />
        </div>
    );
}

function GetDepthIcon({ depth }: { depth: PrivilegeDepth | null }) {

    let icon = null;
    let tooltip = "";

    if (depth === null || depth === undefined) {
        icon = <Minus className="h-4 w-4 text-black" />;
        tooltip = "Unavailable";
    } else {
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
    }

    return (
        <HybridTooltip>
            <HybridTooltipTrigger asChild>{icon}</HybridTooltipTrigger>
            <HybridTooltipContent>{tooltip}</HybridTooltipContent>
        </HybridTooltip>
    );
}