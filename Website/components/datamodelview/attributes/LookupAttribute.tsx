import { LookupAttributeType } from "@/lib/Types"
import { FileSearch, FileX2 } from "lucide-react"
import { useDatamodelView } from "@/contexts/DatamodelViewContext"

export default function LookupAttribute({ attribute }: { attribute: LookupAttributeType }) {

    const { scrollToSection } = useDatamodelView();

    return <div className="flex flex-wrap items-center gap-1 md:gap-2">
        <p className="font-semibold text-xs md:font-bold md:text-sm">Lookup</p>
        <div className="flex flex-wrap gap-1">
            {attribute.Targets
                .map(target => target.IsInSolution ? 
                    <button
                        key={target.Name}
                        className="h-5 px-1.5 text-xs flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300 border border-gray-300 rounded-md bg-white shadow-sm md:h-6 md:px-2"
                        onClick={() => scrollToSection(target.Name)}
                    >
                        <FileSearch className="w-2 h-2 md:w-3 md:h-3" />
                        <span className="text-xs">{target.Name}</span>
                    </button> : 
                    <div 
                        key={target.Name} 
                        className="h-5 px-1.5 text-xs flex items-center gap-1 bg-gray-100 text-gray-600 rounded border md:h-6 md:px-2"
                    >
                        <FileX2 className="w-2 h-2 md:w-3 md:h-3" />
                        <span className="text-xs">{target.Name}</span>
                    </div>)}
        </div>
    </div>
}