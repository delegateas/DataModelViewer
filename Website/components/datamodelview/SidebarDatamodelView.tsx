import { EntityType, GroupType } from "@/lib/Types";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";
import { Accordion, AccordionSummary, AccordionDetails, Box, InputAdornment, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { ExpandMore, ExtensionRounded, OpenInNewRounded, SearchRounded } from '@mui/icons-material';
import { useState, useEffect, useMemo, useCallback } from "react";
import { TextField } from "@mui/material";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme, alpha } from '@mui/material/styles';

interface ISidebarDatamodelViewProps { 

}

interface INavItemProps {
    group: GroupType,
}


export const SidebarDatamodelView = ({ }: ISidebarDatamodelViewProps) => {
    const { currentSection, currentGroup, scrollToSection, loadingSection } = useDatamodelView();
    const { close: closeSidebar } = useSidebar();
    const theme = useTheme();
    const isMobile = useIsMobile();

    const dataModelDispatch = useDatamodelViewDispatch();

    const { groups } = useDatamodelData();

    const [searchTerm, setSearchTerm] = useState("");
    const [displaySearchTerm, setDisplaySearchTerm] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    
    // Memoize search results to prevent recalculation on every render
    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) return groups;
        
        return groups.map(group => ({
            ...group,
            Entities: group.Entities.filter(entity => 
                entity.SchemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entity.DisplayName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(group => group.Entities.length > 0);
    }, [groups, searchTerm]);
    
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

    const isEntityMatch = useCallback((entity: EntityType) => {
        if (!searchTerm.trim()) return false;
        return entity.SchemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               entity.DisplayName.toLowerCase().includes(searchTerm.toLowerCase());
    }, [searchTerm]);

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
    }, [dataModelDispatch, currentGroup]);

    const handleSectionClick = useCallback((sectionId: string, groupName: string) => {
        // Use requestAnimationFrame to defer heavy operations
        requestAnimationFrame(() => {
            dataModelDispatch({ type: 'SET_LOADING', payload: true });
            dataModelDispatch({ type: 'SET_LOADING_SECTION', payload: sectionId });
            dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: groupName });
            dataModelDispatch({ type: 'SET_CURRENT_SECTION', payload: sectionId });

            // On phone - close
            if (!!isMobile) {
                closeSidebar();
            }
            
            // Defer scroll operation to next frame to prevent blocking
            requestAnimationFrame(() => {
                if (scrollToSection) {
                    scrollToSection(sectionId);
                }
                clearSearch();
                
                // Clear loading section after a short delay to show the loading state
                setTimeout(() => {
                    dataModelDispatch({ type: 'SET_LOADING_SECTION', payload: null });
                }, 500);
            });
        });
    }, [dataModelDispatch, scrollToSection, clearSearch]);

    const NavItem = useCallback(({ group }: INavItemProps) => {
        const isCurrentGroup = currentGroup?.toLowerCase() === group.Name.toLowerCase();
        const isExpanded = expandedGroups.has(group.Name) || isCurrentGroup;

        return (
            <Accordion
                disableGutters 
                expanded={isExpanded}
                onChange={() => handleGroupClick(group.Name)}
                className={`group/accordion transition-all duration-300 w-full first:rounded-t-lg last:rounded-b-lg shadow-none p-1`}
                sx={{
                    backgroundColor: "background.paper",
                    borderColor: 'border.main',
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore className="w-4 h-4" sx={{ color: isCurrentGroup ? "primary.main" : "default" }} />}
                    className={cn(
                        "p-2 duration-200 flex items-center rounded-md text-xs font-semibold text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-all focus-visible:ring-2 cursor-pointer w-full min-w-0",
                        isCurrentGroup ? "font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-primary"
                    )}
                    sx={{
                        backgroundColor: isExpanded ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        padding: '4px',
                        minHeight: '32px !important',
                        '& .MuiAccordionSummary-content': {
                            margin: 0,
                            alignItems: 'center',
                            minWidth: 0,
                            overflow: 'hidden'
                        }
                    }}
                >
                    <Typography 
                        className={`flex-1 text-sm text-left truncate min-w-0 ${isExpanded ? 'font-semibold' : ''}`} 
                        sx={{ 
                            color: isExpanded ? 'primary.main' : 'text.primary'
                        }}
                    >
                        {group.Name}
                    </Typography>
                    <Typography className={`flex-shrink-0 text-xs mr-2 ${isExpanded ? 'font-semibold' : ''}`} sx={{ opacity: 0.7, color: isExpanded ? 'primary.main' : 'text.primary' }}>{group.Entities.length}</Typography>
                    
                    <OpenInNewRounded 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (group.Entities.length > 0) handleSectionClick(group.Entities[0].SchemaName, group.Name);
                        }}
                        aria-label={`Link to first entity in ${group.Name}`}
                        className="w-4 h-4 flex-shrink-0"
                        sx={{
                            color: isExpanded ? "primary.main" : "default"
                        }}
                    />
                </AccordionSummary>
                <AccordionDetails className="p-0">
                    <Box className="flex flex-col w-full gap-1 pt-1">
                        {group.Entities.map(entity => {
                            const isCurrentSection = currentSection?.toLowerCase() === entity.SchemaName.toLowerCase()
                            const isMatch = isEntityMatch(entity);
                            const isLoading = loadingSection === entity.SchemaName;
                            
                            // If searching and this entity doesn't match, don't render it
                            if (searchTerm.trim() && !isMatch) {
                                return null;
                            }
                            
                            return (
                                <Button
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg px-3 py-1 cursor-pointer transition-colors text-xs font-medium mx-1 justify-start",
                                        isMatch ? "ring-1" : ""
                                    )}
                                    sx={{ 
                                        borderColor: 'accent.main',
                                        backgroundColor: isCurrentSection ? alpha(theme.palette.primary.main, 0.1) : 'transparent' 
                                    }}
                                    key={entity.SchemaName}
                                    onClick={() => {
                                        handleSectionClick(entity.SchemaName, group.Name)
                                    }}
                                    disabled={isLoading}
                                >
                                    {entity.IconBase64 ? (
                                        isCurrentSection ? (
                                            <div 
                                                className="h-4 w-4"
                                                style={{
                                                    maskImage: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                                                    maskSize: 'contain',
                                                    maskRepeat: 'no-repeat',
                                                    maskPosition: 'center',
                                                    backgroundColor: theme.palette.primary.main
                                                }}
                                            />
                                        ) : (
                                            <div 
                                                className="h-4 w-4"
                                                style={{
                                                    maskImage: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                                                    maskSize: 'contain',
                                                    maskRepeat: 'no-repeat',
                                                    maskPosition: 'center',
                                                    backgroundColor: theme.palette.text.primary
                                                }}
                                            />
                                        )
                                    ) : (
                                        <ExtensionRounded 
                                            className="w-4 h-4" 
                                            sx={{ color: isCurrentSection ? 'primary.main' : 'text.secondary' }}
                                        />
                                    )}
                                    <Typography className="truncate text-xs flex-1" variant="body2" sx={{
                                        color: isCurrentSection ? 'primary' : 'text.secondary',
                                    }}>
                                        {isMatch ? highlightText(entity.DisplayName, searchTerm) : entity.DisplayName}
                                    </Typography>
                                    {isLoading && (
                                        <CircularProgress 
                                            size={12} 
                                            sx={{ 
                                                color: 'primary.main',
                                                ml: 'auto'
                                            }}
                                        />
                                    )}
                                </Button>
                            )
                        })}
                    </Box>
                </AccordionDetails>
            </Accordion>
        )
    }, [currentGroup, currentSection, theme, handleGroupClick, handleSectionClick, isEntityMatch, searchTerm, highlightText, expandedGroups]);

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
                {
                    filteredGroups.map((group) => 
                        <NavItem key={group.Name} group={group} />
                    )
                }
            </Paper>
        </Box>
    );
}
