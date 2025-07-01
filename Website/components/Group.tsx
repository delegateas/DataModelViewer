'use client'

import { GroupType } from "@/lib/Types"
import { useEffect } from "react"
import { useScrollTo } from "@/hooks/useScrollTo"
import { useDatamodelView } from "@/contexts/DatamodelViewContext"
import { Section } from "./Section"

interface IGroupProps {
    group: GroupType
}

export const Group = ({ group }: IGroupProps) => {

    const { selected } = useDatamodelView();

    const isSelected = selected?.toLowerCase() === group.Name.toLocaleLowerCase()
    const [contentRef, shouldScrollTo] = useScrollTo<HTMLDivElement>()

    useEffect(() => {
        if (isSelected) {
            shouldScrollTo(true)
        }
    }, [isSelected])
    
    return <div ref={contentRef} className="w-full flex flex-col">
        <a className="flex flex-row gap-2 items-center hover:underline border-b-2 mb-5" href={`?selected=${group.Name}`}><h1 className="text-3xl">{group.Name}</h1></a>
        {group.Entities.map((entity) =>
            <Section key={entity.SchemaName} entity={entity} />
        )}
    </div>
}