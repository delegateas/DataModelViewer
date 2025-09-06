import { EntityType, GroupType } from "@/lib/Types";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";
import { Accordion, AccordionSummary, AccordionDetails, Stack, Box, InputAdornment, Paper, Typography, IconButton, Button } from '@mui/material';
import { ExpandMore, ExtensionRounded, OpenInNewRounded, SearchRounded } from '@mui/icons-material';
import { useState, useEffect } from "react";
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
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    
    // Search functionality
    const handleSearch = (term: string) => {
        setSearchTerm(term);
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
    };

    const clearSearch = () => {
        setSearchTerm("");
        setExpandedGroups(new Set());
    };

    const isEntityMatch = (entity: EntityType) => {
        if (!searchTerm.trim()) return false;
        return entity.SchemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               entity.DisplayName.toLowerCase().includes(searchTerm.toLowerCase());
    };

    const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm.trim()) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) => 
            regex.test(part) ? 
                <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</mark> : 
                part
        );
    };

    const handleGroupClick = (groupName: string) => {
        dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: groupName });
    };

    const handleSectionClick = (sectionId: string) => {
        dataModelDispatch({ type: 'SET_LOADING', payload: true });
        dataModelDispatch({ type: 'SET_CURRENT_SECTION', payload: sectionId });
        if (scrollToSection) {
            scrollToSection(sectionId);
        }
        clearSearch();
    };

    const getColoredSvgIcon = (iconBase64: string, color: string) => {
        try {
            // Decode base64 to get SVG content
            const svgContent = atob(iconBase64);
            
            // Replace fill and stroke attributes with the desired color
            const coloredSvg = svgContent
                .replace(/fill="[^"]*"/g, `fill="${color}"`)
                .replace(/stroke="[^"]*"/g, `stroke="${color}"`)
                .replace(/<svg([^>]*)>/g, `<svg$1 fill="${color}">`);
            
            // Re-encode to base64
            return btoa(coloredSvg);
        } catch (error) {
            console.warn('Failed to modify SVG color:', error);
            return iconBase64; // Return original if modification fails
        }
    };

    const NavItem = ({ group }: INavItemProps) => {
        const isCurrentGroup = currentGroup?.toLowerCase() === group.Name.toLowerCase();
        const shouldExpand = expandedGroups.has(group.Name);

        console.log(isCurrentGroup, currentGroup, group);

        const [isExpanded, setIsExpanded] = useState(false)
    
        useEffect(() => {
            if (searchTerm.trim()) {
                setIsExpanded(shouldExpand);
            } else {
                setIsExpanded(isCurrentGroup);
            }
        }, [isCurrentGroup, shouldExpand, searchTerm])
    
        return (
            <Accordion
                disableGutters 
                expanded={isExpanded}
                onChange={(_, expanded) => setIsExpanded(expanded)}
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
                    <IconButton
                        size="xsmall"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleGroupClick(group.Name);
                            if (group.Entities.length > 0) handleSectionClick(group.Entities[0].SchemaName);
                        }}
                        aria-label={`Link to first entity in ${group.Name}`}
                        tabIndex={0}
                        color={isCurrentGroup ? "primary" : "default"}
                    >
                        <OpenInNewRounded />
                    </IconButton>
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
                                        isMatch ? "ring-1 ring-yellow-300" : ""
                                    )}
                                    sx={{ 
                                        backgroundColor: isCurrentSection ? alpha(theme.palette.primary.main, 0.1) : 'transparent' 
                                    }}
                                    key={entity.SchemaName}
                                    onClick={() => {
                                        handleGroupClick(group.Name)
                                        handleSectionClick(entity.SchemaName)
                                    }}
                                >
                                    {entity.IconBase64 ? 
                                        <img 
                                            className="h-4 w-4" 
                                            src={`data:image/svg+xml;base64,${
                                                isCurrentSection ? 
                                                    getColoredSvgIcon(entity.IconBase64, theme.palette.primary.main) : 
                                                    entity.IconBase64
                                            }`} 
                                            alt="icon" 
                                        /> : 
                                        <ExtensionRounded 
                                            className="w-4 h-4" 
                                            sx={{ color: isCurrentSection ? 'primary.main' : 'currentColor' }}
                                        />
                                    }
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
    }

    return (
        <Box className="flex flex-col w-full p-2">
            <TextField
                type="text"
                placeholder="Search tables..."
                aria-label="Search tables"
                value={searchTerm}
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
                    groups.map((group) => 
                        <NavItem key={group.Name} group={group} />
                    )
                }
            </Paper>
        </Box>
    );
}
