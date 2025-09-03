import React from 'react';
import { CircularProgress, Typography, Backdrop, Box } from '@mui/material';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

const LoadingOverlay = ({ open, message = 'Loading...' }: LoadingOverlayProps) => {
  return (
    <Backdrop
      className="text-white dark:text-white z-[1301] bg-black/70 dark:bg-black/70"
      open={open}
    >
      <Box 
        className="flex flex-col items-center gap-4"
        aria-label="Loading content"
      >
        <CircularProgress 
          color="inherit" 
          size={40}
          aria-label="Loading indicator"
        />
        <Typography 
          variant="body1" 
          color="inherit"
          className="font-context text-white dark:text-white"
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
