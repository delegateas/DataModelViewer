'use client'

import { AttributeType, CalculationMethods, ComponentType, RequiredLevel } from "@/lib/Types";
import { Tooltip } from "@mui/material";
import { Calculator, CircleAlert, CirclePlus, Eye, Lock, Sigma, Zap } from "lucide-react";

export function AttributeDetails({ attribute }: { attribute: AttributeType }) {
    const details = [];

    switch (attribute.RequiredLevel) {
        case RequiredLevel.SystemRequired:
        case RequiredLevel.ApplicationRequired:
            details.push({ icon: <CircleAlert className="h-4 w-4" />, tooltip: "Required" });
            break;
        case RequiredLevel.Recommended:
            details.push({ icon: <CirclePlus className="h-4 w-4" />, tooltip: "Recommended" });
            break;
    }

    switch (attribute.CalculationMethod) {
        case CalculationMethods.Calculated:
            details.push({ icon: <Calculator className="h-4 w-4" />, tooltip: "Calculated" });
            break;
        case CalculationMethods.Rollup:
            details.push({ icon: <Sigma className="h-4 w-4" />, tooltip: "Rollup" });
            break;
    }

    if (attribute.IsAuditEnabled) {
        details.push({ icon: <Eye className="h-4 w-4" />, tooltip: "Audit Enabled" });
    }

    if (attribute.IsColumnSecured) {
        details.push({ icon: <Lock className="h-4 w-4" />, tooltip: "Field Security" });
    }

    if (attribute.AttributeUsages.some(a => a.ComponentType == ComponentType.Plugin)) {
        const tooltip = `Plugins ${attribute.AttributeUsages.map(au => au.Name).join(", ")}`;
        details.push({ icon: <Zap className="h-4 w-4" />, tooltip });
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