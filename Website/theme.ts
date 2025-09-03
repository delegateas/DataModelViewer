'use client';
import { createTheme } from '@mui/material/styles';

// Augment the theme to add custom IconButton sizes
declare module '@mui/material/IconButton' {
  interface IconButtonPropsSizeOverrides {
    xsmall: true;
  }
}

const theme = createTheme({
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Base styles for all IconButton variants
        },
      },
      variants: [
        {
          props: { size: 'xsmall' },
          style: {
            padding: '2px',
            fontSize: '0.75rem',
            '& svg': {
              width: '16px',
              height: '16px',
            },
          },
        },
      ],
    },
  },
  palette: {
    primary: {
      main: '#2563eb', // Blue-600 - change this to your desired primary color
      light: '#3b82f6', // Blue-500
      dark: '#1d4ed8', // Blue-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed', // Violet-600 - change this to your desired secondary color  
      light: '#8b5cf6', // Violet-500
      dark: '#6d28d9', // Violet-700
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626', // Red-600
      light: '#ef4444', // Red-500
      dark: '#b91c1c', // Red-700
    },
    warning: {
      main: '#d97706', // Amber-600
      light: '#f59e0b', // Amber-500
      dark: '#b45309', // Amber-700
    },
    info: {
      main: '#0ea5e9', // Sky-500
      light: '#38bdf8', // Sky-400
      dark: '#0284c7', // Sky-600
    },
    success: {
      main: '#16a34a', // Green-600
      light: '#22c55e', // Green-500
      dark: '#15803d', // Green-700
    },
    text: {
      primary: '#111827', // Grey-900 - Main text color
      secondary: '#6b7280', // Grey-500 - Secondary text color
      disabled: '#9ca3af', // Grey-400 - Disabled text color
    },
    background: {
      default: '#ffffff', // Main background color
      paper: '#ffffff', // Card/paper background color
    },
  },
  typography: {
    fontFamily: '"HassGrotesk", "Helvetica", "Arial", sans-serif',
    allVariants: {
      fontFamily: '"HassGrotesk", "Helvetica", "Arial", sans-serif',
    },
  },
  cssVariables: true,
});

export default theme;