'use client'

import { EntityType, OwnershipType } from "@/lib/Types";
import { AssignmentRounded, AttachmentRounded, BusinessRounded, FaceRounded, VisibilityRounded } from "@mui/icons-material";
import { Chip, ChipPropsColorOverrides, Tooltip, useTheme } from "@mui/material";
import { OverridableStringUnion } from "@mui/types";

type EntityDetailType = {
    icon: JSX.Element;
    tooltip: string;
    color?: OverridableStringUnion<'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', ChipPropsColorOverrides>;
};

export function EntityDetails({ entity }: { entity: EntityType }) {
    const details = getEntityDetails(entity);

    if (details.length === 0) return null;
    
    return (
        <div className="flex flex-wrap gap-2">
            {details.map((detail, index) => (
                <Tooltip key={index} title={detail.tooltip}>
                    <Chip 
                        variant="outlined"
                        size="small"
                        label={detail.tooltip}
                        icon={detail.icon}
                        color={detail.color} />
                </Tooltip>
            ))}
        </div>
    );
}

function getEntityDetails(entity: EntityType): EntityDetailType[] {
    const details: EntityDetailType[] = [];

    if (entity.IsAuditEnabled) {
        details.push({ 
            icon: <VisibilityRounded className="h-4 w-4" />, 
            tooltip: "Audit Enabled",
            color: "primary"
        });
    }
    if (entity.IsActivity) {
        details.push({ 
            icon: <AssignmentRounded className="h-4 w-4" />, 
            tooltip: "Is Activity",
            color: 'success'
        });
    }
    if (entity.IsNotesEnabled) {
        details.push({ 
            icon: <AttachmentRounded className="h-4 w-4" />, 
            tooltip: "Notes Enabled",
            color: 'warning'
        });
    }

    switch (entity.Ownership) {
        case OwnershipType.OrganizationOwned:
            details.push({ 
                icon: <BusinessRounded className="h-4 w-4" />, 
                tooltip: "Organization Owned",
                color: 'info'
            });
            break;
        case OwnershipType.UserOwned:
        case OwnershipType.TeamOwned:
            details.push({ 
                icon: <FaceRounded className="h-4 w-4" />, 
                tooltip: "User/Team Owned",
                color: 'info'
            });
            break;
    }

    return details;
}