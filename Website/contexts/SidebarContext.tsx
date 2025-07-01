"use client"

import { createContext, ReactNode, useContext, useReducer } from "react";

export interface SidebarState {
    element: React.ReactNode;
    isOpen: boolean;
}

const initialState: SidebarState = {
    element: null,
    isOpen: false
}

type SidebarAction = 
    | { type: 'SET_ELEMENT', payload: React.ReactNode }
    | { type: 'SET_OPEN', payload: boolean }


const sidebarReducer = (state: SidebarState, action: SidebarAction): SidebarState => {
    switch (action.type) {
        case 'SET_ELEMENT':
            return { ...state, element: action.payload }
        case 'SET_OPEN':
            return { ...state, isOpen: action.payload }
        default:
            return state;
    }
}

const SidebarContext = createContext<SidebarState>(initialState);
const SidebarDispatcher = createContext<React.Dispatch<SidebarAction>>(() => { });
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