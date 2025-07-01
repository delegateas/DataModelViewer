'use client';

import { useIsMobile } from "@/hooks/use-mobile";
import SidebarNavRail from "./SidebarNavRail";

interface IAppSidebarProps {
  children: React.ReactNode
}

export const AppSidebar = ({ children }: IAppSidebarProps) => { 
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-screen w-64 border-r border-gray-300 sticky top-0">
      <div className="w-full h-16 border-b border-gray-300 p-2">
        { isMobile ? <img src="/DMVLOGO.svg" alt="Logo" className="h-full" draggable={false} /> : <img src="/DMVLOGOHORZ.svg" alt="Logo" className="h-full" draggable={false} />}
      </div>
      <div className="flex flex-grow">
        <SidebarNavRail />
        {children}
      </div>
    </div>
  )
}
