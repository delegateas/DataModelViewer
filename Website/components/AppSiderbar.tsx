import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import NavItems from "@/generated/NavItems"
  
  export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <NavItems />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  