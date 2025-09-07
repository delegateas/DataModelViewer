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
      main: mode === 'dark' ? '#9fa8da' : '#3949ab', // Automatically adapts based on mode
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#8b5cf6' : '#7c3aed', // Violet-500 in dark, Violet-600 in light
      contrastText: '#ffffff',
    },
    accent: {
      main: mode === 'dark' ? '#c4b5fd' : '#a78bfa', // Purple-300 in dark, Purple-400 in light
      contrastText: '#ffffff',
    },
    error: {
      main: mode === 'dark' ? '#ef4444' : '#dc2626', // Red-500 in dark, Red-600 in light
    },
    warning: {
      main: mode === 'dark' ? '#f59e0b' : '#d97706', // Amber-500 in dark, Amber-600 in light
    },
    info: {
      main: mode === 'dark' ? '#38bdf8' : '#0ea5e9', // Sky-400 in dark, Sky-500 in light
    },
    success: {
      main: mode === 'dark' ? '#22c55e' : '#16a34a', // Green-500 in dark, Green-600 in light
    },
    text: {
      primary: mode === 'dark' ? '#f9fafb' : '#111827', // Light text in dark mode, dark text in light mode
      secondary: mode === 'dark' ? '#d1d5db' : '#6b7280', // Secondary text colors
      disabled: mode === 'dark' ? '#6b7280' : '#9ca3af', // Disabled text colors
    },
    background: {
      default: mode === 'dark' ? '#111827' : '#fafafa', 
      paper: mode === 'dark' ? '#1f2937' : '#ffffff',
    },
    divider: mode === 'dark' ? '#374151' : '#e5e7eb', // Same as border.main for consistency
    grey: {
      100: mode === 'dark' ? '#374151' : '#f3f4f6',
      200: mode === 'dark' ? '#4b5563' : '#e5e7eb',
      600: mode === 'dark' ? '#9ca3af' : '#4b5563',
      700: mode === 'dark' ? '#d1d5db' : '#374151',
    },
    border: {
      main: mode === 'dark' ? '#374151' : '#e5e7eb', // Gray-700 in dark mode, Gray-200 in light mode
      dark: mode === 'dark' ? '#4b5563' : '#d1d5db', // Gray-600 in dark mode, Gray-300 in light mode
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    allVariants: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  cssVariables: true,
});

// Default theme for backwards compatibility
const theme = createAppTheme('light');

export default theme;