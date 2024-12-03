'use client'

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Button } from "./ui/button"
import { ChevronDown, ChevronRight, Link } from "lucide-react"
import SectionRow from "./SectionRow"

function Section({
    displayName,
    schemaName,
    description,
    children }: {
        displayName: string,
        schemaName: string,
        description: string,
        children: React.ReactNode
    }) {
    const [isOpen, setOpen] = useState(false)

    return <Collapsible id={schemaName} open={isOpen} onOpenChange={setOpen}>
        <div className="flex flex-row gap-2 items-center">
            <a href={`#${schemaName}`}><Link /></a>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex flex-row justify-start">
                    <span>{displayName} ({schemaName})</span>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="flex flex-col pt-5">
            <p className="py-2 border-b-2 col-span-4">{description}</p>
            <SectionRow className="font-bold" displayName="Display" schemaName="Schema" type="Type" description="Description" />
            <div className="striped">
                {children}
            </div>
        </CollapsibleContent>
    </Collapsible>
}

export default Section