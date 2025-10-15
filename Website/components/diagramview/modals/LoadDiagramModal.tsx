'use client';

import React, { useRef } from 'react';
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
    Divider,
    Button,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    CloudDownload as CloudIcon,
    Upload as UploadIcon,
    Description as FileIcon,
    Close as CloseIcon,
    DocumentScannerRounded,
    FolderRounded,
    PolylineRounded
} from '@mui/icons-material';
import { DiagramFile } from '@/lib/diagram/services/diagram-deserialization';

interface LoadDiagramModalProps {
    open: boolean;
    onClose: () => void;
    availableDiagrams: DiagramFile[];
    isLoadingList: boolean;
    isLoading: boolean;
    onLoadFromCloud: (filePath: string) => void;
    onLoadFromFile: (file: File) => void;
}

export const LoadDiagramModal = ({
    open,
    onClose,
    availableDiagrams,
    isLoadingList,
    isLoading,
    onLoadFromCloud,
    onLoadFromFile
}: LoadDiagramModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLoadFromFile(file);
            // Reset the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
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
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        backgroundImage: 'none',
                        minHeight: '500px'
                    }
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6">Load Diagram</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>
                <Box className="space-y-4">
                    {/* Upload from file section */}
                    <Box>
                        <Typography variant="subtitle1" className="mb-2 font-semibold">
                            Load from File
                        </Typography>
                        <Button
                            variant='contained'
                            startIcon={<UploadIcon />}
                            onClick={handleUploadClick}
                            disabled={isLoading}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Choose local File...
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                    </Box>

                    <Divider />

                    {/* Cloud diagrams section */}
                    <Box>
                        <Typography variant="subtitle1" className="mb-2 font-semibold">
                            Load from Cloud
                        </Typography>

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
                            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
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
                </Box>
            </DialogContent>
        </Dialog>
    );
};