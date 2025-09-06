'use client'

import { SecurityRole, PrivilegeDepth } from "@/lib/Types";
import { Tooltip, Box, Typography, Paper, useTheme } from "@mui/material";
import { Ban, User, Users, Boxes, Building2, Minus } from "lucide-react";

export function SecurityRoles({ roles }: { roles: SecurityRole[] }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {roles.map(role => (
                <SecurityRoleRow key={role.Name} role={role} />
            ))}
        </Box>
    );
}

function SecurityRoleRow({ role }: { role: SecurityRole }) {
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
                {role.Name}
            </Typography>
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }, 
                    gap: 1, 
                    alignItems: 'flex-end' 
                }}
            >
                <PrivilegeIcon name="Create" depth={role.Create} />
                <PrivilegeIcon name="Read" depth={role.Read} />
                <PrivilegeIcon name="Write" depth={role.Write} />
                <PrivilegeIcon name="Delete" depth={role.Delete} />
                <PrivilegeIcon name="Append" depth={role.Append} />
                <PrivilegeIcon name="Append To" depth={role.AppendTo} />
                <PrivilegeIcon name="Assign" depth={role.Assign} />
                <PrivilegeIcon name="Share" depth={role.Share} />
            </Box>
        </Paper>
    );
}

function PrivilegeIcon({ name, depth }: { name: string, depth: PrivilegeDepth | null }) {
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
            <GetDepthIcon depth={depth} />
        </Box>
    );
}

function GetDepthIcon({ depth }: { depth: PrivilegeDepth | null }) {
    const theme = useTheme();
    
    let icon = null;
    let tooltip = "";

    if (depth === null || depth === undefined) {
        icon = <Minus style={{ height: '16px', width: '16px', color: theme.palette.text.primary }} />;
        tooltip = "Unavailable";
    } else {
        switch (depth) {
            case PrivilegeDepth.None:
                icon = <Ban style={{ height: '16px', width: '16px', color: theme.palette.error.main }} />;
                tooltip = "None";
                break;
            case PrivilegeDepth.Basic:
                icon = <User style={{ height: '16px', width: '16px', color: theme.palette.text.secondary }} />;
                tooltip = "User";
                break;
            case PrivilegeDepth.Local:
                icon = <Users style={{ height: '16px', width: '16px', color: theme.palette.text.secondary }} />;
                tooltip = "Business Unit";
                break;
            case PrivilegeDepth.Deep:
                icon = <Boxes style={{ height: '16px', width: '16px', color: theme.palette.info.main }} />;
                tooltip = "Parent: Child Business Units";
                break;
            case PrivilegeDepth.Global:
                icon = <Building2 style={{ height: '16px', width: '16px', color: theme.palette.success.main }} />;
                tooltip = "Organization";
                break;
            default:
                return null;
        }
    }

    return (
        <Tooltip title={tooltip}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </Box>
        </Tooltip>
    );
}