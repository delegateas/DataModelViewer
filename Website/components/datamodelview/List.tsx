import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import React from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Section } from "./Section";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { throttle } from "@/lib/utils";

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
    const lastSectionRef = useRef<string | null>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
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
            | { type: 'group'; group: any }
            | { type: 'entity'; group: any; entity: any }
        > = [];
        for (const group of groups) {
            // Filter entities in this group
            const filteredEntities = group.Entities.filter((entity: any) => {
                if (!lowerSearch) return true;
                // Match entity schema or display name
                const entityMatch = entity.SchemaName.toLowerCase().includes(lowerSearch) ||
                    (entity.DisplayName && entity.DisplayName.toLowerCase().includes(lowerSearch));
                // Match any attribute schema or display name
                const attrMatch = entity.Attributes.some((attr: any) =>
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
        requestAnimationFrame(() => {
            rowVirtualizer.measure();
        });
    }, [flatItems]);

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
        const firstVisibleItem = virtualItems.find(v => {
            return v.start <= scrollOffset && v.end >= scrollOffset;
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
                console.log("List: setting loading false");
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }
    }, [datamodelView.currentSection, flatItems, rowVirtualizer, dispatch]);

    return (
        <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }} className="p-6 relative">
            {/* Add skeleton loading state */}
            {flatItems.length === 0 && datamodelView.loading && (
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
            
            {/* Virtualized list */}
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                    visibility: flatItems.length === 0 && datamodelView.loading ? 'hidden' : 'visible'
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
                                sectionRef && sectionRef(el);
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
