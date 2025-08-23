import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import React from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Section } from "./Section";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { AttributeType, EntityType, GroupType } from "@/lib/Types";

interface IListProps {
}

// Helper to highlight search matches
export function highlightMatch(text: string, search: string) {
    if (!search || search.length < 3) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark className="bg-yellow-200 text-black px-0.5 rounded">{text.slice(idx, idx + search.length)}</mark>{text.slice(idx + search.length)}</>;
}

export const List = ({ }: IListProps) => {
    const dispatch = useDatamodelViewDispatch();
    const datamodelView = useDatamodelView();
    const [isScrollingToSection, setIsScrollingToSection] = useState(false);
    const { groups, filtered, search } = useDatamodelData();
    const parentRef = useRef<HTMLDivElement | null>(null);
    const lastScrollHandleTime = useRef<number>(0);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
    // Track position before search for restoration
    const positionBeforeSearch = useRef<{ section: string | null; scrollTop: number } | null>(null);
    const isTabSwitching = useRef(false);
    const isIntentionalScroll = useRef(false);
    
    const getSectionRefCallback = (schemaName: string) => (el: HTMLDivElement | null) => {
        sectionRefs.current[schemaName] = el;
    };
    
    const remeasureSection = (schemaName: string) => {
        const el = sectionRefs.current[schemaName];
        if (el) rowVirtualizer.measureElement(el);
    };

    // Only recalculate items when filtered or search changes
    const flatItems = useMemo(() => {
        if (filtered && filtered.length > 0) return filtered;
        const lowerSearch = search.trim().toLowerCase();
        const items: Array<
            | { type: 'group'; group: GroupType }
            | { type: 'entity'; group: GroupType; entity: EntityType }
        > = [];
        for (const group of groups) {
            // Filter entities in this group
            const filteredEntities = group.Entities.filter((entity: EntityType) => {
                const typedEntity = entity;
                if (!lowerSearch) return true;
                // Match entity schema or display name
                const entityMatch = typedEntity.SchemaName.toLowerCase().includes(lowerSearch) ||
                    (typedEntity.DisplayName && typedEntity.DisplayName.toLowerCase().includes(lowerSearch));
                // Match any attribute schema or display name
                const attrMatch = typedEntity.Attributes.some((attr: AttributeType) =>
                    attr.SchemaName.toLowerCase().includes(lowerSearch) ||
                    (attr.DisplayName && attr.DisplayName.toLowerCase().includes(lowerSearch))
                );
                return entityMatch || attrMatch;
            });
            if (filteredEntities.length > 0) {
                items.push({ type: 'group', group });
                for (const entity of filteredEntities) {
                    items.push({ type: 'entity', group, entity });
                }
            }
        }
        return items;
    }, [filtered, search, groups]);

    const rowVirtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        overscan: 5, // Reduce overscan to improve performance
        estimateSize: (index) => {
            const item = flatItems[index];
            if (!item) return 100;
            return item.type === 'group' ? 92 : 300;
        },
        // Override scroll behavior to prevent jumping during tab switches
        scrollToFn: (offset, options) => { 
            // When switching tabs during search, don't change scroll position
            if (isTabSwitching.current && !isIntentionalScroll.current) {
                return;
            }
            
            // Reset the intentional scroll flag after use
            if (isIntentionalScroll.current) {
                isIntentionalScroll.current = false;
            }
            
            // Default scroll behavior for other cases
            const scrollElement = parentRef.current;
            if (scrollElement) {
                scrollElement.scrollTop = offset;
            }
        },
    });

    const scrollToSection = useCallback((sectionId: string) => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        const sectionIndex = flatItems.findIndex(item => 
            item.type === 'entity' && item.entity.SchemaName === sectionId
        );
        
        if (sectionIndex === -1) {
            console.warn(`Section ${sectionId} not found in virtualized list`);
            return;
        }

        const currentIndex = rowVirtualizer.getVirtualItems()[0]?.index || 0;
        const isLargeJump = Math.abs(sectionIndex - currentIndex) > 10;

        if (isLargeJump) {
            setIsScrollingToSection(true);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            if (!rowVirtualizer || sectionIndex >= flatItems.length) {
                console.warn(`Invalid index ${sectionIndex} for section ${sectionId}`);
                setIsScrollingToSection(false);
                return;
            }

            try {
                isIntentionalScroll.current = true; // Mark this as intentional scroll
                rowVirtualizer.scrollToIndex(sectionIndex, { 
                    align: 'start'
                });

                setTimeout(() => {
                    setIsScrollingToSection(false);
                }, 500);
            } catch (error) {
                console.warn(`Failed to scroll to section ${sectionId}:`, error);
                
                const estimatedOffset = sectionIndex * 300;
                if (parentRef.current) {
                    parentRef.current.scrollTop = estimatedOffset;
                }
                setIsScrollingToSection(false);
            }
        }, 20);
    }, [flatItems, rowVirtualizer]);

    useEffect(() => {
        // Only measure if we're not filtering - let the virtualizer handle filtered states naturally
        if (!search || search.length < 3) {
            requestAnimationFrame(() => {
                rowVirtualizer.measure();
            });
        }
    }, [flatItems, search, rowVirtualizer]);

    // Handle scrolling to top when starting a search
    const prevSearchLengthRef = useRef(search.length);
    useEffect(() => {
        const currentSearchLength = search.length;
        const prevSearchLength = prevSearchLengthRef.current;
        
        // Store position before starting search (crossing from < 3 to >= 3 characters)
        if (prevSearchLength < 3 && currentSearchLength >= 3) {
            positionBeforeSearch.current = {
                section: datamodelView.currentSection,
                scrollTop: parentRef.current?.scrollTop || 0
            };
            
            setTimeout(() => {
                if (parentRef.current) {
                    parentRef.current.scrollTop = 0;
                }
            }, 50); // Small delay to ensure virtualizer has processed the new items
        }
        // Restore position when stopping search (crossing from >= 3 to < 3 characters)
        else if (prevSearchLength >= 3 && currentSearchLength < 3) {
            if (positionBeforeSearch.current) {
                const { section, scrollTop } = positionBeforeSearch.current;
                
                // Restore to the section where the user was before searching
                if (section) {
                    setTimeout(() => {
                        const sectionIndex = flatItems.findIndex(item => 
                            item.type === 'entity' && item.entity.SchemaName === section
                        );
                        
                        if (sectionIndex !== -1) {
                            // Scroll to the section they were at before search
                            isIntentionalScroll.current = true; // Mark this as intentional scroll
                            rowVirtualizer.scrollToIndex(sectionIndex, { align: 'start' });
                        } else {
                            // Fallback to original scroll position
                            if (parentRef.current) {
                                parentRef.current.scrollTop = scrollTop;
                            }
                        }
                    }, 100); // Delay to ensure flatItems is updated
                }
                
                positionBeforeSearch.current = null;
            }
        }
        
        prevSearchLengthRef.current = currentSearchLength;
    }, [search, datamodelView.currentSection, flatItems, rowVirtualizer]);

    // Throttled scroll handler to reduce calculations
    const handleScroll = useCallback(() => {
        const now = Date.now();
        if (now - lastScrollHandleTime.current < 100) return; // Only process every 100ms
        lastScrollHandleTime.current = now;
        
        const scrollElement = parentRef.current;
        if (!scrollElement || isScrollingToSection) return;
        
        const scrollOffset = scrollElement.scrollTop;
        const virtualItems = rowVirtualizer.getVirtualItems();
        
        // Find the first visible item
        const padding = 16;
        const firstVisibleItem = virtualItems.find(v => {
            return v.start <= scrollOffset && (v.end - padding) >= scrollOffset;
        });
        
        if (firstVisibleItem) {
            const item = flatItems[firstVisibleItem.index];
            if (item?.type === 'entity') {
                if (item.entity.SchemaName !== datamodelView.currentSection) {
                    dispatch({ type: "SET_CURRENT_GROUP", payload: item.group.Name });
                    dispatch({ type: "SET_CURRENT_SECTION", payload: item.entity.SchemaName });
                }
            }
        }
    }, [dispatch, flatItems, rowVirtualizer, datamodelView.currentSection, isScrollingToSection]);

    // Throttled scroll event listener
    useEffect(() => {
        const scrollElement = parentRef.current;
        if (!scrollElement) return;
        
        let scrollTimeout: number;
        const throttledScrollHandler = () => {
            if (scrollTimeout) return;
            scrollTimeout = window.setTimeout(() => {
                handleScroll();
                scrollTimeout = 0;
            }, 100);
        };
        
        scrollElement.addEventListener("scroll", throttledScrollHandler, { passive: true });
        return () => {
            scrollElement.removeEventListener("scroll", throttledScrollHandler);
            clearTimeout(scrollTimeout);
        };
    }, [handleScroll]);

    useEffect(() => {
        dispatch({ type: 'SET_SCROLL_TO_SECTION', payload: scrollToSection });
        
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [dispatch, scrollToSection]);

    useEffect(() => {
        // When the current section is in view, set loading to false
        if (datamodelView.currentSection) {
            // Check if the current section is rendered in the virtualizer
            const isInView = rowVirtualizer.getVirtualItems().some(vi => {
                const item = flatItems[vi.index];
                return item.type === 'entity' && item.entity.SchemaName === datamodelView.currentSection;
            });
            if (isInView) {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }
    }, [datamodelView.currentSection, flatItems, rowVirtualizer, dispatch]);

    return (
        <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }} className="p-6 relative">

            {/* Show skeleton loading state only when initially loading */}
            {flatItems.length === 0 && datamodelView.loading && (!search || search.length < 3) && (
                <div className="space-y-8">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-300 shadow-md animate-pulse">
                            <div className="h-32 p-6 flex flex-col">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="p-4 border-t">
                                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Show no results message when searching but no items found */}
            {flatItems.length === 0 && search && search.length >= 3 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="text-lg font-medium mb-2">No tables found</div>
                    <div className="text-sm text-center">
                        No attributes match your search for &quot;{search}&quot;
                    </div>
                </div>
            )}
            
            {/* Virtualized list */}
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                    visibility: flatItems.length === 0 ? 'hidden' : 'visible'
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const item = flatItems[virtualItem.index];
                const sectionRef = item.type === 'entity' ? getSectionRefCallback(item.entity.SchemaName) : undefined;

                return (
                    <div
                        key={virtualItem.key}
                        data-index={virtualItem.index}
                        ref={item.type === 'entity'
                            ? el => {
                                if (sectionRef) sectionRef(el);
                                if (el) rowVirtualizer.measureElement(el);
                              }
                            : rowVirtualizer.measureElement
                        }
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualItem.start}px)`,
                        }}
                    >
                        {item.type === 'group' ? (
                            <div className="flex items-center py-6 my-4">
                                <div className="flex-1 h-0.5 bg-gray-200" />
                                <div className="px-4 text-md font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                                    {item.group.Name}
                                </div>
                                <div className="flex-1 h-0.5 bg-gray-200" />
                            </div>
                        ) : (
                            <div className="text-sm">
                                <Section
                                    entity={item.entity}
                                    group={item.group}
                                    onContentChange={() => remeasureSection(item.entity.SchemaName)}
                                    onTabChange={(isChanging: boolean) => {
                                        isTabSwitching.current = isChanging;
                                        if (isChanging) {
                                            // Reset after a short delay to allow for the content change
                                            setTimeout(() => {
                                                isTabSwitching.current = false;
                                            }, 100);
                                        }
                                    }}
                                    search={search}
                                />
                            </div>
                        )}
                    </div>
                );
                })}
            </div>
        </div>
    );
};
