'use client'

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from "react";

export interface EntityFilterState {
    hideStandardFields: boolean;
    typeFilter: string;
}

interface EntityFiltersState {
    filters: Map<string, EntityFilterState>; // Map of entitySchemaName -> filter state
}

type EntityFiltersAction =
    | { type: "SET_ENTITY_FILTERS"; entitySchemaName: string; filters: EntityFilterState }
    | { type: "CLEAR_ENTITY_FILTERS"; entitySchemaName: string };

const initialState: EntityFiltersState = {
    filters: new Map(),
};

const EntityFiltersContext = createContext<EntityFiltersState>(initialState);
const EntityFiltersDispatchContext = createContext<React.Dispatch<EntityFiltersAction>>(() => { });

const entityFiltersReducer = (state: EntityFiltersState, action: EntityFiltersAction): EntityFiltersState => {
    switch (action.type) {
        case "SET_ENTITY_FILTERS": {
            const newFilters = new Map(state.filters);
            newFilters.set(action.entitySchemaName, action.filters);
            return { ...state, filters: newFilters };
        }
        case "CLEAR_ENTITY_FILTERS": {
            const newFilters = new Map(state.filters);
            newFilters.delete(action.entitySchemaName);
            return { ...state, filters: newFilters };
        }
        default:
            return state;
    }
};

export const EntityFiltersProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(entityFiltersReducer, initialState);

    return (
        <EntityFiltersContext.Provider value={state}>
            <EntityFiltersDispatchContext.Provider value={dispatch}>
                {children}
            </EntityFiltersDispatchContext.Provider>
        </EntityFiltersContext.Provider>
    );
};

export const useEntityFilters = () => useContext(EntityFiltersContext);
export const useEntityFiltersDispatch = () => useContext(EntityFiltersDispatchContext);
