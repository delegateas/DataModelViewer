'use client'

import { AppSidebar } from "../AppSidebar";
import { TooltipProvider } from "../ui/tooltip";
import { useSidebarDispatch } from "@/contexts/SidebarContext";
import { SidebarDatamodelView } from "./SidebarDatamodelView";
import { DatamodelViewProvider, useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import { SearchPerformanceProvider } from "@/contexts/SearchPerformanceContext";
import { List } from "./List";
import { SearchBar } from "./SearchBar";
import { TimeSlicedSearch } from "./TimeSlicedSearch";
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Dispatch, SetStateAction, RefObject } from "react";
import { useDatamodelData, useDatamodelDataDispatch } from "@/contexts/DatamodelDataContext";
import { debounce } from "@/lib/utils";

export function DatamodelView() {
    const dispatch = useSidebarDispatch();

    useEffect(() => {
        dispatch({ type: "SET_ELEMENT", payload: <SidebarDatamodelView /> });
    }, []);

    return (
        <SearchPerformanceProvider>
            <DatamodelViewProvider>
                <DatamodelViewContent />
            </DatamodelViewProvider>
        </SearchPerformanceProvider>
    );
}

function DatamodelViewContent() {
    const { loading } = useDatamodelView();
    const datamodelDispatch = useDatamodelViewDispatch();
    const { groups, search, filtered } = useDatamodelData();
    const datamodelDataDispatch = useDatamodelDataDispatch();
    const workerRef = useRef<Worker | null>(null);
    const [searchProgress, setSearchProgress] = useState(0);

    // Isolated search handlers - these don't depend on component state
    const handleSearch = useCallback((searchValue: string) => {
        if (workerRef.current && groups) {
            workerRef.current.postMessage(searchValue.length >= 3 ? searchValue : "");
        }
        datamodelDataDispatch({ type: "SET_SEARCH", payload: searchValue.length >= 3 ? searchValue : "" });
    }, [groups, datamodelDataDispatch]);

    const handleLoadingChange = useCallback((isLoading: boolean) => {
        datamodelDispatch({ type: "SET_LOADING", payload: isLoading });
    }, [datamodelDispatch]);

    useEffect(() => {
        if (!workerRef.current && groups) {
            workerRef.current = new Worker(new URL("./searchWorker.js", import.meta.url));
            workerRef.current.postMessage({ type: "init", groups });
        }

        const worker = workerRef.current;
        if (!worker) return;

        const handleMessage = (e: MessageEvent) => {
            const message = e.data;
            
            if (message.type === 'started') {
                datamodelDispatch({ type: "SET_LOADING", payload: true });
                setSearchProgress(0);
                // Start with empty results to show loading state
                datamodelDataDispatch({ type: "SET_FILTERED", payload: [] });
            } 
            else if (message.type === 'results') {
                setSearchProgress(message.progress || 0);
                
                // For chunked results, append to existing
                if (message.complete) {
                    datamodelDataDispatch({ type: "SET_FILTERED", payload: message.data });
                    datamodelDispatch({ type: "SET_LOADING", payload: false });
                } else {
                    datamodelDataDispatch({ type: "APPEND_FILTERED", payload: message.data });
                }
            }
            else {
                // Handle legacy format for backward compatibility
                datamodelDataDispatch({ type: "SET_FILTERED", payload: message });
                datamodelDispatch({ type: "SET_LOADING", payload: false });
            }
        };

        worker.addEventListener("message", handleMessage);
        return () => worker.removeEventListener("message", handleMessage);
    }, [datamodelDispatch, datamodelDataDispatch, groups]);

    if (!groups) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-32 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 animate-indeterminate rounded-full" />
                <style>{`
                    @keyframes indeterminate {
                        0% { left: -33%; width: 33%; }
                        50% { left: 33%; width: 33%; }
                        100% { left: 100%; width: 33%; }
                    }
                    .animate-indeterminate {
                        position: relative;
                        animation: indeterminate 1.2s cubic-bezier(0.4,0,0.2,1) infinite;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="flex">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-stone-50">
                <div className="relative">
                    {/* LOADING BAR */}
                    {loading && (
                        <div className="absolute top-0 left-0 w-full h-1.5 z-50 overflow-hidden">
                            <div className="absolute left-0 top-0 h-full w-full bg-blue-100 opacity-40" />
                            <div 
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600" 
                                style={{ width: `${searchProgress}%`, transition: 'width 200ms ease-out' }}
                            />
                        </div>
                    )}
                    <TimeSlicedSearch 
                        onSearch={handleSearch} 
                        onLoadingChange={handleLoadingChange}
                    />
                    <TooltipProvider delayDuration={0}>
                        <List />
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}