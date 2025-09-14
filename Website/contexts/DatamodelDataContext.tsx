'use client'

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { GroupType, SolutionWarningType } from "@/lib/Types";
import { useSearchParams } from "next/navigation";

interface DatamodelDataState {
  groups: GroupType[];
  warnings: SolutionWarningType[];
  search: string;
  filtered: any[];
}

const initialState: DatamodelDataState = {
  groups: [],
  warnings: [],
  search: "",
  filtered: []
};

const DatamodelDataContext = createContext<DatamodelDataState>(initialState);
const DatamodelDataDispatchContext = createContext<React.Dispatch<any>>(() => {});

const datamodelDataReducer = (state: DatamodelDataState, action: any): DatamodelDataState => {
  switch (action.type) {
    case "SET_GROUPS":
      return { ...state, groups: action.payload };
    case "SET_WARNINGS":
      return { ...state, warnings: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_FILTERED":
      return { ...state, filtered: action.payload };
    case "APPEND_FILTERED":
      return { ...state, filtered: [...state.filtered, ...action.payload] };
    default:
      return state;
  }
};

export const DatamodelDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(datamodelDataReducer, initialState);

  const searchParams = useSearchParams();
  const globalsearchParam = searchParams.get('globalsearch');

  React.useEffect(() => {

    dispatch({ type: "SET_SEARCH", payload: globalsearchParam || "" });

    const worker = new Worker(new URL("../components/datamodelview/dataLoaderWorker.js", import.meta.url));
    worker.onmessage = (e) => {
      dispatch({ type: "SET_GROUPS", payload: e.data.groups || [] });
      dispatch({ type: "SET_WARNINGS", payload: e.data.warnings || [] });
      worker.terminate();
    };
    worker.postMessage({});
    return () => worker.terminate();
  }, []);

  return (
    <DatamodelDataContext.Provider value={state}>
      <DatamodelDataDispatchContext.Provider value={dispatch}>
        {children}
      </DatamodelDataDispatchContext.Provider>
    </DatamodelDataContext.Provider>
  );
};

export const useDatamodelData = () => useContext(DatamodelDataContext);
export const useDatamodelDataDispatch = () => useContext(DatamodelDataDispatchContext);