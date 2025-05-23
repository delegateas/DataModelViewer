'use client'

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSiderbar";
import List from "./List";
import { TooltipProvider } from "./ui/tooltip";
import { TouchProvider } from "./ui/hybridtooltop";
import { SidebarTrigger } from "./ui/sidebar";

export function DatamodelView() {
    const [selected, setSelected] = useState<string | null>(null);
    const searchParams = useSearchParams()
    const entityParam = searchParams.get('selected')
    useEffect(() => {
        setSelected(entityParam)
    }, [entityParam])

    return <>
        <TouchProvider>
            <AppSidebar selected={selected} onSelect={entity => setSelected(entity)} />
            <SidebarTrigger className="top-0 sticky" />
            <div className='flex-1 flex flex-col min-w-0 overflow-auto'>
                <div className="pr-5 pt-5 pb-20">
                    <TooltipProvider delayDuration={0}>
                        <List selected={selected} onSelect={entity => setSelected(entity)} />
                    </TooltipProvider>
                </div>
            </div>
        </TouchProvider>
    </>;
}