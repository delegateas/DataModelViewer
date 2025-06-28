import { LookupAttributeType } from "@/lib/Types"
import { Button } from "../ui/button"
import { FileSearch, FileX2 } from "lucide-react"

export default function LookupAttribute({ attribute, onSelect }: { attribute: LookupAttributeType, onSelect: (entity: string) => void }) {
    return <>
        <p className="font-bold">Lookup</p>
        <div className="flex flex-wrap gap-1 mt-1">
            {attribute.Targets
                .map(target => target.IsInSolution ? 
                    <Button
                        key={target.Name}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => onSelect(target.Name)}
                    >
                        <FileSearch className="w-3 h-3" />
                        {target.Name}
                    </Button> : 
                    <div 
                        key={target.Name} 
                        className="h-6 px-2 text-xs flex items-center gap-1 bg-gray-100 text-gray-600 rounded border"
                    >
                        <FileX2 className="w-3 h-3" />
                        {target.Name}
                    </div>)}
        </div>
    </>
}