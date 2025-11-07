import { Box, Typography, TextField, Divider, Alert, Button } from '@mui/material';
import React, { useState } from 'react';
import { EntitySelectionPane } from './panes/EntitySelectionPane';
import { useDiagramView } from '@/contexts/DiagramViewContext';
import { Add as AddIcon } from '@mui/icons-material';

interface ISidebarDiagramViewProps {

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

    return (
        <Box className="w-full h-full flex flex-col justify-between">
            <Box className="p-4 border-b" sx={{ borderColor: 'border.main' }}>
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

            <Box className="p-4 flex-grow flex flex-col" gap={3}>

                <Alert severity='warning' sx={{ fontSize: '13px' }}>
                    The diagram tool is still under development.
                </Alert>

                <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1.5 }}>
                        Diagram Elements
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={handleAddEntity}
                        sx={{
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            py: 1.5,
                            borderStyle: 'dashed',
                            '&:hover': {
                                borderStyle: 'dashed',
                                backgroundColor: 'action.hover'
                            }
                        }}
                    >
                        Add Entity to Diagram
                    </Button>
                </Box>

                <EntitySelectionPane
                    open={entityPaneOpen}
                    onClose={handleClosePane}
                />
            </Box>

            {(hasLoadedDiagram || loadedDiagramFilename) && (
                <Box className="border-t p-4" sx={{ borderColor: 'border.main', backgroundColor: 'action.hover' }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Loaded Diagram
                    </Typography>
                    <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 500 }}>
                        {loadedDiagramFilename || 'Untitled'}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Source: {loadedDiagramSource}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}