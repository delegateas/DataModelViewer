'use client'

import { AttributeType, CalculationMethods, RequiredLevel } from "@/lib/Types";
import { AddCircleOutlineRounded, BadgeRounded, CalculateRounded, ElectricBoltRounded, ErrorRounded, FunctionsRounded, KeyRounded, LockRounded, VisibilityRounded } from "@mui/icons-material";
import { Box, Link, Tooltip, Typography } from "@mui/material";

export function AttributeDetails({ entityName, attribute }: { entityName: string, attribute: AttributeType }) {
    const details = [];

    if (attribute.IsPrimaryId) {
        details.push({ icon: <KeyRounded className="h-4 w-4" />, tooltip: "Primary ID" });
    }

    if (attribute.IsPrimaryName) {
        details.push({ icon: <BadgeRounded className="h-4 w-4" />, tooltip: "Primary Name" });
    }

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

    if (attribute.AttributeUsages.length > 0) {
        const tooltip = <span className="">
            <b>Usages ({attribute.AttributeUsages.length}):</b>
            <Box className="flex flex-col my-1" gap={1}>{attribute.AttributeUsages.map(au => au.Name).join(", ")}</Box>
            <Typography variant="caption">Click <ElectricBoltRounded className="h-4 w-4" /> to see more details.</Typography>
        </span>;
        details.push({
            icon: (
                <Link href={`/processes?ent=${entityName}&attr=${attribute.SchemaName}`}>
                    <ElectricBoltRounded className="h-4 w-4" />
                </Link>
            ), tooltip
        });
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