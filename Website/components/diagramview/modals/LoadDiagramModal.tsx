'use client';

import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    CloudDownload as CloudIcon,
    Upload as UploadIcon,
    Close as CloseIcon,
    PolylineRounded,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DiagramFile } from '@/lib/diagram/services/diagram-deserialization';
import { ClickableCard } from '@/components/shared/elements/ClickableCard';
import { AzureDevOpsIcon, LoadIcon } from '@/lib/icons';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { useRepositoryInfo } from '@/hooks/useRepositoryInfo';

interface LoadDiagramModalProps {
    open: boolean;
    onClose: () => void;
    availableDiagrams: DiagramFile[];
    isLoadingList: boolean;
    isLoading: boolean;
    onLoadFromCloud: (filePath: string) => void;
    onLoadFromFile: (file: File) => void;
    onLoadAvailableDiagrams: () => void;
}

export const LoadDiagramModal = ({
    open,
    onClose,
    availableDiagrams,
    isLoadingList,
    isLoading,
    onLoadFromCloud,
    onLoadFromFile,
    onLoadAvailableDiagrams
}: LoadDiagramModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showCloudDiagrams, setShowCloudDiagrams] = useState(false);
    const { isCloudConfigured } = useRepositoryInfo();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLoadFromFile(file);
            // Reset the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onClose();
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCloudClick = () => {
        setShowCloudDiagrams(true);
        onLoadAvailableDiagrams();
    };

    const handleBackToOptions = () => {
        setShowCloudDiagrams(false);
    };

    const handleCloseModal = () => {
        setShowCloudDiagrams(false);
        onClose();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number) => {
        const kb = bytes / 1024;
        return `${kb.toFixed(1)} KB`;
    };

    return (
        <Dialog
            open={open}
            onClose={handleCloseModal}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        backgroundImage: 'none',
                        minHeight: showCloudDiagrams ? '500px' : '300px'
                    }
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {showCloudDiagrams && (
                        <IconButton onClick={handleBackToOptions} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6">
                        {showCloudDiagrams ? 'Select from Azure DevOps' : 'Load Diagram'}
                    </Typography>
                </Box>
                <IconButton onClick={handleCloseModal} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>
                {!showCloudDiagrams ? (
                    // Main options view
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Load from Device Card */}
                        <ClickableCard
                            title="Load from Device"
                            description="Choose a diagram file from your computer"
                            icon={LoadIcon}
                            onClick={handleUploadClick}
                            disabled={isLoading}
                            color="primary.main"
                        />

                        {/* Load from Azure DevOps Card */}
                        <ClickableCard
                            title="Load from Azure DevOps"
                            description="Browse diagrams stored in your repository"
                            icon={AzureDevOpsIcon}
                            onClick={handleCloudClick}
                            disabled={isLoading || !isCloudConfigured}
                            color="secondary.main"
                        />

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                    </Box>
                ) : (
                    // Cloud diagrams list view
                    <Box>
                        {isLoadingList ? (
                            <Box className="flex justify-center items-center py-8" gap={2}>
                                <CircularProgress size={32} />
                                <Typography variant="body2" className="ml-3">
                                    Loading diagrams from Azure DevOps...
                                </Typography>
                            </Box>
                        ) : availableDiagrams.length === 0 ? (
                            <Box className="text-center py-8">
                                <CloudIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    No diagrams found in the repository
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ maxHeight: '350px', overflow: 'auto' }}>
                                {availableDiagrams.map((diagram) => (
                                    <ListItem key={diagram.path} disablePadding>
                                        <ListItemButton
                                            onClick={() => onLoadFromCloud(diagram.path)}
                                            disabled={isLoading}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 0.5,
                                                '&:hover': {
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <ListItemIcon className='rounded-full min-w-8 min-h-8 mr-4 p-4' sx={{ color: 'primary.main', backgroundColor: 'grey.200' }}>
                                                <PolylineRounded />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={diagram.name}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="caption" component="div">
                                                            Updated: {formatDate(diagram.updatedAt)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Size: {formatFileSize(diagram.size)}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};