'use client'

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { EntityType, GroupType, RelationshipType, SolutionType, SolutionWarningType } from "@/lib/Types";
import { useSearchParams } from "next/navigation";

interface DataModelAction {
  getEntityDataBySchemaName: (schemaName: string) => EntityType | undefined;
}

interface DatamodelDataState extends DataModelAction {
  groups: GroupType[];
  entityMap?: Map<string, EntityType>;
  warnings: SolutionWarningType[];
  solutions: SolutionType[];
  search: string;
  filtered: Array<
    | { type: 'group'; group: GroupType }
    | { type: 'entity'; group: GroupType; entity: EntityType }
  >;
}

const initialState: DatamodelDataState = {
  groups: [],
  warnings: [],
  solutions: [],
  search: "",
  filtered: [],

  getEntityDataBySchemaName: () => { throw new Error("getEntityDataBySchemaName not implemented.") },
};

const DatamodelDataContext = createContext<DatamodelDataState>(initialState);
const DatamodelDataDispatchContext = createContext<React.Dispatch<any>>(() => { });

const datamodelDataReducer = (state: DatamodelDataState, action: any): DatamodelDataState => {
  switch (action.type) {
    case "SET_GROUPS":
      return { ...state, groups: action.payload };
    case "SET_ENTITIES":
      return { ...state, entityMap: action.payload };
    case "SET_WARNINGS":
      return { ...state, warnings: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_FILTERED":
      return { ...state, filtered: action.payload };
    case "SET_SOLUTIONS":
      return { ...state, solutions: action.payload };
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

    const worker = new Worker(new URL("../components/datamodelview/dataLoaderWorker.ts", import.meta.url));
    worker.onmessage = (e) => {
      dispatch({ type: "SET_GROUPS", payload: e.data.groups || [] });
      dispatch({ type: "SET_ENTITIES", payload: e.data.entityMap || new Map() });
      dispatch({ type: "SET_WARNINGS", payload: e.data.warnings || [] });
      dispatch({ type: "SET_SOLUTIONS", payload: e.data.solutions || [] });
      worker.terminate();
    };
    worker.postMessage({});
    return () => worker.terminate();
  }, []);

  const getEntityDataBySchemaName = (schemaName: string): EntityType | undefined => {
    return state.entityMap?.get(schemaName);
  }

  return (
    <DatamodelDataContext.Provider value={{ ...state, getEntityDataBySchemaName }}>
      <DatamodelDataDispatchContext.Provider value={dispatch}>
        {children}
      </DatamodelDataDispatchContext.Provider>
    </DatamodelDataContext.Provider>
  );
};

export const useDatamodelData = () => useContext(DatamodelDataContext);
export const useDatamodelDataDispatch = () => useContext(DatamodelDataDispatchContext);