import { dia, shapes } from '@joint/core';
import React, { createContext, useContext, ReactNode, useReducer, useEffect, useRef } from 'react';

interface DiagramActions {
  setZoom: (zoom: number) => void;
  setIsPanning: (isPanning: boolean) => void;
  setTranslate: (translate: { x: number; y: number }) => void;
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

    useEffect(() => {
        if (!diagramViewState.canvas.current) return;
        
        const graph = new dia.Graph({}, { cellNamespace: shapes });
        const paper = new dia.Paper({
            model: graph,
            width: '100%',
            height: '100%',
            gridSize: 20,
            drawGrid: {
                name: 'doubleMesh',
                args: [
                    { color: '#f0f0f0', thickness: 1 }, // Minor grid lines
                    { color: '#d0d0d0', thickness: 2, scaleFactor: 5 } // Major grid lines
                ]
            },
            background: {
                color: '#fafafa'
            },
            interactive: true,
            snapToGrid: true,
            frozen: true,
            async: true,
            cellViewNamespace: shapes
        });

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

        // Add some sample elements
        const rect = new shapes.standard.Rectangle({
            position: { x: 100, y: 50 },
            size: { width: 120, height: 80 },
            attrs: {
                body: {
                    fill: '#3b82f6',
                    stroke: '#1e40af',
                    strokeWidth: 2,
                    rx: 8,
                    ry: 8
                },
                label: {
                    text: 'Sample Entity',
                    fill: 'white',
                    fontSize: 14,
                    fontFamily: 'Arial, sans-serif'
                }
            }
        });

        const rect2 = new shapes.standard.Rectangle({
            position: { x: 300, y: 200 },
            size: { width: 120, height: 80 },
            attrs: {
                body: {
                    fill: '#10b981',
                    stroke: '#059669',
                    strokeWidth: 2,
                    rx: 8,
                    ry: 8
                },
                label: {
                    text: 'Another Entity',
                    fill: 'white',
                    fontSize: 14,
                    fontFamily: 'Arial, sans-serif'
                }
            }
        });

        graph.addCells([rect, rect2]);
        
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

    return (
        <DiagramViewContext.Provider value={{ ...diagramViewState, setZoom, setIsPanning, setTranslate }}>
            <DiagramViewDispatcher.Provider value={dispatch}>
                {children}
            </DiagramViewDispatcher.Provider>
        </DiagramViewContext.Provider>
    )
}

export const useDiagramView = () => useContext(DiagramViewContext);
export const useDiagramViewDispatch = () => useContext(DiagramViewDispatcher);