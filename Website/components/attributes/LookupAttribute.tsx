import { LookupAttributeType } from "@/lib/Types"
import { Button } from "../ui/button"
import { Label } from "@radix-ui/react-label"

export default function LookupAttribute({ attribute, onSelect }: { attribute: LookupAttributeType, onSelect: (entity: string) => void }) {
    return <>
        <p className="font-bold">Lookup</p>
        <div className="flex flex-col items-start">
            {attribute.Targets
                .map(target => target.IsInSolution ? 
                    <Button
                        key={target.Name}
                        variant="ghost"
                        className="p-0 text-base text-blue-600 underline dark:text-blue-500 hover:no-underline"
                        onClick={() => onSelect(target.Name)}>{target.Name}
                    </Button> : 
                    <Label 
                        key={target.Name} 
                        className="p-0 text-base dark:text-gray-300 hover:no-underline">{target.Name}
                    </Label>)}
        </div>
    </>
}