'use client'

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSiderbar";
import List from "./List";
import { TooltipProvider } from "./ui/tooltip";
import { TouchProvider } from "./ui/hybridtooltop";
import { useSidebar, useSidebarDispatch } from "@/contexts/SidebarContext";
import { SidebarDatamodelView } from "./SidebarDatamodelView";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PanelLeft } from "lucide-react";

export function DatamodelView() {
    const [selected, setSelected] = useState<string | null>(null);
    const searchParams = useSearchParams()
    const entityParam = searchParams.get('selected')
    const { isOpen, element } = useSidebar();
    const isMobile = useIsMobile();
    const dispatch = useSidebarDispatch();

    useEffect(() => {
        setSelected(entityParam);
    }, [entityParam])

    useEffect(() => {
        dispatch({ type: "SET_ELEMENT", payload: <SidebarDatamodelView selected={selected} onSelect={setSelected} /> })
    }, [])

    return (
        <TouchProvider>
            <div className="flex">
                <AppSidebar children={element} />
                {/* { !isOpen && !isMobile ? <Button className={cn("top-0 sticky h-10 w-10 [&_svg]:size-6")} onClick={() => dispatch({ type: "SET_OPEN", payload: !isOpen })}><PanelLeft /><span className="sr-only">Toggle Sidebar</span></Button> : <></> }
                { isMobile ? <Button className={cn("fixed top-4 left-4 z-50 md:hidden bg-white rounded-full shadow p-6 border border-gray-200")} onClick={() => dispatch({ type: "SET_OPEN", payload: !isOpen })}><PanelLeft /><span className="sr-only">Toggle Sidebar</span></Button> : <></>} */}
                <div className='flex-1 flex flex-col min-w-0 overflow-hidden bg-stone-50'>
                    <div className="p-6">
                        <TooltipProvider delayDuration={0}>
                            <List selected={selected} onSelect={entity => setSelected(entity)} />
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </TouchProvider>
    )
}