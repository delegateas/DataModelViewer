import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import React from "react";
import { elementScroll, useVirtualizer, VirtualizerOptions } from '@tanstack/react-virtual';
import { Section } from "./Section";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { AttributeType, EntityType, GroupType } from "@/lib/Types";
import { updateURL } from "@/lib/url-utils";
import { copyToClipboard, generateGroupLink } from "@/lib/clipboard-utils";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { debounce, Tooltip } from '@mui/material';

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
    const scrollingRef = React.useRef<number>()
    // used to relocate section after search/filter
    const [sectionVirtualItem, setSectionVirtualItem] = useState<string | null>(null);
    
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

    function easeInOutQuint(t: number) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
    }

    const scrollToFn: VirtualizerOptions<any, any>['scrollToFn'] =
        React.useCallback((offset, canSmooth, instance) => {
        const duration = 2000
        const start = parentRef.current?.scrollTop || 0
        const startTime = (scrollingRef.current = Date.now())

        const run = () => {
            if (scrollingRef.current !== startTime) return
            const now = Date.now()
            const elapsed = now - startTime
            const progress = easeInOutQuint(Math.min(elapsed / duration, 1))
            const interpolated = start + (offset - start) * progress

            if (elapsed < duration) {
                elementScroll(interpolated, canSmooth, instance)
                requestAnimationFrame(run)
            } else {
                elementScroll(interpolated, canSmooth, instance)
            }
        }

        requestAnimationFrame(run)
    }, [])

    const debouncedOnChange = debounce((instance, sync) => {
        if (!sync) {
            dispatch({ type: 'SET_LOADING_SECTION', payload: null });
        }
        
        const virtualItems = instance.getVirtualItems();
        if (virtualItems.length === 0) return;

        const scrollOffset = instance.scrollOffset;
        const scrollRect = instance.scrollRect;
        if (!scrollOffset || !scrollRect) return;

        const viewportTop = scrollOffset;
        const viewportBottom = scrollOffset + scrollRect.height;

        let mostVisibleEntity: {
            entity: EntityType;
            group: GroupType;
            visibleArea: number;
        } | null = null;

        for (const vi of virtualItems) {
            const item = flatItems[vi.index];
            if (!item || item.type !== 'entity') continue;
            
            const itemTop = vi.start;
            const itemBottom = vi.end;
            
            // Calculate intersection
            const intersectionTop = Math.max(itemTop, viewportTop);
            const intersectionBottom = Math.min(itemBottom, viewportBottom);
            
            // Skip if no intersection
            if (intersectionTop >= intersectionBottom) continue;
            
            const visibleArea = intersectionBottom - intersectionTop;
            
            // Update most visible entity without array operations
            if (!mostVisibleEntity || visibleArea > mostVisibleEntity.visibleArea) {
                mostVisibleEntity = {
                    entity: item.entity,
                    group: item.group,
                    visibleArea
                };
            }
        }

        if (mostVisibleEntity && currentSection !== mostVisibleEntity.entity.SchemaName) {
            setSectionVirtualItem(mostVisibleEntity.entity.SchemaName);
            updateURL({ query: { group: mostVisibleEntity.group.Name, section: mostVisibleEntity.entity.SchemaName } });
            dispatch({ type: "SET_CURRENT_GROUP", payload: mostVisibleEntity.group.Name });
            dispatch({ type: "SET_CURRENT_SECTION", payload: mostVisibleEntity.entity.SchemaName });
        }
    }, 100);

    const rowVirtualizer = useVirtualizer({
        count: flatItems.length,
        getScrollElement: () => parentRef.current,
        overscan: 5,
        estimateSize: (index) => {
            const item = flatItems[index];
            if (!item) return 200;
            return item.type === 'group' ? 100 : 500; 
        },
        scrollToFn,
        onChange: debouncedOnChange,
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

    const restoreSection = useCallback(() => {
        if (sectionVirtualItem) {
            scrollToSection(sectionVirtualItem);
        }
    }, [sectionVirtualItem]);

    useEffect(() => {
        dispatch({ type: 'SET_SCROLL_TO_SECTION', payload: scrollToSection });
        dispatch({ type: 'SET_SCROLL_TO_GROUP', payload: scrollToGroup });
        dispatch({ type: 'SET_RESTORE_SECTION', payload: restoreSection });
        
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
