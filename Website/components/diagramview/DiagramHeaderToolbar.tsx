'use client';

import React, { use } from 'react';
import { Box, Chip, Typography, useTheme, alpha } from '@mui/material';
import { HeaderDropdownMenu, MenuItemConfig } from './smaller-components/HeaderDropdownMenu';
import { CloudLoadIcon, CloudNewIcon, CloudSaveIcon, FileMenuIcon, LocalSaveIcon, NewIcon } from '@/lib/icons';
import { SaveDiagramModal } from './modals/SaveDiagramModal';
import { LoadDiagramModal } from './modals/LoadDiagramModal';
import { useDiagramSave } from '@/hooks/useDiagramSave';
import { useDiagramLoad } from '@/hooks/useDiagramLoad';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { CheckRounded, ErrorRounded } from '@mui/icons-material';

interface IDiagramHeaderToolbarProps {
    // No props needed - actions are handled internally
}

export const DiagramHeaderToolbar = ({ }: IDiagramHeaderToolbarProps) => {
    const { hasLoadedDiagram, loadedDiagramSource} = useDiagramView();
    const { isSaving, showSaveModal, saveDiagramToCloud, saveDiagramLocally, closeSaveModal, createNewDiagram } = useDiagramSave();
    const { 
        isLoading, 
        isLoadingList, 
        showLoadModal, 
        availableDiagrams, 
        loadDiagramFromCloud, 
        loadDiagramFromFile, 
        openLoadModal, 
        closeLoadModal 
    } = useDiagramLoad();

    const theme = useTheme();

    const fileMenuItems: MenuItemConfig[] = [
        {
            id: 'new',
            label: 'New Diagram',
            icon: NewIcon,
            action: createNewDiagram,
            disabled: false,
            dividerAfter: true,
        },
        {
            id: 'save',
            label: 'Save to Cloud',
            icon: CloudSaveIcon,
            action: saveDiagramToCloud,
            disabled: isSaving || !hasLoadedDiagram || loadedDiagramSource !== 'cloud',
        },
        {
            id: 'save-new',
            label: 'Create in Cloud',
            icon: CloudNewIcon,
            action: saveDiagramLocally,
            disabled: isSaving
        },
        {
            id: 'load',
            label: 'Load from Cloud',
            icon: CloudLoadIcon,
            action: openLoadModal, 
            disabled: isLoading,
            dividerAfter: true,
        },
        {
            id: 'save-local',
            label: 'Download',
            icon: LocalSaveIcon,
            action: saveDiagramLocally,
            disabled: isSaving
        },
    ];

    return (
        <>
            <Box className="border-b w-full h-16 max-h-16 p-2 flex items-center justify-between" gap={2} sx={{ bgcolor: 'background.paper', borderColor: 'border.main' }}>
                <Box className="flex">
                    <HeaderDropdownMenu
                        triggerIcon={FileMenuIcon}
                        triggerLabel="File"
                        triggerTooltip="File operations"
                        menuItems={fileMenuItems}
                        isNew={true}
                    />
                </Box>

                <Chip size='small' icon={!hasLoadedDiagram ? <ErrorRounded /> : <CheckRounded />} label={hasLoadedDiagram ? 'Diagram Loaded' : 'No Diagram Loaded'} sx={{ backgroundColor: alpha(hasLoadedDiagram ? theme.palette.primary.main : theme.palette.error.main, 0.5) }} />
            </Box>

            <SaveDiagramModal 
                open={showSaveModal}
                onClose={closeSaveModal}
            />

            <LoadDiagramModal
                open={showLoadModal}
                onClose={closeLoadModal}
                availableDiagrams={availableDiagrams}
                isLoadingList={isLoadingList}
                isLoading={isLoading}
                onLoadFromCloud={loadDiagramFromCloud}
                onLoadFromFile={loadDiagramFromFile}
            />
        </>
    );
};