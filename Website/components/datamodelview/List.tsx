import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import React from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Section } from "./Section";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";

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
    const lastSectionRef = useRef<string | null>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    // Map of SchemaName to element
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const getSectionRefCallback = (schemaName: string) => (el: HTMLDivElement | null) => {
        sectionRefs.current[schemaName] = el;
    };
    const remeasureSection = (schemaName: string) => {
        const el = sectionRefs.current[schemaName];
        if (el) rowVirtualizer.measureElement(el);
    };

    // Compute filtered items based on search
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
        overscan: 20,
        estimateSize: (index) => {
            const item = flatItems[index];
            if (item.type === 'group') return 92;
            return 300;
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

    useEffect(() => {
        const scrollElement = parentRef.current;
        if (!scrollElement) return;
    
        let ticking = false;
        let lastScrollTop = 0;
    
        const handleScroll = () => {
            if (!ticking) {
                ticking = true;
        
                window.requestAnimationFrame(() => {
                    const currentScrollTop = scrollElement.scrollTop;
                    if (Math.abs(currentScrollTop - lastScrollTop) < 10) {
                        ticking = false;
                        return;
                    }
                    lastScrollTop = currentScrollTop;

                    const virtualItems = rowVirtualizer.getVirtualItems();
                    const scrollOffset = scrollElement.scrollTop;

                    let best: { id: string; group: string; distance: number } | null = null;

                    for (const v of virtualItems) {
                        const item = flatItems[v.index];
                        if (item.type !== "entity") continue;

                        const itemTop = v.start;
                        const distance = Math.abs(itemTop - scrollOffset);

                        if (!best || distance < best.distance) {
                            best = {
                                id: item.entity.SchemaName,
                                group: item.group.Name,
                                distance,
                            };
                        }

                        if (distance > best.distance) break;
                    }

                    if (best && best.id !== lastSectionRef.current) {
                        lastSectionRef.current = best.id;
                        dispatch({ type: "SET_CURRENT_GROUP", payload: best.group });
                        dispatch({ type: "SET_CURRENT_SECTION", payload: best.id });
                    }
            
                    ticking = false;
                });
            }
        };
    
        scrollElement.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
    
        return () => {
          scrollElement.removeEventListener("scroll", handleScroll);
        };
      }, [dispatch, flatItems, rowVirtualizer]);

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
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
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
