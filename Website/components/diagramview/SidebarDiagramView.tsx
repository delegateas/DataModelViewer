import { Box, Tooltip, Typography, Grid, TextField, Divider, Button } from '@mui/material';
import React, { useState } from 'react';
import { AddSquareIcon } from '@/lib/icons';
import { EntitySelectionPane } from './panes/EntitySelectionPane';
import { useDiagramView } from '@/contexts/DiagramViewContext';

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

    const { loadedDiagramFilename, loadedDiagramSource, hasLoadedDiagram, diagramName, setDiagramName } = useDiagramView();

    const handleAddEntity = () => {
        setEntityPaneOpen(true);
    };

    const handleClosePane = () => {
        setEntityPaneOpen(false);
    };

    const handleDiagramNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDiagramName(event.target.value);
    };

    const diagramTools: DiagramTool[] = [
        {
            id: 'add-entity',
            label: 'Add Entity',
            icon: <Box className="rounded-md border flex items-center justify-center h-6" sx={{ borderColor: 'text.primary' }}></Box>,
            action: handleAddEntity
        },
    ];

    return (
        <Box className="w-full h-full flex flex-col justify-between">
            <Box className="max-h-16 h-16 p-4 border-b" sx={{ borderColor: 'border.main' }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Diagram Name"
                    value={diagramName}
                    onChange={handleDiagramNameChange}
                    disabled={hasLoadedDiagram}
                    variant="outlined"
                />
            </Box>

            <Box className="p-4 flex-grow">
                <Typography variant='body1'>
                    Elements
                </Typography>

                <Divider className="my-2" />
                
                <Grid container spacing={1}>
                    {diagramTools.map((tool) => (
                        <Grid size={3} key={tool.id}>
                            <Tooltip title={tool.label} placement="top">
                                <Box
                                    onClick={tool.action}
                                    className='hover:cursor-pointer w-full h-full'
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
            
            <Box className="border-t p-4" sx={{ borderColor: 'border.main' }}>
                <Typography variant='body2' className='mt-4 font-semibold'>
                    Loaded Diagram: ({loadedDiagramSource})
                </Typography>
                <Typography variant='caption'>
                    {loadedDiagramFilename}
                </Typography>
            </Box>
        </Box>
    );
}