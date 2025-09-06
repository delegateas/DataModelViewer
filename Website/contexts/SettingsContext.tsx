'use client';
import React, { createContext, ReactNode, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { PaletteMode, CssBaseline } from "@mui/material";
import { createAppTheme } from "../theme";

interface SettingsContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [mode, setMode] = useState<PaletteMode>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode);
    }
    setIsHydrated(true);
  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('themeMode', mode);
    }
  }, [mode, isHydrated]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) =>
          prevMode === 'light' ? 'dark' : 'light',
        );
      },
    }), [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Prevent flash of wrong theme during hydration
  if (!isHydrated) {
    return null;
  }

  return (
    <SettingsContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
};