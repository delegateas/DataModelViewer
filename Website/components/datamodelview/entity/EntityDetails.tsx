'use client'

import { EntityType, OwnershipType } from "@/lib/Types";
import { Tooltip } from "@mui/material";
import { Eye, ClipboardList, Paperclip, Building, Users } from "lucide-react";

type EntityDetailType = {
    icon: JSX.Element;
    tooltip: string;
    color?: string;
};

export function EntityDetails({ entity }: { entity: EntityType }) {
    const details = getEntityDetails(entity);

    if (details.length === 0) return null;
    
    return (
        <div className="flex flex-wrap gap-2">
            {details.map((detail, index) => (
                <Tooltip key={index} title={detail.tooltip}>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm ${detail.color || 'bg-blue-50 text-blue-700'}`}>
                        {detail.icon}
                        <span>{detail.tooltip}</span>
                    </div>
                </Tooltip>
            ))}
        </div>
    );
}

function getEntityDetails(entity: EntityType): EntityDetailType[] {
    const details: EntityDetailType[] = [];

    if (entity.IsAuditEnabled) {
        details.push({ 
            icon: <Eye className="h-4 w-4" />, 
            tooltip: "Audit Enabled",
            color: 'bg-purple-50 text-purple-700'
        });
    }
    if (entity.IsActivity) {
        details.push({ 
            icon: <ClipboardList className="h-4 w-4" />, 
            tooltip: "Is Activity",
            color: 'bg-green-50 text-green-700'
        });
    }
    if (entity.IsNotesEnabled) {
        details.push({ 
            icon: <Paperclip className="h-4 w-4" />, 
            tooltip: "Notes Enabled",
            color: 'bg-orange-50 text-orange-700'
        });
    }

    switch (entity.Ownership) {
        case OwnershipType.OrganizationOwned:
            details.push({ 
                icon: <Building className="h-4 w-4" />, 
                tooltip: "Organization Owned",
                color: 'bg-gray-50 text-gray-700'
            });
            break;
        case OwnershipType.UserOwned:
        case OwnershipType.TeamOwned:
            details.push({ 
                icon: <Users className="h-4 w-4" />, 
                tooltip: "User/Team Owned",
                color: 'bg-gray-50 text-gray-700'
            });
            break;
    }

    return details;
}