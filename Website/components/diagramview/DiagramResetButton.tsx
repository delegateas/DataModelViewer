import React from 'react';
import { Button } from '@/components/shared/ui/button';
import { RotateCcw } from 'lucide-react';

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
      variant="outline"
      size="sm"
      onClick={onReset}
      disabled={disabled}
      className="w-full"
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      Reset View
    </Button>
  );
}; 