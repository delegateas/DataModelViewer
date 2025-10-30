import { EntityType, GroupType } from "@/lib/Types";
import { useSidebar } from '@/contexts/SidebarContext';
import { Box, InputAdornment, Paper } from '@mui/material';
import { SearchRounded } from '@mui/icons-material';
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { TextField } from "@mui/material";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { EntityGroupAccordion } from "@/components/shared/elements/EntityGroupAccordion";

interface ISidebarDatamodelViewProps { 

}

export const SidebarDatamodelView = ({ }: ISidebarDatamodelViewProps) => {
    const { currentSection, currentGroup, scrollToSection, scrollToGroup, loadingSection } = useDatamodelView();
    const { close: closeSidebar } = useSidebar();
    const isMobile = useIsMobile();

    const dataModelDispatch = useDatamodelViewDispatch();

    const { groups, filtered, search } = useDatamodelData();

    const [searchTerm, setSearchTerm] = useState("");
    const [displaySearchTerm, setDisplaySearchTerm] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [manuallyCollapsed, setManuallyCollapsed] = useState<Set<string>>(new Set());
    const prevGroupRef = useRef<string | null>(null);

    // Auto-expand the current group when it changes or when section changes (e.g., from scrolling)
    useEffect(() => {
        if (currentGroup) {
            const groupChanged = prevGroupRef.current !== currentGroup;
            const oldGroup = prevGroupRef.current;

            // If the group changed, close the old group and open the new one
            if (groupChanged) {
                setManuallyCollapsed(prev => {
                    const newCollapsed = new Set(prev);
                    newCollapsed.delete(currentGroup);
                    return newCollapsed;
                });
                setExpandedGroups(prev => {
                    const newExpanded = new Set(prev);
                    // Close the old group
                    if (oldGroup) {
                        newExpanded.delete(oldGroup);
                    }
                    // Open the new group
                    newExpanded.add(currentGroup);
                    return newExpanded;
                });
                prevGroupRef.current = currentGroup;
            }
            // If the group didn't change but section did, only expand if not manually collapsed
            else if (!manuallyCollapsed.has(currentGroup)) {
                setExpandedGroups(prev => {
                    const newExpanded = new Set(prev);
                    newExpanded.add(currentGroup);
                    return newExpanded;
                });
            }
        }
    }, [currentGroup, currentSection, manuallyCollapsed]);

    // Memoize search results to prevent recalculation on every render
    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim() && !search) return groups;
        
        return groups.map(group => ({
            ...group,
            Entities: group.Entities.filter(entity => 
                (entity.SchemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entity.DisplayName.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!search || filtered.some(f => f.type === 'entity' && f.entity.SchemaName === entity.SchemaName))
            )
        })).filter(group => group.Entities.length > 0);
    }, [groups, searchTerm, filtered]);
    
    // Debounced search to reduce performance impact
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(displaySearchTerm);
        }, 150);
        return () => clearTimeout(timeoutId);
    }, [displaySearchTerm]);
    
    // Search functionality
    const handleSearch = useCallback((term: string) => {
        setDisplaySearchTerm(term);
        if (term.trim()) {
            const newExpandedGroups = new Set<string>();
            groups.forEach(group => {
                const hasMatchingEntity = group.Entities.some(entity => 
                    entity.SchemaName.toLowerCase().includes(term.toLowerCase()) ||
                    entity.DisplayName.toLowerCase().includes(term.toLowerCase())
                );
                if (hasMatchingEntity) {
                    newExpandedGroups.add(group.Name);
                }
            });
            setExpandedGroups(newExpandedGroups);
        }
    }, [groups]);

    const clearSearch = useCallback(() => {
        setSearchTerm("");
        setDisplaySearchTerm("");
    }, []);

    const highlightText = useCallback((text: string, searchTerm: string) => {
        if (!searchTerm.trim()) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) => 
            regex.test(part) ? 
                <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</mark> : 
                part
        );
    }, []);

    const handleGroupClick = useCallback((groupName: string) => {
        setExpandedGroups(prev => {
            const newExpanded = new Set(prev);
            const isCurrentlyExpanded = newExpanded.has(groupName);

            if (isCurrentlyExpanded) {
                // User is manually collapsing this group
                newExpanded.delete(groupName);
                setManuallyCollapsed(prevCollapsed => {
                    const newCollapsed = new Set(prevCollapsed);
                    newCollapsed.add(groupName);
                    return newCollapsed;
                });
            } else {
                // User is manually expanding this group
                newExpanded.add(groupName);
                setManuallyCollapsed(prevCollapsed => {
                    const newCollapsed = new Set(prevCollapsed);
                    newCollapsed.delete(groupName);
                    return newCollapsed;
                });
            }
            return newExpanded;
        });
    }, []);

    const clearCurrentGroup = useCallback(() => {
        dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: null });
        dataModelDispatch({ type: "SET_CURRENT_SECTION", payload: null });
    }, [dataModelDispatch]);

    const handleScrollToGroup = useCallback((group: GroupType) => {
        // If clicking on the current group, clear the selection
        if (currentGroup?.toLowerCase() === group.Name.toLowerCase()) {
            clearCurrentGroup();
            return;
        }

        // Set current group and scroll to group header
        dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: group.Name });
        if (group.Entities.length > 0)
            dataModelDispatch({ type: "SET_CURRENT_SECTION", payload: group.Entities[0].SchemaName });

        // Clear manually collapsed state and ensure the group is expanded when selected
        setManuallyCollapsed(prev => {
            const newCollapsed = new Set(prev);
            newCollapsed.delete(group.Name);
            return newCollapsed;
        });
        setExpandedGroups(prev => {
            const newExpanded = new Set(prev);
            newExpanded.add(group.Name);
            return newExpanded;
        });

        if (scrollToGroup) {
            scrollToGroup(group.Name);
        }

        // On phone - close sidebar
        if (!!isMobile) {
            closeSidebar();
        }
    }, [currentGroup, clearCurrentGroup, dataModelDispatch, scrollToGroup, isMobile, closeSidebar]);

    const handleEntityClick = useCallback((entity: EntityType, groupName: string) => {
        // Use requestAnimationFrame to defer heavy operations
        requestAnimationFrame(() => {
            dataModelDispatch({ type: 'SET_LOADING', payload: true });
            dataModelDispatch({ type: 'SET_LOADING_SECTION', payload: entity.SchemaName });
            dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: groupName });
            dataModelDispatch({ type: 'SET_CURRENT_SECTION', payload: entity.SchemaName });

            // Clear manually collapsed state and ensure the group is expanded when an entity is clicked
            setManuallyCollapsed(prev => {
                const newCollapsed = new Set(prev);
                newCollapsed.delete(groupName);
                return newCollapsed;
            });
            setExpandedGroups(prev => {
                const newExpanded = new Set(prev);
                newExpanded.add(groupName);
                return newExpanded;
            });

            // On phone - close
            if (!!isMobile) {
                closeSidebar();
            }

            // Defer scroll operation to next frame to prevent blocking
            requestAnimationFrame(() => {
                if (scrollToSection) {
                    scrollToSection(entity.SchemaName);
                }
                clearSearch();
            });
        });
    }, [dataModelDispatch, scrollToSection, clearSearch, isMobile, closeSidebar]);

    const isEntityMatch = useCallback((entity: EntityType) => {
        if (!searchTerm.trim()) return false;
        return entity.SchemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               entity.DisplayName.toLowerCase().includes(searchTerm.toLowerCase());
    }, [searchTerm]);

    return (
        <Box className="flex flex-col w-full p-2">
            <TextField
                type="text"
                placeholder="Search tables..."
                aria-label="Search tables"
                value={displaySearchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                size="small"
                variant="outlined"
                fullWidth
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment>,
                    }
                }}      
                
            />
            <Paper className="mt-4 border rounded-lg" sx={{ borderColor: 'border.main' }} variant="outlined">
                {filteredGroups.map((group) => (
                    <EntityGroupAccordion
                        key={group.Name}
                        group={group}
                        isExpanded={expandedGroups.has(group.Name)}
                        onToggle={handleGroupClick}
                        onEntityClick={handleEntityClick}
                        onGroupClick={handleScrollToGroup}
                        currentSection={currentSection}
                        currentGroup={currentGroup}
                        loadingSection={loadingSection}
                        searchTerm={searchTerm}
                        highlightText={highlightText}
                        isEntityMatch={isEntityMatch}
                        showGroupClickIcon={true}
                    />
                ))}
            </Paper>
        </Box>
    );
}
