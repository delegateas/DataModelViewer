import { EntityType, GroupType } from "@/lib/Types";
import { useSidebar } from '@/contexts/SidebarContext';
import { Box, InputAdornment, Paper } from '@mui/material';
import { SearchRounded } from '@mui/icons-material';
import { useState, useEffect, useMemo, useCallback } from "react";
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
            if (newExpanded.has(groupName)) {
                newExpanded.delete(groupName);
            } else {
                if (currentGroup?.toLowerCase() === groupName.toLowerCase()) return newExpanded;
                newExpanded.add(groupName);
            }
            return newExpanded;
        });
    }, [currentGroup]);

    const handleScrollToGroup = useCallback((group: GroupType) => {
        // Set current group and scroll to group header
        dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: group.Name });
        if (group.Entities.length > 0) 
            dataModelDispatch({ type: "SET_CURRENT_SECTION", payload: group.Entities[0].SchemaName });

        setExpandedGroups(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(group.Name)) {
                newExpanded.delete(group.Name);
            }
            return newExpanded;
        });

        if (scrollToGroup) {
            scrollToGroup(group.Name);
        }
        
        // On phone - close sidebar
        if (!!isMobile) {
            closeSidebar();
        }
    }, [dataModelDispatch, scrollToGroup, isMobile, closeSidebar]);

    const handleEntityClick = useCallback((entity: EntityType, groupName: string) => {
        // Use requestAnimationFrame to defer heavy operations
        requestAnimationFrame(() => {
            dataModelDispatch({ type: 'SET_LOADING', payload: true });
            dataModelDispatch({ type: 'SET_LOADING_SECTION', payload: entity.SchemaName });
            dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: groupName });
            dataModelDispatch({ type: 'SET_CURRENT_SECTION', payload: entity.SchemaName });

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
                        isExpanded={expandedGroups.has(group.Name) || currentGroup?.toLowerCase() === group.Name.toLowerCase()}
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
