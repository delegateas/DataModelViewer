'use client';

import React, { useState } from 'react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography
} from '@mui/material';
import HeaderMenuItem from './HeaderMenuItem';

export interface MenuItemConfig {
    id: string;
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    disabled?: boolean;
    dividerAfter?: boolean;
}

interface HeaderDropdownMenuProps {
    triggerIcon: React.ReactNode;
    triggerLabel: string;
    triggerTooltip?: string;
    menuItems: MenuItemConfig[];
    isNew?: boolean;
    disabled?: boolean;
}

export const HeaderDropdownMenu: React.FC<HeaderDropdownMenuProps> = ({
    triggerIcon,
    triggerLabel,
    triggerTooltip,
    menuItems,
    isNew = false,
    disabled = false
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (action: () => void) => {
        handleMenuClose();
        action();
    };

    return (
        <>
            <HeaderMenuItem
                icon={triggerIcon}
                label={triggerLabel}
                tooltip={triggerTooltip}
                action={handleMenuClick}
                new={isNew}
                disabled={disabled}
            />

            <Menu
                anchorEl={anchorEl}
                elevation={1}
                open={isOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: -16,
                    horizontal: 'left',
                }}
                sx={{
                    borderRadius: '16px',
                }}
            >
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={item.id}
                        onClick={() => handleMenuItemClick(item.action)}
                        disabled={item.disabled}
                    >
                        {item.icon && (
                            <ListItemIcon className='mr-2'>
                                {item.icon}
                            </ListItemIcon>
                        )}
                        <ListItemText><Typography variant='caption'>{item.label}</Typography></ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};