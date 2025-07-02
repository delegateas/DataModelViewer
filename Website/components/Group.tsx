'use client'

import { GroupType } from "@/lib/Types"
import { useEffect } from "react"
import { useDatamodelView } from "@/contexts/DatamodelViewContext"
import { Section } from "./Section"

interface IGroupProps {
    group: GroupType
}

export const Group = ({ group }: IGroupProps) => {
    return <div className="w-full flex flex-col">
        <a className="flex flex-row gap-2 items-center hover:underline border-b-2 mb-5" href={`#${group.Name}`}><h1 className="text-3xl">{group.Name}</h1></a>
        {group.Entities.map((entity) =>
            <Section key={entity.SchemaName} entity={entity} group={group} />
        )}
    </div>
}