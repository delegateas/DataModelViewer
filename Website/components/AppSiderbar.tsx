'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
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
        <SidebarHeader>
          <Button onClick={() => deleteSession()}>Sign Out</Button>
        </SidebarHeader>
        <SidebarContent>
          <NavItems selected={selected} onSelect={onSelect} />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  