'use client'

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSiderbar";
import List from "./List";
import { TooltipProvider } from "./ui/tooltip";
import { TouchProvider } from "./ui/hybridtooltop";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

export function DatamodelView() {
    const [selected, setSelected] = useState<string | null>(null);
    const searchParams = useSearchParams()
    const entityParam = searchParams.get('selected')
    const sidebar = useSidebar();

    useEffect(() => {
        setSelected(entityParam)
    }, [entityParam])

    return <>
        <TouchProvider>
            <AppSidebar selected={selected} onSelect={entity => setSelected(entity)} />
            { !sidebar.open && !sidebar.isMobile ? <SidebarTrigger className="top-0 sticky" /> : <></> }
            { sidebar.isMobile ? <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full shadow p-6 border border-gray-200" /> : <></>}
            <div className='flex-1 flex flex-col min-w-0 overflow-hidden bg-stone-50'>
                <div className="p-6">
                    <TooltipProvider delayDuration={0}>
                        <List selected={selected} onSelect={entity => setSelected(entity)} />
                    </TooltipProvider>
                </div>
            </div>
        </TouchProvider>
    </>;
}