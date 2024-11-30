import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible"
import { Button } from "./components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

function Section({name, children}: {name: string, children: React.ReactNode}) {
    const [isOpen, setOpen] = useState(false)
    
    return <Collapsible open={isOpen} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex flex-row justify-start">
                    <span>{name}</span>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button></CollapsibleTrigger>
            <CollapsibleContent className="grid grid-cols-4 pt-5">
                {children}
            </CollapsibleContent>
        </Collapsible>
}

export default Section