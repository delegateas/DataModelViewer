import { GroupType } from "@/lib/Types";
import { Groups } from "../../generated/Data"
import { useTouch } from '../ui/hybridtooltop';
import { useSidebarDispatch } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown, Puzzle } from "lucide-react";
import { useState, useEffect } from "react";
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
    
    const setOpen = (state: boolean) => {
        dispatch({ type: "SET_OPEN", payload: state })
    }

    const handleGroupClick = (groupName: string) => {
        dataModelDispatch({ type: "SET_CURRENT_GROUP", payload: groupName });
    };

    const handleSectionClick = (sectionId: string) => {
        if (scrollToSection) {
            scrollToSection(sectionId);
        }
        if (isTouch) { setOpen(false); }
    };

    const NavItem = ({ group }: INavItemProps) => {
        const isCurrentGroup = currentGroup?.toLowerCase() === group.Name.toLowerCase();

        const [isExpanded, setIsExpanded] = useState(false)
    
        useEffect(() => {
            setIsExpanded(isCurrentGroup)
        }, [isCurrentGroup])
    
        return (
            <Collapsible
                open={isExpanded}
                onOpenChange={setIsExpanded}
                className={`group/collapsible mx-1 ${isCurrentGroup ? "bg-sidebar-accent border-blue-500" : "border-transparent"} rounded-md transition-colors w-full`}
            >
                <div className="relative flex w-full min-w-0 flex-col p-0">
                    <Slot
                        className={cn(
                            "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-all focus-visible:ring-2 cursor-pointer w-full",
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
                            <span className="flex-1 font-semibold text-sm text-left truncate">{group.Name}</span>
                            <p className="ml-auto font-semibold text-xs opacity-70">{group.Entities.length}</p>
                            <ChevronDown className={cn("mr-1 w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")} onClick={() => handleGroupClick(group.Name)}/>
                        </CollapsibleTrigger>
                    </Slot>
                    <CollapsibleContent>
                        <div className="flex flex-col w-full gap-1 py-1">
                            {group.Entities.map(entity => {
                                const isCurrentSection = currentSection?.toLowerCase() === entity.SchemaName.toLowerCase()
                                return (
                                    <button
                                        className={cn(
                                            "flex items-center gap-2 rounded-full px-3 py-1 cursor-pointer transition-colors text-xs font-medium",
                                            "hover:bg-blue-50 hover:text-blue-900 text-sidebar-foreground/60",
                                            isCurrentSection ? "bg-blue-100 text-blue-900" : ""
                                        )}
                                        key={entity.SchemaName}
                                        onClick={() => handleSectionClick(entity.SchemaName)}
                                    >
                                        {entity.IconBase64 ? <img className="h-4 w-4" src={`data:image/svg+xml;base64,${entity.IconBase64}`} alt="icon" /> : <Puzzle className="w-4 h-4" />}
                                        <span className="truncate">{entity.DisplayName}</span>
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
            <h2 className="my-1 p-2 font-semibold border-b w-full text-center text-gray-700">Data viewer</h2>
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
