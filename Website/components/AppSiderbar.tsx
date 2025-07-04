'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { deleteSession } from "@/lib/session";
import NavItems from "./NavItems";

export function AppSidebar({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (entity: string) => void
}) {  
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row">
        <Button className="flex-1" onClick={() => deleteSession()}>Sign Out</Button>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <NavItems selected={selected} onSelect={onSelect} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
