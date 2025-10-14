'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
} from '@mui/material';

interface SaveProgressModalProps {
    open: boolean;
    onClose?: () => void;
}

export const SaveProgressModal: React.FC<SaveProgressModalProps> = ({ open, onClose }) => {
    const [repositoryInfo, setRepositoryInfo] = useState<string>('Loading...');

    useEffect(() => {
        if (open) {
            fetch('/api/diagram/repository-info')
                .then(response => response.json())
                .then(data => {
                    if (data.organization && data.repository) {
                        setRepositoryInfo(`${data.organization}/${data.repository}`);
                    } else {
                        setRepositoryInfo('Azure DevOps Repository');
                    }
                })
                .catch(() => {
                    setRepositoryInfo('Azure DevOps Repository');
                });
        }
    }, [open]);
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        backgroundImage: 'none',
                    }
                }
            }}
        >
            <DialogContent sx={{ py: 6, px: 4 }}>
                <Box className="flex flex-col items-center space-y-6" gap={1}>
                    {/* Title */}
                    <Typography variant="h6" className="text-center font-semibold">
                        Saving Diagram to Azure DevOps
                    </Typography>
                    <Typography variant='caption'>
                        Connected to <b>{repositoryInfo}</b>
                    </Typography>

                    {/* Animation Container */}
                    <Box className="relative w-full h-24 flex items-center justify-center">
                        {/* DMV Logo (Left) */}
                        <Box className="absolute left-0 flex flex-col items-center">
                            <Box
                                component="img"
                                src="/DMVLOGO.svg"
                                alt="DMV Logo"
                                className="w-12 h-12 animate-[pulse-activity_2s_ease-in-out_infinite]"
                            />
                            <Typography variant="caption" className="mt-2 text-center">
                                DataModel
                                <br />
                                Viewer
                            </Typography>
                        </Box>

                        {/* Data Flow Animation (Center) */}
                        <Box className="absolute inset-0 flex items-center justify-center">
                            <Box
                                className="absolute z-10 w-2 h-2 rounded-full animate-[data-flow_3s_ease-in-out_infinite]"
                                sx={{
                                    backgroundColor: 'primary.main'
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '20%',
                                    right: '20%',
                                    height: 2,
                                    backgroundColor: 'divider',
                                    transform: 'translateY(-50%)',
                                    opacity: 0.3,
                                }}
                            />
                        </Box>

                        {/* Azure DevOps Logo (Right) */}
                        <Box className="absolute right-0 flex flex-col items-center">
                            <Box
                                component="img"
                                src="/AzureDevOps.svg"
                                alt="Azure DevOps Logo"
                                className="w-12 h-12 animate-[pulse-activity_2s_ease-in-out_infinite]"
                                sx={{
                                    animationDelay: '0.5s'
                                }}
                            />
                            <Typography variant="caption" className="mt-2 text-center">
                                Azure
                                <br />
                                DevOps
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary" className="text-center">
                        Your diagram is being securely saved to the repository
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};