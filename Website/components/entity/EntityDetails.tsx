'use client'

import { EntityType, OwnershipType } from "@/lib/Types";
import { Eye, ClipboardList, Paperclip, Building, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type EntityDetailType = {
    icon: JSX.Element;
    tooltip: string;
};

export function EntityDetails({ entity }: { entity: EntityType }) {
    const details = getEntityDetails(entity);

    return (
        <div className="flex flex-row gap-1 py-1">
            {details.map((detail, index) => (
                <Tooltip key={index}>
                    <TooltipTrigger asChild>{detail.icon}</TooltipTrigger>
                    <TooltipContent>{detail.tooltip}</TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
}

function getEntityDetails(entity: EntityType): EntityDetailType[] {
    const details: EntityDetailType[] = [];

    if (entity.IsAuditEnabled) {
        details.push({ icon: <Eye className="h-4 w-4" />, tooltip: "Audit Enabled" });
    }
    if (entity.IsActivity) {
        details.push({ icon: <ClipboardList className="h-4 w-4" />, tooltip: "Is Activity" });
    }
    if (entity.IsNotesEnabled) {
        details.push({ icon: <Paperclip className="h-4 w-4" />, tooltip: "Notes Enabled" });
    }

    switch (entity.Ownership) {
        case OwnershipType.OrganizationOwned:
            details.push({ icon: <Building className="h-4 w-4" />, tooltip: "Organization Owned" });
            break;
        case OwnershipType.UserOwned:
        case OwnershipType.TeamOwned:
            details.push({ icon: <Users className="h-4 w-4" />, tooltip: "User/Team Owned" });
            break;
    }

    return details;
}