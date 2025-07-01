import { GroupType } from "@/lib/Types";
import { Groups } from "../generated/Data"
import { useTouch } from './ui/hybridtooltop';
import { useSidebar, useSidebarDispatch } from '@/contexts/SidebarContext';
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface ISidebarDatamodelViewProps { 
    selected: string | null, 
    onSelect: (entity: string) => void 
}

export const SidebarDatamodelView = ({ selected, onSelect }: ISidebarDatamodelViewProps) => {
    const isTouch = useTouch();
    const dispatch = useSidebarDispatch();
    
    const setOpen = (state: boolean) => {
        dispatch({ type: "SET_OPEN", payload: state })
    }

    interface INavItemProps {
        group: GroupType,
        selected: string | null,
        onSelect: (entity: string) => void
    }
    
    const NavItem = ({ group, selected, onSelect }: INavItemProps) => {
        const isSelected = selected?.toLowerCase() === group.Name.toLowerCase()
        const [isExpanded, setIsExpanded] = useState(false)
    
        useEffect(() => {
            setIsExpanded(isSelected)
        }, [isSelected])
    
        return (
            <Collapsible
                open={isExpanded}
                onOpenChange={setIsExpanded}
                className={cn(
                    "group/collapsible mx-1",
                    isSelected ? "bg-sidebar-accent border-l-2 border-blue-500" : "border-l-2 border-transparent",
                    "rounded-md transition-colors w-full"
                )}
            >
                <div className="relative flex w-full min-w-0 flex-col p-0">
                    <Slot
                        className={cn(
                            "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-all focus-visible:ring-2 cursor-pointer w-full",
                            isSelected ? "bg-blue-100 text-blue-900" : "hover:bg-sidebar-accent hover:text-sidebar-primary"
                        )}
                    >
                        <CollapsibleTrigger
                            className={cn(
                                "flex items-center w-full gap-2 rounded-md p-1 transition-colors cursor-pointer text-left min-h-8 border border-gray-100",
                                isSelected ? "bg-blue-100 text-blue-900" : "bg-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-primary",
                                "focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none"
                            )}
                            data-state={isExpanded ? 'open' : 'closed'}
                        >
                            <a className="flex-1 font-semibold text-sm text-left truncate" href={`?selected=${group.Name}`}><span>{group.Name}</span></a>
                            <p className="ml-auto font-semibold text-xs opacity-70">{group.Entities.length}</p>
                            <ChevronDown className={cn("mr-1 w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")}/>
                        </CollapsibleTrigger>
                    </Slot>
                    <CollapsibleContent>
                        <div className="flex flex-col w-full gap-1 pl-4 py-1">
                            {group.Entities.map(entity => (
                                <div
                                    className={cn(
                                        "flex items-center gap-2 rounded-full px-3 py-1 cursor-pointer transition-colors text-xs font-medium",
                                        "hover:bg-blue-50 hover:text-blue-900 text-sidebar-foreground/60",
                                        selected === entity.SchemaName ? "bg-blue-100 text-blue-900" : ""
                                    )}
                                    key={entity.SchemaName}
                                    onClick={() => onSelect(entity.SchemaName)}
                                >
                                    {entity.IconBase64 && (
                                        <img className="h-4 w-4" src={`data:image/svg+xml;base64,${entity.IconBase64}`} alt="icon" />
                                    )}
                                    <span className="truncate">{entity.DisplayName}</span>
                                </div>
                            ))}
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        )
    }

    return (
        <div className='h-full gap-1 flex flex-col max-w-48'> 
            {
                Groups.map((group) => 
                    <NavItem key={group.Name} group={group} selected={selected} onSelect={(entity) => {
                        if (isTouch) { setOpen(false); }
                        onSelect(entity);
                    }} />
                )
            }
        </div>
    );
}
