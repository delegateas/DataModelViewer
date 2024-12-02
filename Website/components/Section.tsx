'use client'

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Button } from "./ui/button"
import { ChevronDown, ChevronRight, Link } from "lucide-react"

function Section({ displayName: name, schemaName, children }: { displayName: string, schemaName: string, children: React.ReactNode }) {
    const [isOpen, setOpen] = useState(false)

    return <Collapsible id={schemaName} open={isOpen} onOpenChange={setOpen}>
        <div className="flex flex-row gap-2 items-center">
            <a href={`#${schemaName}`}><Link /></a>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex flex-row justify-start">
                    <span>{name} ({schemaName}</span>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="grid grid-cols-4 pt-5">
            {children}
        </CollapsibleContent>
    </Collapsible>
}

export default Section