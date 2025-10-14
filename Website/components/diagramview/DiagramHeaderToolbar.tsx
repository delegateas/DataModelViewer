'use client';

import React from 'react';
import { Box } from '@mui/material';
import { HeaderDropdownMenu, MenuItemConfig } from './smaller-components/HeaderDropdownMenu';
import { CloudLoadIcon, CloudNewIcon, CloudSaveIcon, FileMenuIcon } from '@/lib/icons';
import { SaveProgressModal } from './modals/SaveProgressModal';
import { useDiagramSave } from '@/hooks/useDiagramSave';

interface IDiagramHeaderToolbarProps {
    // No props needed - actions are handled internally
}

export const DiagramHeaderToolbar = ({ }: IDiagramHeaderToolbarProps) => {
    const { isSaving, showSaveModal, saveDiagram, closeSaveModal } = useDiagramSave();

    const handleLoad = () => {
        // TODO: Implement load functionality
        console.log('Load diagram');
    };

    const fileMenuItems: MenuItemConfig[] = [
        {
            id: 'save',
            label: 'Save',
            icon: CloudSaveIcon,
            action: saveDiagram,
            dividerAfter: true,
            disabled: true
        },
        {
            id: 'savenew',
            label: 'Save new',
            icon: CloudNewIcon,
            action: saveDiagram,
            dividerAfter: true,
            disabled: isSaving
        },
        {
            id: 'load',
            label: 'Load',
            icon: CloudLoadIcon,
            action: handleLoad
        }
    ];

    return (
        <>
            <Box className="border-b w-full h-16 max-h-16 p-2 flex items-center" gap={2} sx={{ bgcolor: 'background.paper', borderColor: 'border.main' }}>
                <HeaderDropdownMenu
                    triggerIcon={FileMenuIcon}
                    triggerLabel="File"
                    triggerTooltip="File operations"
                    menuItems={fileMenuItems}
                    isNew={true}
                />
            </Box>

            <SaveProgressModal 
                open={showSaveModal}
                onClose={closeSaveModal}
            />
        </>
    );
};