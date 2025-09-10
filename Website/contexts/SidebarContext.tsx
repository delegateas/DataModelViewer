"use client"

import { createContext, ReactNode, useContext, useReducer, useMemo, useCallback } from "react";

export interface SidebarState {
    element: React.ReactNode;
    isOpen: boolean;
    showElement: boolean;
}

const initialState: SidebarState = {
    element: null,
    isOpen: false,
    showElement: true
}

type SidebarAction = 
    | { type: 'SET_ELEMENT', payload: React.ReactNode }
    | { type: 'SET_OPEN', payload: boolean }
    | { type: 'SET_SHOW_ELEMENT', payload: boolean }
    | { type: 'TOGGLE_OPEN' }
    | { type: 'CLEAR_ELEMENT' }

const sidebarReducer = (state: SidebarState, action: SidebarAction): SidebarState => {
    switch (action.type) {
        case 'SET_ELEMENT':
            return { ...state, element: action.payload }
        case 'SET_OPEN':
            return { ...state, isOpen: action.payload }
        case 'SET_SHOW_ELEMENT':
            return { ...state, showElement: action.payload }
        case 'TOGGLE_OPEN':
            return { ...state, isOpen: !state.isOpen }
        case 'CLEAR_ELEMENT':
            return { ...state, element: null }
        default:
            return state;
    }
}

// Enhanced interface with convenience methods
export interface SidebarContextValue extends SidebarState {
    toggleExpansion: () => void;
    expand: () => void;
    close: () => void;
    setElement: (element: React.ReactNode | null) => void;
    clearElement: () => void;
    dispatch: React.Dispatch<SidebarAction>;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [sidebarState, dispatch] = useReducer(sidebarReducer, initialState);
    
    // Memoized convenience methods using useCallback
    const toggleExpansion = useCallback(() => dispatch({ type: 'TOGGLE_OPEN' }), []);
    const expand = useCallback(() => dispatch({ type: 'SET_OPEN', payload: true }), []);
    const close = useCallback(() => dispatch({ type: 'SET_OPEN', payload: false }), []);
    const setElement = useCallback((element: React.ReactNode | null) => dispatch({ type: 'SET_ELEMENT', payload: element }), []);
    const clearElement = useCallback(() => dispatch({ type: 'CLEAR_ELEMENT' }), []);
    
    const contextValue = useMemo<SidebarContextValue>(() => ({
        ...sidebarState,
        toggleExpansion,
        expand,
        close,
        setElement,
        clearElement,
        dispatch
    }), [sidebarState, toggleExpansion, expand, close, setElement, clearElement]);
    
    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    )
}

// Single hook that provides everything
export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

// Backward compatibility - deprecated, use useSidebar instead
export const useSidebarDispatch = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebarDispatch must be used within a SidebarProvider");
    }
    return context.dispatch;
};