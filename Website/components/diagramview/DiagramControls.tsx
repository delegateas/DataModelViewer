import React from 'react';
import { Button, Divider, Typography, Box } from '@mui/material';
import { 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Maximize, 
    Settings,
    Layers,
    Search
} from 'lucide-react';
import { useDiagramViewContext } from '@/contexts/DiagramViewContext';

export const DiagramControls: React.FC = () => {
  const { 
    resetView, 
    fitToScreen 
  } = useDiagramViewContext();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          View Controls
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            onClick={resetView}
            startIcon={<RotateCcw size={16} />}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Reset View
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            onClick={fitToScreen}
            startIcon={<Maximize size={16} />}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Fit to Screen
          </Button>
        </Box>
      </Box>
      
      <Divider />
      
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Tools
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            startIcon={<Search size={16} />}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Search Entities
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            startIcon={<Layers size={16} />}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Layer Manager
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            startIcon={<Settings size={16} />}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Diagram Settings
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export const DiagramZoomDisplay: React.FC = () => {
  const { zoom } = useDiagramViewContext();

  return (
    <Typography variant="caption" color="text.secondary">
      Zoom: {Math.round(zoom * 100)}%
    </Typography>
  );
};

export const DiagramZoomControls: React.FC = () => {
  const { zoomIn, zoomOut } = useDiagramViewContext();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button 
        variant="contained" 
        onClick={zoomIn}
        sx={{ minWidth: 32, height: 32, padding: 0 }}
      >
        <ZoomIn size={16} />
      </Button>
      <Button 
        variant="contained" 
        onClick={zoomOut}
        sx={{ minWidth: 32, height: 32, padding: 0 }}
      >
        <ZoomOut size={16} />
      </Button>
    </Box>
  );
}; 