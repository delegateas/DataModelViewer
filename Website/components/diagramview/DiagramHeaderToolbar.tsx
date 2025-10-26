'use client';

import React, { useState } from 'react';
import { Box, Chip, useTheme, alpha } from '@mui/material';
import { HeaderDropdownMenu, MenuItemConfig } from './smaller-components/HeaderDropdownMenu';
import { ArchiveIcon, CloudNewIcon, CloudSaveIcon, FileMenuIcon, LoadIcon, LocalSaveIcon, NewIcon, CloudExportIcon, ExportIcon } from '@/lib/icons';
import { SaveDiagramModal } from './modals/SaveDiagramModal';
import { LoadDiagramModal } from './modals/LoadDiagramModal';
import { ExportOptionsModal } from './modals/ExportOptionsModal';
import { VersionHistorySidepane } from './panes/VersionHistorySidepane';
import { useDiagramSave } from '@/hooks/useDiagramSave';
import { useDiagramLoad } from '@/hooks/useDiagramLoad';
import { useDiagramExport } from '@/hooks/useDiagramExport';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { useRepositoryInfo } from '@/hooks/useRepositoryInfo';
import { CheckRounded, ErrorRounded, WarningRounded } from '@mui/icons-material';
import HeaderMenuItem from './smaller-components/HeaderMenuItem';

interface IDiagramHeaderToolbarProps {
    // No props needed - actions are handled internally
}

export const DiagramHeaderToolbar = ({ }: IDiagramHeaderToolbarProps) => {
    const { hasLoadedDiagram, loadedDiagramSource, loadedDiagramFilePath} = useDiagramView();
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
    const { isExporting, showExportModal, exportTarget, exportDiagramLocallyAsPng, exportDiagramToCloudAsPng, performExport, closeExportModal } = useDiagramExport();
    const { isCloudConfigured, isLoading: isRepoInfoLoading } = useRepositoryInfo();
    const [showVersionHistory, setShowVersionHistory] = useState(false);

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
            disabled: isSaving,
            dividerAfter: true,
        },
        {
            id: 'export-cloud',
            label: 'Export to Cloud',
            icon: CloudExportIcon,
            action: exportDiagramToCloudAsPng,
            disabled: !isCloudConfigured || isExporting,
        },
        {
            id: 'export-local',
            label: 'Download PNG',
            icon: ExportIcon,
            action: exportDiagramLocallyAsPng,
            disabled: isExporting,
        },
    ];

    return (
        <>
            <Box className="border-b w-full h-16 max-h-16 p-2 flex items-center justify-between" gap={2} sx={{ bgcolor: 'background.paper', borderColor: 'border.main' }}>
                <Box className="flex gap-2">
                    <HeaderDropdownMenu
                        triggerIcon={FileMenuIcon}
                        triggerLabel="File"
                        triggerTooltip="File operations"
                        menuItems={fileMenuItems}
                    />

                    <HeaderMenuItem
                        icon={ArchiveIcon}
                        label="Version History"
                        tooltip="View version history"
                        action={() => setShowVersionHistory(true)}
                        new={false}
                        disabled={!hasLoadedDiagram || !loadedDiagramFilePath}
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

            <VersionHistorySidepane
                open={showVersionHistory}
                onClose={() => setShowVersionHistory(false)}
            />

            <ExportOptionsModal
                open={showExportModal}
                onClose={closeExportModal}
                onExport={performExport}
                isExportingToCloud={exportTarget === 'cloud'}
            />
        </>
    );
};