import { Box, Tooltip, Typography, Grid, Divider } from '@mui/material';
import React, { useState } from 'react';
import { AddSquareIcon } from '@/lib/icons';
import { EntitySelectionPane } from './panes/EntitySelectionPane';

interface ISidebarDiagramViewProps { 

}

interface DiagramTool {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
}

export const SidebarDiagramView = ({ }: ISidebarDiagramViewProps) => {
    const [entityPaneOpen, setEntityPaneOpen] = useState(false);

    const handleAddEntity = () => {
        setEntityPaneOpen(true);
    };

    const handleClosePane = () => {
        setEntityPaneOpen(false);
    };

    const diagramTools: DiagramTool[] = [
        {
            id: 'add-entity',
            label: 'Add Entity',
            icon: AddSquareIcon,
            action: handleAddEntity
        },
    ];

    return (
        <Box className="w-full h-full">
            <Box className="max-h-16 h-16 p-4 border-b" sx={{ borderColor: 'border.main' }}>
                <Typography 
                    variant="h6" 
                    className="font-semibold"
                    sx={{ color: 'text.primary' }}
                >
                    Diagram Tools
                </Typography>
            </Box>

            <Box className="p-4 space-y-2">
                <Typography variant='body1'>
                    Elements
                </Typography>
                
                <Grid container spacing={1}>
                    {diagramTools.map((tool) => (
                        <Grid size={6} key={tool.id}>
                            <Tooltip title={tool.label} placement="top">
                                <Box
                                    onClick={tool.action}
                                    className='h-12 w-12 p-2 hover:cursor-pointer'
                                    sx={{ color: "primary.main", backgroundColor: "transparent" }}
                                >
                                    {tool.icon}
                                </Box>
                            </Tooltip>
                        </Grid>
                    ))}
                </Grid>

                <EntitySelectionPane 
                    open={entityPaneOpen} 
                    onClose={handleClosePane} 
                />
            </Box>
        </Box>
    );
}