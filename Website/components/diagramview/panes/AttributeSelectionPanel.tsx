'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { 
    Button, 
    Collapse, 
    RadioGroup, 
    FormControlLabel, 
    Radio, 
    Typography, 
    Box 
} from '@mui/material';
import { AttributeSelectionMode } from '@/hooks/useAttributeSelection';

export interface AttributeSelectionPanelProps {
    attributeMode: AttributeSelectionMode;
    setAttributeMode: (mode: AttributeSelectionMode) => void;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    getAttributeModeDescription: (mode: AttributeSelectionMode) => string;
}

export const AttributeSelectionPanel: React.FC<AttributeSelectionPanelProps> = ({
    attributeMode,
    setAttributeMode,
    isExpanded,
    setIsExpanded,
    getAttributeModeDescription
}) => {
    return (
        <Box>
            <Button 
                variant="outlined" 
                onClick={() => setIsExpanded(!isExpanded)}
                fullWidth
                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
            >
                <Box display="flex" alignItems="center">
                    <Settings style={{ width: 16, height: 16, marginRight: 8 }} />
                    Attribute Selection
                </Box>
                {isExpanded ? <ChevronDown style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
            </Button>
            
            <Collapse in={isExpanded}>
                <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1} bgcolor="grey.50">
                    <Typography variant="subtitle2" gutterBottom>
                        Default attributes to include:
                    </Typography>
                    <RadioGroup
                        value={attributeMode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttributeMode(e.target.value as AttributeSelectionMode)}
                    >
                        <FormControlLabel
                            value="minimal"
                            control={<Radio size="small" />}
                            label={
                                <Typography variant="body2">
                                    {getAttributeModeDescription('minimal')}
                                </Typography>
                            }
                        />
                        <FormControlLabel
                            value="custom-lookups"
                            control={<Radio size="small" />}
                            label={
                                <Typography variant="body2">
                                    {getAttributeModeDescription('custom-lookups')}
                                </Typography>
                            }
                        />
                        <FormControlLabel
                            value="all-lookups"
                            control={<Radio size="small" />}
                            label={
                                <Typography variant="body2">
                                    {getAttributeModeDescription('all-lookups')}
                                </Typography>
                            }
                        />
                        <FormControlLabel
                            value="custom"
                            control={<Radio size="small" />}
                            label={
                                <Typography variant="body2">
                                    {getAttributeModeDescription('custom')}
                                </Typography>
                            }
                        />
                    </RadioGroup>
                </Box>
            </Collapse>
        </Box>
    );
};
