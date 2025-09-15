'use client'

import { AttributeType, CalculationMethods, ComponentType, RequiredLevel } from "@/lib/Types";
import { AccountTreeRounded, AddCircleOutlineRounded, CalculateRounded, ElectricBoltRounded, ErrorRounded, FunctionsRounded, JavascriptRounded, LockRounded, VisibilityRounded } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

export function AttributeDetails({ attribute }: { attribute: AttributeType }) {
    const details = [];

    switch (attribute.RequiredLevel) {
        case RequiredLevel.SystemRequired:
        case RequiredLevel.ApplicationRequired:
            details.push({ icon: <ErrorRounded className="h-4 w-4" />, tooltip: "Required" });
            break;
        case RequiredLevel.Recommended:
            details.push({ icon: <AddCircleOutlineRounded className="h-4 w-4" />, tooltip: "Recommended" });
            break;
    }

    switch (attribute.CalculationMethod) {
        case CalculationMethods.Calculated:
            details.push({ icon: <CalculateRounded className="h-4 w-4" />, tooltip: "Calculated" });
            break;
        case CalculationMethods.Rollup:
            details.push({ icon: <FunctionsRounded className="h-4 w-4" />, tooltip: "Rollup" });
            break;
    }

    if (attribute.IsAuditEnabled) {
        details.push({ icon: <VisibilityRounded className="h-4 w-4" />, tooltip: "Audit Enabled" });
    }

    if (attribute.IsColumnSecured) {
        details.push({ icon: <LockRounded className="h-4 w-4" />, tooltip: "Field Security" });
    }

    if (attribute.AttributeUsages.some(a => a.ComponentType == ComponentType.Plugin)) {
        const tooltip = `Plugins ${attribute.AttributeUsages.filter(au => au.ComponentType == ComponentType.Plugin).map(au => au.Name).join(", ")}`;
        details.push({ icon: <ElectricBoltRounded className="h-4 w-4" />, tooltip });
    }

    if (attribute.AttributeUsages.some(a => a.ComponentType == ComponentType.PowerAutomateFlow)) {
        const tooltip = `Power Automate Flows ${attribute.AttributeUsages.filter(au => au.ComponentType == ComponentType.PowerAutomateFlow).map(au => au.Name).join(", ")}`;
        details.push({ icon: <AccountTreeRounded className="h-4 w-4" />, tooltip });
    }

    if (attribute.AttributeUsages.some(a => a.ComponentType == ComponentType.WebResource)) {
        const tooltip = `Web Resources ${attribute.AttributeUsages.filter(au => au.ComponentType == ComponentType.WebResource).map(au => au.Name).join(", ")}`;
        details.push({ icon: <JavascriptRounded className="h-4 w-4" />, tooltip });
    }

    return (
        <div className="flex flex-row gap-1">
            {details.map((detail, index) => (
                <Tooltip key={index} title={detail.tooltip}>
                    {detail.icon}
                </Tooltip>
            ))}
        </div>
    );
}