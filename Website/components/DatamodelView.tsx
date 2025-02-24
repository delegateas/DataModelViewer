'use client'

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSiderbar";
import List from "./List";
import { TooltipProvider } from "./ui/tooltip";
import { TouchProvider } from "./ui/hybridtooltop";
import { useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { PanelLeftOpen } from "lucide-react";

export function DatamodelView() {
    const [selected, setSelected] = useState<string | null>(null);

    const { open: isSidebarOpen, toggleSidebar } = useSidebar();

    const searchParams = useSearchParams()
    const entityParam = searchParams.get('selected')
    useEffect(() => {
        setSelected(entityParam)
    }, [entityParam])

    return <>
        <AppSidebar selected={selected} onSelect={entity => setSelected(entity)} />
        {!isSidebarOpen && <Button
            data-sidebar="trigger"
            variant="ghost"
            size="sm"
            className="h-10 w-10 [&_svg]:size-6 top-0 sticky"
            onClick={toggleSidebar}
        >
            <PanelLeftOpen />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>}
        <div className='flex-1 flex flex-col min-w-0 overflow-auto'>
            <div className="pr-5 pt-5 pb-20">
                <TouchProvider>
                    <TooltipProvider delayDuration={0}>
                        <List selected={selected} onSelect={entity => setSelected(entity)} />
                    </TooltipProvider>
                </TouchProvider>
            </div>
        </div>
    </>;
}