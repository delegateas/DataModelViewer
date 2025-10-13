import { dia, shapes } from '@joint/core';
import React, { createContext, useContext, ReactNode, useReducer, useEffect, useRef } from 'react';

interface DiagramActions {
  setZoom: (zoom: number) => void;
  setIsPanning: (isPanning: boolean) => void;
  setTranslate: (translate: { x: number; y: number }) => void;
  addEntity: (position?: { x: number; y: number }, label?: string) => void;
  getGraph: () => dia.Graph | null;
}

export interface DiagramState extends DiagramActions {
  canvas: React.MutableRefObject<HTMLDivElement | null>;
  zoom: number;
  isPanning: boolean;
  translate: { x: number; y: number };
}

const initialState: DiagramState = {
  zoom: 1,
  isPanning: false,
  translate: { x: 0, y: 0 },
  canvas: React.createRef<HTMLDivElement>(),

  setZoom: () => { throw new Error("setZoom not initialized yet!"); },
  setIsPanning: () => { throw new Error("setIsPanning not initialized yet!"); },
  setTranslate: () => { throw new Error("setTranslate not initialized yet!"); },
  addEntity: () => { throw new Error("addEntity not initialized yet!"); },
  getGraph: () => { throw new Error("getGraph not initialized yet!"); },
}

type DiagramViewAction =
  | { type: 'SET_ZOOM', payload: number }
  | { type: 'SET_IS_PANNING', payload: boolean }
  | { type: 'SET_TRANSLATE', payload: { x: number; y: number } };

