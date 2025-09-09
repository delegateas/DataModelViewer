'use client'

import React from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Switch, 
  Paper
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsPaneProps {
  open: boolean;
  onClose: () => void;
}

const SettingsPane = ({ open, onClose }: SettingsPaneProps) => {
  const { mode, toggleColorMode } = useSettings();

  const handleThemeToggle = () => {
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
        <Box className="flex items-center justify-between p-4">
          <Typography variant="h6" className="font-semibold">
            Settings
          </Typography>
          <IconButton onClick={onClose} size="xsmall" aria-label="Close settings pane">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box className="flex-1 p-4">
          <Paper variant='outlined' className='rounded-lg'>
            <Box className='flex p-4 items-start justify-between'>
                <Typography variant="subtitle1" className="font-medium mb-3 flex items-center flex-col h-full">
                    {mode === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className='mb-2'>
                            <path fill="currentColor" d="M12 22c5.523 0 10-4.477 10-10c0-.463-.694-.54-.933-.143a6.5 6.5 0 1 1-8.924-8.924C12.54 2.693 12.463 2 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10" opacity={0.5}></path>
                            <path fill="currentColor" d="M11.286 22C13.337 22 15 20.42 15 18.47c0-1.544-1.045-2.857-2.5-3.336C12.295 13.371 10.72 12 8.81 12c-2.052 0-3.715 1.58-3.715 3.53c0 .43.082.844.23 1.226a3 3 0 0 0-.54-.05C3.248 16.706 2 17.89 2 19.353S3.247 22 4.786 22z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className='mb-2'>
                            <path fill="currentColor" d="M11.5 8a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0" opacity={0.5}></path>
                            <path fill="currentColor" fillRule="evenodd" d="M7.5 1.25a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M3.08 3.08a.75.75 0 0 1 1.062 0l.216.217a.75.75 0 0 1-1.061 1.06l-.216-.216a.75.75 0 0 1 0-1.06m8.839 0a.75.75 0 0 1 0 1.061l-.216.216a.75.75 0 1 1-1.06-1.06l.215-.216a.75.75 0 0 1 1.061 0M1.25 7.5A.75.75 0 0 1 2 6.75h.5a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m3.108 3.143a.75.75 0 0 1 0 1.06l-.216.216a.75.75 0 0 1-1.061-1.06l.216-.216a.75.75 0 0 1 1.06 0" clipRule="evenodd" opacity={0.5}></path>
                            <path fill="currentColor" d="M16.286 22C19.442 22 22 19.472 22 16.353c0-2.472-1.607-4.573-3.845-5.338C17.837 8.194 15.415 6 12.476 6C9.32 6 6.762 8.528 6.762 11.647c0 .69.125 1.35.354 1.962a4.4 4.4 0 0 0-.83-.08C3.919 13.53 2 15.426 2 17.765S3.919 22 6.286 22z"></path>
                        </svg>
                    )}
                    Mode
                </Typography>
                <Switch
                    checked={mode === 'dark'}
                    onChange={handleThemeToggle}
                    color="default"
                />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SettingsPane;
