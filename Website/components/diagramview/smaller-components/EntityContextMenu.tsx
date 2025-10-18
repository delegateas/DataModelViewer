'use client';

import React from 'react';
import { Menu, MenuItem } from '@mui/material';

interface EntityContextMenuProps {
    anchorPosition?: { top: number; left: number } | null;
    open: boolean;
    onClose: () => void;
    entityId?: string;
}

export const EntityContextMenu: React.FC<EntityContextMenuProps> = ({
    anchorPosition,
    open,
    onClose,
    entityId
}) => {
    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition || undefined}
            slotProps={{
                paper: {
                    sx: {
                        minWidth: 120,
                    }
                }
            }}
        >
            <MenuItem 
                onClick={onClose}
                dense
            >
                Edit Entity
            </MenuItem>
        </Menu>
    );
};