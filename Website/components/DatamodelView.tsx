'use client'

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSiderbar";
import List from "./List";
import { TooltipProvider } from "./ui/tooltip";

export function DatamodelView() {
    const [selected, setSelected] = useState<string | null>(null);

    const searchParams = useSearchParams()
    const entityParam = searchParams.get('selected')
    useEffect(() => {
        setSelected(entityParam)
    }, [entityParam])

    return <>
        <AppSidebar selected={selected} onSelect={entity => setSelected(entity)} />
        <div className='flex-1 flex flex-col min-w-0 overflow-auto'>
            <div className='px-5 pt-5 pb-20'>
                <TooltipProvider>
                    <List selected={selected} onSelect={entity => setSelected(entity)} />
                </TooltipProvider>
            </div>
        </div>
    </>;
}