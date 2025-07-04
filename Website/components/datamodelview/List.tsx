import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { Groups } from "../../generated/Data";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import React from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Section } from "./Section";
import { Loader2 } from "lucide-react";

interface IListProps {}

export const List = ({}: IListProps) => {
    const dispatch = useDatamodelViewDispatch();
    const [isScrollingToSection, setIsScrollingToSection] = useState(false);

    const parentRef = useRef<HTMLDivElement | null>(null);
    const lastSectionRef = useRef<string | null>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();

    const flatItems = useMemo(() => {
        const items: Array<
            | { type: 'group'; group: (typeof Groups)[number] }
            | { type: 'entity'; group: (typeof Groups)[number]; entity: (typeof Groups)[number]['Entities'][number] }
        > = [];
        for (const group of Groups) {
        items.push({ type: 'group', group });
        for (const entity of group.Entities) {
            items.push({ type: 'entity', group, entity });
        }
        }
        return items;
    }, []);

    const rowVirtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        overscan: 20,
        estimateSize: () => 300,
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
                    const containerHeight = scrollElement.clientHeight;
                    const target = containerHeight / 3;

                    let best: { id: string; group: string; distance: number } | null = null;

                    for (const v of virtualItems) {
                        const item = flatItems[v.index];
                        if (item.type !== "entity") continue;

                        const itemTop = v.start;
                        const distance = Math.abs(itemTop - scrollOffset - target);

                        if (!best || distance < best.distance) {
                            best = {
                                id: item.entity.SchemaName,
                                group: item.group.Name,
                                distance,
                            };
                        }
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

    return (
        <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }} className="p-6 relative">
            {isScrollingToSection && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">Loading section...</span>
                    </div>
                </div>
            )}
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const item = flatItems[virtualItem.index];

                return (
                    <div
                        key={virtualItem.key}
                        data-index={virtualItem.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualItem.start}px)`,
                        }}
                    >
                        {item.type === 'group' ? (
                            <div
                                style={{
                                    padding: '8px 16px',
                                    fontWeight: 'bold',
                                    background: '#f7f7f7',
                                    borderBottom: '1px solid #ddd',
                                }}
                            >
                                {item.group.Name}
                            </div>
                        ) : (
                            <Section entity={item.entity} group={item.group} />
                        )}
                    </div>
                );
                })}
            </div>
        </div>
    );
};
