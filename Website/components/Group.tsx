'use client'

import { GroupType } from "@/lib/Types"
import Section from "./Section"
import { useEffect } from "react"
import { useScrollTo } from "@/hooks/useScrollTo"
import { Link } from "lucide-react"

function Group({ group, selected, onSelect }: { group: GroupType, selected: string | null, onSelect: (entity: string) => void }) {
    const isSelected = selected?.toLowerCase() === group.Name.toLocaleLowerCase()
    const [contentRef, shouldScrollTo] = useScrollTo<HTMLDivElement>()
    useEffect(() => {
        if (isSelected) {
            shouldScrollTo(true)
        }
    }, [isSelected])
    
    return <div ref={contentRef} className="w-full flex flex-col">
        <a className="flex flex-row gap-2 items-center hover:underline border-b-2 mb-5" href={`?selected=${group.Name}`}><Link /> <h1 className="text-3xl">{group.Name}</h1></a>
        {group.Entities.map((entity) =>
            <Section key={entity.SchemaName} entity={entity} selected={selected} onSelect={onSelect} />
        )}
    </div>
}

export default Group