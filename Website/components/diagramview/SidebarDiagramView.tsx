import React, { useState } from 'react';
import { 
    Tabs, 
    Tab, 
    Box, 
    Button,
    Collapse,
    Typography,
    Divider,
} from '@mui/material';
import { CheckBoxOutlineBlankRounded, ChevronRightRounded, DeleteRounded, DriveFolderUploadRounded, ExpandMoreRounded, FolderRounded, HardwareRounded, PeopleRounded, RttRounded, SaveRounded, SettingsRounded, SmartphoneRounded, SyncRounded } from '@mui/icons-material';
import { useDiagramViewContextSafe } from '@/contexts/DiagramViewContext';
import { AddEntityPane, AddGroupPane, ResetToGroupPane } from '@/components/diagramview/panes';
import { useIsMobile } from '@/hooks/use-mobile';
import { GroupType } from '@/lib/Types';
import CustomTabPanel from '../shared/elements/TabPanel';

interface ISidebarDiagramViewProps { 

}

export const SidebarDiagramView = ({ }: ISidebarDiagramViewProps) => {
    const diagramContext = useDiagramViewContextSafe();
    const isMobile = useIsMobile();
    const [isDataExpanded, setIsDataExpanded] = useState(true);
    const [isGeneralExpanded, setIsGeneralExpanded] = useState(false);
    const [isEntitySheetOpen, setIsEntitySheetOpen] = useState(false);
    const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
    const [isResetSheetOpen, setIsResetSheetOpen] = useState(false);
    const [tab, setTab] = useState(0);

    // If not in diagram context, show a message or return null
    if (!diagramContext) {
        return (
            <div className="flex flex-col h-full w-full p-4">
                <div className="text-center text-muted-foreground">
                    <FolderRounded className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Diagram tools are only available on the diagram page.</p>
                </div>
            </div>
        );
    }

    const { addEntityToDiagram, addGroupToDiagram, addSquareToDiagram, addTextToDiagram, saveDiagram, loadDiagram, currentEntities, diagramType, updateDiagramType, clearDiagram } = diagramContext;

    const handleLoadDiagram = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            loadDiagram(file).catch(error => {
                alert('Failed to load diagram: ' + error.message);
            });
        }
        // Reset input value to allow loading the same file again
        event.target.value = '';
    };

    const handleResetToGroup = (group: GroupType) => {
        // First clear the entire diagram
        clearDiagram();
        // Then add the selected group
        addGroupToDiagram(group);
    };

    // Use the clearDiagram function from the hook
    // const clearDiagram function is already available from the context

    return (
        <div className="flex flex-col h-full w-full">
            <Box className="w-full">
                <Tabs value={tab} indicatorColor="primary" textColor="primary" onChange={(_, newValue) => setTab(newValue)} aria-label="Diagram view tabs" variant="fullWidth">
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HardwareRounded />
                                Build
                            </Box>
                        } 
                        sx={{ minWidth: 0, flex: 1, fontSize: '0.75rem' }} 
                    />
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SettingsRounded />
                                Settings
                            </Box>
                        } 
                        sx={{ minWidth: 0, flex: 1, fontSize: '0.75rem' }} 
                    />
                </Tabs>

                <CustomTabPanel value={tab} index={0} className='p-4'>
                    {/* Mobile Notice */}
                    {isMobile && (
                        <Box sx={{ 
                            backgroundColor: 'rgb(255 251 235)', 
                            border: '1px solid rgb(252 211 77)', 
                            borderRadius: 2, 
                            p: 1.5, 
                            mb: 2,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1
                        }}>
                            <SmartphoneRounded style={{ color: 'rgb(146 64 14)', flexShrink: 0, marginTop: 2 }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgb(146 64 14)', mb: 0.5 }}>
                                    Mobile Mode
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgb(120 53 15)' }}>
                                    Some advanced features may have limited functionality on mobile devices. 
                                    For the best experience, use a desktop computer.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    
                    {/* Data Section */}
                    <Box sx={{ mb: 2 }}>
                        <Button 
                            variant="text" 
                            fullWidth
                            onClick={() => setIsDataExpanded(!isDataExpanded)}
                            sx={{ 
                                justifyContent: 'space-between', 
                                p: 1, 
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                            endIcon={isDataExpanded ? <ExpandMoreRounded /> : <ChevronRightRounded />}
                        >
                            Data
                        </Button>
                        <Collapse in={isDataExpanded}>
                            <Box sx={{ pl: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button 
                                    variant="text" 
                                    fullWidth
                                    startIcon={<FolderRounded />}
                                    onClick={() => setIsEntitySheetOpen(true)}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        py: 1,
                                        textTransform: 'none'
                                    }}
                                >
                                    Entity
                                </Button>
                                <Button 
                                    variant="text" 
                                    fullWidth
                                    startIcon={<PeopleRounded />}
                                    onClick={() => setIsGroupSheetOpen(true)}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        py: 1,
                                        textTransform: 'none'
                                    }}
                                >
                                    Group
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>

                    {/* General Section */}
                    <Box sx={{ mb: 2 }}>
                        <Button 
                            variant="text" 
                            fullWidth
                            onClick={() => setIsGeneralExpanded(!isGeneralExpanded)}
                            sx={{ 
                                justifyContent: 'space-between', 
                                p: 1, 
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                            endIcon={isGeneralExpanded ? <ExpandMoreRounded /> : <ChevronRightRounded />}
                        >
                            General
                        </Button>
                        <Collapse in={isGeneralExpanded}>
                            <Box sx={{ pl: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button 
                                    variant="text" 
                                    fullWidth
                                    startIcon={<CheckBoxOutlineBlankRounded />}
                                    onClick={addSquareToDiagram}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        py: 1,
                                        textTransform: 'none'
                                    }}
                                >
                                    Square
                                </Button>
                                <Button 
                                    variant="text" 
                                    fullWidth
                                    startIcon={<RttRounded />}
                                    onClick={addTextToDiagram}
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        py: 1,
                                        textTransform: 'none'
                                    }}
                                >
                                    Text
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                </CustomTabPanel >

                <CustomTabPanel value={tab} index={1} className='flex flex-col p-4'>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Diagram Type
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Choose between simple or detailed entity view
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant={diagramType === 'simple' ? 'contained' : 'outlined'}
                                size="small"
                                fullWidth
                                startIcon={<FolderRounded />}
                                onClick={() => updateDiagramType('simple')}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                            >
                                Simple View
                            </Button>
                            <Button
                                variant={diagramType === 'detailed' ? 'contained' : 'outlined'}
                                size="small"
                                fullWidth
                                startIcon={<CheckBoxOutlineBlankRounded/>}
                                onClick={() => updateDiagramType('detailed')}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                            >
                                Detailed View
                            </Button>
                        </Box>
                    </Box>
                
                    <Divider className="my-4"/>
                    
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Save & Load
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Save your diagram or load an existing one
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                startIcon={<SaveRounded />}
                                onClick={saveDiagram}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                            >
                                Save Diagram
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                component="label"
                                startIcon={<DriveFolderUploadRounded />}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                            >
                                Load Diagram
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleLoadDiagram}
                                    style={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                    id="load-diagram"
                                />
                            </Button>
                        </Box>
                    </Box>
                    
                    <Divider className="my-4" />
                
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Current Settings
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Diagram Type: <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{diagramType}</span>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Entities in Diagram: <span style={{ fontWeight: 500 }}>{currentEntities.length}</span>
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Divider className="my-4" />
                    
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Diagram Actions
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Reset or clear your diagram
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                startIcon={<SyncRounded />}
                                onClick={() => setIsResetSheetOpen(true)}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                            >
                                Reset to Group
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                startIcon={<DeleteRounded />}
                                onClick={clearDiagram}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                            >
                                Clear All
                            </Button>
                        </Box>
                    </Box>
                </CustomTabPanel>
            </Box>

            {/* Add Entity Pane */}
            <AddEntityPane
                isOpen={isEntitySheetOpen}
                onOpenChange={setIsEntitySheetOpen}
                onAddEntity={addEntityToDiagram}
                currentEntities={currentEntities}
            />

            {/* Add Group Pane */}
            <AddGroupPane
                isOpen={isGroupSheetOpen}
                onOpenChange={setIsGroupSheetOpen}
                onAddGroup={addGroupToDiagram}
                currentEntities={currentEntities}
            />

            {/* Reset to Group Pane */}
            <ResetToGroupPane
                isOpen={isResetSheetOpen}
                onOpenChange={setIsResetSheetOpen}
                onResetToGroup={handleResetToGroup}
            />
        </div>
    );
}