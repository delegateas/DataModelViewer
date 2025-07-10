"use client"

import { DatamodelView } from "@/components/datamodelview/DatamodelView";
import { useSearchParams } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useReducer, useRef } from "react";

export interface DatamodelViewState {
    currentGroup: string | null;
    currentSection: string | null;
    scrollToSection: (sectionId: string) => void;
}

const initialState: DatamodelViewState = {
    currentGroup: null,
    currentSection: null,
    scrollToSection: () => { throw new Error("scrollToSection not initialized yet!"); },
}

type DatamodelViewAction = 
    | { type: 'SET_CURRENT_GROUP', payload: string | null }
    | { type: 'SET_CURRENT_SECTION', payload: string | null }
    | { type: 'SET_SCROLL_TO_SECTION', payload: (sectionId: string) => void }


const datamodelViewReducer = (state: DatamodelViewState, action: DatamodelViewAction): DatamodelViewState => {
    switch (action.type) {
        case 'SET_CURRENT_GROUP':
            return { ...state, currentGroup: action.payload }
        case 'SET_CURRENT_SECTION':
            return { ...state, currentSection: action.payload }
        case 'SET_SCROLL_TO_SECTION':
            return { ...state, scrollToSection: action.payload }
        default:
            return state;
    }
}

const DatamodelViewContext = createContext<DatamodelViewState>(initialState);
const DatamodelViewDispatcher = createContext<React.Dispatch<DatamodelViewAction>>(() => { });
export const DatamodelViewProvider = ({ children }: { children: ReactNode }) => {
    const [datamodelViewState, dispatch] = useReducer(datamodelViewReducer, initialState);

    const searchParams = useSearchParams();
    const entityParam = searchParams.get('section');

    useEffect(() => {
        dispatch({ type: "SET_CURRENT_GROUP", payload: entityParam });
    }, [entityParam])

    return (
        <DatamodelViewContext.Provider value={{ ...datamodelViewState }}>
            <DatamodelViewDispatcher.Provider value={dispatch}>
                {children}
            </DatamodelViewDispatcher.Provider>
        </DatamodelViewContext.Provider>
    )
}

export const useDatamodelView = () => useContext(DatamodelViewContext);
export const useDatamodelViewDispatch = () => useContext(DatamodelViewDispatcher);