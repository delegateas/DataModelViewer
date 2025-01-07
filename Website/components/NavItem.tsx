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
                <CollapsibleTrigger>
                    <a className="hover:underline" href={`?selected=${group.Name}`}><span className="font-bold text-base">{group.Name}</span></a>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
                <SidebarGroupContent className="flex flex-col">
                    <SidebarMenu>
                        {group.Entities.map(entity =>
                            <SidebarMenuItem key={entity.SchemaName}>
                                <SidebarMenuButton onClick={() => onSelect(entity.SchemaName)}>
                                    {entity.DisplayName}
                                </SidebarMenuButton>
                            </SidebarMenuItem>)}
                    </SidebarMenu>
                </SidebarGroupContent>
            </CollapsibleContent>
        </SidebarGroup>
    </Collapsible>
}