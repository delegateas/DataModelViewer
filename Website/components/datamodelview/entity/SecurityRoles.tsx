'use client'

import { SecurityRole, PrivilegeDepth } from "@/lib/Types";
import { AccountTreeRounded, BlockRounded, BusinessRounded, PeopleRounded, PersonRounded, RemoveRounded } from "@mui/icons-material";
import { Tooltip, Box, Typography, Paper, useTheme } from "@mui/material";
import React from "react";

export function SecurityRoles({ roles, highlightMatch, highlightTerm }: { roles: SecurityRole[], highlightMatch?: (text: string, term: string) => string | React.JSX.Element, highlightTerm?: string }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {roles.map(role => (
                <SecurityRoleRow key={role.Name} role={role} highlightMatch={highlightMatch} highlightTerm={highlightTerm} />
            ))}
        </Box>
    );
}

function SecurityRoleRow({ role, highlightMatch, highlightTerm }: { role: SecurityRole, highlightMatch?: (text: string, term: string) => string | React.JSX.Element, highlightTerm?: string }) {
    const theme = useTheme();

    return (
        <Paper
            variant="outlined"
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
                gap: 1,
                p: 2,
                backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.02)',
                borderColor: 'border.main',
                width: '100%',
            }}
        >
            <Typography
                variant="subtitle1"
                sx={{
                    fontWeight: 700,
                    wordWrap: 'break-word',
                    maxWidth: { xs: '100%', sm: '180px', md: '240px' },
                    color: 'text.primary'
                }}
            >
                {highlightMatch && highlightTerm ? highlightMatch(role.Name, highlightTerm) : role.Name}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: 1,
                    alignItems: 'flex-end'
                }}
            >
                <PrivilegeIcon privilege="Create" name="Create" depth={role.Create} />
                <PrivilegeIcon privilege="Read" name="Read" depth={role.Read} />
                <PrivilegeIcon privilege="Write" name="Write" depth={role.Write} />
                <PrivilegeIcon privilege="Delete" name="Delete" depth={role.Delete} />
                <PrivilegeIcon privilege="Append" name="Append" depth={role.Append} />
                <PrivilegeIcon privilege="AppendTo" name="Append To" depth={role.AppendTo} />
                <PrivilegeIcon privilege="Assign" name="Assign" depth={role.Assign} />
                <PrivilegeIcon privilege="Share" name="Share" depth={role.Share} />
            </Box>
        </Paper>
    );
}

function PrivilegeIcon({ privilege, name, depth }: { privilege: string, name: string, depth: PrivilegeDepth | null }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '60px',
                maxWidth: '80px'
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    textAlign: 'center',
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                }}
            >
                {name}
            </Typography>
            <GetDepthIcon privilege={privilege} depth={depth} />
        </Box>
    );
}

function GetDepthIcon({ privilege, depth }: { privilege: string, depth: PrivilegeDepth | null }) {
    const theme = useTheme();

    let icon = null;
    let tooltip = "";

    // Generate context-aware tooltip based on privilege type and depth
    const getTooltipText = (priv: string, d: PrivilegeDepth): string => {
        const depthDescriptions: Record<PrivilegeDepth, string> = {
            [PrivilegeDepth.None]: "No access",
            [PrivilegeDepth.Basic]: "User (or team) - Only records owned by the user themselves or owned by teams the user is a member of. This doesn't give access to rows owned by other members of those teams.",
            [PrivilegeDepth.Local]: "Business Unit - Records owned by the user's business unit",
            [PrivilegeDepth.Deep]: "Parent: Child Business Units - Records owned by the user's business unit and all child business units",
            [PrivilegeDepth.Global]: "Organization - All records in the organization"
        };

        const privilegeDescriptions: Record<string, string> = {
            "Create": "Create new records",
            "Read": "View records",
            "Write": "Modify existing records",
            "Delete": "Remove records",
            "Append": "Access to attach other tables to me. (e.g. fill a lookup on table record with other table record)",
            "AppendTo": "Access to attach me to other tables. (e.g. this table can be selected in a lookup from another table)",
            "Assign": "Change the owner of records",
            "Share": "Share records with other users or teams"
        };

        if (d === PrivilegeDepth.None) {
            return `${privilegeDescriptions[priv] || priv}: ${depthDescriptions[d]}`;
        }

        return `${privilegeDescriptions[priv] || priv}\n${depthDescriptions[d]}`;
    };

    if (depth === null || depth === undefined) {
        icon = <RemoveRounded style={{ height: '16px', width: '16px', color: theme.palette.text.primary }} />;
        tooltip = "This privilege is not available for this entity";
    } else {
        switch (depth) {
            case PrivilegeDepth.None:
                icon = <BlockRounded style={{ height: '16px', width: '16px', color: theme.palette.error.main }} />;
                tooltip = getTooltipText(privilege, depth);
                break;
            case PrivilegeDepth.Basic:
                icon = <PersonRounded style={{ height: '16px', width: '16px', color: theme.palette.text.secondary }} />;
                tooltip = getTooltipText(privilege, depth);
                break;
            case PrivilegeDepth.Local:
                icon = <PeopleRounded style={{ height: '16px', width: '16px', color: theme.palette.text.secondary }} />;
                tooltip = getTooltipText(privilege, depth);
                break;
            case PrivilegeDepth.Deep:
                icon = <AccountTreeRounded style={{ height: '16px', width: '16px', color: theme.palette.info.main }} />;
                tooltip = getTooltipText(privilege, depth);
                break;
            case PrivilegeDepth.Global:
                icon = <BusinessRounded style={{ height: '16px', width: '16px', color: theme.palette.success.main }} />;
                tooltip = getTooltipText(privilege, depth);
                break;
            default:
                return null;
        }
    }

    return (
        <Tooltip
            title={tooltip}
            placement="top"
            slotProps={{
                tooltip: {
                    sx: {
                        whiteSpace: 'pre-line',
                        maxWidth: '300px',
                        textAlign: 'center'
                    }
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </Box>
        </Tooltip>
    );
}