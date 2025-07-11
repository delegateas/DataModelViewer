import { GroupType } from "@/lib/Types";
import { Groups } from "../../generated/Data"
import { useTouch } from '../ui/hybridtooltop';
import { useSidebarDispatch } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown, Puzzle, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";

interface ISidebarDatamodelViewProps { 

}

interface INavItemProps {
    group: GroupType,
}


export const SidebarDatamodelView = ({ }: ISidebarDatamodelViewProps) => {
    const isTouch = useTouch();
    const dispatch = useSidebarDispatch();
    const { currentSection, currentGroup, scrollToSection } = useDatamodelView();
    const dataModelDispatch = useDatamodelViewDispatch();
    
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
            Groups.forEach(group => {
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

    const isEntityMatch = (entity: any) => {
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
        if (scrollToSection) {
            scrollToSection(sectionId);
        }
        if (isTouch) { setOpen(false); }
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
            <Collapsible
                open={isExpanded}
                onOpenChange={setIsExpanded}
                className={`group/collapsible ${isCurrentGroup ? "bg-sidebar-accent border-blue-500" : "border-transparent"} rounded-md transition-colors w-full m-0 pl-2`}
            >
                <div className="relative flex w-full min-w-0 flex-col p-0">
                    <Slot
                        className={cn(
                            "duration-200 flex h-8 shrink-0 items-center bg-white rounded-md text-xs font-semibold text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-all focus-visible:ring-2 cursor-pointer w-full",
                            isCurrentGroup ? "bg-blue-100 text-blue-900" : "hover:bg-sidebar-accent hover:text-sidebar-primary"
                        )}
                    >
                        <CollapsibleTrigger
                            className={cn(
                                "flex items-center w-full gap-2 rounded-md p-1 transition-colors cursor-pointer text-left min-h-8 border border-gray-100",
                                isCurrentGroup ? "bg-blue-100 text-blue-900" : "bg-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-primary",
                                "focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none"
                            )}
                            data-state={isExpanded ? 'open' : 'closed'}
                        >
                            <span className="flex-1 font-medium text-sm text-left truncate">{group.Name}</span>
                            <p className="ml-auto font-semibold text-xs opacity-70">{group.Entities.length}</p>
                            <ChevronDown className={cn("mr-1 w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")} onClick={() => handleGroupClick(group.Name)}/>
                        </CollapsibleTrigger>
                    </Slot>
                    <CollapsibleContent>
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
                                        onClick={() => handleSectionClick(entity.SchemaName)}
                                    >
                                        {entity.IconBase64 ? <img className="h-4 w-4" src={`data:image/svg+xml;base64,${entity.IconBase64}`} alt="icon" /> : <Puzzle className="w-4 h-4" />}
                                        <span className="truncate">
                                            {isMatch ? highlightText(entity.DisplayName, searchTerm) : entity.DisplayName}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        )
    }

    return (
        <div className="flex flex-col">
            {/* Search Bar */}
            <div className="px-2 pb-3">
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search entities..."
                        aria-label="Search entities"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-8 pr-8 h-8 text-xs"
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
                    Groups.map((group) => 
                        <NavItem key={group.Name} group={group} />
                    )
                }
            </div>
        </div>
    );
}
