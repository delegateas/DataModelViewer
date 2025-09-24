import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import React from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Section } from "./Section";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { AttributeType, EntityType, GroupType } from "@/lib/Types";
import { updateURL } from "@/lib/url-utils";
import { copyToClipboard, generateGroupLink } from "@/lib/clipboard-utils";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { Tooltip } from '@mui/material';

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
    const { currentSection, loading } = useDatamodelView();
    const { groups, filtered, search } = useDatamodelData();
    const { showSnackbar } = useSnackbar();
    const parentRef = useRef<HTMLDivElement | null>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();
    
    // Track position before search for restoration
    const isTabSwitching = useRef(false);
    
    const handleCopyGroupLink = useCallback(async (groupName: string) => {
        const link = generateGroupLink(groupName);
        const success = await copyToClipboard(link);
        if (success) {
            showSnackbar('Group link copied to clipboard!', 'success');
        } else {
            showSnackbar('Failed to copy group link', 'error');
        }
    }, [showSnackbar]);

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
        overscan: 5,
        estimateSize: (index) => {
            const item = flatItems[index];
            if (!item) return 200;
            return item.type === 'group' ? 100 : 500; 
        },
        onChange: (instance, sync) => {

            console.log("change", { instance, sync });

            // Only update during actual scrolling (sync = true)
            if (!sync) return;
            
            const virtualItems = instance.getVirtualItems();
            if (virtualItems.length === 0) return;

            const scrollOffset = instance.scrollOffset;
            const scrollRect = instance.scrollRect;
            if (!scrollOffset || !scrollRect) return;

            // Find the first entity item that's currently visible
            const firstVisibleEntity = virtualItems.find(vi => {
                const item = flatItems[vi.index];
                if (!item || item.type !== 'entity') return false;
                
                // Check if this virtual item is actually visible in the viewport
                // vi.start is the top position of the item, vi.end would be vi.start + vi.size
                const itemTop = vi.start;
                const itemBottom = vi.end;

                // An item is visible if its bottom is below the scroll position
                // and its top is above the scroll position + viewport height
                return itemBottom > scrollOffset && itemTop < scrollOffset + scrollRect.height;
            });
            
            if (firstVisibleEntity) {
                const item = flatItems[firstVisibleEntity.index];
                if (item && item.type === 'entity') {
                    // Only update if the section has actually changed
                    if (currentSection !== item.entity.SchemaName) {
                        updateURL({ query: { group: item.group.Name, section: item.entity.SchemaName } });
                        dispatch({ type: "SET_CURRENT_GROUP", payload: item.group.Name });
                        dispatch({ type: "SET_CURRENT_SECTION", payload: item.entity.SchemaName });
                    }
                }
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

        rowVirtualizer.scrollToIndex(sectionIndex, { 
            align: 'start'
        });

    }, [flatItems]);

    const scrollToGroup = useCallback((groupName: string) => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        const groupIndex = flatItems.findIndex(item => 
            item.type === 'group' && item.group.Name === groupName
        );
        
        if (groupIndex === -1) {
            console.warn(`Group ${groupName} not found in virtualized list`);
            return;
        }

        rowVirtualizer.scrollToIndex(groupIndex, { 
            align: 'start'
        });
    }, [flatItems]);

    useEffect(() => {
        dispatch({ type: 'SET_SCROLL_TO_SECTION', payload: scrollToSection });
        dispatch({ type: 'SET_SCROLL_TO_GROUP', payload: scrollToGroup });
        
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [dispatch, scrollToSection, scrollToGroup]);

    // Callback to handle section content changes (for tab switches, expansions, etc.)
    const handleSectionResize = useCallback((index: number) => {
        if (index !== -1) {
            const containerElement = document.querySelector(`[data-index="${index}"]`) as HTMLElement;
            if (containerElement) {
                rowVirtualizer.measureElement(containerElement);
            }
        }
    }, [rowVirtualizer]);

    return (
        <div ref={parentRef} style={{ height: 'calc(100vh - var(--layout-header-desktop-height))', overflow: 'auto' }} className="p-6 relative no-scrollbar">

            {/* Show skeleton loading state only when initially loading */}
            {flatItems.length === 0 && loading && (!search || search.length < 3) && (
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

                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                            ref={(el) => {
                                if (el) {
                                    // trigger remeasurement when content changes and load
                                    requestAnimationFrame(() => {
                                        handleSectionResize(virtualItem.index);
                                    });
                                }
                            }}
                        >
                            {item.type === 'group' ? (
                                <div className="flex items-center py-6 my-4">
                                    <div className="flex-1 h-0.5 bg-gray-200" />
                                    <Tooltip title="Copy link to this group">
                                        <div 
                                            className="px-4 text-md font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-blue-600 transition-colors"
                                            onClick={() => handleCopyGroupLink(item.group.Name)}
                                        >
                                            {item.group.Name}
                                        </div>
                                    </Tooltip>
                                    <div className="flex-1 h-0.5 bg-gray-200" />
                                </div>
                            ) : (
                                <div className="text-sm">
                                    <Section
                                        entity={item.entity}
                                        group={item.group}
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
