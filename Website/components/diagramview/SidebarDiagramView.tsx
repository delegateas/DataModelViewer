import { Box, IconButton, Tooltip, Typography, Grid, Divider } from '@mui/material';
import React, { useState } from 'react';
import { useDiagramView } from '@/contexts/DiagramViewContext';
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
        <Box className="w-full h-full p-4">
            <Typography 
                variant="h6" 
                className="font-semibold"
                sx={{ color: 'text.primary' }}
            >
                Diagram Tools
            </Typography>

            <Divider className='my-2' />

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
    );
}