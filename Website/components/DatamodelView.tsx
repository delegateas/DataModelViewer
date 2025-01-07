'use client'

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSiderbar";
import List from "./List";

export function DatamodelView() {
    const [selected, setSelected] = useState<string | null>(null);

    const searchParams = useSearchParams()
    const entityParam = searchParams.get('selected')
    useEffect(() => {
        setSelected(entityParam)
    }, [entityParam])

    return <>
        <AppSidebar selected={selected} onSelect={entity => setSelected(entity)} />
        <div className='flex flex-col gap-5 mx-5 mt-5 w-full'>
            <List selected={selected} onSelect={entity => setSelected(entity)} />
        </div>
    </>;
}