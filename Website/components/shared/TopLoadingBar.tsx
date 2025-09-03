import React from 'react';
import { Box, LinearProgress } from '@mui/material';

interface TopLoadingBarProps {
  loading: boolean;
}

const TopLoadingBar = ({ loading }: TopLoadingBarProps) => {
  if (!loading) return null;

  return (
    <Box
      className="fixed top-0 left-0 right-0 z-[1302] h-1"
      aria-label="Loading progress"
    >
      <LinearProgress 
        className="h-1 bg-black/10 dark:bg-white/10 [&_.MuiLinearProgress-bar]:bg-blue-600 dark:[&_.MuiLinearProgress-bar]:bg-blue-400"
        aria-label="Loading indicator"
      />
    </Box>
  );
};

export default TopLoadingBar;
