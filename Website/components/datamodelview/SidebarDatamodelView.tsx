import { EntityType, GroupType } from "@/lib/Types";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";
import { Accordion, AccordionSummary, AccordionDetails, Stack, Box, InputAdornment, Paper, Typography, IconButton, Button } from '@mui/material';
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
    const isMobile = useIsMobile();
    const { dispatch } = useSidebar();
    const { currentSection, currentGroup, scrollToSection } = useDatamodelView();
    const theme = useTheme();

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
        } else {
            setExpandedGroups(new Set());
        }
    }, [groups]);

    const clearSearch = useCallback(() => {
        setSearchTerm("");
        setDisplaySearchTerm("");
        setExpandedGroups(new Set());
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
        dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: groupName });
    }, [dataModelDispatch]);

    const handleSectionClick = useCallback((sectionId: string) => {
        // Use requestAnimationFrame to defer heavy operations
        requestAnimationFrame(() => {
            dataModelDispatch({ type: 'SET_LOADING', payload: true });
            dataModelDispatch({ type: 'SET_CURRENT_SECTION', payload: sectionId });
            
            // Defer scroll operation to next frame to prevent blocking
            requestAnimationFrame(() => {
                if (scrollToSection) {
                    scrollToSection(sectionId);
                }
                clearSearch();
            });
        });
    }, [dataModelDispatch, scrollToSection, clearSearch]);

    const NavItem = useCallback(({ group }: INavItemProps) => {
        const isCurrentGroup = currentGroup?.toLowerCase() === group.Name.toLowerCase();
    
        return (
            <Accordion
                disableGutters 
                expanded={isCurrentGroup}
                onClick={() => handleGroupClick(group.Name)}
                className={`group/accordion transition-all duration-300 w-full border-b first:rounded-t-lg last:rounded-b-lg last:border-b-0`}
                sx={{
                    backgroundColor: "background.paper",
                    borderColor: 'border.main',
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore className="mr-1 w-4 h-4" sx={{ color: isCurrentGroup ? "primary.main" : "default" }} />}
                    className={cn(
                        "duration-200 flex h-8 shrink-0 items-center rounded-md text-xs font-semibold text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-all focus-visible:ring-2 cursor-pointer w-full",
                        isCurrentGroup ? "font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-primary"
                    )}
                    sx={{
                        backgroundColor: isCurrentGroup ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        padding: '4px',
                        minHeight: '32px !important',
                        '& .MuiAccordionSummary-content': {
                            margin: 0,
                            alignItems: 'center',
                        }
                    }}
                >
                    <Typography className={`flex-1 text-sm text-left truncate ${isCurrentGroup ? 'font-semibold' : ''}`} sx={{ color: isCurrentGroup ? 'primary.main' : 'text.primary' }}>{group.Name}</Typography>
                    <Typography className={`ml-auto text-xs mr-2 ${isCurrentGroup ? 'font-semibold' : ''}`} sx={{ opacity: 0.7, color: isCurrentGroup ? 'primary.main' : 'text.primary' }}>{group.Entities.length}</Typography>
                    
                    <OpenInNewRounded 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleGroupClick(group.Name);
                            if (group.Entities.length > 0) handleSectionClick(group.Entities[0].SchemaName);
                        }}
                        aria-label={`Link to first entity in ${group.Name}`}
                        className="w-4 h-4"
                        sx={{
                            color: isCurrentGroup ? "primary.main" : "default"
                        }}
                    />
                </AccordionSummary>
                <AccordionDetails className="p-0">
                    <Box className="flex flex-col w-full gap-1 py-1">
                        {group.Entities.map(entity => {
                            const isCurrentSection = currentSection?.toLowerCase() === entity.SchemaName.toLowerCase()
                            const isMatch = isEntityMatch(entity);
                            
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
                                        handleGroupClick(group.Name)
                                        handleSectionClick(entity.SchemaName)
                                    }}
                                >
                                    {entity.IconBase64 ? (
                                        isCurrentSection ? (
                                            // Use CSS mask for reliable color change
                                            <div 
                                                className="h-4 w-4"
                                                style={{
                                                    mask: `url(data:image/svg+xml;base64,${entity.IconBase64})`,
                                                    maskSize: 'contain',
                                                    maskRepeat: 'no-repeat',
                                                    maskPosition: 'center',
                                                    backgroundColor: theme.palette.primary.main
                                                }}
                                            />
                                        ) : (
                                            // Use original SVG for non-selected items
                                            <img 
                                                className="h-4 w-4" 
                                                src={`data:image/svg+xml;base64,${entity.IconBase64}`} 
                                                alt="icon" 
                                            />
                                        )
                                    ) : (
                                        <ExtensionRounded 
                                            className="w-4 h-4" 
                                            sx={{ color: isCurrentSection ? 'primary.main' : 'text.primary' }}
                                        />
                                    )}
                                    <Typography className="truncate" variant="body2" sx={{
                                        color: isCurrentSection ? 'primary.main' : 'text.primary',
                                    }}>
                                        {isMatch ? highlightText(entity.DisplayName, searchTerm) : entity.DisplayName}
                                    </Typography>
                                </Button>
                            )
                        })}
                    </Box>
                </AccordionDetails>
            </Accordion>
        )
    }, [currentGroup, currentSection, theme, handleGroupClick, handleSectionClick, isEntityMatch, searchTerm, highlightText]);

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
