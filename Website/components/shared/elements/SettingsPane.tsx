'use client'

import React from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Card, 
  CardContent, 
  Switch, 
  FormControlLabel,
  Divider 
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsPaneProps {
  open: boolean;
  onClose: () => void;
}

const SettingsPane = ({ open, onClose }: SettingsPaneProps) => {
  const { mode, toggleColorMode } = useSettings();

  const handleThemeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    toggleColorMode();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box className="h-full flex flex-col">
        {/* Header */}
        <Box className="flex items-center justify-between p-4 border-b">
          <Typography variant="h6" className="font-semibold">
            Settings
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box className="flex-1 p-4">
          <Card className="shadow-sm">
            <CardContent>
              <Typography variant="subtitle1" className="font-medium mb-3">
                Appearance
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={mode === 'dark'}
                    onChange={handleThemeToggle}
                    color="primary"
                  />
                }
                label="Dark Theme"
                className="w-full justify-between flex-row-reverse ml-0"
                componentsProps={{
                  typography: {
                    className: "flex-1"
                  }
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SettingsPane;
