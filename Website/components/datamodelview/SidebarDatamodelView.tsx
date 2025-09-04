import { EntityType, GroupType } from "@/lib/Types";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { ExternalLink, Puzzle, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import { useDatamodelData } from "@/contexts/DatamodelDataContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface ISidebarDatamodelViewProps { 

}

interface INavItemProps {
    group: GroupType,
}


export const SidebarDatamodelView = ({ }: ISidebarDatamodelViewProps) => {
    const isMobile = useIsMobile();
    const { close, dispatch } = useSidebar();
    const { currentSection, currentGroup, scrollToSection } = useDatamodelView();

    const dataModelDispatch = useDatamodelViewDispatch();

    const { groups } = useDatamodelData();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    
    const setOpen = (state: boolean) => {
        dispatch({ type: "SET_OPEN", payload: state })
    }

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
        if (isMobile) { setOpen(false); }
        clearSearch();
    };

    const NavItem = ({ group }: INavItemProps) => {
        const isCurrentGroup = currentGroup?.toLowerCase() === group.Name.toLowerCase();
        const shouldExpand = expandedGroups.has(group.Name);

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
                expanded={isExpanded}
                onChange={(_, expanded) => setIsExpanded(expanded)}
                className={`group/accordion ${isCurrentGroup ? "bg-sidebar-accent border-blue-500" : "border-transparent"} rounded-md transition-colors w-full m-0 pl-2`}
                sx={{
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                    '& .MuiAccordionSummary-root': {
                        padding: 0,
                        minHeight: 'auto',
                        '& .MuiAccordionSummary-content': {
                            margin: 0,
                            minHeight: 'auto',
                        }
                    },
                    '& .MuiAccordionDetails-root': {
                        padding: 0,
                    }
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMore sx={{ fontSize: 16 }} />}
                    className={cn(
                        "duration-200 flex h-8 shrink-0 items-center bg-white rounded-md text-xs font-semibold text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-all focus-visible:ring-2 cursor-pointer w-full",
                        isCurrentGroup ? "bg-blue-100 text-blue-900" : "hover:bg-sidebar-accent hover:text-sidebar-primary"
                    )}
                    sx={{
                        padding: '4px',
                        minHeight: '32px !important',
                        '& .MuiAccordionSummary-content': {
                            margin: 0,
                            alignItems: 'center',
                        }
                    }}
                >
                    <div className={cn(
                        "flex items-center w-full gap-2 rounded-md p-1 transition-colors cursor-pointer text-left min-h-8 border border-gray-100",
                        isCurrentGroup ? "bg-blue-100 text-blue-900" : "bg-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-primary"
                    )}>
                        <span className="flex-1 font-medium text-sm text-left truncate">{group.Name}</span>
                        <p className="ml-auto font-semibold text-xs opacity-70">{group.Entities.length}</p>
                        <button
                            className={cn(
                                "p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400",
                                currentSection?.toLowerCase() === (group.Entities[0]?.SchemaName?.toLowerCase())
                                    ? "bg-blue-100 text-blue-900"
                                    : "hover:bg-gray-200 text-gray-400 hover:text-blue-700"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGroupClick(group.Name);
                                if (group.Entities.length > 0) handleSectionClick(group.Entities[0].SchemaName);
                            }}
                            aria-label={`Link to first entity in ${group.Name}`}
                            tabIndex={0}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '4px 0' }}>
                    <div className="flex flex-col w-full gap-1 py-1">
                        {group.Entities.map(entity => {
                            const isCurrentSection = currentSection?.toLowerCase() === entity.SchemaName.toLowerCase()
                            const isMatch = isEntityMatch(entity);
                            
                            // If searching and this entity doesn't match, don't render it
                            if (searchTerm.trim() && !isMatch) {
                                return null;
                            }
                            
                            return (
                                <button
                                    className={cn(
                                        "flex items-center gap-2 rounded-full px-3 py-1 cursor-pointer transition-colors text-xs font-medium",
                                        "hover:bg-blue-50 hover:text-blue-900 text-sidebar-foreground/60",
                                        isCurrentSection ? "bg-blue-100 text-blue-900" : "",
                                        isMatch ? "ring-1 ring-yellow-300" : ""
                                    )}
                                    key={entity.SchemaName}
                                    onClick={() => {
                                        handleGroupClick(group.Name)
                                        handleSectionClick(entity.SchemaName)
                                    }}
                                >
                                    {entity.IconBase64 ? <img className="h-4 w-4" src={`data:image/svg+xml;base64,${entity.IconBase64}`} alt="icon" /> : <Puzzle className="w-4 h-4" />}
                                    <span className="truncate">
                                        {isMatch ? highlightText(entity.DisplayName, searchTerm) : entity.DisplayName}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </AccordionDetails>
            </Accordion>
        )
    }

    return (
        <div className="flex flex-col">
            {/* Search Bar */}
            <div className="px-2 pb-3">
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <TextField
                        type="text"
                        placeholder="Search tables..."
                        aria-label="Search tables"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        size="small"
                        variant="outlined"
                        className="pl-8 pr-8 h-8 text-xs"
                        fullWidth
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
                        >
                            <X className="w-3 h-3 text-gray-400" />
                        </button>
                    )}
                </div>
            </div>
            
            <div className='h-full gap-1 flex flex-col max-w-48 overflow-y-auto overflow-x-hidden'> 
                {
                    groups.map((group) => 
                        <NavItem key={group.Name} group={group} />
                    )
                }
            </div>
        </div>
    );
}
