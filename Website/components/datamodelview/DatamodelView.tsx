'use client'

import { useEffect } from "react";
import { AppSidebar } from "../AppSiderbar";
import { TooltipProvider } from "../ui/tooltip";
import { useSidebarDispatch } from "@/contexts/SidebarContext";
import { SidebarDatamodelView } from "./SidebarDatamodelView";
import { DatamodelViewProvider } from "@/contexts/DatamodelViewContext";
import { List } from "./List";

export function DatamodelView() {
    const dispatch = useSidebarDispatch();

    useEffect(() => {
        dispatch({ type: "SET_ELEMENT", payload: <SidebarDatamodelView /> })
    }, [])

    return (
        <DatamodelViewProvider>
            <div className="flex">
                <AppSidebar />
                {/* { !isOpen && !isMobile ? <Button className={cn("top-0 sticky h-10 w-10 [&_svg]:size-6")} onClick={() => dispatch({ type: "SET_OPEN", payload: !isOpen })}><PanelLeft /><span className="sr-only">Toggle Sidebar</span></Button> : <></> }
                { isMobile ? <Button className={cn("fixed top-4 left-4 z-50 md:hidden bg-white rounded-full shadow p-6 border border-gray-200")} onClick={() => dispatch({ type: "SET_OPEN", payload: !isOpen })}><PanelLeft /><span className="sr-only">Toggle Sidebar</span></Button> : <></>} */}
                <div className='flex-1 flex flex-col min-w-0 overflow-hidden bg-stone-50'>
                    <div className="">
                        <TooltipProvider delayDuration={0}>
                            <List />
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </DatamodelViewProvider>
    )
}