import React, { createContext, useContext, ReactNode, useReducer } from 'react';

interface DiagramActions {
  setZoom: (zoom: number) => void;
  setIsPanning: (isPanning: boolean) => void;
}

export interface DiagramState extends DiagramActions {
  zoom: number;
  isPanning: boolean;
}

const initialState: DiagramState = {
  zoom: 1,
  isPanning: false,
  
  setZoom: () => { throw new Error("setZoom not initialized yet!"); },
  setIsPanning: () => { throw new Error("setIsPanning not initialized yet!"); },
}

type DiagramViewAction =
  | { type: 'SET_ZOOM', payload: number }
  | { type: 'SET_IS_PANNING', payload: boolean };

const diagramViewReducer = (state: DiagramState, action: DiagramViewAction): DiagramState => {
  switch (action.type) {
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload }
    case 'SET_IS_PANNING':
      return { ...state, isPanning: action.payload }
    default:
      return state;
  }
}

const DiagramViewContext = createContext<DiagramState>(initialState);
const DiagramViewDispatcher = createContext<React.Dispatch<DiagramViewAction>>(() => { });

export const DiagramViewProvider = ({ children }: { children: ReactNode }) => {
    const [diagramViewState, dispatch] = useReducer(diagramViewReducer, initialState);

    const setZoom = (zoom: number) => {
        dispatch({ type: 'SET_ZOOM', payload: zoom });
    }

    const setIsPanning = (isPanning: boolean) => {
        dispatch({ type: 'SET_IS_PANNING', payload: isPanning });
    }

    return (
        <DiagramViewContext.Provider value={{ ...diagramViewState, setZoom, setIsPanning }}>
            <DiagramViewDispatcher.Provider value={dispatch}>
                {children}
            </DiagramViewDispatcher.Provider>
        </DiagramViewContext.Provider>
    )
}

export const useDiagramView = () => useContext(DiagramViewContext);
export const useDiagramViewDispatch = () => useContext(DiagramViewDispatcher);