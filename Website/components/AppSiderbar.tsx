'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { deleteSession } from "@/lib/session";
import NavItems from "./NavItems";
import { PanelLeftClose } from "lucide-react";

export function AppSidebar({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (entity: string) => void
}) {

  const { toggleSidebar } = useSidebar();
  
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <Button onClick={() => deleteSession()}>Sign Out</Button>
        <Button
            data-sidebar="trigger"
            variant="ghost"
            size="sm"
            className="h-10 w-10 [&_svg]:size-6 top-0 sticky"
            onClick={toggleSidebar}
        >
            <PanelLeftClose />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <NavItems selected={selected} onSelect={onSelect} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
