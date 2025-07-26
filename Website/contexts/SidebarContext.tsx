"use client"

import { createContext, ReactNode, useContext, useEffect, useReducer } from "react";

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


const sidebarReducer = (state: SidebarState, action: SidebarAction): SidebarState => {
    switch (action.type) {
        case 'SET_ELEMENT':
            return { ...state, element: action.payload }
        case 'SET_OPEN':
            return { ...state, isOpen: action.payload }
        case 'SET_SHOW_ELEMENT':
            return { ...state, showElement: action.payload }
        default:
            return state;
    }
}

const SidebarContext = createContext<SidebarState>(initialState);
const SidebarDispatcher = createContext<React.Dispatch<SidebarAction>>(() => {
    throw new Error("SidebarDispatcher must be used within a SidebarProvider");
});
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [sidebarState, dispatch] = useReducer(sidebarReducer, initialState);
    
    return (
        <SidebarContext.Provider value={sidebarState}>
            <SidebarDispatcher.Provider value={dispatch}>
                {children}
            </SidebarDispatcher.Provider>
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext);
export const useSidebarDispatch = () => useContext(SidebarDispatcher);