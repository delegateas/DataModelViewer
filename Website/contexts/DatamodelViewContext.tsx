"use client"

import { DatamodelView } from "@/components/DatamodelView";
import { useSearchParams } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useReducer } from "react";

export interface DatamodelViewState {
    currentGroup: string | null;
    currentSection: string | null;
    isScrolling: boolean;
}

const initialState: DatamodelViewState = {
    currentGroup: null,
    currentSection: null,
    isScrolling: false,
}

type DatamodelViewAction = 
    | { type: 'SET_SCROLLING', payload: boolean }
    | { type: 'SET_CURRENT_GROUP', payload: string | null }
    | { type: 'SET_CURRENT_SECTION', payload: string | null }


const datamodelViewReducer = (state: DatamodelViewState, action: DatamodelViewAction): DatamodelViewState => {
    switch (action.type) {
        case 'SET_SCROLLING':
            console.log("dispatched: ", action.payload)
            return { ...state, isScrolling: action.payload }
        case 'SET_CURRENT_GROUP':
            return { ...state, currentGroup: action.payload }
        case 'SET_CURRENT_SECTION':
            return { ...state, currentSection: action.payload }
        default:
            return state;
    }
}

const DatamodelViewContext = createContext<any>(initialState);
const DatamodelViewDispatcher = createContext<React.Dispatch<DatamodelViewAction>>(() => { });
export const DatamodelViewProvider = ({ children }: { children: ReactNode }) => {
    const [DatamodelViewState, dispatch] = useReducer(datamodelViewReducer, initialState);

    const searchParams = useSearchParams()
    const entityParam = searchParams.get('section')
    useEffect(() => {
        dispatch({ type: "SET_CURRENT_GROUP", payload: entityParam });
    }, [entityParam])

    const scrollIntoView = (element: HTMLElement | null) => {
        dispatch({ type: "SET_SCROLLING", payload: true });
        if (!element) return;
        element.scrollIntoView({ behavior: 'smooth' });
        dispatch({ type: "SET_SCROLLING", payload: false });
    }
    
    useEffect(() => {
        console.log(DatamodelViewState.isScrolling)
    }, [DatamodelViewState.isScrolling])

    return (
        <DatamodelViewContext.Provider value={{ ...DatamodelViewState, scrollIntoView }}>
            <DatamodelViewDispatcher.Provider value={dispatch}>
                {children}
            </DatamodelViewDispatcher.Provider>
        </DatamodelViewContext.Provider>
    )
}

export const useDatamodelView = () => useContext(DatamodelViewContext);
export const useDatamodelViewDispatch = () => useContext(DatamodelViewDispatcher);