"use client"

import { useSearchParams } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useReducer } from "react";

export interface DatamodelViewState {
    selected: string | null;
}

const initialState: DatamodelViewState = {
    selected: null
}

type DatamodelViewAction = 
    | { type: 'SET_SELECTED', payload: string | null }


const datamodelViewReducer = (state: DatamodelViewState, action: DatamodelViewAction): DatamodelViewState => {
    switch (action.type) {
        case 'SET_SELECTED':
            return { ...state, selected: action.payload }
        default:
            return state;
    }
}

const DatamodelViewContext = createContext<DatamodelViewState>(initialState);
const DatamodelViewDispatcher = createContext<React.Dispatch<DatamodelViewAction>>(() => { });
export const DatamodelViewProvider = ({ children }: { children: ReactNode }) => {
    const [DatamodelViewState, dispatch] = useReducer(datamodelViewReducer, initialState);

    const searchParams = useSearchParams()
    const entityParam = searchParams.get('selected')
    useEffect(() => {
        dispatch({ type: "SET_SELECTED", payload: entityParam });
    }, [entityParam])
    
    return (
        <DatamodelViewContext.Provider value={DatamodelViewState}>
            <DatamodelViewDispatcher.Provider value={dispatch}>
                {children}
            </DatamodelViewDispatcher.Provider>
        </DatamodelViewContext.Provider>
    )
}

export const useDatamodelView = () => useContext(DatamodelViewContext);
export const useDatamodelViewDispatch = () => useContext(DatamodelViewDispatcher);