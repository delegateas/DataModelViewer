'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    FormControlLabel,
    Checkbox,
    Typography,
    Divider,
} from '@mui/material';

export interface ExportOptions {
    includeGrid: boolean;
}

interface ExportOptionsModalProps {
    open: boolean;
    onClose: () => void;
    onExport: (options: ExportOptions) => void;
    isExportingToCloud?: boolean;
}

export const ExportOptionsModal = ({
    open,
    onClose,
    onExport,
    isExportingToCloud = false
}: ExportOptionsModalProps) => {
    const [includeGrid, setIncludeGrid] = useState(false);

    const handleExport = () => {
        onExport({ includeGrid });
        onClose();
    };

    const handleCancel = () => {
        // Reset to defaults
        setIncludeGrid(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
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
            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                <Typography variant="h6" className="font-semibold">
                    Export Options
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {isExportingToCloud ? 'Export diagram to Azure DevOps as PNG' : 'Download diagram as PNG'}
                </Typography>
            </Box>

            <Divider />

            <DialogContent sx={{ py: 3 }}>
                <Box className="flex flex-col space-y-4">
                    <Typography variant="body2" color="text.secondary">
                        Customize your PNG export settings:
                    </Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeGrid}
                                onChange={(e) => setIncludeGrid(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2">Include Grid Background</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Show grid lines in the exported image
                                </Typography>
                            </Box>
                        }
                    />

                    <Box
                        className="p-3 rounded-lg"
                        sx={{
                            backgroundColor: 'action.hover',
                            border: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            <strong>Tip:</strong> Exporting without the grid produces a cleaner image with transparent background, perfect for presentations and documentation.
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={handleCancel}
                    variant="outlined"
                    color="inherit"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    color="primary"
                >
                    {isExportingToCloud ? 'Export to Cloud' : 'Download PNG'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
