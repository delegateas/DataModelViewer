'use client'

import { AppSidebar } from "../AppSidebar";
import { TooltipProvider } from "../ui/tooltip";
import { useSidebarDispatch } from "@/contexts/SidebarContext";
import { SidebarDatamodelView } from "./SidebarDatamodelView";
import { DatamodelViewProvider, useDatamodelView, useDatamodelViewDispatch } from "@/contexts/DatamodelViewContext";
import { List } from "./List";
import React, { useState, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction, RefObject } from "react";
import { DatamodelDataProvider, useDatamodelData } from "@/contexts/DatamodelDataContext";

export function DatamodelView() {
    const dispatch = useSidebarDispatch();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filtered, setFiltered] = useState<any[]>([]); // will be passed to List
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        dispatch({ type: "SET_ELEMENT", payload: <SidebarDatamodelView /> })
    }, []);

    return (
        <DatamodelViewProvider>
            <DatamodelViewContent
                search={search}
                setSearch={setSearch}
                debouncedSearch={debouncedSearch}
                setDebouncedSearch={setDebouncedSearch}
                filtered={filtered}
                setFiltered={setFiltered}
                workerRef={workerRef}
            />
        </DatamodelViewProvider>
    );
}

function DatamodelViewContent({ search, setSearch, debouncedSearch, setDebouncedSearch, filtered, setFiltered, workerRef }: {
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    debouncedSearch: string;
    setDebouncedSearch: Dispatch<SetStateAction<string>>;
    filtered: any[];
    setFiltered: Dispatch<SetStateAction<any[]>>;
    workerRef: { current: Worker | null };
}) {
    const { loading } = useDatamodelView();
    const datamodelDispatch = useDatamodelViewDispatch();
    const groups = useDatamodelData();

    useEffect(() => {
        if (!workerRef.current && groups) {
            workerRef.current = new Worker(new URL("./searchWorker.js", import.meta.url));
            workerRef.current.postMessage({ type: "init", groups });
        }

        const worker = workerRef.current;
        if (!worker) return;

        const handleMessage = (e: MessageEvent) => {
            setFiltered(e.data);
            datamodelDispatch({ type: 'SET_LOADING', payload: false });
        };

        worker.addEventListener("message", handleMessage);
        return () => worker.removeEventListener("message", handleMessage);
    }, [datamodelDispatch, setFiltered, workerRef]);

    useEffect(() => {
        datamodelDispatch({ type: 'SET_LOADING', payload: true });
        const handler = setTimeout(() => {
            if (workerRef.current && groups) {
                workerRef.current.postMessage(search.length >= 3 ? search : "");
            }
            setDebouncedSearch(search.length >= 3 ? search : "");
        }, 200);
        return () => clearTimeout(handler);
    }, [search, datamodelDispatch, setDebouncedSearch, workerRef]);

    if (!groups) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-32 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 animate-indeterminate rounded-full" />
                <style>{`
                    @keyframes indeterminate {
                        0% { left: -33%; width: 33%; }
                        50% { left: 33%; width: 33%; }
                        100% { left: 100%; width: 33%; }
                    }
                    .animate-indeterminate {
                        position: relative;
                        animation: indeterminate 1.2s cubic-bezier(0.4,0,0.2,1) infinite;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="flex">
            <AppSidebar />
            <div className='flex-1 flex flex-col min-w-0 overflow-hidden bg-stone-50'>
                <div className="relative">
                    {/* LOADING BAR */}
                    {loading && (
                        <div className="absolute top-0 left-0 w-full h-1.5 z-50 overflow-hidden">
                            <div className="absolute left-0 top-0 h-full w-full bg-blue-100 opacity-40" />
                            <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-blue-400 to-blue-600 animate-indeterminate" />
                            <style>{`
                                @keyframes indeterminate {
                                    0% { left: -33%; width: 33%; }
                                    50% { left: 33%; width: 33%; }
                                    100% { left: 100%; width: 33%; }
                                }
                                .animate-indeterminate {
                                    position: absolute;
                                    animation: indeterminate 1.2s cubic-bezier(0.4,0,0.2,1) infinite;
                                }
                            `}</style>
                        </div>
                    )}
                    {/* SEARCH BAR */}
                    <div className="fixed top-4 right-8 z-50 w-80 flex items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                datamodelDispatch({ type: 'SET_LOADING', payload: true });
                            }}
                            placeholder="Search attributes or entities..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                    </div>
                    <TooltipProvider delayDuration={0}>
                        <List filteredItems={filtered} search={debouncedSearch} />
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}