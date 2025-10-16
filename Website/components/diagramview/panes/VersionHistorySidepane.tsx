'use client';

import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    Skeleton,
    Button,
    Tooltip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useDiagramView } from '@/contexts/DiagramViewContext';

interface FileVersion {
    commitId: string;
    author: {
        name: string;
        email: string;
        date: string;
    };
    committer: {
        name: string;
        email: string;
        date: string;
    };
    comment: string;
    changeType: string;
    objectId: string;
}

interface VersionHistorySidepaneProps {
    open: boolean;
    onClose: () => void;
}

export const VersionHistorySidepane: React.FC<VersionHistorySidepaneProps> = ({
    open,
    onClose
}) => {
    const { loadedDiagramFilePath } = useDiagramView();
    const [versions, setVersions] = useState<FileVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVersions = async () => {
        if (!loadedDiagramFilePath) {
            setError('No diagram loaded');
            return;
        }

        setLoading(true);
        setError(null);
        setVersions([]);

        try {
            const params = new URLSearchParams({
                filePath: loadedDiagramFilePath,
                maxVersions: '20'
            });

            const response = await fetch(`/api/diagram/versions?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch versions');
            }

            if (data.success) {
                setVersions(data.versions);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && loadedDiagramFilePath) {
            fetchVersions();
        }
    }, [open, loadedDiagramFilePath]);

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };

    const getChangeTypeColor = (changeType: string) => {
        switch (changeType.toLowerCase()) {
            case 'add':
                return 'success';
            case 'edit':
                return 'primary';
            case 'delete':
                return 'error';
            default:
                return 'default';
        }
    };

    const renderVersionSkeleton = () => (
        <ListItem>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width={100} />
                </Box>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={80} />
                </Box>
            </Box>
        </ListItem>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{ 
                paper: {
                    sx: {
                        width: 400,
                        maxWidth: '90vw'
                    }
                }
            }}
        >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                        Version History
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                {loadedDiagramFilePath && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {loadedDiagramFilePath}
                    </Typography>
                )}
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {!loadedDiagramFilePath ? (
                    <Alert severity="info" sx={{ m: 2 }}>
                        Load a diagram to view its version history
                    </Alert>
                ) : error ? (
                    <Alert severity="error" sx={{ m: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <List sx={{ p: 0 }}>
                        {loading ? (
                            // Show skeleton loaders while loading
                            Array.from({ length: 5 }).map((_, index) => (
                                <React.Fragment key={index}>
                                    {renderVersionSkeleton()}
                                    {index < 4 && <Divider />}
                                </React.Fragment>
                            ))
                        ) : versions.length === 0 ? (
                            <Alert severity="info" sx={{ m: 2 }}>
                                No version history found for this file
                            </Alert>
                        ) : (
                            versions.map((version, index) => (
                                <React.Fragment key={version.commitId}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Chip
                                                        label={version.changeType}
                                                        size="small"
                                                        color={getChangeTypeColor(version.changeType)}
                                                        variant="outlined"
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatRelativeTime(version.author.date)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box className="flex justify-between items-end">
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                                            {version.comment}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            by {version.author.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                                            {version.commitId.substring(0, 8)}
                                                        </Typography>
                                                    </Box>
                                                    <Button 
                                                        size="small"
                                                        variant="outlined"
                                                        disabled
                                                        className="italic"
                                                        onClick={() => {}}
                                                    >
                                                        Peek version
                                                    </Button>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < versions.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        )}
                    </List>
                )}
            </Box>
        </Drawer>
    );
};