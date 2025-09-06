'use client';
import { createTheme, PaletteMode } from '@mui/material/styles';

// Augment the theme to add custom IconButton sizes
declare module '@mui/material/IconButton' {
  interface IconButtonPropsSizeOverrides {
    xsmall: true;
  }
}

// Augment the palette to add custom colors
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    border: Palette['primary'];
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    border?: PaletteOptions['primary'];
  }
}

export const createAppTheme = (mode: PaletteMode) => createTheme({
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
    mode,
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
    accent: {
      main: '#a78bfa', // Purple-500
      light: '#a78bfa', // Purple-400
      dark: '#7c3aed', // Purple-600
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
      primary: mode === 'dark' ? '#f9fafb' : '#111827', // Light text in dark mode, dark text in light mode
      secondary: mode === 'dark' ? '#d1d5db' : '#6b7280', // Secondary text colors
      disabled: mode === 'dark' ? '#6b7280' : '#9ca3af', // Disabled text colors
    },
    background: {
      default: mode === 'dark' ? '#111827' : '#ffffff', // Dark background in dark mode
      paper: mode === 'dark' ? '#1f2937' : '#ffffff', // Dark paper background in dark mode
    },
    border: {
      main: mode === 'dark' ? '#374151' : '#e5e7eb', // Gray-700 in dark mode, Gray-200 in light mode
      dark: mode === 'dark' ? '#4b5563' : '#d1d5db', // Gray-600 in dark mode, Gray-300 in light mode
    }
  },
  typography: {
    fontFamily: '"HassGrotesk", "Helvetica", "Arial", sans-serif',
    allVariants: {
      fontFamily: '"HassGrotesk", "Helvetica", "Arial", sans-serif',
    },
  },
  cssVariables: true,
});

// Default theme for backwards compatibility
const theme = createAppTheme('light');

export default theme;