import { Tooltip, Box, Badge, alpha, Typography } from '@mui/material';
import React from 'react'

interface IHeaderMenuItemProps {
    icon: React.ReactNode;
    label: string;
    tooltip?: string;
    new?: boolean;
    disabled?: boolean;
    action?: (event: React.MouseEvent<HTMLElement>) => void;
}

const HeaderMenuItem = ({ icon, label, tooltip, new: isNew, disabled, action }: IHeaderMenuItemProps) => {
    return (
        <Tooltip title={tooltip} placement="right" arrow>
            <Badge variant='dot' color='primary' invisible={!isNew} sx={{'& .MuiBadge-badge': {top: 8, right: 8}}}>
                <Box
                    component="button"
                    disabled={disabled}
                    onClick={(event) => {
                        if (action) {
                            action(event);
                        }
                    }}
                    className="hover:cursor-pointer"
                >
                    <Box
                        className="flex items-center px-4 py-1.5 rounded-lg relative"
                        gap={1}
                        sx={{
                            color: disabled ? 'text.disabled' : 'text.secondary',
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: disabled
                                    ? 'transparent'
                                    : (theme) => alpha(theme.palette.primary.main, 0.16),
                                color: disabled ? 'text.disabled' : 'text.primary',
                            }
                        }}
                    >
                        <Box className="h-6 w-6">
                        {icon}
                        </Box>
                        <Typography variant="body2" className="text-xs text-center">
                            {label}
                        </Typography>
                    </Box>
                </Box>
            </Badge>
        </Tooltip>
    );
}

export default HeaderMenuItem
