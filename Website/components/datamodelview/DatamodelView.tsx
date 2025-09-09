'use client'

import { useSidebar } from "@/contexts/SidebarContext";
import { SidebarDatamodelView } from "./SidebarDatamodelView";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import { SearchPerformanceProvider } from "@/contexts/SearchPerformanceContext";
import { List } from "./List";
import { TimeSlicedSearch } from "./TimeSlicedSearch";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDatamodelData, useDatamodelDataDispatch } from "@/contexts/DatamodelDataContext";
import { updateURL } from "@/lib/url-utils";
import { useSearchParams } from "next/navigation";

export function DatamodelView() {
    const { setElement, expand } = useSidebar();

    useEffect(() => {
        setElement(<SidebarDatamodelView />);
        expand();
    }, [setElement]);

    return (
        <SearchPerformanceProvider>
            <DatamodelViewContent />
        </SearchPerformanceProvider>
    );
}

function DatamodelViewContent() {
    const { scrollToSection } = useDatamodelView();
    const datamodelDispatch = useDatamodelViewDispatch();
    const { groups, filtered } = useDatamodelData();
    const datamodelDataDispatch = useDatamodelDataDispatch();
    const workerRef = useRef<Worker | null>(null);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const accumulatedResultsRef = useRef<Array<{ type: string; entity: { SchemaName: string }; group: { Name: string } }>>([]); // Track all results during search

    // Calculate total search results
    const totalResults = filtered.length > 0 ? filtered.filter(item => item.type === 'entity').length : 0;
    const initialLocalValue = useSearchParams().get('globalsearch') || "";

    // Isolated search handlers - these don't depend on component state
    const handleSearch = useCallback((searchValue: string) => {
        if (workerRef.current && groups) {
            if (searchValue.length >= 3) {
                workerRef.current.postMessage(searchValue);
            } else {
                // Clear search - reset to show all groups
                datamodelDataDispatch({ type: "SET_FILTERED", payload: [] });
            }
        }
        updateURL({ query: { globalsearch: searchValue.length >= 3 ? searchValue : "" } })
        datamodelDataDispatch({ type: "SET_SEARCH", payload: searchValue.length >= 3 ? searchValue : "" });
        setCurrentSearchIndex(searchValue.length >= 3 ? 1 : 0); // Reset to first result when searching, 0 when cleared
    }, [groups, datamodelDataDispatch]);

    const handleLoadingChange = useCallback((isLoading: boolean) => {
        datamodelDispatch({ type: "SET_LOADING", payload: isLoading });
    }, [datamodelDispatch]);

    // Navigation handlers
    const handleNavigateNext = useCallback(() => {
        if (currentSearchIndex < totalResults) {
            const nextIndex = currentSearchIndex + 1;
            setCurrentSearchIndex(nextIndex);
            
            // Find the next entity in filtered results
            const entityResults = filtered.filter(item => item.type === 'entity');
            const nextEntity = entityResults[nextIndex - 1];
            if (nextEntity) {
                datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: nextEntity.entity.SchemaName });
                datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: nextEntity.group.Name });
                
                // Scroll to the section
                scrollToSection(nextEntity.entity.SchemaName);
            }
        }
    }, [currentSearchIndex, totalResults, filtered, datamodelDispatch, scrollToSection]);

    const handleNavigatePrevious = useCallback(() => {
        if (currentSearchIndex > 1) {
            const prevIndex = currentSearchIndex - 1;
            setCurrentSearchIndex(prevIndex);
            
            // Find the previous entity in filtered results
            const entityResults = filtered.filter(item => item.type === 'entity');
            const prevEntity = entityResults[prevIndex - 1];
            if (prevEntity) {
                datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: prevEntity.entity.SchemaName });
                datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: prevEntity.group.Name });
                
                // Scroll to the section
                scrollToSection(prevEntity.entity.SchemaName);
            }
        }
    }, [currentSearchIndex, filtered, datamodelDispatch, scrollToSection]);

    useEffect(() => {
        if (!workerRef.current) {
            workerRef.current = new Worker(new URL("./searchWorker.ts", import.meta.url));
        }

        // Initialize or re-initialize worker with groups when groups change
        if (workerRef.current && groups && groups.length > 0) {
            workerRef.current.postMessage({ type: "init", groups });
        }

        const worker = workerRef.current;
        if (!worker) return;

        const handleMessage = (e: MessageEvent) => {
            const message = e.data;
            
            if (message.type === 'started') {
                datamodelDispatch({ type: "SET_LOADING", payload: true });
                // setSearchProgress(0);
                setCurrentSearchIndex(0);
                // Start with empty results to show loading state
                accumulatedResultsRef.current = []; // Reset accumulated results
                datamodelDataDispatch({ type: "SET_FILTERED", payload: [] });
            } 
            else if (message.type === 'results') {
                // setSearchProgress(message.progress || 0);
                
                // Accumulate results in ref for immediate access
                accumulatedResultsRef.current = [...accumulatedResultsRef.current, ...message.data];
                
                // For chunked results, always append to existing
                datamodelDataDispatch({ type: "APPEND_FILTERED", payload: message.data });
                
                // Only handle completion logic when all chunks are received
                if (message.complete) {
                    datamodelDispatch({ type: "SET_LOADING", payload: false });
                    // Set to first result if we have any and auto-navigate to it
                    // Use accumulated results from ref for immediate access
                    const allFilteredResults = accumulatedResultsRef.current.filter((item: { type: string }) => item.type === 'entity');
                    if (allFilteredResults.length > 0) {
                        setCurrentSearchIndex(1);
                        const firstEntity = allFilteredResults[0];
                        datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: firstEntity.entity.SchemaName });
                        datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: firstEntity.group.Name });
                        // Small delay to ensure virtual list is ready
                        setTimeout(() => {
                            scrollToSection(firstEntity.entity.SchemaName);
                        }, 100);
                    }
                }
            }
            else {
                // Handle legacy format for backward compatibility
                datamodelDataDispatch({ type: "SET_FILTERED", payload: message });
                datamodelDispatch({ type: "SET_LOADING", payload: false });
                // Set to first result if we have any and auto-navigate to it
                const entityResults = message.filter((item: { type: string }) => item.type === 'entity');
                if (entityResults.length > 0) {
                    setCurrentSearchIndex(1);
                    const firstEntity = entityResults[0];
                    datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: firstEntity.entity.SchemaName });
                    datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: firstEntity.group.Name });
                    // Small delay to ensure virtual list is ready
                    setTimeout(() => {
                        scrollToSection(firstEntity.entity.SchemaName);
                    }, 100);
                }
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
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="relative">
                {/* LOADING BAR - currently deprecated */}
                {/* {loading && (
                    <div className="absolute top-0 left-0 w-full h-1.5 z-50 overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-full bg-blue-100 opacity-40" />
                        <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600" 
                            style={{ width: `${searchProgress}%`, transition: 'width 200ms ease-out' }}
                        />
                    </div>
                )} */}
                <TimeSlicedSearch 
                    onSearch={handleSearch} 
                    onLoadingChange={handleLoadingChange}
                    onNavigateNext={handleNavigateNext}
                    onNavigatePrevious={handleNavigatePrevious}
                    initialLocalValue={initialLocalValue}
                    currentIndex={currentSearchIndex}
                    totalResults={totalResults}
                />
                <List />
            </div>
        </div>
    );
}