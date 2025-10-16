'use client';

import React from 'react';
import { Box, Chip, useTheme, alpha } from '@mui/material';
import { HeaderDropdownMenu, MenuItemConfig } from './smaller-components/HeaderDropdownMenu';
import { CloudNewIcon, CloudSaveIcon, FileMenuIcon, LoadIcon, LocalSaveIcon, NewIcon } from '@/lib/icons';
import { SaveDiagramModal } from './modals/SaveDiagramModal';
import { LoadDiagramModal } from './modals/LoadDiagramModal';
import { useDiagramSave } from '@/hooks/useDiagramSave';
import { useDiagramLoad } from '@/hooks/useDiagramLoad';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { useRepositoryInfo } from '@/hooks/useRepositoryInfo';
import { CheckRounded, ErrorRounded, WarningRounded } from '@mui/icons-material';

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
        loadAvailableDiagrams,
        openLoadModal, 
        closeLoadModal 
    } = useDiagramLoad();
    const { isCloudConfigured, isLoading: isRepoInfoLoading } = useRepositoryInfo();

    const theme = useTheme();

    const fileMenuItems: MenuItemConfig[] = [
        {
            id: 'new',
            label: 'New Diagram',
            icon: NewIcon,
            action: createNewDiagram,
            disabled: false,
        },
        {
            id: 'load',
            label: 'Load',
            icon: LoadIcon,
            action: openLoadModal, 
            disabled: isLoading,
            dividerAfter: true,
        },
        {
            id: 'save',
            label: 'Save to Cloud',
            icon: CloudSaveIcon,
            action: saveDiagramToCloud,
            disabled: !isCloudConfigured || isSaving || !hasLoadedDiagram || loadedDiagramSource !== 'cloud',
        },
        {
            id: 'save-new',
            label: 'Create in Cloud',
            icon: CloudNewIcon,
            action: saveDiagramToCloud,
            disabled: !isCloudConfigured || isSaving,
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

                <Box className="flex gap-2">
                    <Chip 
                        size='small' 
                        icon={!hasLoadedDiagram ? <ErrorRounded /> : <CheckRounded />} 
                        label={hasLoadedDiagram ? 'Diagram Loaded' : 'No Diagram Loaded'} 
                        color="error"
                        sx={{ 
                            backgroundColor: alpha(hasLoadedDiagram ? theme.palette.primary.main : theme.palette.error.main, 0.5),
                            '& .MuiChip-icon': { color: hasLoadedDiagram ? theme.palette.primary.contrastText : theme.palette.error.contrastText }
                        }} 
                    />

                    {!isRepoInfoLoading && !isCloudConfigured && (
                        <Chip 
                            size='small' 
                            icon={<WarningRounded />} 
                            label="Cloud Storage Disabled" 
                            color="warning"
                            sx={{ 
                                backgroundColor: alpha(theme.palette.warning.main, 0.5),
                                '& .MuiChip-icon': { color: theme.palette.warning.contrastText }
                            }} 
                        />
                    )}

                    {!isRepoInfoLoading && isCloudConfigured && (
                        <Chip 
                            size='small' 
                            icon={<CheckRounded />} 
                            label="Cloud Storage Ready" 
                            color="success"
                            sx={{ 
                                backgroundColor: alpha(theme.palette.success.main, 0.5),
                                '& .MuiChip-icon': { color: theme.palette.success.contrastText }
                            }} 
                        />
                    )}
                </Box>
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
                onLoadAvailableDiagrams={loadAvailableDiagrams}
            />
        </>
    );
};