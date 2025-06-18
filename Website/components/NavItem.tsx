'use client'

import { ChevronDown } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { GroupType } from "../lib/Types";
import { useEffect, useState } from "react";

export default function NavItem({
    group,
    selected,
    onSelect
}: {
    group: GroupType,
    selected: string | null,
    onSelect: (entity: string) => void
}) {
    const isSelected = selected?.toLowerCase() === group.Name.toLocaleLowerCase()
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        setIsExpanded(isSelected)
    }, [isSelected])

    return <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="group/collapsible">
        <SidebarGroup>
            <SidebarGroupLabel asChild>
                <CollapsibleTrigger
                    className={`flex items-center w-full gap-2 rounded-md p-2 transition-colors cursor-pointer text-left border
                        ${isExpanded ? 'bg-blue-100 text-blue-900 border-blue-500' : 'bg-sidebar-accent text-sidebar-accent-foreground'}
                        focus-visible:ring-2 focus-visible:ring-sidebar-ring outline-none`}
                    data-state={isExpanded ? 'open' : 'closed'}
                >
                    <a className="flex-1 font-bold text-base text-left" href={`?selected=${group.Name}`}><span>{group.Name}</span></a>
                    <p className="ml-auto font-semibold text-xs opacity-70">{group.Entities.length}</p>
                    <ChevronDown className={`ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
                <SidebarGroupContent className="flex flex-col">
                    <SidebarMenu>
                        {group.Entities.map(entity =>
                            <SidebarMenuItem key={entity.SchemaName}>
                                <SidebarMenuButton onClick={() => onSelect(entity.SchemaName)}>
                                    {entity.IconBase64 != null && <span><img className="h-4 w-4" src={`data:image/svg+xml;base64,${entity.IconBase64}`} /></span>}
                                    <span>{entity.DisplayName}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>)}
                    </SidebarMenu>
                </SidebarGroupContent>
            </CollapsibleContent>
        </SidebarGroup>
    </Collapsible>
}