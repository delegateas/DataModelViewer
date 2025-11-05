'use client'

import { useSidebar } from "@/contexts/SidebarContext";
import { SidebarDatamodelView } from "./SidebarDatamodelView";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import { List } from "./List";
import { TimeSlicedSearch } from "./TimeSlicedSearch";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDatamodelData, useDatamodelDataDispatch } from "@/contexts/DatamodelDataContext";
import { updateURL } from "@/lib/url-utils";
import { useSearchParams } from "next/navigation";
import { AttributeType, EntityType, GroupType } from "@/lib/Types";
import { useEntityFilters } from "@/contexts/EntityFiltersContext";

// Type for search results
type SearchResultItem =
    | { type: 'group'; group: GroupType }
    | { type: 'entity'; group: GroupType; entity: EntityType }
    | { type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType };

export function DatamodelView() {
    const { setElement, expand } = useSidebar();

    useEffect(() => {
        setElement(<SidebarDatamodelView />);
        expand();
    }, [setElement]);

    return (
        <DatamodelViewContent />
    );
}

function DatamodelViewContent() {
    const { scrollToSection, scrollToAttribute, restoreSection } = useDatamodelView();
    const datamodelDispatch = useDatamodelViewDispatch();
    const { groups, filtered } = useDatamodelData();
    const datamodelDataDispatch = useDatamodelDataDispatch();
    const { filters: entityFilters } = useEntityFilters();
    const workerRef = useRef<Worker | null>(null);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const accumulatedResultsRef = useRef<SearchResultItem[]>([]); // Track all results during search

    // Calculate total search results (prioritize attributes, fallback to entities)
    const totalResults = useMemo(() => {
        if (filtered.length === 0) return 0;

        const attributeCount = filtered.filter(item => item.type === 'attribute').length;
        if (attributeCount > 0) return attributeCount;
        return 0;
    }, [filtered]);
    const initialLocalValue = useSearchParams().get('globalsearch') || "";

    // Isolated search handlers - these don't depend on component state
    const handleSearch = useCallback((searchValue: string) => {
        if (workerRef.current && groups) {
            if (searchValue.length >= 3) {
                // Convert Map to plain object for worker
                const filtersObject: Record<string, { hideStandardFields: boolean; typeFilter: string }> = {};
                entityFilters.forEach((filter, entitySchemaName) => {
                    filtersObject[entitySchemaName] = filter;
                });

                workerRef.current.postMessage({
                    type: 'search',
                    data: searchValue,
                    entityFilters: filtersObject
                });
            } else {
                // Clear search - reset to show all groups
                datamodelDataDispatch({ type: "SET_FILTERED", payload: [] });

                // Relocate section
                if (searchValue && searchValue.length === 0) {
                    restoreSection();
                }
            }
        }
        updateURL({ query: { globalsearch: searchValue.length >= 3 ? searchValue : "" } })
        datamodelDataDispatch({ type: "SET_SEARCH", payload: searchValue.length >= 3 ? searchValue : "" });
        setCurrentSearchIndex(searchValue.length >= 3 ? 1 : 0); // Reset to first result when searching, 0 when cleared
    }, [groups, datamodelDataDispatch, restoreSection, entityFilters]);

    const handleLoadingChange = useCallback((isLoading: boolean) => {
        datamodelDispatch({ type: "SET_LOADING", payload: isLoading });
    }, [datamodelDispatch]);

    // Helper function to sort results by their Y position on the page
    const sortResultsByYPosition = useCallback((results: Array<{ type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType }>) => {
        return results.sort((a, b) => {
            // Get the actual DOM elements for attributes
            const elementA = document.getElementById(`attr-${a.entity.SchemaName}-${a.attribute.SchemaName}`);
            const elementB = document.getElementById(`attr-${b.entity.SchemaName}-${b.attribute.SchemaName}`);

            // If both elements are found, compare their Y positions
            if (elementA && elementB) {
                const rectA = elementA.getBoundingClientRect();
                const rectB = elementB.getBoundingClientRect();
                return rectA.top - rectB.top;
            }

            // Fallback: if elements can't be found, maintain original order
            return 0;
        });
    }, []);

    // Get attribute results (not sorted initially)
    const attributeResults = useMemo(() => {
        return filtered.filter((item): item is { type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType } =>
            item.type === 'attribute'
        );
    }, [filtered]);

    // Cached sorted results - only re-sort when attribute results change
    const [cachedSortedResults, setCachedSortedResults] = useState<Array<{ type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType }>>([]);

    // Update cached sorted results when attribute results change
    useEffect(() => {
        if (attributeResults.length > 0) {
            // Wait a bit for DOM to settle, then sort and cache
            const timeoutId = setTimeout(() => {
                const sorted = sortResultsByYPosition([...attributeResults]);
                setCachedSortedResults(sorted);
            }, 200);

            return () => clearTimeout(timeoutId);
        } else {
            setCachedSortedResults([]);
        }
    }, [attributeResults, sortResultsByYPosition]);

    // Helper function to get sorted attribute results
    const getSortedAttributeResults = useCallback(() => {
        return cachedSortedResults;
    }, [cachedSortedResults]);

    // Navigation handlers
    const handleNavigateNext = useCallback(() => {
        if (currentSearchIndex < totalResults) {
            const nextIndex = currentSearchIndex + 1;
            setCurrentSearchIndex(nextIndex);

            // Get sorted attribute results
            const sortedAttributeResults = getSortedAttributeResults();

            // If we have attribute results, use them
            if (sortedAttributeResults.length > 0) {
                const nextResult = sortedAttributeResults[nextIndex - 1];
                if (nextResult) {
                    datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: nextResult.entity.SchemaName });
                    datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: nextResult.group.Name });

                    // Always scroll to the attribute since we only have attribute results
                    scrollToAttribute(nextResult.entity.SchemaName, nextResult.attribute.SchemaName);
                }
            } else {
                // Fallback to entity results if no attributes found (e.g., searching by entity name)
                const entityResults = filtered.filter((item): item is { type: 'entity'; group: GroupType; entity: EntityType } =>
                    item.type === 'entity'
                );

                const nextResult = entityResults[nextIndex - 1];
                if (nextResult) {
                    datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: nextResult.entity.SchemaName });
                    datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: nextResult.group.Name });
                    scrollToSection(nextResult.entity.SchemaName);
                }
            }
        }
    }, [currentSearchIndex, totalResults, getSortedAttributeResults, filtered, datamodelDispatch, scrollToAttribute, scrollToSection]);

    const handleNavigatePrevious = useCallback(() => {
        if (currentSearchIndex > 1) {
            const prevIndex = currentSearchIndex - 1;
            setCurrentSearchIndex(prevIndex);

            // Get sorted attribute results
            const sortedAttributeResults = getSortedAttributeResults();

            // If we have attribute results, use them
            if (sortedAttributeResults.length > 0) {
                const prevResult = sortedAttributeResults[prevIndex - 1];
                if (prevResult) {
                    datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: prevResult.entity.SchemaName });
                    datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: prevResult.group.Name });
                    // Always scroll to the attribute since we only have attribute results
                    scrollToAttribute(prevResult.entity.SchemaName, prevResult.attribute.SchemaName);
                }
            } else {
                // Fallback to entity results if no attributes found (e.g., searching by entity name)
                const entityResults = filtered.filter((item): item is { type: 'entity'; group: GroupType; entity: EntityType } =>
                    item.type === 'entity'
                );

                const prevResult = entityResults[prevIndex - 1];
                if (prevResult) {
                    datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: prevResult.entity.SchemaName });
                    datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: prevResult.group.Name });
                    scrollToSection(prevResult.entity.SchemaName);
                }
            }
        }
    }, [currentSearchIndex, getSortedAttributeResults, filtered, datamodelDispatch, scrollToAttribute, scrollToSection]);

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
                    // Prioritize attributes, fallback to entities
                    const attributeResults = accumulatedResultsRef.current.filter((item): item is { type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType } =>
                        item.type === 'attribute'
                    );

                    if (attributeResults.length > 0) {
                        setCurrentSearchIndex(1);
                        // Use the first result from the array (will be sorted when user navigates)
                        const firstResult = attributeResults[0];
                        datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: firstResult.entity.SchemaName });
                        datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: firstResult.group.Name });
                        // Small delay to ensure virtual list is ready
                        setTimeout(() => {
                            // Always scroll to attribute since we have attribute results
                            scrollToAttribute(firstResult.entity.SchemaName, firstResult.attribute.SchemaName);
                        }, 100);
                    } else {
                        // Fallback to entity results
                        const entityResults = accumulatedResultsRef.current.filter((item): item is { type: 'entity'; group: GroupType; entity: EntityType } =>
                            item.type === 'entity'
                        );

                        if (entityResults.length > 0) {
                            setCurrentSearchIndex(1);
                            const firstResult = entityResults[0];
                            datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: firstResult.entity.SchemaName });
                            datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: firstResult.group.Name });
                            setTimeout(() => {
                                scrollToSection(firstResult.entity.SchemaName);
                            }, 100);
                        }
                    }
                }
            }
            else {
                // Handle legacy format for backward compatibility
                const messageData = message as SearchResultItem[];
                datamodelDataDispatch({ type: "SET_FILTERED", payload: messageData });
                datamodelDispatch({ type: "SET_LOADING", payload: false });
                // Set to first result if we have any and auto-navigate to it - prioritize attributes
                const attributeResults = messageData.filter((item): item is { type: 'attribute'; group: GroupType; entity: EntityType; attribute: AttributeType } =>
                    item.type === 'attribute'
                );

                if (attributeResults.length > 0) {
                    setCurrentSearchIndex(1);
                    const firstResult = attributeResults[0];
                    datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: firstResult.entity.SchemaName });
                    datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: firstResult.group.Name });
                    // Small delay to ensure virtual list is ready
                    setTimeout(() => {
                        // Always scroll to attribute since we have attribute results
                        scrollToAttribute(firstResult.entity.SchemaName, firstResult.attribute.SchemaName);
                    }, 100);
                } else {
                    // Fallback to entity results
                    const entityResults = messageData.filter((item): item is { type: 'entity'; group: GroupType; entity: EntityType } =>
                        item.type === 'entity'
                    );

                    if (entityResults.length > 0) {
                        setCurrentSearchIndex(1);
                        const firstResult = entityResults[0];
                        datamodelDispatch({ type: "SET_CURRENT_SECTION", payload: firstResult.entity.SchemaName });
                        datamodelDispatch({ type: "SET_CURRENT_GROUP", payload: firstResult.group.Name });
                        setTimeout(() => {
                            scrollToSection(firstResult.entity.SchemaName);
                        }, 100);
                    }
                }
            }
        };

        worker.addEventListener("message", handleMessage);
        return () => worker.removeEventListener("message", handleMessage);
    }, [datamodelDispatch, datamodelDataDispatch, groups, scrollToSection, scrollToAttribute]);

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
                <List setCurrentIndex={setCurrentSearchIndex} />
            </div>
        </div>
    );
}