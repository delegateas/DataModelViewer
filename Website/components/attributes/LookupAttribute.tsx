import { LookupAttributeType } from "@/lib/Types"
import { FileSearch, FileX2 } from "lucide-react"
import { useDatamodelView } from "@/contexts/DatamodelViewContext"

export default function LookupAttribute({ attribute }: { attribute: LookupAttributeType }) {

    const { scrollToSection } = useDatamodelView();

    return <>
        <p className="font-bold">Lookup</p>
        <div className="flex flex-wrap gap-1 mt-1">
            {attribute.Targets
                .map(target => target.IsInSolution ? 
                    <button
                        key={target.Name}
                        className="h-6 px-2 text-xs flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 border border-gray-300 rounded-md bg-white shadow-sm"
                        onClick={() => scrollToSection(target.Name)}
                    >
                        <FileSearch className="w-3 h-3" />
                        {target.Name}
                    </button> : 
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