const diagramViewReducer = (state: DiagramState, action: DiagramViewAction): DiagramState => {
  switch (action.type) {
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload }
    case 'SET_IS_PANNING':
      return { ...state, isPanning: action.payload }
    case 'SET_TRANSLATE':
      return { ...state, translate: action.payload }
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

    const setTranslate = (translate: { x: number; y: number }) => {
        dispatch({ type: 'SET_TRANSLATE', payload: translate });
    }

    // Refs to store graph and paper instances
    const graphRef = useRef<dia.Graph | null>(null);
    const paperRef = useRef<dia.Paper | null>(null);

    useEffect(() => {
        if (!diagramViewState.canvas.current) return;
        
        const graph = new dia.Graph({}, { cellNamespace: shapes });
        graphRef.current = graph;
        
        // Theme-aware colors using MUI CSS variables
        const gridMinorColor = "var(--mui-palette-border-main)";
        const gridMajorColor = "var(--mui-palette-border-main)";
        const backgroundColor = 'var(--mui-palette-background-default)';

        const paper = new dia.Paper({
            model: graph,
            width: '100%',
            height: '100%',
            gridSize: 20,
            drawGrid: {
                name: 'doubleMesh',
                args: [
                    { color: gridMinorColor, thickness: 1 }, // Minor grid lines
                    { color: gridMajorColor, thickness: 2, scaleFactor: 5 } // Major grid lines
                ]
            },
            background: {
                color: backgroundColor
            },
            interactive: true,
            snapToGrid: true,
            frozen: true,
            async: true,
            cellViewNamespace: shapes
        });

        paperRef.current = paper;
        diagramViewState.canvas.current.appendChild(paper.el);
        
        // Variables for panning and zooming
        let isPanning = false;
        let panStartX = 0;
        let panStartY = 0;
        let currentZoom = diagramViewState.zoom;
        let currentTranslate = { ...diagramViewState.translate };

        // Mouse down handler for panning
        const handleMouseDown = (evt: MouseEvent) => {
            if (evt.ctrlKey) {
                evt.preventDefault();
                isPanning = true;
                panStartX = evt.clientX;
                panStartY = evt.clientY;
                setIsPanning(true);
                diagramViewState.canvas.current!.style.cursor = 'grabbing';
            }
        };

        // Mouse move handler for panning
        const handleMouseMove = (evt: MouseEvent) => {
            if (isPanning && evt.ctrlKey) {
                evt.preventDefault();
                const deltaX = evt.clientX - panStartX;
                const deltaY = evt.clientY - panStartY;
                
                // Update current translate position
                currentTranslate.x += deltaX;
                currentTranslate.y += deltaY;
                
                // Apply the full transform (scale + translate)
                paper.matrix({
                    a: currentZoom,
                    b: 0,
                    c: 0,
                    d: currentZoom,
                    e: currentTranslate.x,
                    f: currentTranslate.y
                });
                
                // Update context state
                setTranslate({ ...currentTranslate });
                
                panStartX = evt.clientX;
                panStartY = evt.clientY;
            }
        };

        // Mouse up handler for panning
        const handleMouseUp = (evt: MouseEvent) => {
            if (isPanning) {
                evt.preventDefault();
                isPanning = false;
                setIsPanning(false);
                diagramViewState.canvas.current!.style.cursor = 'default';
            }
        };

        // Wheel handler for zooming and scrolling
        const handleWheel = (evt: WheelEvent) => {
            if (evt.ctrlKey) {
                // Zoom functionality
                evt.preventDefault();
                
                const zoomFactor = evt.deltaY > 0 ? 0.9 : 1.1;
                const newZoom = Math.max(0.1, Math.min(3, currentZoom * zoomFactor));
                
                if (newZoom !== currentZoom) {
                    // Get mouse position relative to canvas
                    const rect = diagramViewState.canvas.current!.getBoundingClientRect();
                    const mouseX = evt.clientX - rect.left;
                    const mouseY = evt.clientY - rect.top;
                    
                    // Calculate zoom center offset
                    const zoomRatio = newZoom / currentZoom;
                    
                    // Adjust translation to zoom around mouse position
                    currentTranslate.x = mouseX - (mouseX - currentTranslate.x) * zoomRatio;
                    currentTranslate.y = mouseY - (mouseY - currentTranslate.y) * zoomRatio;
                    
                    currentZoom = newZoom;
                    
                    // Apply the full transform (scale + translate)
                    paper.matrix({
                        a: currentZoom,
                        b: 0,
                        c: 0,
                        d: currentZoom,
                        e: currentTranslate.x,
                        f: currentTranslate.y
                    });
                    
                    // Update context state
                    setZoom(newZoom);
                    setTranslate({ ...currentTranslate });
                }
            } else {
                // Scroll functionality
                evt.preventDefault();
                
                const scrollSpeed = 50;
                
                // Handle scrolling with priority for horizontal scroll
                if (evt.deltaX !== 0) {
                    // Horizontal scroll wheel (if available) - only move horizontally
                    currentTranslate.x -= evt.deltaX > 0 ? scrollSpeed : -scrollSpeed;
                } else if (evt.shiftKey) {
                    // Shift + scroll = horizontal scrolling
                    currentTranslate.x -= evt.deltaY > 0 ? scrollSpeed : -scrollSpeed;
                } else {
                    // Regular scroll = vertical scrolling only
                    currentTranslate.y -= evt.deltaY > 0 ? scrollSpeed : -scrollSpeed;
                }
                
                // Apply the full transform (scale + translate)
                paper.matrix({
                    a: currentZoom,
                    b: 0,
                    c: 0,
                    d: currentZoom,
                    e: currentTranslate.x,
                    f: currentTranslate.y
                });
                
                // Update context state
                setTranslate({ ...currentTranslate });
            }
        };



        // Add event listeners
        const canvas = diagramViewState.canvas.current;
        canvas.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        
        // Unfreeze and render the paper to make it interactive
        paper.render();
        paper.unfreeze();
        
        return () => {
            // Remove event listeners
            canvas.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
            paper.remove();
        };
    }, []);

    // Context functions
    const addEntity = (position?: { x: number; y: number }, label?: string) => {
        if (graphRef.current && paperRef.current) {
            const x = position?.x ?? 100;
            const y = position?.y ?? 100;
            
            // Convert position if it's in screen coordinates
            const paperPoint = paperRef.current.clientToLocalPoint({ x, y });
            
            // Theme-aware entity colors using MUI CSS variables
            const colors = [
                { fill: 'var(--mui-palette-primary-main)', stroke: 'var(--mui-palette-primary-dark)' },
                { fill: 'var(--mui-palette-success-main)', stroke: 'var(--mui-palette-success-dark)' },
                { fill: 'var(--mui-palette-warning-main)', stroke: 'var(--mui-palette-warning-dark)' },
                { fill: 'var(--mui-palette-error-main)', stroke: 'var(--mui-palette-error-dark)' },
                { fill: 'var(--mui-palette-secondary-main)', stroke: 'var(--mui-palette-secondary-dark)' },
                { fill: 'var(--mui-palette-info-main)', stroke: 'var(--mui-palette-info-dark)' },
            ];
            
            const colorIndex = graphRef.current.getCells().length % colors.length;
            const color = colors[colorIndex];
            const entityLabel = label || `Entity ${graphRef.current.getCells().length + 1}`;
            
            // Theme-aware text color using MUI variables
            const textColor = 'var(--mui-palette-primary-contrastText)';
            
            const rect = new shapes.standard.Rectangle({
                position: { x: paperPoint.x - 60, y: paperPoint.y - 40 },
                size: { width: 120, height: 80 },
                attrs: {
                    body: {
                        fill: color.fill,
                        stroke: color.stroke,
                        strokeWidth: 2,
                        rx: 8,
                        ry: 8
                    },
                    label: {
                        text: entityLabel,
                        fill: textColor,
                        fontSize: 14,
                        fontFamily: 'Arial, sans-serif'
                    }
                }
            });
            
            graphRef.current.addCell(rect);
            return rect;
        }
        return null;
    };

    const getGraph = () => {
        return graphRef.current;
    };

    return (
        <DiagramViewContext.Provider value={{ ...diagramViewState, setZoom, setIsPanning, setTranslate, addEntity, getGraph }}>
            <DiagramViewDispatcher.Provider value={dispatch}>
                {children}
            </DiagramViewDispatcher.Provider>
        </DiagramViewContext.Provider>
    )
}

export const useDiagramView = () => useContext(DiagramViewContext);
export const useDiagramViewDispatch = () => useContext(DiagramViewDispatcher);