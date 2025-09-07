import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    DialogActions, 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Typography,
    Box
} from '@mui/material';
import { Groups } from '../../../generated/Data';
import { GroupType } from '@/lib/Types';
import { RefreshRounded } from '@mui/icons-material';

interface IResetToGroupPaneProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onResetToGroup: (group: GroupType) => void;
}

export const ResetToGroupPane = ({ isOpen, onOpenChange, onResetToGroup }: IResetToGroupPaneProps) => {
    const [selectedGroupForReset, setSelectedGroupForReset] = useState<string>('');

    const handleResetToGroup = () => {
        if (!selectedGroupForReset) return;
        
        const selectedGroup = Groups.find(group => group.Name === selectedGroupForReset);
        if (selectedGroup) {
            onResetToGroup(selectedGroup);
            onOpenChange(false);
            setSelectedGroupForReset('');
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        setSelectedGroupForReset('');
    };

    return (
        <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
            <DialogContent>
                <DialogTitle>Reset Diagram to Group</DialogTitle>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Choose a group to reset the diagram and show only entities from that group.
                    This will clear the current diagram and add all entities from the selected group.
                </Typography>
                
                <Box mt={3} display="flex" flexDirection="column" gap={3}>
                    <FormControl fullWidth>
                        <InputLabel>Select Group</InputLabel>
                        <Select
                            value={selectedGroupForReset}
                            onChange={(e) => setSelectedGroupForReset(e.target.value)}
                            label="Select Group"
                        >
                            {Groups.map((group) => (
                                <MenuItem key={group.Name} value={group.Name}>
                                    {group.Name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <Box sx={{ bgcolor: 'warning.light', border: 1, borderColor: 'warning.main', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                            Warning
                        </Typography>
                        <Typography variant="body2" color="warning.dark">
                            This will clear all current elements from your diagram and replace them with entities from the selected group.
                        </Typography>
                    </Box>
                </Box>

                <DialogActions sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        fullWidth
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleResetToGroup}
                        disabled={!selectedGroupForReset}
                        fullWidth
                        startIcon={<RefreshRounded style={{ width: 16, height: 16 }} />}
                    >
                        Reset to Group
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
};
