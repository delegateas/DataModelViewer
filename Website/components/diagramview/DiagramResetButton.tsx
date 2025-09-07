import React from 'react';
import { Button } from '@mui/material';
import { RefreshRounded } from '@mui/icons-material';

interface DiagramResetButtonProps {
  onReset: () => void;
  disabled?: boolean;
}

export const DiagramResetButton: React.FC<DiagramResetButtonProps> = ({
  onReset,
  disabled = false
}) => {
  return (
    <Button
      variant="outlined"
      size="small"
      onClick={onReset}
      disabled={disabled}
      className="w-full"
    >
      <RefreshRounded className="h-4 w-4 mr-2" />
      Reset View
    </Button>
  );
}; 