'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"HassGrotesk", "Helvetica", "Arial", sans-serif',
    allVariants: {
      fontFamily: '"HassGrotesk", "Helvetica", "Arial", sans-serif',
    },
  },
  cssVariables: true,
});

export default theme;