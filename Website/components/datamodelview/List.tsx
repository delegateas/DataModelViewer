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
import { Box, CircularProgress, debounce, Tooltip } from '@mui/material';

interface IListProps {
    setCurrentIndex: (index: number) => void;
}

// Helper to highlight search matches
export function highlightMatch(text: string, search: string) {
    if (!search || search.length < 3) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark className="bg-yellow-200 text-black px-0.5 rounded">{text.slice(idx, idx + search.length)}</mark>{text.slice(idx + search.length)}</>;
}

export const List = ({ setCurrentIndex }: IListProps) => {
    const dispatch = useDatamodelViewDispatch();
    const { currentSection, loadingSection } = useDatamodelView();
    const { groups, filtered, search } = useDatamodelData();
    const { showSnackbar } = useSnackbar();
    const parentRef = useRef<HTMLDivElement | null>(null);
    // used to relocate section after search/filter
    const [sectionVirtualItem, setSectionVirtualItem] = useState<string | null>(null);
        
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
            index: number;
            visibleArea: number;
        } | null = null;

        let actualIndex = 0;
        for (const vi of virtualItems) {
            const item = flatItems[vi.index];
            if (!item || item.type !== 'entity') continue;
            actualIndex++;
            
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
                    index: actualIndex,
                    visibleArea
                };
            }
        }

        if (mostVisibleEntity && !search) {
            setSectionVirtualItem(mostVisibleEntity.entity.SchemaName);
        }

        if (mostVisibleEntity && currentSection !== mostVisibleEntity.entity.SchemaName) {
            updateURL({ query: { group: mostVisibleEntity.group.Name, section: mostVisibleEntity.entity.SchemaName } });
            dispatch({ type: "SET_CURRENT_GROUP", payload: mostVisibleEntity.group.Name });
            dispatch({ type: "SET_CURRENT_SECTION", payload: mostVisibleEntity.entity.SchemaName });
            setCurrentIndex(mostVisibleEntity.index);
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
        onChange: debouncedOnChange,
    });
    
    const scrollToSection = useCallback((sectionId: string) => {
        const sectionIndex = flatItems.findIndex(item => 
            item.type === 'entity' && item.entity.SchemaName === sectionId
        );
        
        if (sectionIndex === -1) {
            console.warn(`Section ${sectionId} not found in virtualized list`);
            return;
        }

        smartScrollToIndex(sectionIndex);

    }, [flatItems]);

    const scrollToGroup = useCallback((groupName: string) => {
        const groupIndex = flatItems.findIndex(item => 
            item.type === 'group' && item.group.Name === groupName
        );
        
        if (groupIndex === -1) {
            console.warn(`Group ${groupName} not found in virtualized list`);
            return;
        }

        smartScrollToIndex(groupIndex);
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

    const smartScrollToIndex = useCallback((index: number) => {
        rowVirtualizer.scrollToIndex(index, { align: 'start' });

        const tryFix = () => {
            const mounted = rowVirtualizer.getVirtualItems().some(v => v.index === index);
            if (!mounted) {
                requestAnimationFrame(tryFix);
                return;
            }

            requestAnimationFrame(() => {
                rowVirtualizer.scrollToIndex(index, { align: 'start' });
            });
        };
        requestAnimationFrame(tryFix);
        }, [rowVirtualizer]);

    return (
        <>
            <Box className={`absolute w-full h-full flex items-center justify-center z-[100] transition-opacity duration-300 ${loadingSection ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <CircularProgress />
            </Box>
            <div ref={parentRef} style={{ height: 'calc(100vh - var(--layout-header-desktop-height))', overflow: 'auto' }} className="relative no-scrollbar">

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
                    className={`m-6 transition-opacity duration-300 ${loadingSection ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
                                            onTabChange={() => {
                                                
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
        </>
    );
};
