import { useState, useCallback, ReactNode } from 'react';

interface SidebarState {
  isOpen: boolean;
  element: ReactNode | null;
}

interface UseSidebarReturn {
  isOpen: boolean;
  element: ReactNode | null;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setElement: (element: ReactNode | null) => void;
  clearElement: () => void;
}

export const useSidebar = (initialState: Partial<SidebarState> = {}): UseSidebarReturn => {
  const [state, setState] = useState<SidebarState>({
    isOpen: initialState.isOpen ?? false,
    element: initialState.element ?? null,
  });

  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  }, []);

  const openSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true
    }));
  }, []);

  const closeSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const setElement = useCallback((element: ReactNode | null) => {
    setState(prev => ({
      ...prev,
      element
    }));
  }, []);

  const clearElement = useCallback(() => {
    setState(prev => ({
      ...prev,
      element: null
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    element: state.element,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setElement,
    clearElement,
  };
};
